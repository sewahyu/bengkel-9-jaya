import { KATEGORI_TRAINER } from "@/lib/constants";
import type { Trainer } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

/**
 * Cover for the accepted Trainer inventory: the old unit data survives as a
 * public, login-free Trainer list and detail, admins manage it through a
 * dedicated Data Trainer page, and there is no anonymous self-service borrowing
 * path for Trainer (only Alat).
 *
 * The backend is a typed local mock, so these tests assert the frontend's
 * observable behavior and the actor calls it makes — not the canister's own
 * stock or approval logic.
 */

const trainer: Trainer[] = [
  {
    id: 1n,
    nama: "Unit Trainer Mesin Beat",
    kategori: "Mesin",
    jumlahTotal: 4n,
    jumlahTersedia: 4n,
    keterangan: "Set lengkap",
  },
  {
    id: 2n,
    nama: "Unit Trainer Kelistrikan",
    kategori: "Kelistrikan",
    jumlahTotal: 3n,
    jumlahTersedia: 1n,
    keterangan: "Untuk praktik kelistrikan",
  },
];

beforeEach(() => {
  vi.resetModules();
});

describe("Trainer list (pengunjung tanpa login)", () => {
  it("renders every unit with its category and links to the detail page", async () => {
    mockCoreInfrastructure(
      createMockActor({ listTrainer: vi.fn(async () => trainer) }),
    );
    const { Trainer: Page } = await import("@/pages/Trainer");
    renderWithRouter(<Page />, "/trainer");

    expect(
      await screen.findByText("Unit Trainer Mesin Beat"),
    ).toBeInTheDocument();
    expect(screen.getByText("Unit Trainer Kelistrikan")).toBeInTheDocument();

    const item = await screen.findByTestId("trainer.item.1");
    expect(item).toHaveAttribute("href", "/trainer/1");
    expect(within(item).getByText("Mesin")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("trainer.item.2")).getByText("Kelistrikan"),
    ).toBeInTheDocument();
  });

  it("offers a filter button for every legacy Trainer category", async () => {
    mockCoreInfrastructure(
      createMockActor({ listTrainer: vi.fn(async () => trainer) }),
    );
    const { Trainer: Page } = await import("@/pages/Trainer");
    renderWithRouter(<Page />, "/trainer");

    await screen.findByText("Unit Trainer Mesin Beat");
    for (const kategori of KATEGORI_TRAINER) {
      const ocid = `trainer.kategori.${kategori.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")}`;
      expect(screen.getByTestId(ocid)).toHaveTextContent(kategori.label);
    }
  });

  it("filters by search text", async () => {
    mockCoreInfrastructure(
      createMockActor({ listTrainer: vi.fn(async () => trainer) }),
    );
    const { Trainer: Page } = await import("@/pages/Trainer");
    renderWithRouter(<Page />, "/trainer");

    await screen.findByText("Unit Trainer Mesin Beat");
    const user = userEvent.setup();
    await user.type(screen.getByTestId("trainer.search_input"), "Kelistrikan");

    expect(screen.getByText("Unit Trainer Kelistrikan")).toBeInTheDocument();
    expect(
      screen.queryByText("Unit Trainer Mesin Beat"),
    ).not.toBeInTheDocument();
  });

  it("applies a category filter from the URL", async () => {
    mockCoreInfrastructure(
      createMockActor({ listTrainer: vi.fn(async () => trainer) }),
    );
    const { Trainer: Page } = await import("@/pages/Trainer");
    renderWithRouter(<Page />, "/trainer?kategori=Mesin");

    expect(
      await screen.findByText("Unit Trainer Mesin Beat"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Unit Trainer Kelistrikan"),
    ).not.toBeInTheDocument();
  });
});

