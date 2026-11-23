// Cek entri Agenda yang sudah kedaluwarsa (Arif, 23 Nov 2026; untuk rutin harian Raka & Fajar).
// Aturan rutin: hapus acara yang sudah lewat lebih dari 14 hari.
// Tanggal acuan: dividen = tanggal terakhir yang terisi (pembayaran, recording, ex, cum);
//                IPO = pencatatan, atau tanggal terakhir lain yang terisi.
// Pakai: node tools/cek-kedaluwarsa.mjs [YYYY-MM-DD] [berkas-agenda.js]
// Tanpa tanggal = hari ini (WIB). Alat ini hanya mendaftar, tidak mengubah berkas.
import { readFileSync } from "node:fs";
import vm from "node:vm";

export function tanggalAkhir(e) {
  const t = e.tanggal || {};
  const semua = [t.cum, t.ex, t.recording, t.pembayaran, t.penjatahan, t.pencatatan,
    t.penawaranAwal && t.penawaranAwal.selesai, t.penawaranUmum && t.penawaranUmum.selesai]
    .filter(x => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x));
  return semua.length ? semua.sort().at(-1) : null;
}

export function cariKedaluwarsa(ipo, dividen, hariIni, batasHari = 14) {
  const hasil = [];
  const nol = Date.parse(hariIni + "T00:00:00Z");
  for (const [jenis, daftar] of [["IPO", ipo], ["dividen", dividen]]) {
    for (const e of daftar || []) {
      const akhir = tanggalAkhir(e);
      if (!akhir) continue;
      const lewat = Math.round((nol - Date.parse(akhir + "T00:00:00Z")) / 86400000);
      if (lewat > batasHari) hasil.push({ jenis, nama: e.kode || e.nama, akhir, lewat });
    }
  }
  return hasil;
}

export function muatAgenda(berkas = "data/agenda.js") {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(berkas, "utf8"), ctx);
  return { ipo: ctx.window.AGENDA_IPO || [], dividen: ctx.window.AGENDA_DIVIDEN || [] };
}

function hariIniWIB() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hariIni = process.argv[2] || hariIniWIB();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hariIni)) { console.error("Tanggal harus YYYY-MM-DD"); process.exit(2); }
  const { ipo, dividen } = muatAgenda(process.argv[3]);
  const hasil = cariKedaluwarsa(ipo, dividen, hariIni);
  console.log(`Agenda per ${hariIni}: ${ipo.length} IPO, ${dividen.length} dividen.`);
  if (!hasil.length) console.log("Tidak ada entri yang lewat lebih dari 14 hari.");
  for (const h of hasil) console.log(`HAPUS? ${h.jenis} ${h.nama}: tanggal terakhir ${h.akhir} (lewat ${h.lewat} hari)`);
}
