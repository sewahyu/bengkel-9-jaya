import type { StatusKetersediaan } from "@/types";

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Format angka menjadi Rupiah tanpa desimal: Rp1.250.000 */
export function formatRupiah(value: bigint | number): string {
  const numeric = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(numeric)) return "Rp0";
  const sign = numeric < 0 ? "-" : "";
  const digits = Math.abs(Math.round(numeric)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}Rp${grouped}`;
}

/** Format angka biasa dengan pemisah ribuan titik. */
export function formatAngka(value: bigint | number): string {
  const numeric = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(numeric)) return "0";
  return Math.round(numeric)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Ubah string tanggal ISO (yyyy-mm-dd) menjadi "12 Maret 2026". */
export function formatTanggal(value: string | null | undefined): string {
  if (!value) return "—";
  const parts = value.slice(0, 10).split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  const monthIndex = Number(month) - 1;
  if (Number.isNaN(monthIndex) || !BULAN[monthIndex]) return value;
  return `${Number(day)} ${BULAN[monthIndex]} ${year}`;
}

/** Ubah string tanggal ISO menjadi "Senin, 12 Maret 2026". */
export function formatTanggalLengkap(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return formatTanggal(value);
  return `${HARI[date.getDay()]}, ${formatTanggal(value)}`;
}

/** Konversi timestamp nanodetik Motoko menjadi Date. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format timestamp nanodetik menjadi "12 Mar 2026, 14:30". */
export function formatWaktu(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const day = date.getDate();
  const month = BULAN[date.getMonth()]?.slice(0, 3) ?? "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${date.getFullYear()}, ${hours}:${minutes}`;
}

/** Tanggal hari ini dalam format yyyy-mm-dd untuk input date. */
export function todayIso(): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Tentukan status ketersediaan dari jumlah tersedia dan ambang minimum. */
export function statusKetersediaan(
  tersedia: bigint | number,
  ambang: bigint | number = 0,
): StatusKetersediaan {
  const available = typeof tersedia === "bigint" ? Number(tersedia) : tersedia;
  const threshold = typeof ambang === "bigint" ? Number(ambang) : ambang;
  if (available <= 0) return "habis";
  if (available <= threshold) return "menipis";
  return "tersedia";
}

