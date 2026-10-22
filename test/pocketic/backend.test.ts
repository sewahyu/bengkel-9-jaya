import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";
import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    await loginAsAdmin();
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
  await loginAsAdmin();
});

// Every write endpoint requires a logged-in admin. The accepted auth contract is
// a single built-in account, so the test logs in as that account before the
// admin-gated cases. Without this the canister traps with
// "Unauthorized: Hanya admin yang dapat melakukan tindakan ini".
async function loginAsAdmin(): Promise<void> {
  const result = await actor.login("admin", "admin01");
  if (!("ok" in result)) {
    throw new Error("backend test setup: admin login was rejected");
  }
}

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.listAlat()).resolves.toEqual([]);
  await expect(actor.listSparepart()).resolves.toEqual([]);
  await expect(actor.listJadwal()).resolves.toEqual([]);
  await expect(actor.listPeminjaman([], [], [])).resolves.toEqual([]);
  await expect(actor.listNota([], [], [])).resolves.toEqual([]);
  await expect(actor.ringkasanKeuangan()).resolves.toEqual({
    totalMasuk: 0n,
    totalKeluar: 0n,
    saldo: 0n,
  });
});

it("reports the built-in admin session and role after login", async () => {
  await expect(actor.isCallerAdmin()).resolves.toBe(true);
  const session = await actor.getSession();
  expect(session).toHaveLength(1);
  expect(session[0]?.username).toBe("admin");
});

it("rejects wrong credentials without starting a session", async () => {
  const result = await actor.login("admin", "salah");
  expect(result).toEqual({ invalidCredentials: null });
  // The caller is still the admin from the setup login, so the session survives
  // a failed re-login attempt.
  await expect(actor.isCallerAdmin()).resolves.toBe(true);
});

it("ends the session on logout and can log back in", async () => {
  await actor.logout();
  await expect(actor.isCallerAdmin()).resolves.toBe(false);
  await expect(actor.getSession()).resolves.toEqual([]);

  await loginAsAdmin();
  await expect(actor.isCallerAdmin()).resolves.toBe(true);
});

