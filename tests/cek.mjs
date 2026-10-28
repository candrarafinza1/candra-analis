// Pemeriksaan otomatis (tim Nina, QA). Jalankan: node tests/cek.mjs
// Tanpa dependensi. Gagal = exit code 1, dan rilis dihentikan.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import vm from "node:vm";

let gagal = 0;
const ok = (kondisi, pesan) => { if (!kondisi) { gagal++; console.error("GAGAL:", pesan); } };

// 1. Semua file lokal yang dirujuk halaman HTML harus ada
const halaman = readdirSync(".").filter(f => f.endsWith(".html"));
for (const h of halaman) {
  const isi = readFileSync(h, "utf8");
  for (const [, url] of isi.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:)/.test(url)) continue;
    const berkas = url.split("?")[0];
    ok(existsSync(berkas), `${h} merujuk ${url}, berkas tidak ada`);
  }
  ok(/<html lang="id">/.test(isi), `${h} tidak memakai lang="id"`);
  ok(/bukan penasihat investasi/.test(isi), `${h} tidak memuat penafian di kaki halaman`);
}

// 2. Data dapat dibaca dan lengkap
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data/modul.js", "data/emiten.js", "data/rujukan.js"]) vm.runInContext(readFileSync(f, "utf8"), ctx);
const { MODUL, EMITEN, RUJUKAN } = ctx.window;

// Rujukan: hanya tautan https ke sumber yang sudah disetujui tim Laras & Hana
const domainResmi = /^https:\/\/(www\.)?(idx\.co\.id|idx\.id|ojk\.go\.id|sikapiuangmu\.ojk\.go\.id|akses\.ksei\.co\.id|youtube\.com|cnbcindonesia\.com)(\/|$)/;
ok(Array.isArray(RUJUKAN) && RUJUKAN.length > 0, "rujukan kosong");
for (const k of RUJUKAN || []) for (const r of k.item) {
  ok(r.judul && r.ket, `rujukan tidak lengkap: ${r.url}`);
  ok(domainResmi.test(r.url), `rujukan dari sumber yang belum disetujui: ${r.url}`);
}
ok(existsSync("assets/modul/modul-candra-analis.pdf"), "modul PDF belum dibuat (jalankan tools/buat-modul-pdf.py)");

ok(Array.isArray(MODUL) && MODUL.length > 0, "kurikulum kosong");
const idModul = new Set();
for (const m of MODUL) {
  ok(m.id && m.judul && m.ringkas && m.isi, `pelajaran ${m.id} tidak lengkap`);
  ok(!idModul.has(m.id), `id pelajaran ganda: ${m.id}`); idModul.add(m.id);
}

ok(Array.isArray(EMITEN) && EMITEN.length >= 10, "data emiten kurang dari 10");
const kode = new Set();
for (const e of EMITEN) {
  ok(/^[A-Z0-9]{4}$/.test(e.kode), `kode tidak valid: ${e.kode}`);
  ok(!kode.has(e.kode), `kode ganda: ${e.kode}`); kode.add(e.kode);
  ok(Array.isArray(e.labaKuartal) && e.labaKuartal.length === 4, `${e.kode}: labaKuartal harus 4 angka`);
  ok(Array.isArray(e.pendapatan) && e.pendapatan.length === 2 && e.pendapatan[0] > 0, `${e.kode}: pendapatan tidak valid`);
  for (const k of ["roe", "der", "divYield"]) ok(Number.isFinite(e[k]), `${e.kode}: ${k} bukan angka`);
  ok(!(e.syariah && e.keluarDES), `${e.kode}: tidak boleh syariah sekaligus keluar DES`);
}

// 3. Aturan Hana (syariah): halaman tidak boleh memakai bahasa ajakan
const terlarang = /\b(wajib beli|pasti naik|buruan (beli|jual)|dijamin untung|rekomendasi beli)\b/i;
for (const f of [...halaman, "data/modul.js", "assets/app.js"]) {
  // Frasa di dalam tanda kutip dianggap contoh yang dibahas, bukan ajakan
  const isi = readFileSync(f, "utf8").replace(/[“"][^“”"\n]{1,40}[”"]/g, "");
  ok(!terlarang.test(isi), `${f} memuat bahasa ajakan yang dilarang`);
}

if (gagal) { console.error(`\n${gagal} pemeriksaan gagal.`); process.exit(1); }
console.log(`Semua pemeriksaan lolos: ${halaman.length} halaman, ${MODUL.length} pelajaran, ${EMITEN.length} emiten.`);