describe("Trainer detail", () => {
  it("shows total, available, and borrowed counts for the unit", async () => {
    mockCoreInfrastructure(
      createMockActor({ getTrainer: vi.fn(async () => trainer[1]) }),
    );
    const { TrainerDetail } = await import("@/pages/TrainerDetail");
    renderWithRouter(<TrainerDetail />, "/trainer/2");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Unit Trainer Kelistrikan",
      }),
    ).toBeInTheDocument();

    // Total 3, available 1, so 2 are borrowed. The status badge also reads
    // "Tersedia", so scope each label to its stat card.
    const statCard = (label: string) => {
      const heading = screen
        .getAllByText(label)
        .find((el) => el.closest('[data-slot="card-content"]') !== null);
      return heading?.closest('[data-slot="card-content"]') as HTMLElement;
    };
    expect(within(statCard("Jumlah Total")).getByText("3")).toBeInTheDocument();
    expect(within(statCard("Tersedia")).getByText("1")).toBeInTheDocument();
    expect(within(statCard("Dipinjam")).getByText("2")).toBeInTheDocument();
  });

  it("offers no anonymous self-service borrowing form", async () => {
    mockCoreInfrastructure(
      createMockActor({ getTrainer: vi.fn(async () => trainer[0]) }),
    );
    const { TrainerDetail } = await import("@/pages/TrainerDetail");
    renderWithRouter(<TrainerDetail />, "/trainer/1");

    await screen.findByRole("heading", {
      level: 1,
      name: "Unit Trainer Mesin Beat",
    });

    // Trainer borrowing is admin-only: the detail page states the rule and
    // exposes no submit control or link to the Alat self-service form.
    expect(
      screen.getByText(/hanya dapat dicatat oleh petugas UPJ/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pinjam|ajukan/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /pinjam|ajukan/i }),
    ).not.toBeInTheDocument();
  });
});

describe("AdminTrainer CRUD", () => {
  it("adds a Trainer unit with the entered values", async () => {
    const addTrainer = vi.fn(async () => trainer[0]);
    mockCoreInfrastructure(
      createMockActor({ listTrainer: vi.fn(async () => []), addTrainer }),
    );
    const { AdminTrainer } = await import("@/pages/admin/AdminTrainer");
    renderWithRouter(<AdminTrainer />, "/admin/trainer");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("trainer.nama.input"),
      "Unit Trainer Mesin Beat",
    );
    await user.clear(screen.getByTestId("trainer.total.input"));
    await user.type(screen.getByTestId("trainer.total.input"), "4");
    await user.click(screen.getByTestId("trainer.submit_button"));

    await waitFor(() => expect(addTrainer).toHaveBeenCalledTimes(1));
    expect(addTrainer).toHaveBeenCalledWith(
      "Unit Trainer Mesin Beat",
      expect.any(String),
      4n,
      "",
    );
  });

  it("loads an existing Trainer unit into the form for editing", async () => {
    mockCoreInfrastructure(
      createMockActor({ listTrainer: vi.fn(async () => trainer) }),
    );
    const { AdminTrainer } = await import("@/pages/admin/AdminTrainer");
    renderWithRouter(<AdminTrainer />, "/admin/trainer");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("trainer.edit_button.1"));

    expect(screen.getByTestId("trainer.nama.input")).toHaveValue(
      "Unit Trainer Mesin Beat",
    );
    expect(screen.getByTestId("trainer.total.input")).toHaveValue(4);
    expect(
      screen.getByRole("button", { name: /Perbarui Unit Trainer/ }),
    ).toBeInTheDocument();
  });

  it("deletes a Trainer unit through the backend", async () => {
    const deleteTrainer = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        listTrainer: vi.fn(async () => trainer),
        deleteTrainer,
      }),
    );
    const { AdminTrainer } = await import("@/pages/admin/AdminTrainer");
    renderWithRouter(<AdminTrainer />, "/admin/trainer");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("trainer.delete_button.1"));

    await waitFor(() => expect(deleteTrainer).toHaveBeenCalledWith(1n));
  });
});