it("round-trips an alat through the real canister", async () => {
  const created = await actor.addAlat("Kunci T", "Peralatan Tangan", 5n, "Set");
  expect(created.nama).toBe("Kunci T");
  expect(created.jumlahTotal).toBe(5n);
  expect(created.jumlahTersedia).toBe(5n);

  const list = await actor.listAlat();
  expect(list).toContainEqual(expect.objectContaining({ id: created.id, nama: "Kunci T" }));

  // Candid `?Alat` decodes to `[] | [Alat]`, not `Alat | null`.
  const fetched = await actor.getAlat(created.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({ id: created.id, nama: "Kunci T" });
});

it("round-trips a Trainer unit through the real canister", async () => {
  const created = await actor.addTrainer("Unit Trainer Mesin", "Mesin", 4n, "Set");
  expect(created.nama).toBe("Unit Trainer Mesin");
  expect(created.kategori).toBe("Mesin");
  expect(created.jumlahTotal).toBe(4n);
  expect(created.jumlahTersedia).toBe(4n);

  const list = await actor.listTrainer();
  expect(list).toContainEqual(
    expect.objectContaining({ id: created.id, nama: "Unit Trainer Mesin" }),
  );

  const fetched = await actor.getTrainer(created.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({ id: created.id, nama: "Unit Trainer Mesin" });

  const updated = await actor.updateTrainer(
    created.id,
    "Unit Trainer Mesin Beat",
    "Mesin",
    5n,
    "Set lengkap",
  );
  expect(updated[0]?.nama).toBe("Unit Trainer Mesin Beat");
  expect(updated[0]?.jumlahTotal).toBe(5n);

  await expect(actor.deleteTrainer(created.id)).resolves.toBe(true);
  const setelah = await actor.listTrainer();
  expect(setelah.find((item) => item.id === created.id)).toBeUndefined();
});

it("records an admin Trainer loan and returns the stock on pengembalian", async () => {
  const trainer = await actor.addTrainer("Unit Trainer Sasis", "Sasis", 3n, "");
  const pinjam = await actor.catatPeminjamanTrainer(
    trainer.id,
    "Rizky",
    "XII TSM 2",
    2n,
    "2026-03-12",
    "Praktik",
  );
  expect(pinjam).toHaveLength(1);
  expect(pinjam[0]?.jenis).toBe("trainer");
  expect(pinjam[0]?.namaTarget).toBe("Unit Trainer Sasis");

  const afterPinjam = await actor.getTrainer(trainer.id);
  expect(afterPinjam[0]?.jumlahTersedia).toBe(1n);

  const kembali = await actor.catatPengembalian(pinjam[0]!.id, "2026-03-12", "Baik");
  expect(kembali[0]?.status).toBe("dikembalikan");

  const afterKembali = await actor.getTrainer(trainer.id);
  expect(afterKembali[0]?.jumlahTersedia).toBe(3n);
});

it("records a peminjaman and a pengembalian, moving jumlahTersedia", async () => {
  const alat = await actor.addAlat("Dongkrak", "Sasis", 3n, "");
  const pinjam = await actor.catatPeminjamanAlat(
    alat.id,
    "Rizky",
    "XII TSM 2",
    2n,
    "2026-03-12",
    "Praktik",
  );
  expect(pinjam).toHaveLength(1);

  const afterPinjam = await actor.getAlat(alat.id);
  expect(afterPinjam[0]?.jumlahTersedia).toBe(1n);

  const kembali = await actor.catatPengembalian(pinjam[0]!.id, "2026-03-12", "Baik");
  expect(kembali[0]?.status).toBe("dikembalikan");

  const afterKembali = await actor.getAlat(alat.id);
  expect(afterKembali[0]?.jumlahTersedia).toBe(3n);
});

it("records uang masuk and uang keluar and reports a consistent ringkasan", async () => {
  await actor.addNota("2026-03-01", "Donasi", "masuk", "Donasi", 500_000n);
  await actor.addNota("2026-03-02", "Beli oli", "keluar", "Pembelian Sparepart", 200_000n);

  const ringkasan = await actor.ringkasanKeuangan();
  expect(ringkasan.totalMasuk).toBe(500_000n);
  expect(ringkasan.totalKeluar).toBe(200_000n);
  expect(ringkasan.saldo).toBe(300_000n);
});

it("adds, updates, and deletes a sparepart", async () => {
  const created = await actor.addSparepart("Busi", "SP-BUS-001", "Busi & Pengapian", 10n, "pcs", 2n);
  const updated = await actor.updateSparepart(created.id, "Busi NGK", "SP-BUS-001", "Busi & Pengapian", "pcs", 2n);
  expect(updated[0]?.nama).toBe("Busi NGK");

  await expect(actor.deleteSparepart(created.id)).resolves.toBe(true);
  const list = await actor.listSparepart();
  expect(list.find((item) => item.id === created.id)).toBeUndefined();
});

it("adds, updates, and deletes a jadwal entry", async () => {
  const created = await actor.addJadwal("Senin", "2026-03-02", "Andi", "XI TSM 1", "Menyapu");
  const updated = await actor.updateJadwal(created.id, "Senin", "2026-03-02", "Andi", "XI TSM 1", "Merapikan alat");
  expect(updated[0]?.tugas).toBe("Merapikan alat");

  await expect(actor.deleteJadwal(created.id)).resolves.toBe(true);
  const list = await actor.listJadwal();
  expect(list.find((item) => item.id === created.id)).toBeUndefined();
});

it("accepts a visitor loan request and only reduces stock once approved", async () => {
  const alat = await actor.addAlat("Kunci Ring", "Peralatan Tangan", 4n, "");

  // A visitor submits without any admin session; the request is recorded as
  // pending and does not touch the available stock yet.
  const diajukan = await actor.ajukanPeminjamanAlat(
    alat.id,
    "Siswa Tamu",
    "XII TSM 3",
    2n,
    "2026-04-01",
    "Praktik",
    "0812-0000",
  );
  expect(diajukan).toHaveLength(1);
  expect(diajukan[0]?.status).toBe("menunggu");
  expect(diajukan[0]?.sumber).toBe("pengunjung");
  expect(diajukan[0]?.jenis).toBe("alat");

  const sebelum = await actor.getAlat(alat.id);
  expect(sebelum[0]?.jumlahTersedia).toBe(4n);

  // Approval is the step that moves the stock.
  const disetujui = await actor.setujuiPeminjaman(diajukan[0]!.id);
  expect(disetujui[0]?.status).toBe("dipinjam");

  const sesudah = await actor.getAlat(alat.id);
  expect(sesudah[0]?.jumlahTersedia).toBe(2n);
});

it("rejects a visitor loan request without changing stock", async () => {
  const alat = await actor.addAlat("Kunci Pas", "Peralatan Tangan", 3n, "");
  const diajukan = await actor.ajukanPeminjamanAlat(
    alat.id,
    "Siswa Tamu",
    "XII TSM 3",
    1n,
    "2026-04-02",
    "Praktik",
    "0812-0001",
  );
  expect(diajukan).toHaveLength(1);

  const ditolak = await actor.tolakPeminjaman(diajukan[0]!.id);
  expect(ditolak[0]?.status).toBe("ditolak");

  const sesudah = await actor.getAlat(alat.id);
  expect(sesudah[0]?.jumlahTersedia).toBe(3n);
});

it("accepts a visitor lab booking and lists it per lab", async () => {
  const diajukan = await actor.ajukanPeminjamanLab(
    "Lab 2 Mesin",
    "Siswa Tamu",
    "XI TSM 1",
    "0812-0002",
    "2026-04-03",
    "07:00",
    "09:00",
    "Praktik mesin",
  );
  expect(diajukan).toHaveLength(1);
  expect(diajukan[0]?.lab).toBe("Lab 2 Mesin");
  expect(diajukan[0]?.status).toBe("menunggu");

  // Candid `?text` decodes/encodes as `[] | [text]`, not `null`.
  const semua = await actor.listPeminjamanLab([]);
  expect(semua).toContainEqual(
    expect.objectContaining({ id: diajukan[0]!.id, lab: "Lab 2 Mesin" }),
  );

  const hanyaMesin = await actor.listPeminjamanLab(["Lab 2 Mesin"]);
  expect(hanyaMesin.every((item) => item.lab === "Lab 2 Mesin")).toBe(true);
});

it("adds, updates, and deletes a lab booking as admin", async () => {
  const created = await actor.addPeminjamanLab(
    "Lab 1 Chasis",
    "Dwi Anggraini",
    "XI TSM 1",
    "0812-0003",
    "2026-04-04",
    "07:00",
    "09:00",
    "Praktik chasis",
    "menunggu",
  );
  expect(created).toHaveLength(1);

  const updated = await actor.updatePeminjamanLab(
    created[0]!.id,
    "Lab 1 Chasis",
    "Dwi Anggraini",
    "XI TSM 1",
    "0812-0003",
    "2026-04-04",
    "08:00",
    "10:00",
    "Praktik chasis lanjutan",
    "disetujui",
  );
  expect(updated[0]?.status).toBe("disetujui");
  expect(updated[0]?.jamMulai).toBe("08:00");

  await expect(actor.deletePeminjamanLab(created[0]!.id)).resolves.toBe(true);
  const list = await actor.listPeminjamanLab([]);
  expect(list.find((item) => item.id === created[0]!.id)).toBeUndefined();
});

it("stores the Instagram feed URL and manages manual news", async () => {
  await expect(actor.getFeedUrl()).resolves.toBe("");
  await actor.setFeedUrl("https://rss.app/feeds/abc.xml");
  await expect(actor.getFeedUrl()).resolves.toBe("https://rss.app/feeds/abc.xml");

  const created = await actor.addBerita(
    "Bengkel 9 Jaya Juara LKS",
    "Tim TSM menjuarai LKS.",
    "",
    "https://www.instagram.com/p/abc",
    "2026-04-05",
  );
  expect(created).toHaveLength(1);

  const updated = await actor.updateBerita(
    created[0]!.id,
    "Bengkel 9 Jaya Juara LKS Provinsi",
    "Tim TSM menjuarai LKS provinsi.",
    "",
    "https://www.instagram.com/p/abc",
    "2026-04-05",
  );
  expect(updated[0]?.judul).toBe("Bengkel 9 Jaya Juara LKS Provinsi");

  const list = await actor.listBerita();
  expect(list).toContainEqual(
    expect.objectContaining({ id: created[0]!.id, judul: "Bengkel 9 Jaya Juara LKS Provinsi" }),
  );

  await expect(actor.deleteBerita(created[0]!.id)).resolves.toBe(true);
  const setelah = await actor.listBerita();
  expect(setelah.find((item) => item.id === created[0]!.id)).toBeUndefined();
});