/** Potong teks panjang agar aman di dalam kartu dan tabel. */
export function potongTeks(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/* ------------------------------------------------------------------ */
/* Kalender                                                            */
/* ------------------------------------------------------------------ */

export interface SelKalender {
  /** Kunci ISO yyyy-mm-dd. */
  iso: string;
  /** Nomor hari dalam bulan (1-31). */
  hari: number;
  /** Bulan kalender (0-11). */
  bulan: number;
  /** Tahun kalender. */
  tahun: number;
  /** Apakah tanggal ini berada di bulan yang sedang ditampilkan. */
  dalamBulan: boolean;
}

/** Nama bulan Indonesia untuk indeks 0-11. */
export function namaBulan(index: number): string {
  return BULAN[index] ?? "";
}

/** Susun 42 sel (6 minggu) untuk kalender bulanan, dimulai hari Minggu. */
export function buatSelKalender(tahun: number, bulan: number): SelKalender[] {
  const pertama = new Date(tahun, bulan, 1);
  const offset = pertama.getDay();
  const mulai = new Date(tahun, bulan, 1 - offset);
  const sel: SelKalender[] = [];
  for (let i = 0; i < 42; i += 1) {
    const tanggal = new Date(
      mulai.getFullYear(),
      mulai.getMonth(),
      mulai.getDate() + i,
    );
    const iso = `${tanggal.getFullYear()}-${(tanggal.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${tanggal.getDate().toString().padStart(2, "0")}`;
    sel.push({
      iso,
      hari: tanggal.getDate(),
      bulan: tanggal.getMonth(),
      tahun: tanggal.getFullYear(),
      dalamBulan: tanggal.getMonth() === bulan,
    });
  }
  return sel;
}

/* ------------------------------------------------------------------ */
/* Ekspor Excel (.xlsx)                                                */
/* ------------------------------------------------------------------ */

export type SelExcel = string | number | null | undefined;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function kolomNama(index: number): string {
  let n = index + 1;
  let nama = "";
  while (n > 0) {
    const sisa = (n - 1) % 26;
    nama = String.fromCharCode(65 + sisa) + nama;
    n = Math.floor((n - 1) / 26);
  }
  return nama;
}

function selKeXml(nilai: SelExcel, ref: string): string {
  if (nilai === null || nilai === undefined || nilai === "") {
    return `<c r="${ref}"/>`;
  }
  if (typeof nilai === "number" && Number.isFinite(nilai)) {
    return `<c r="${ref}"><v>${nilai}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
    String(nilai),
  )}</t></is></c>`;
}

function barisKeXml(baris: SelExcel[], index: number): string {
  const nomor = index + 1;
  const sel = baris
    .map((nilai, kolom) => selKeXml(nilai, `${kolomNama(kolom)}${nomor}`))
    .join("");
  return `<row r="${nomor}">${sel}</row>`;
}

/**
 * Bangun berkas .xlsx minimal (satu sheet) tanpa dependensi eksternal.
 * Mengembalikan Blob siap diunduh.
 */
export function buatBlobXlsx(namaSheet: string, baris: SelExcel[][]): Blob {
  const sheetRows = baris.map(barisKeXml).join("");
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(
    namaSheet.slice(0, 31),
  )}" sheetId="1" r:id="rId1"/></sheets></workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

  const files: Record<string, string> = {
    "[Content_Types].xml": contentTypes,
    "_rels/.rels": rootRels,
    "xl/workbook.xml": workbookXml,
    "xl/_rels/workbook.xml.rels": workbookRels,
    "xl/worksheets/sheet1.xml": sheetXml,
  };

  return zipStore(files);
}

/** Unduh Blob sebagai berkas dengan nama tertentu. */
export function unduhBlob(blob: Blob, namaBerkas: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = namaBerkas;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Ekspor baris data menjadi berkas .xlsx dan langsung mengunduhnya. */
export function eksporXlsx(
  namaBerkas: string,
  namaSheet: string,
  baris: SelExcel[][],
): void {
  unduhBlob(buatBlobXlsx(namaSheet, baris), namaBerkas);
}

/* ------------------------------------------------------------------ */
/* ZIP (store, tanpa kompresi) — dipakai oleh penulis .xlsx            */
/* ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function tulisU16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function tulisU32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

/** Bangun arsip ZIP (metode store) dari peta nama berkas → isi teks. */
function zipStore(files: Record<string, string>): Blob {
  const encoder = new TextEncoder();
  const entries = Object.entries(files).map(([nama, isi]) => {
    const data = encoder.encode(isi);
    return { nama: encoder.encode(nama), data, crc: crc32(data) };
  });

  const lokal: Uint8Array[] = [];
  const sentral: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const header = new Uint8Array(30 + entry.nama.length);
    const view = new DataView(header.buffer);
    tulisU32(view, 0, 0x04034b50);
    tulisU16(view, 4, 20);
    tulisU16(view, 6, 0);
    tulisU16(view, 8, 0);
    tulisU16(view, 10, 0);
    tulisU16(view, 12, 0);
    tulisU32(view, 14, entry.crc);
    tulisU32(view, 18, entry.data.length);
    tulisU32(view, 22, entry.data.length);
    tulisU16(view, 26, entry.nama.length);
    tulisU16(view, 28, 0);
    header.set(entry.nama, 30);
    lokal.push(header, entry.data);

    const central = new Uint8Array(46 + entry.nama.length);
    const cview = new DataView(central.buffer);
    tulisU32(cview, 0, 0x02014b50);
    tulisU16(cview, 4, 20);
    tulisU16(cview, 6, 20);
    tulisU16(cview, 8, 0);
    tulisU16(cview, 10, 0);
    tulisU16(cview, 12, 0);
    tulisU16(cview, 14, 0);
    tulisU32(cview, 16, entry.crc);
    tulisU32(cview, 20, entry.data.length);
    tulisU32(cview, 24, entry.data.length);
    tulisU16(cview, 28, entry.nama.length);
    tulisU16(cview, 30, 0);
    tulisU16(cview, 32, 0);
    tulisU16(cview, 34, 0);
    tulisU16(cview, 36, 0);
    tulisU32(cview, 38, 0);
    tulisU32(cview, 42, offset);
    central.set(entry.nama, 46);
    sentral.push(central);

    offset += header.length + entry.data.length;
  }

  const sentralSize = sentral.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  tulisU32(eview, 0, 0x06054b50);
  tulisU16(eview, 4, 0);
  tulisU16(eview, 6, 0);
  tulisU16(eview, 8, entries.length);
  tulisU16(eview, 10, entries.length);
  tulisU32(eview, 12, sentralSize);
  tulisU32(eview, 16, offset);
  tulisU16(eview, 20, 0);

  return new Blob([...lokal, ...sentral, end] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
