// Alat pencocok Daftar Efek Syariah (DES) — tim Arif, diuji Nina (22 Nov 2026).
// Tujuan: begitu OJK menerbitkan DES periode baru (mis. periode II 2026, berlaku 1 Desember),
// tim bisa mencocokkan semua kode di data kami dengan lampiran DES dalam satu langkah,
// tanpa menyalin nomor baris satu per satu dengan tangan.
//
// Cara pakai:
//   1. Ubah lampiran PDF DES menjadi teks, mis.: pdftotext -layout "Lampiran I.pdf" des.txt
//   2. node tools/cek-des.mjs des.txt            (laporan biasa)
//      node tools/cek-des.mjs des.txt --json     (keluaran JSON)
//      node tools/cek-des.mjs des.txt --kode KMDS,PORT   (tambah kode calon Agenda)
//
// Alat ini HANYA membaca dan melapor. Ia tidak mengubah data. Hasilnya tetap diperiksa Hana
// (syariah) dan Fajar (data) sebelum nomor baris baru ditulis ke data/emiten-asli.js atau data/agenda.js.
// Kode yang "tidak ditemukan" belum tentu keluar DES (bisa salah baca PDF); Hana wajib mengecek berkas aslinya.

import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Baca baris lampiran DES. Bentuk umum setelah pdftotext: "  12   ADRO   Alamtri Resources Indonesia Tbk".
// Nomor boleh diikuti titik atau garis tegak ("12." / "12 |"). Kode saham = 4 huruf/angka besar.
export function bacaDes(teks) {
  const baris = new Map(); // kode -> [{ no, nama }]
  for (const line of String(teks).split(/\r?\n/)) {
    const m = line.match(/^\s*(\d{1,4})[\s.|]+([A-Z][A-Z0-9]{3})(?![A-Za-z0-9])[\s|]*(.*)$/);
    if (!m) continue;
    const no = Number(m[1]);
    if (!(no > 0)) continue;
    const kode = m[2];
    const nama = m[3].replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    if (!baris.has(kode)) baris.set(kode, []);
    baris.get(kode).push({ no, nama });
  }
  return baris;
}

// Cocokkan daftar kode dengan isi DES. lama = { KODE: desBarisLama } (boleh kosong).
export function cocokkanDes(teks, kodeList, lama = {}) {
  const des = bacaDes(teks);
  const hasil = [];
  for (const kode of [...new Set(kodeList)]) {
    const ada = des.get(kode) || [];
    if (ada.length === 0) hasil.push({ kode, status: "tidak-ditemukan", barisLama: lama[kode] ?? null });
    else if (ada.length > 1) hasil.push({ kode, status: "ganda", baris: ada.map(a => a.no), barisLama: lama[kode] ?? null });
    else hasil.push({ kode, status: "ada", baris: ada[0].no, nama: ada[0].nama, barisLama: lama[kode] ?? null });
  }
  return { jumlahBarisDes: [...des.values()].reduce((n, a) => n + a.length, 0), hasil };
}

function muatData() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ["data/emiten-asli.js", "data/agenda.js"]) vm.runInContext(readFileSync(f, "utf8"), ctx);
  const lama = {};
  const kode = [];
  for (const e of ctx.window.EMITEN_ASLI || []) { kode.push(e.kode); lama[e.kode] = e.desBaris; }
  for (const d of ctx.window.AGENDA_DIVIDEN || []) { kode.push(d.kode); if (!(d.kode in lama)) lama[d.kode] = d.desBaris; }
  for (const i of ctx.window.AGENDA_IPO || []) if (i.kode) kode.push(i.kode);
  return { kode, lama };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const berkas = args.find(a => !a.startsWith("--") && !/^[A-Z0-9,]+$/.test(a));
  if (!berkas) {
    console.error("Pakai: node tools/cek-des.mjs <des.txt> [--json] [--kode KODE1,KODE2]");
    process.exit(2);
  }
  const { kode, lama } = muatData();
  const iKode = args.indexOf("--kode");
  if (iKode >= 0 && args[iKode + 1]) kode.push(...args[iKode + 1].split(",").map(s => s.trim().toUpperCase()).filter(Boolean));
  const r = cocokkanDes(readFileSync(berkas, "utf8"), kode, lama);
  if (args.includes("--json")) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  console.log(`Baris DES terbaca: ${r.jumlahBarisDes}. Kode diperiksa: ${r.hasil.length}.`);
  if (r.jumlahBarisDes < 100) console.log("PERINGATAN: baris terbaca sangat sedikit; mungkin format teks PDF berbeda. Periksa berkas teksnya.");
  for (const h of r.hasil) {
    if (h.status === "ada") console.log(`  ADA       ${h.kode}  baris ${h.baris}${h.barisLama && h.barisLama !== h.baris ? ` (sebelumnya ${h.barisLama})` : ""}  ${h.nama}`);
    else if (h.status === "ganda") console.log(`  GANDA     ${h.kode}  baris ${h.baris.join(", ")} — periksa manual`);
    else console.log(`  TIDAK ADA ${h.kode}${h.barisLama ? ` (sebelumnya baris ${h.barisLama})` : ""} — Hana wajib cek berkas asli sebelum dianggap keluar DES`);
  }
}
