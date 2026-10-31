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

// 1b. Tautan internal (Arif & Yoga): halaman .html yang disebut di skrip harus ada,
// dan tautan jangkar (#bagian) harus menunjuk id yang ada di halaman tujuan.
{
  const idDi = new Map(halaman.map(h => [h, new Set([...readFileSync(h, "utf8").matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))]));
  const skrip = ["assets", "data"].flatMap(d => readdirSync(d).filter(f => f.endsWith(".js")).map(f => `${d}/${f}`));
  for (const f of skrip) {
    for (const [, nama, jangkar] of readFileSync(f, "utf8").matchAll(/(?<![\/\w.-])([a-z][a-z0-9-]*\.html)(?:#([A-Za-z0-9_-]+))?/g)) {
      ok(existsSync(nama), `${f} menaut ke ${nama}, halaman tidak ada`);
      if (jangkar && idDi.has(nama)) ok(idDi.get(nama).has(jangkar), `${f} menaut ke ${nama}#${jangkar}, id tidak ada di halaman itu`);
    }
  }
  for (const h of halaman) {
    for (const [, nama, jangkar] of readFileSync(h, "utf8").matchAll(/href="([a-z0-9-]*\.html)?#([A-Za-z0-9_-]+)"/g)) {
      const tujuan = nama || h;
      if (idDi.has(tujuan)) ok(idDi.get(tujuan).has(jangkar), `${h} menaut ke ${tujuan}#${jangkar}, id tidak ada di halaman itu`);
    }
  }
}

// 2. Data dapat dibaca dan lengkap
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data/modul.js", "data/rujukan.js"]) vm.runInContext(readFileSync(f, "utf8"), ctx);
const { MODUL, RUJUKAN } = ctx.window;

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
  // Kuis (Laras, 29 Okt): 3 soal, 3 pilihan, satu jawaban benar yang valid, ada penjelasan
  ok(Array.isArray(m.kuis) && m.kuis.length === 3, `pelajaran ${m.id}: kuis harus 3 soal`);
  for (const q of m.kuis || []) {
    ok(q.soal && q.jelas && Array.isArray(q.pilihan) && q.pilihan.length === 3 && new Set(q.pilihan).size === 3,
      `pelajaran ${m.id}: soal kuis tidak lengkap: ${q.soal}`);
    ok(Number.isInteger(q.benar) && q.benar >= 0 && q.benar < (q.pilihan || []).length, `pelajaran ${m.id}: kunci kuis tidak valid: ${q.soal}`);
  }
}

// Data asli (tim Fajar): setiap emiten wajib punya bukti baris DES dan sumber https
vm.runInContext(readFileSync("data/emiten-asli.js", "utf8"), ctx);
const ASLI = ctx.window.EMITEN_ASLI;
ok(Array.isArray(ASLI) && ASLI.length >= 15, "data asli kurang dari 15 emiten");
const kodeAsli = new Set();
for (const e of ASLI || []) {
  ok(/^[A-Z0-9]{4}$/.test(e.kode) && !kodeAsli.has(e.kode), `data asli: kode tidak valid/ganda: ${e.kode}`); kodeAsli.add(e.kode);
  ok(Number.isInteger(e.desBaris) && e.desBaris > 0, `data asli ${e.kode}: desBaris wajib diisi`);
  ok(Array.isArray(e.sumber) && e.sumber.length > 0 && e.sumber.every(s => s.judul && /^https:\/\//.test(s.url)), `data asli ${e.kode}: sumber wajib berisi judul dan tautan https`);
  ok(e.mataUang === undefined || e.mataUang === "USD", `data asli ${e.kode}: mataUang hanya boleh kosong (rupiah) atau "USD"`);
  for (const g of ["labaTahun", "pendapatan"]) for (const v of Object.values(e[g] || {}))
    ok(v === null || Number.isFinite(v), `data asli ${e.kode}: ${g} harus angka atau null`);
}

// Kamus istilah (tim Arif): setiap istilah punya penjelasan, pola, dan pelajaran yang benar-benar ada
vm.runInContext(readFileSync("data/istilah.js", "utf8"), ctx);
const ISTILAH = ctx.window.ISTILAH;
ok(Array.isArray(ISTILAH) && ISTILAH.length > 0, "kamus istilah kosong");
for (const t of ISTILAH || []) {
  ok(t.istilah && t.arti && Array.isArray(t.pola) && t.pola.length > 0, `istilah tidak lengkap: ${t.istilah}`);
  ok(!t.pelajaran || idModul.has(t.pelajaran), `istilah ${t.istilah}: pelajaran "${t.pelajaran}" tidak ada`);
}

// Profil emiten (Nina, 29 Okt): halaman ada, memuat wadah #profil, dan Peringkat menaut ke profil
ok(existsSync("emiten.html") && /id="profil"/.test(readFileSync("emiten.html", "utf8")), "emiten.html tidak ada atau tanpa wadah #profil");
ok(/emiten\.html\?kode=/.test(readFileSync("assets/app.js", "utf8")), "Peringkat/Radar belum menaut ke profil emiten");
// Posisi di Peringkat pada profil (Nina, 29 Okt 21.30): wajib memakai peserta() yang sama dengan Peringkat
ok(/function posisi\(kunci[\s\S]{0,900}peserta\(kunci\)/.test(readFileSync("assets/app.js", "utf8")), "Posisi di Peringkat pada profil tidak memakai peserta() yang sama");
// Penanda kemajuan (Nina, 29 Okt): setiap akses localStorage wajib di dalam try { ... }
{
  const js = readFileSync("assets/app.js", "utf8");
  for (const baris of js.split("\n").filter((b) => /localStorage\./.test(b)))
    ok(/try\s*\{/.test(baris), "akses localStorage di luar try/catch: " + baris.trim());
  const css = readFileSync("assets/styles.css", "utf8");
  ok(!/@view-transition/.test(css) || /prefers-reduced-motion: no-preference\)\s*\{\s*@view-transition/.test(css),
    "@view-transition harus di dalam prefers-reduced-motion: no-preference");
  // Nina (30 Okt): daftar isi Metodologi (IDE.md #8) — tiap tautan menuju judul yang ada, app.js dimuat
  const metod = readFileSync("metodologi.html", "utf8");
  const navIsi = (metod.match(/<nav class="isi-halaman" id="isi-halaman"[\s\S]*?<\/nav>/) || [""])[0];
  ok(navIsi, "metodologi.html: nav#isi-halaman tidak ditemukan");
  for (const [, id] of navIsi.matchAll(/href="#([^"]+)"/g))
    ok(new RegExp(`id="${id}"`).test(metod), `metodologi.html: tautan #${id} tidak punya tujuan`);
  ok(/src="assets\/app\.js"/.test(metod), "metodologi.html harus memuat assets/app.js untuk penanda bagian");
  ok(!/scroll-behavior:\s*smooth/.test(css) || /prefers-reduced-motion: no-preference\)[^}]*scroll-behavior/.test(css),
    "scroll halus hanya boleh bila pengguna tidak meminta gerak dikurangi");
  // Nina (30 Okt): "Lanjutkan belajar" (IDE.md #9) — wadah tersembunyi di beranda, memakai bacaSelesai() yang sama
  const beranda = readFileSync("index.html", "utf8");
  ok(/id="lanjutkan-belajar"[^>]*\bhidden\b/.test(beranda), "index.html: wadah #lanjutkan-belajar harus ada dan tersembunyi secara bawaan");
  ok(/function renderLanjutkan\(\)[\s\S]{0,400}bacaSelesai\(\)/.test(js), "renderLanjutkan harus memakai bacaSelesai() yang sama dengan penanda kemajuan");
  // Nina (30 Okt): batang laba 9 bulan (IDE.md #10) — hanya bila kedua angka positif, angka tetap tertulis, batang aria-hidden
  ok(/N\[2025\] > 0 && N\[2026\] > 0[\s\S]{0,200}class: "batang9"/.test(js), "batang9 hanya boleh dibuat bila laba 9 bulan 2025 dan 2026 positif");
  // Nina (30 Okt 10.10): saring sektor Peringkat (IDE.md #11) — select berlabel, saringan memakai peserta() yang sama
  ok(/function urutkan\(kunci, sektor\)[\s\S]{0,300}peserta\(kunci\)\.filter/.test(js), "saring sektor harus menyaring dari peserta() yang sama");
  ok(/el\("label", \{ for: "pilih-sektor"/.test(js), "select #pilih-sektor wajib punya label");
  ok(/urutkan\(kunci, sektor\)/.test(js), "Peringkat harus memakai sektor terpilih saat mengurutkan");
  ok(/batang9-isi[^\n]*"aria-hidden": "true"/.test(js) && /class: "batang9-angka", text: rp\(/.test(js), "batang9: batang aria-hidden dan angka wajib tertulis");
  // Nina (30 Okt 15.20): Radar (IDE.md #6) — panduan warna sebelum memilih; batang 2024 vs 2025 hanya bila kedua angka positif, angka tertulis
  ok(/function batangTahun\(judul, D, rp\)[\s\S]{0,120}D\[2024\] > 0 && D\[2025\] > 0\)\) return null/.test(js), "batangTahun hanya boleh dibuat bila angka 2024 dan 2025 positif");
  ok(/batang-tumbuh[^\n]*"aria-hidden": "true"/.test(js) && /function batangTahun[\s\S]{0,900}class: "batang9-angka", text: rp\(D\[th\]\)/.test(js), "batangTahun: batang aria-hidden dan angka wajib tertulis");
  ok(/hasil\.appendChild\(panduanRadar\(\)\)/.test(js), "Radar harus menampilkan panduan cara membaca sebelum emiten dipilih");
  ok(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.batang-tumbuh/.test(css), "animasi batang Radar hanya di prefers-reduced-motion: no-preference");
  // Nina (30 Okt 14.15): waktu baca (IDE.md #12) — dihitung dari isi saja, bukan ditulis tangan
  ok(/function menitBaca\(m\)[\s\S]{0,200}m\.isi[\s\S]{0,300}Math\.max\(1, Math\.ceil\(kata \/ KATA_PER_MENIT\)\)/.test(js) && !/menitBaca[^\n]*kuis/.test(js), "menitBaca harus menghitung dari m.isi saja (tanpa kuis), dibulatkan ke atas, minimal 1");
  ok(/class: "durasi", text: teksWaktuBaca\(m\)/.test(js), "kartu pelajaran harus memakai teksWaktuBaca()");
  ok(!MODUL.some(m => "durasi" in m), "data/modul.js: durasi tidak boleh ditulis tangan lagi (dihitung otomatis)");
}

// Nina (30 Okt 16.10): angka perubahan diberi tanda "+" bila naik; ROE tidak.
{
  const js = readFileSync("assets/app.js", "utf8");
  ok(/function ubah\(p\)\s*\{\s*return \(p > 0 \? "\+" : ""\) \+ persen\(p\)/.test(js), "Fungsi ubah() untuk tanda +/− perubahan tidak ditemukan");
  ok(!/persen\((gl|gp|g9)\)/.test(js) && !/strip\(g, persen\)/.test(js), "Angka perubahan masih memakai persen() tanpa tanda +");
  ok(/nilai: roe, tampil: persen/.test(js), "ROE tidak boleh diberi tanda +");
}

// Tegar & Nina (30 Okt 17.10): audit keamanan
{
  const api = readFileSync("api/tanya.mjs", "utf8");
  ok(/process\.env\.GEMINI_API_KEY/.test(api) && !/AIza[0-9A-Za-z_-]{20,}/.test(api), "api/tanya.mjs harus membaca key dari Environment Variable, bukan menulisnya");
  ok(/MAKS_PERTANYAAN = \d+/.test(api) && /BATAS_PER_MENIT = \d+/.test(api) && /MAKS_TOTAL_RIWAYAT = \d+/.test(api), "api/tanya.mjs harus punya batas panjang, jumlah per menit, dan total riwayat");
  ok(/if \(asalLain\(req\)\) return kirim\(res, 403/.test(api), "api/tanya.mjs harus menolak POST dari situs lain");
  const vj = JSON.parse(readFileSync("vercel.json", "utf8"));
  const kunciHeader = vj.headers[0].headers.map(h => h.key);
  for (const k of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "Cross-Origin-Opener-Policy"])
    ok(kunciHeader.includes(k), `vercel.json: header keamanan ${k} hilang`);
  const rahasia = /AIza[0-9A-Za-z_-]{30,}|ghp_[0-9A-Za-z]{30,}|sk-[0-9A-Za-z]{30,}/;
  for (const f of [...halaman, "assets/app.js", "api/tanya.mjs", "vercel.json"])
    ok(!rahasia.test(readFileSync(f, "utf8")), `${f} tampak memuat API key/rahasia`);
}

// Nina (30 Okt): aturan laba sekali-waktu Galih & Hana
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  ok(/id="sekali-waktu"/.test(metod), "metodologi.html: bagian #sekali-waktu (aturan laba sekali-waktu) tidak ada");
  ok(/function diluarPeringkat\(e\) \{ return !!\(e\.periksaUlang \|\| e\.sekaliWaktu\)/.test(app), "app.js: diluarPeringkat harus mencakup periksaUlang dan sekaliWaktu");
  ok(/syariahAktif\(e\) && !diluarPeringkat\(e\)/.test(app), "app.js: peserta() Peringkat harus memakai diluarPeringkat");
  for (const e of ASLI) {
    if (!("sekaliWaktu" in e)) continue;
    ok(typeof e.sekaliWaktu === "string" && e.sekaliWaktu.length >= 20, `${e.kode}: sekaliWaktu harus berupa penjelasan singkat`);
    ok(new RegExp(`<strong>${e.kode}</strong>`).test(metod), `${e.kode}: bertanda sekaliWaktu tetapi tidak disebut di metodologi #sekali-waktu`);
  }
  for (const kode of ["UNVR", "INTP", "TPIA"]) ok(ASLI.some(e => e.kode === kode && e.sekaliWaktu), `${kode} seharusnya bertanda sekaliWaktu`);
}

// Nina (30 Okt 19.15): aturan sekali-waktu untuk laba 9 bulan (Fajar & Galih)
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  ok(/function sekaliWaktu9b\(e\)/.test(app) && /porsi < 25/.test(app), "app.js: sekaliWaktu9b() dengan batas 25% tidak ada");
  ok(/var sw9 = sekaliWaktu9b\(e\)/.test(app), "app.js: Radar harus memakai sekaliWaktu9b()");
  ok(/var sw9p = sekaliWaktu9b\(e\)/.test(app), "app.js: profil emiten harus memakai sekaliWaktu9b()");
  for (const e of ASLI) {
    if (!("sekaliWaktu9b" in e)) continue;
    const w = e.sekaliWaktu9b;
    ok(w && (w.tahun === 2025 || w.tahun === 2026) && typeof w.nilai === "number" && ["keuntungan", "beban"].includes(w.jenis) && typeof w.ket === "string" && w.ket.length >= 20,
      `${e.kode}: sekaliWaktu9b harus { tahun 2025/2026, nilai angka, jenis keuntungan/beban, ket }`);
    ok(e.laba9b && typeof e.laba9b[w.tahun] === "number", `${e.kode}: sekaliWaktu9b butuh laba9b tahun ${w.tahun}`);
    ok(e.catatan9b && e.sumber && e.sumber.length > 0, `${e.kode}: sekaliWaktu9b butuh catatan9b dan sumber`);
    ok(new RegExp(`<strong>${e.kode}</strong>`).test(metod), `${e.kode}: sekaliWaktu9b tetapi tidak disebut di metodologi`);
  }
  for (const kode of ["UNTR", "TPIA"]) ok(ASLI.some(e => e.kode === kode && e.sekaliWaktu9b), `${kode} seharusnya bertanda sekaliWaktu9b`);
}

// 2b. Ringkasan usaha (Raka & Sari, 30 Okt): bila diisi, wajib bersumber, singkat, tanpa ajakan
{
  const app = readFileSync("assets/app.js", "utf8");
  ok(/e\.usaha\.sumber\.url/.test(app) && /Usaha perusahaan/.test(app), "app.js: profil harus menampilkan ringkasan usaha beserta sumbernya");
  const ajakan = /\b(wajib beli|pasti naik|buruan (beli|jual)|dijamin untung|rekomendasi beli|layak (dibeli|dikoleksi)|prospek cerah)\b/i;
  for (const e of ASLI) {
    if (!("usaha" in e)) continue;
    const u = e.usaha;
    ok(u && typeof u.teks === "string" && u.teks.length >= 40 && u.teks.length <= 260, `${e.kode}: usaha.teks harus 40–260 karakter`);
    ok(u && u.teks && (u.teks.match(/[.!?](\s|$)/g) || []).length <= 2, `${e.kode}: usaha.teks maksimal 2 kalimat`);
    ok(u && u.sumber && u.sumber.judul && /^https:\/\//.test(u.sumber.url || ""), `${e.kode}: usaha butuh sumber { judul, url https }`);
    ok(!ajakan.test(u.teks || ""), `${e.kode}: usaha.teks memuat bahasa ajakan`);
  }
}

// 3. Aturan Hana (syariah): halaman tidak boleh memakai bahasa ajakan
const terlarang = /\b(wajib beli|pasti naik|buruan (beli|jual)|dijamin untung|rekomendasi beli)\b/i;
for (const f of [...halaman, "data/modul.js", "data/istilah.js", "assets/app.js"]) {
  // Frasa di dalam tanda kutip dianggap contoh yang dibahas, bukan ajakan
  const isi = readFileSync(f, "utf8").replace(/[“"][^“”"\n]{1,40}[”"]/g, "");
  ok(!terlarang.test(isi), `${f} memuat bahasa ajakan yang dilarang`);
}

if (gagal) { console.error(`\n${gagal} pemeriksaan gagal.`); process.exit(1); }
console.log(`Semua pemeriksaan lolos: ${halaman.length} halaman, ${MODUL.length} pelajaran, ${ASLI.length} emiten asli.`);
