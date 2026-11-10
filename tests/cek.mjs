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
    const berkas = url.split("?")[0].replace(/^\//, "");
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

// 1c. Parameter tautan (Arif, 31 Okt): ?kode= harus kode yang ada di data asli, ?m= harus id pelajaran yang ada.
// Tautan tertulis (literal) dicek nilainya; tautan buatan skrip wajib memakai e.kode/x.kode dan m.id/MODUL[..].id,
// dan halaman tujuan harus membaca nama parameter yang sama.
{
  const app = readFileSync("assets/app.js", "utf8");
  const berkasCek = [...halaman, ...["assets", "data"].flatMap(d => readdirSync(d).filter(f => f.endsWith(".js")).map(f => `${d}/${f}`))];
  for (const f of berkasCek) {
    const isi = readFileSync(f, "utf8");
    for (const [, k] of isi.matchAll(/emiten\.html\?kode=([A-Z0-9]{4})\b/g)) if (k !== "XXXX") ok(kodeAsli.has(k), `${f}: tautan emiten.html?kode=${k}, kode tidak ada di data/emiten-asli.js`);
    for (const [, m] of isi.matchAll(/pelajaran\.html\?m=([a-z0-9-]+)/g)) ok(idModul.has(m), `${f}: tautan pelajaran.html?m=${m}, id pelajaran tidak ada di data/modul.js`);
    ok(!/pelajaran\.html\?id=/.test(isi), `${f}: pelajaran.html memakai ?m=, bukan ?id=`);
  }
  for (const [, ekspr] of app.matchAll(/"emiten\.html\?kode=" \+ ([\w.\[\]]+)/g)) ok(/^(e|x)\.kode$/.test(ekspr), `app.js: ?kode= dibuat dari ${ekspr}, harus dari kode data emiten`);
  for (const [, ekspr] of app.matchAll(/"pelajaran\.html\?m=" \+ ([\w.\[\] +-]+?)(?=[,)])/g)) ok(/^(m\.id|MODUL\[[^\]]+\]\.id|t\.pelajaran)$/.test(ekspr.trim()), `app.js: ?m= dibuat dari ${ekspr}, harus dari id pelajaran`);
  ok(/URLSearchParams\(location\.search\)\.get\("kode"\)/.test(app) && /URLSearchParams\(location\.search\)\.get\("m"\)/.test(app), "app.js: emiten.html harus membaca ?kode= dan pelajaran.html harus membaca ?m=");
}

// Kamus istilah (tim Arif): setiap istilah punya penjelasan, pola, dan pelajaran yang benar-benar ada
vm.runInContext(readFileSync("data/istilah.js", "utf8"), ctx);
const ISTILAH = ctx.window.ISTILAH;
ok(Array.isArray(ISTILAH) && ISTILAH.length > 0, "kamus istilah kosong");
for (const t of ISTILAH || []) {
  ok(t.istilah && t.arti && Array.isArray(t.pola) && t.pola.length > 0, `istilah tidak lengkap: ${t.istilah}`);
  ok(!t.pelajaran || idModul.has(t.pelajaran), `istilah ${t.istilah}: pelajaran "${t.pelajaran}" tidak ada`);
  // Laras & Sari (1 Nov): istilah tampil sendirian di beranda, jadi arti harus bisa dipahami tanpa konteks halaman
  ok(!/\b(di atas|di bawah ini|tabel ini|kolom ini|halaman ini|grafik ini)\b/i.test(t.arti), `istilah ${t.istilah}: arti merujuk konteks halaman`);
  ok(!!t.pelajaran, `istilah ${t.istilah}: field pelajaran kosong`);
}
// Arif & Nina (5 Nov 07.09): nama istilah dan pola tidak boleh kembar, agar satu kata di halaman
// tidak dicocokkan ke dua penjelasan yang berbeda
function istilahKembar(daftar) {
  const salah = [], nama = new Set(), pola = new Map();
  for (const t of daftar || []) {
    const n = String(t.istilah || "").toLowerCase();
    if (nama.has(n)) salah.push(`nama istilah kembar: ${t.istilah}`);
    nama.add(n);
    for (const p of t.pola || []) {
      const k = String(p).toLowerCase();
      if (pola.has(k) && pola.get(k) !== t.istilah) salah.push(`pola "${p}" dipakai ${pola.get(k)} dan ${t.istilah}`);
      pola.set(k, t.istilah);
    }
  }
  return salah;
}
for (const s of istilahKembar(ISTILAH)) ok(false, `kamus istilah: ${s}`);
ok(istilahKembar([{ istilah: "A", pola: ["laba"] }, { istilah: "B", pola: ["Laba"] }, { istilah: "a", pola: ["x"] }]).length === 2,
  "uji negatif istilahKembar harus menangkap pola kembar dan nama kembar");
// Nina + Arif (6 Nov 07.08): penanda istilah memilih istilah yang muncul paling awal; bila mulai di tempat
// yang sama, istilah yang lebih panjang menang ("Pendapatan tidak halal" > "Pendapatan").
{
  const js = readFileSync("assets/app.js", "utf8");
  const fn = (js.match(/function pilihIstilah\(pola, teks, dipakai\) \{[\s\S]*?\n  \}/) || [""])[0];
  ok(fn, "pilihIstilah tidak ditemukan di assets/app.js");
  ok(/var terbaik = pilihIstilah\(POLA, n\.nodeValue, dipakai\)/.test(js), "pasangIstilah harus memakai pilihIstilah");
  const bangun = (daftar) => {
    const hasil = [];
    daftar.forEach((t, i) => t.pola.forEach((p) => {
      const aman = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      hasil.push({ i, re: new RegExp("(^|[^A-Za-z0-9À-ÿ])(" + aman + ")(?![A-Za-z0-9À-ÿ])", t.besarKecil ? "" : "i") });
    }));
    return hasil;
  };
  ok(js.includes(`"(^|[^A-Za-z0-9À-ÿ])(" + aman + ")(?![A-Za-z0-9À-ÿ])"`), "pola istilah di app.js berubah: sesuaikan uji pilihIstilah");
  if (fn) {
    const pilih = vm.runInNewContext(`(${fn.replace(/^function pilihIstilah/, "function")})`);
    const POLA = bangun(ISTILAH);
    const nama = (r) => (r ? ISTILAH[r.i].istilah : null);
    const pth = ISTILAH.find((t) => /^Pendapatan tidak halal/.test(t.istilah));
    ok(!!pth, "istilah \"Pendapatan tidak halal\" harus ada di kamus");
    if (pth) {
      const r = pilih(POLA, "Batas pendapatan tidak halal adalah 10% dari total pendapatan.", {});
      ok(nama(r) === pth.istilah && r.teks.toLowerCase() === "pendapatan tidak halal", `istilah panjang harus menang, didapat: ${nama(r)}`);
    }
    // Semua pasangan istilah yang satu pola-nya diawali pola lain: yang panjang harus menang di teks yang sama
    for (const a of ISTILAH) for (const p of a.pola) for (const b of ISTILAH) {
      if (a === b) continue;
      for (const q of b.pola) {
        if (q.length >= p.length || !p.toLowerCase().startsWith(q.toLowerCase() + " ")) continue;
        const r = pilih(POLA, "Contoh: " + p + ".", {});
        ok(r && r.teks === p, `"${p}" harus menang atas "${q}", didapat: ${r && r.teks}`);
      }
    }
    // Istilah yang sudah dipakai di wadah dilewati; yang paling awal di teks didahulukan
    const iP = ISTILAH.indexOf(pth);
    const r2 = pilih(POLA, "Pendapatan tidak halal", { [iP]: true });
    ok(r2 && r2.teks.toLowerCase() === "pendapatan", "istilah yang sudah ditandai harus dilewati");
    const contoh = [{ istilah: "X", pola: ["laba"] }, { istilah: "Y", pola: ["laba bersih"] }, { istilah: "Z", pola: ["ekuitas"] }];
    const r3 = pilih(bangun(contoh), "ekuitas dan laba bersih", {});
    ok(r3 && r3.teks === "ekuitas", "istilah yang muncul paling awal harus dipilih");
    // Uji negatif: versi lama (yang pertama di daftar menang) harus tertangkap oleh pemeriksaan ini
    const lama = (pola, teks) => { for (const p of pola) { const m = p.re.exec(teks); if (m) return { i: p.i, teks: m[2] }; } return null; };
    ok(lama(bangun(contoh), "laba bersih naik").teks === "laba", "uji negatif: versi lama harus memilih istilah pendek");
    ok(pilih(bangun(contoh), "laba bersih naik", {}).teks === "laba bersih", "uji negatif: pilihIstilah harus berbeda dari versi lama");
    // Nina + Arif (7 Nov 21.10): judul profil "Laba Januari–September" dan kolom Bandingkan "Laba Jan–Sep 2026"
    // ditandai sebagai istilah "Laba 9 bulan"; "Laporan Januari–September" (bukan laba) tidak ikut ditandai.
    for (const teks of ["Laba Januari–September: Rp1 T (2025)", "Laba Jan–Sep 2026 (perubahan dari 2025)", "Laba 9 bulan naik"]) {
      const r = pilih(POLA, teks, {});
      ok(nama(r) === "Laba 9 bulan" && r.mulai === 0, `cek 2m: "${teks}" harus ditandai sebagai "Laba 9 bulan", didapat: ${nama(r)}`);
    }
    const r4 = pilih(POLA, "Laporan Januari–September 2026 sudah masuk", {});
    ok(!r4 || nama(r4) !== "Laba 9 bulan", "cek 2m: \"Laporan Januari–September\" tidak boleh ditandai sebagai Laba 9 bulan");
    ok(nama(pilih(bangun([{ istilah: "Laba 9 bulan", pola: ["laba 9 bulan"] }]), "Laba Jan–Sep 2026", {})) === null, "cek 2m tidak menangkap pola Jan–Sep yang hilang");
  }
}
// Nina (5 Nov 07.09, IDE.md #22): Kamus istilah di Belajar memakai semua istilah dari data/istilah.js
{
  const bel = readFileSync("belajar.html", "utf8"), js = readFileSync("assets/app.js", "utf8");
  ok(/id="kamus-istilah"/.test(bel), "belajar.html: wadah #kamus-istilah harus ada");
  ok(/src="data\/istilah\.js"[\s\S]*src="assets\/app\.js"/.test(bel), "belajar.html: data/istilah.js harus dimuat sebelum assets/app.js");
  const f = (js.match(/function renderKamus\(\)[\s\S]*?\n  \}\n/) || [""])[0];
  ok(!!f, "assets/app.js: renderKamus() tidak ditemukan");
  ok(/ISTILAH\.slice\(\)\.sort\(/.test(f) && !/\.slice\(0,/.test(f) && !/ISTILAH\.filter\(/.test(f), "renderKamus harus menampilkan semua istilah (tanpa dipotong/disaring di awal)");
  ok(/el\("label", \{ for: "cari-istilah"/.test(f) && /id: "cari-istilah"/.test(f), "kotak cari kamus harus berlabel");
  ok(/"aria-live": "polite"/.test(f), "jumlah hasil kamus harus dibacakan pembaca layar");
  ok(!/innerHTML/.test(f), "renderKamus tidak boleh memakai innerHTML");
  ok(/renderKamus\(\);/.test(js), "renderKamus() harus dipanggil");
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
  // Nina (7 Nov): id yang dipakai app.js sebagai wadah halaman lain tidak boleh ada di Metodologi
  //  (dulu h2#peringkat membuat tabel Peringkat ikut tergambar di dalam judul bagian 4)
  for (const id of ["peringkat", "radar", "profil", "kabar", "pita"])
    ok(!new RegExp(`id="${id}"`).test(metod), `metodologi.html: id="${id}" bentrok dengan wadah halaman lain di app.js`);
  // Nina (7 Nov, IDE.md #24): istilah kamus ditandai di Metodologi → istilah.js dimuat sebelum app.js
  ok(metod.indexOf('src="data/istilah.js"') > -1 && metod.indexOf('src="data/istilah.js"') < metod.indexOf('src="assets/app.js"'),
    "metodologi.html harus memuat data/istilah.js sebelum assets/app.js");
  ok(!/scroll-behavior:\s*smooth/.test(css) || /prefers-reduced-motion: no-preference\)[^}]*scroll-behavior/.test(css),
    "scroll halus hanya boleh bila pengguna tidak meminta gerak dikurangi");
  // Nina (30 Okt): "Lanjutkan belajar" (IDE.md #9) — wadah tersembunyi di beranda, memakai bacaSelesai() yang sama
  const beranda = readFileSync("index.html", "utf8");
  ok(/id="lanjutkan-belajar"[^>]*\bhidden\b/.test(beranda), "index.html: wadah #lanjutkan-belajar harus ada dan tersembunyi secara bawaan");
  ok(/function renderLanjutkan\(\)[\s\S]{0,400}bacaSelesai\(\)/.test(js), "renderLanjutkan harus memakai bacaSelesai() yang sama dengan penanda kemajuan");
  // Nina (1 Nov 13.10): "Istilah hari ini" (IDE.md #15) — tersembunyi bawaan, kamus dimuat sebelum app.js,
  // dipilih dari tanggal tanpa simpanan, dan pilihan hari selalu indeks yang sah (uji 800 hari berturut-turut).
  ok(/id="istilah-hari"[^>]*\bhidden\b/.test(beranda), "index.html: wadah #istilah-hari harus ada dan tersembunyi secara bawaan");
  ok(/src="data\/istilah\.js"[\s\S]*src="assets\/app\.js"/.test(beranda), "index.html: data/istilah.js harus dimuat sebelum assets/app.js");
  {
    const fn = (js.match(/function renderIstilahHari\(\)[\s\S]*?\n  \}/) || [""])[0];
    ok(fn, "renderIstilahHari tidak ditemukan");
    ok(!/localStorage|sessionStorage|fetch\(/.test(fn), "renderIstilahHari tidak boleh menyimpan atau memanggil server");
    const fIdx = (js.match(/function indeksHariIni\(jumlah, tgl\) \{[\s\S]*?\n  \}/) || [""])[0];
    ok(fIdx, "indeksHariIni tidak ditemukan");
    if (fIdx) {
      const indeksHariIni = vm.runInNewContext(`(${fIdx.replace(/^function indeksHariIni/, "function")})`);
      const terlihat = new Set();
      for (let i = 0; i < 800; i++) {
        const t = new Date(2026, 0, 1 + i, 23, 59);
        const k = indeksHariIni(25, t);
        ok(Number.isInteger(k) && k >= 0 && k < 25, `indeksHariIni menghasilkan indeks tidak sah: ${k}`);
        ok(k === indeksHariIni(25, new Date(2026, 0, 1 + i, 0, 1)), "indeksHariIni harus sama sepanjang satu hari");
        terlihat.add(k);
      }
      ok(terlihat.size === 25, "indeksHariIni harus memutar semua istilah");
      ok(indeksHariIni(25, new Date(2026, 10, 1)) !== indeksHariIni(25, new Date(2026, 10, 2)), "istilah harus berganti antarhari");
    }
  }
  // Nina (1 Nov 14.10): "Kabar terbaru" di beranda (IDE.md #16) — tersembunyi bawaan, data/kabar.js dimuat sebelum app.js,
  // maksimal 3 kartu memakai kartuKabar() yang sama, ada catatan "bukan saran" dan tautan ke kabar.html, tanpa simpanan.
  ok(/id="kabar-beranda"[^>]*\bhidden\b/.test(beranda), "index.html: wadah #kabar-beranda harus ada dan tersembunyi secara bawaan");
  ok(/src="data\/kabar\.js"[\s\S]*src="assets\/app\.js"/.test(beranda), "index.html: data/kabar.js harus dimuat sebelum assets/app.js");
  {
    const fn = (js.match(/function renderKabarBeranda\(\)[\s\S]*?\n  \}/) || [""])[0];
    ok(fn, "renderKabarBeranda tidak ditemukan");
    ok(/daftarKabar\(\)\.slice\(0, 3\)/.test(fn), "renderKabarBeranda harus mengambil maksimal 3 kabar dari daftarKabar()");
    ok(/kartuKabar\(/.test(fn), "renderKabarBeranda harus memakai kartuKabar() yang sama dengan halaman Kabar");
    ok(/Kabar bukan saran membeli atau menjual/.test(fn), "renderKabarBeranda harus memuat catatan bukan saran");
    ok(/href: "kabar\.html"/.test(fn), "renderKabarBeranda harus menautkan ke kabar.html");
    ok(!/localStorage|sessionStorage|fetch\(/.test(fn), "renderKabarBeranda tidak boleh menyimpan atau memanggil server");
    ok(/renderKabarBeranda\(\);/.test(js), "renderKabarBeranda harus dipanggil");
  }
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

// Nina (1 Nov 16.10): Bandingkan dua emiten (Arif, IDE.md #14)
{
  const app = readFileSync("assets/app.js", "utf8");
  const m = app.match(/function bagianBanding\(e\) \{[\s\S]*?\n  \}\n/);
  ok(m, "app.js: bagianBanding() tidak ada");
  const f = m ? m[0] : "";
  ok(/akar\.appendChild\(bagianBanding\(e\)\)/.test(app), "app.js: profil emiten harus memasang bagianBanding(e)");
  ok(/<label|el\("label", \{ for: "pilih-banding"/.test(f) && /id: "pilih-banding"/.test(f), "banding: <select> wajib punya label");
  ok(/x\.kode !== e\.kode/.test(f), "banding: emiten yang sedang dibuka tidak boleh muncul di pilihan");
  ok(/usd\(e\) !== usd\(x\)/.test(f) && /tidak sebanding langsung/.test(f), "banding: catatan mata uang beda wajib ada");
  ok(/bukan saran membeli atau menjual/.test(f), "banding: catatan bukan saran wajib ada");
  ok(!/lebih baik|lebih unggul|pemenang|terbaik/i.test(f), "banding: dilarang kata penilaian (lebih baik/unggul/terbaik)");
  ok(!/localStorage|sessionStorage/.test(f), "banding: tidak boleh menyimpan apa pun");
  ok(/aria-live/.test(f), "banding: hasil harus diumumkan ke pembaca layar (aria-live)");
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

// 2c. Laba 9 bulan (Arif, 31 Okt): angka 2026 wajib berpasangan dengan pembanding 2025 dan bersumber
const cekLaba9b = (e) => {
  const l = e.laba9b;
  if (!l || l[2026] === null || l[2026] === undefined) return true;
  return typeof l[2026] === "number" && Number.isFinite(l[2026])
    && typeof l[2025] === "number" && Number.isFinite(l[2025])
    && Array.isArray(e.sumber) && e.sumber.length > 0;
};
for (const e of ASLI) {
  const l = e.laba9b || {};
  for (const t of [2025, 2026]) ok(l[t] === null || l[t] === undefined || (typeof l[t] === "number" && Number.isFinite(l[t])), `${e.kode}: laba9b ${t} harus angka atau null`);
  ok(cekLaba9b(e), `${e.kode}: laba9b 2026 terisi tanpa pembanding 2025 (angka) atau tanpa sumber`);
}
// uji negatif: pasangan tidak lengkap harus tertangkap
ok(!cekLaba9b({ laba9b: { 2025: null, 2026: 100 }, sumber: [{}] }), "cek laba9b tidak menangkap 2025 kosong");
ok(!cekLaba9b({ laba9b: { 2025: "100", 2026: 100 }, sumber: [{}] }), "cek laba9b tidak menangkap 2025 berupa teks");
ok(!cekLaba9b({ laba9b: { 2025: 90, 2026: 100 }, sumber: [] }), "cek laba9b tidak menangkap sumber kosong");

// 2d. Keamanan tautan (Tegar, 31 Okt): setiap target="_blank" wajib rel="noopener"
{
  const berkas = [...halaman, ...readdirSync("assets").filter(f => f.endsWith(".js")).map(f => "assets/" + f),
    ...readdirSync("data").filter(f => f.endsWith(".js")).map(f => "data/" + f)];
  const tanpaNoopener = (teks) => teks.split("\n").filter(b => /_blank/.test(b) && !/noopener/.test(b));
  for (const f of berkas) {
    const salah = tanpaNoopener(readFileSync(f, "utf8"));
    ok(salah.length === 0, `${f}: ${salah.length} tautan target _blank tanpa rel noopener`);
  }
  ok(tanpaNoopener('<a href="x" target="_blank">').length === 1, "cek noopener tidak menangkap tautan tanpa rel");
}

// Nina (1 Nov): mode gelap (Dewi, IDE.md #13). Warna di :root wajib punya pasangan di prefers-color-scheme: dark,
// dan pasangan teks/latar utama kontras min. 4,5:1 di kedua mode (garis & lampu min. 3:1).
{
  const css = readFileSync("assets/styles.css", "utf8");
  const ambil = blok => Object.fromEntries([...blok.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map(m => [m[1], m[2]]));
  const terang = ambil(css.match(/:root\s*\{([\s\S]*?)\}/)[1]);
  const mGelap = css.match(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([\s\S]*?)\}/);
  ok(mGelap, "styles.css belum punya mode gelap (prefers-color-scheme: dark)");
  if (mGelap) {
    const gelap = { ...terang, ...ambil(mGelap[1]) };
    for (const k of ["kertas", "putih", "tinta", "tinta-2", "garis", "naik", "turun", "waspada", "naik-muda", "turun-muda", "waspada-muda"])
      ok(gelap[k] !== terang[k], `mode gelap belum mengganti --${k}`);
    const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
    const kontras = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
    ok(kontras("#ffffff", "#000000") > 20.9 && kontras("#777777", "#777777") === 1, "rumus kontras salah");
    const teks = [["tinta", "kertas"], ["tinta", "putih"], ["tinta-2", "kertas"], ["tinta-2", "putih"],
      ["naik", "putih"], ["turun", "putih"], ["waspada", "putih"], ["naik", "naik-muda"], ["turun", "turun-muda"],
      ["waspada", "waspada-muda"], ["tinta", "naik-muda"], ["tinta", "turun-muda"], ["tinta", "waspada-muda"],
      ["demo-teks", "waspada-muda"], ["sumber-teks", "naik-muda"]];
    const aksenGelap = gelap["aksen"]; // di mode terang --aksen = var(--malam-2)
    for (const [nama, w] of [["terang", { ...terang, aksen: terang["malam-2"] }], ["gelap", { ...gelap, aksen: aksenGelap }]]) {
      for (const [t, l] of [...teks, ["aksen", "putih"], ["aksen", "kertas"]]) {
        const k = kontras(w[t], w[l]);
        const batas = 4.5;
        ok(k >= batas, `kontras --${t} di atas --${l} (mode ${nama}) ${k.toFixed(2)}:1 < ${batas}:1`);
      }
      for (const lampu of ["naik", "turun", "waspada", "aksen"]) ok(kontras(w[lampu], w["putih"]) >= 3, `lampu --${lampu} (mode ${nama}) kurang kontras`);
    }
  }
}

// 2e. Kabar emiten (Arif & Nina, 1 Nov): kode ada di data, tanggal valid & tidak di masa depan, jenis dikenal,
// ringkasan singkat tanpa ajakan, sumber https. Halaman kabar.html memuat wadah #kabar dan data/kabar.js.
{
  vm.runInContext(readFileSync("data/kabar.js", "utf8"), ctx);
  const { KABAR, KABAR_JENIS } = ctx.window;
  const ajakan = /\b(wajib beli|pasti naik|buruan (beli|jual)|dijamin untung|rekomendasi beli|layak (dibeli|dikoleksi)|prospek cerah|saatnya (beli|masuk|jual)|target harga)\b/i;
  const hariIni = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); // WIB
  const salahKabar = (k) => {
    const s = [];
    if (!kodeAsli.has(k.kode)) s.push("kode tidak ada di data asli");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k.tanggal || "") || isNaN(Date.parse(k.tanggal)) || k.tanggal > hariIni) s.push("tanggal tidak valid/di masa depan");
    if (!(KABAR_JENIS || []).includes(k.jenis)) s.push("jenis tidak dikenal");
    if (typeof k.ringkas !== "string" || k.ringkas.length < 20 || k.ringkas.length > 260) s.push("ringkas harus 20–260 karakter");
    if (ajakan.test(k.ringkas || "")) s.push("ringkas memuat kalimat ajakan");
    if (!k.sumber || !k.sumber.judul || !/^https:\/\//.test(k.sumber.url || "")) s.push("sumber wajib judul + https");
    return s;
  };
  ok(Array.isArray(KABAR) && KABAR.length > 0, "data/kabar.js kosong");
  const kunci = new Set();
  for (const k of KABAR || []) {
    for (const s of salahKabar(k)) ok(false, `kabar ${k.kode} ${k.tanggal}: ${s}`);
    const id = `${k.kode}|${k.tanggal}|${k.jenis}`;
    ok(!kunci.has(id), `kabar ganda: ${id}`); kunci.add(id);
  }
  // Arif (2 Nov): angka laba di kabar laporan Januari–September 2026 harus sama dengan laba9b di data emiten
  // (dalam batas pembulatan angka yang ditulis di kabar). Satuan: miliar Rp, atau juta US$ untuk emiten dolar AS.
  const emitenByKode = new Map(ASLI.map((e) => [e.kode, e]));
  const angkaKabar = (teks) => [...teks.matchAll(/(Rp|US\$)\s?([\d.]+(?:,\d+)?)\s(triliun|miliar|juta)/g)].map((m) => {
    const [bulat, des = ""] = m[2].replace(/\./g, "").split(",");
    const nilai = Number(`${bulat}.${des || 0}`), langkah = 10 ** -des.length / 2;
    const kali = m[1] === "Rp" ? { triliun: 1000, miliar: 1, juta: 0.001 }[m[3]] : { miliar: 1000, juta: 1, triliun: 1e6 }[m[3]];
    return { nilai: nilai * kali, toleransi: langkah * kali + 1e-9 };
  });
  const salahAngka9b = (k, e) => {
    if (!/Januari–September 2026/.test(k.ringkas || "") || !e) return [];
    const [a26, a25] = angkaKabar(k.ringkas);
    if (!a26 || !a25 || !e.laba9b) return ["angka laba 9 bulan tidak terbaca"];
    const s = [];
    if (Math.abs(a26.nilai - e.laba9b[2026]) > a26.toleransi) s.push(`laba 2026 di kabar (${a26.nilai}) beda dengan data (${e.laba9b[2026]})`);
    if (Math.abs(a25.nilai - e.laba9b[2025]) > a25.toleransi) s.push(`laba 2025 di kabar (${a25.nilai}) beda dengan data (${e.laba9b[2025]})`);
    return s;
  };
  for (const k of KABAR || []) for (const s of salahAngka9b(k, emitenByKode.get(k.kode))) ok(false, `kabar ${k.kode} ${k.tanggal}: ${s}`);
  ok(salahAngka9b({ ringkas: "Laporan Januari–September 2026 terbit. Laba Rp5,20 triliun, dibanding Rp3,36 triliun." }, { laba9b: { 2025: 3360, 2026: 5180 } }).length === 1,
    "cek angka kabar 9 bulan tidak menangkap angka yang berbeda");
  // Arif & Nina (3 Nov): setiap emiten yang laba9b 2026-nya terisi wajib punya kabar "Laporan keuangan",
  // agar halaman Kabar tidak tertinggal dari data Peringkat.
  const tanpaKabarLaporan = (emiten, kabar) => {
    const ada = new Set((kabar || []).filter((k) => k.jenis === "Laporan keuangan").map((k) => k.kode));
    return emiten.filter((e) => e.laba9b && typeof e.laba9b[2026] === "number" && !ada.has(e.kode)).map((e) => e.kode);
  };
  for (const kode of tanpaKabarLaporan(ASLI, KABAR)) ok(false, `${kode}: laba 9 bulan 2026 sudah ada di data, tetapi belum ada kabar "Laporan keuangan" di data/kabar.js`);
  ok(tanpaKabarLaporan([{ kode: "AAAA", laba9b: { 2025: 1, 2026: 2 } }, { kode: "BBBB", laba9b: { 2025: null, 2026: null } }],
    [{ kode: "AAAA", jenis: "Dividen" }]).join() === "AAAA", "cek kabar laporan 9 bulan tidak menangkap emiten tanpa kabar");
  // uji negatif
  ok(salahKabar({ kode: "ZZZZ", tanggal: "2099-01-01", jenis: "Gosip", ringkas: "Saham ini prospek cerah, saatnya beli.", sumber: { judul: "x", url: "http://x" } }).length === 5,
    "cek kabar tidak menangkap entri yang salah");
  const hk = existsSync("kabar.html") ? readFileSync("kabar.html", "utf8") : "";
  ok(/id="kabar"/.test(hk) && /data\/kabar\.js/.test(hk), "kabar.html tidak ada, tanpa wadah #kabar, atau tidak memuat data/kabar.js");
  ok(/data\/kabar\.js/.test(readFileSync("emiten.html", "utf8")), "emiten.html belum memuat data/kabar.js (kabar terbaru di profil)");
}

// Nina (2 Nov 13.19): label "Baru" pada kabar (IDE.md #19) — teks, 0–3 hari dari tanggal perangkat,
// tanggal tidak valid/masa depan bukan baru, dipakai di kartuKabar() (halaman Kabar, beranda, profil), tanpa animasi kedip.
{
  const app = readFileSync("assets/app.js", "utf8");
  const m = app.match(/function kabarBaru\(t, kini\) \{[\s\S]*?\n  \}/);
  ok(m, "assets/app.js: fungsi kabarBaru(t, kini) tidak ditemukan");
  if (m) {
    const kabarBaru = new Function("return " + m[0])();
    const kini = new Date(2026, 10, 2, 13, 30);
    ok(kabarBaru("2026-11-02", kini) && kabarBaru("2026-10-30", kini), "kabarBaru: kabar 0–3 hari harus diberi label Baru");
    ok(!kabarBaru("2026-10-29", kini) && !kabarBaru("2026-11-03", kini), "kabarBaru: kabar >3 hari atau di masa depan tidak boleh berlabel Baru");
    ok(!kabarBaru("bukan-tanggal", kini) && !kabarBaru(undefined, kini), "kabarBaru: tanggal tidak valid harus dianggap bukan baru");
  }
  ok(/function kartuKabar[\s\S]{0,500}kabarBaru\(k\.tanggal\)[\s\S]{0,120}text: "Baru"/.test(app), "kartuKabar harus menambah label teks \"Baru\"");
  const css = readFileSync("assets/styles.css", "utf8");
  ok(/\.kabar-baru\s*\{/.test(css) && !/\.kabar-baru[^{]*\{[^}]*animation/.test(css), "styles.css: .kabar-baru harus ada dan tanpa animasi");
}

// Nina (3 Nov 08.09): halaman Kabar tampil 10 dulu + tombol "Tampilkan 10 kabar lagi (n tersisa)" (IDE.md #20).
// Tombol <button> asli (bisa keyboard), jumlah tampil di keterangan aria-live, saringan mengulang ke 10, tanpa simpanan.
{
  const app = readFileSync("assets/app.js", "utf8");
  const m = app.match(/function renderKabar\(\) \{[\s\S]*?\n  \}\n/);
  const f = m ? m[0] : "";
  ok(!!m, "app.js: renderKabar() tidak ditemukan");
  ok(/PER_HAL = 10/.test(f) && /hasil\.slice\(0, batas\)/.test(f), "renderKabar: harus menampilkan 10 kabar dulu (hasil.slice(0, batas))");
  ok(/el\("button", \{ type: "button"/.test(f) && /kabar lagi \(" \+ sisa \+ " tersisa\)"/.test(f), "renderKabar: tombol <button> \"Tampilkan n kabar lagi (n tersisa)\" harus ada");
  ok(/lagi\.hidden = sisa <= 0/.test(f), "renderKabar: tombol harus tersembunyi bila tidak ada sisa kabar");
  ok(/addEventListener\("change", function \(\) \{ batas = PER_HAL;/.test(f), "renderKabar: ganti saringan harus mengulang ke 10 kabar");
  ok(/"Menampilkan " \+ tampil\.length \+ " dari "/.test(f), "renderKabar: keterangan aria-live harus menyebut jumlah yang tampil");
  ok(/\.focus\(\)/.test(f), "renderKabar: fokus harus pindah ke kabar pertama yang baru muncul");
  ok(!/localStorage|sessionStorage/.test(f), "renderKabar: tidak boleh memakai simpanan browser");
  // Uji negatif: logika potong sama dengan halaman (25 kabar → 10, sisa 15; 30 → sisa 0 setelah 3 klik)
  const potong = (n, batas) => ({ tampil: Math.min(n, batas), sisa: Math.max(0, n - batas) });
  ok(potong(25, 10).sisa === 15 && potong(25, 30).sisa === 0 && potong(4, 10).tampil === 4, "uji potong kabar gagal");
  const css = readFileSync("assets/styles.css", "utf8");
  ok(/\.tombol-lagi\[hidden\]\s*\{\s*display: none/.test(css), "styles.css: .tombol-lagi[hidden] harus display:none");
}

// Nina (2 Nov 08.10): "Musim laporan 9 bulan" (IDE.md #17) — dihitung dari laba9b 2026, tampil di Peringkat & Radar,
// jumlah tertulis sebagai teks, batang disembunyikan dari pembaca layar, tanpa simpanan.
{
  const app = readFileSync("assets/app.js", "utf8");
  const m = app.match(/function musimLaporan\(wadah\) \{[\s\S]*?\n  \}\n/);
  ok(!!m, "app.js: musimLaporan() tidak ada");
  const f = m ? m[0] : "";
  ok(/laba9b && ada\(e\.laba9b\[2026\]\)/.test(f), "musimLaporan harus menghitung dari laba9b 2026");
  ok(/n \+ " dari " \+ total \+ " emiten"/.test(f), "musimLaporan harus menulis jumlah 'n dari total emiten' sebagai teks");
  ok(/"musim-jalur", "aria-hidden": "true"/.test(f), "batang musim laporan harus aria-hidden (angka sudah tertulis)");
  ok(/el\("details"/.test(f), "musimLaporan harus punya <details> daftar kode");
  ok(!/localStorage|sessionStorage/.test(f), "musimLaporan tidak boleh menyimpan apa pun");
  const pr = app.match(/function renderPeringkat\(\) \{[\s\S]{0,300}/)[0], rd = app.match(/function renderRadar\(\) \{[\s\S]{0,300}/)[0];
  ok(/musimLaporan\(/.test(pr) && /musimLaporan\(/.test(rd), "musimLaporan harus dipanggil di Peringkat dan Radar");
  const sudah = ASLI.filter((e) => e.laba9b && typeof e.laba9b[2026] === "number").length;
  ok(sudah >= 0 && sudah <= ASLI.length, "jumlah laporan 9 bulan tidak masuk akal");
}

// Nina (2 Nov 09.10): baris musim laporan di beranda — hitungan sama (laba9b 2026), angka tertulis, tanpa simpanan.
{
  const app = readFileSync("assets/app.js", "utf8"), idx = readFileSync("index.html", "utf8");
  const m = app.match(/function musimBeranda\(\) \{[\s\S]*?\n  \}\n/);
  ok(!!m, "app.js: musimBeranda() tidak ada");
  const f = m ? m[0] : "";
  ok(/laba9b && ada\(e\.laba9b\[2026\]\)/.test(f), "musimBeranda harus menghitung dari laba9b 2026");
  ok(/n \+ " dari " \+ total \+ " emiten"/.test(f), "musimBeranda harus menulis 'n dari total emiten'");
  ok(/peringkat\.html/.test(f), "musimBeranda harus menaut ke Peringkat");
  ok(!/localStorage|sessionStorage/.test(f), "musimBeranda tidak boleh menyimpan apa pun");
  ok(/id="musim-beranda"[^>]*hidden/.test(idx), "index.html: wadah musim-beranda harus ada dan tersembunyi tanpa JavaScript");
  ok(/musimBeranda\(\);/.test(app), "musimBeranda() harus dipanggil");
}

// 2f. Dividen di profil (Galih & Hana, Arif, Nina, 3 Nov): dps wajib bersumber, judul sumber memuat angka yang sama,
//     dan profil tidak menghitung imbal hasil (harga acuan belum ada)
{
  const app = readFileSync("assets/app.js", "utf8");
  const fmtRp = v => "Rp" + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(v);
  const cekDps = e => {
    if (e.dps == null) return true;
    return typeof e.dps === "number" && e.dps > 0 && (!e.mataUang || e.dpsRupiah === true) && !!e.dpsSumber
      && /^https:\/\//.test(e.dpsSumber.url || "") && (e.dpsSumber.judul || "").includes(fmtRp(e.dps));
  };
  for (const e of ASLI) ok(cekDps(e), `${e.kode}: dps butuh dpsSumber https yang judulnya memuat ${e.dps != null ? fmtRp(e.dps) : "angkanya"}`);
  const contoh = { dps: 20, dpsSumber: { judul: "X: dividen Rp20 per saham", url: "https://contoh.id/a" } };
  ok(!cekDps({ ...contoh, dpsSumber: undefined }), "cek dps tidak menangkap dps tanpa sumber");
  ok(!cekDps({ ...contoh, dps: 21 }), "cek dps tidak menangkap angka yang beda dengan judul sumber");
  ok(!cekDps({ ...contoh, dpsSumber: { judul: contoh.dpsSumber.judul, url: "http://contoh.id/a" } }), "cek dps tidak menangkap sumber non-https");
  ok(!cekDps({ ...contoh, dps: "20" }), "cek dps tidak menangkap dps berupa teks");
  ok(!cekDps({ ...contoh, mataUang: "USD" }), "cek dps tidak menangkap emiten US$ tanpa tanda dpsRupiah");
  ok(cekDps({ ...contoh, mataUang: "USD", dpsRupiah: true }), "cek dps menolak emiten US$ yang dividennya dibayar rupiah");
  ok(!cekDps({ dps: 28.33, dpsSumber: { judul: "X: dividen Rp28,3 per saham", url: "https://contoh.id/a" } }), "cek dps tidak menangkap desimal kedua yang beda dengan judul sumber");
  const m = app.match(/function dividenTampil[\s\S]*?\n  }\n/);
  ok(!!m, "app.js: dividenTampil() tidak ada");
  ok(/maximumFractionDigits: 2/.test(m ? m[0] : ""), "dividenTampil() harus menampilkan dua desimal agar angka DPS tidak dibulatkan");
  ok(/Dividen tunai tahun buku 2025/.test(app) && /e\.dpsSumber\.url/.test(app), "profil harus menampilkan dividen beserta sumbernya");
  ok(/tidak menjamin dividen tahun berikutnya/.test(app), "baris dividen harus memuat catatan bahwa dividen tidak dijamin");
  ok(!/imbal hasil|yield/i.test(m ? m[0] : ""), "baris dividen tidak boleh menghitung imbal hasil");
}

// 2g. Nina (4 Nov 09.09): kalimat catatan untuk pembaca tidak boleh memuat nama field internal
{
  const fieldInternal = /\b(dps|dpsRupiah|dpsSumber|laba9b|labaTahun|periksaUlang|sekaliWaktu9b|sekaliWaktu|desBaris|mataUang|catatan9b)\b/;
  const cekCatatan = (e) => ["catatan", "catatan9b"].every(k => typeof e[k] !== "string" || !fieldInternal.test(e[k]));
  for (const e of ASLI) ok(cekCatatan(e), `${e.kode}: catatan memuat nama field internal (mis. "dps", "laba9b"); tulis dengan bahasa pemula`);
  // uji negatif
  ok(!cekCatatan({ catatan: "Tidak membagi dividen, dps tetap kosong." }), "cek catatan tidak menangkap kata \"dps\"");
  ok(!cekCatatan({ catatan9b: "Angka laba9b 2025 belum ada." }), "cek catatan tidak menangkap \"laba9b\" di catatan9b");
  ok(!cekCatatan({ catatan: "Ditandai periksaUlang oleh tim." }), "cek catatan tidak menangkap \"periksaUlang\"");
  ok(cekCatatan({ catatan: "Dividen per saham (DPS) Rp20, dibayar 24 Juni 2026." }), "cek catatan menolak singkatan DPS yang dijelaskan");
}

// 2h. Nina (4 Nov 14.11, IDE.md #21): setiap tautan "Lompat ke" di profil harus punya judul tujuan dengan id yang sama
{
  const app = readFileSync("assets/app.js", "utf8");
  const m = app.match(/var tujuan = \[([\s\S]*?)\];/);
  ok(!!m, "app.js: daftar tujuan \"Lompat ke\" di profil tidak ada");
  const ids = m ? [...m[1].matchAll(/\["([a-z-]+)", "[^"]+"\]/g)].map(x => x[1]) : [];
  ok(ids.length >= 4, "\"Lompat ke\" harus menaut minimal 4 bagian profil");
  const cekJangkar = (sumber, daftar) => daftar.every(id => new RegExp(`id: "${id}"`).test(sumber));
  ok(cekJangkar(app, ids), "ada tautan \"Lompat ke\" yang tujuannya tidak punya id di app.js");
  ok(!cekJangkar('el("h2", { id: "angka-utama" })', ["angka-utama", "sumber-data"]), "cek jangkar tidak menangkap tujuan yang hilang");
  ok(/akar\.querySelector\("#" \+ t\[0\]\)/.test(app), "\"Lompat ke\" harus hanya menaut bagian yang tampil");
  ok(/prefers-reduced-motion: no-preference\) \{\s*html:has\(#profil\) \{ scroll-behavior: smooth/.test(readFileSync("assets/styles.css", "utf8")), "gulir halus \"Lompat ke\" harus menghormati prefers-reduced-motion");
}

// 2i. Nina (5 Nov 13.08, IDE.md #23): kotak istilah menaut ke Kamus di Belajar, kecuali di halaman Belajar sendiri
{
  const app = readFileSync("assets/app.js", "utf8"), belajar = readFileSync("belajar.html", "utf8");
  const cekKamus = (js, html) => /href: "belajar\.html#kamus"/.test(js) && /if \(!document\.getElementById\("kamus-istilah"\)\)/.test(js)
    && /<section[^>]*id="kamus"/.test(html) && /id="kamus-istilah"/.test(html);
  ok(cekKamus(app, belajar), "kotak istilah harus menaut ke belajar.html#kamus (tidak di halaman Belajar), dan bagian #kamus harus ada");
  ok(!cekKamus(app, belajar.replace('id="kamus" ', "")), "cek kamus tidak menangkap bagian #kamus yang hilang");
  ok(!cekKamus(app.replace('if (!document.getElementById("kamus-istilah")) ', ""), belajar), "cek kamus tidak menangkap tautan yang tampil di halaman Belajar");
}

// 2j. Nina + Arif (7 Nov 16.08): setiap id yang dicari app.js lewat getElementById hanya boleh ada
//  di halaman miliknya (dulu h2#peringkat di Metodologi membuat tabel Peringkat ikut tergambar).
//  Id baru di app.js wajib didaftarkan di peta ini; id yang dibuat app.js sendiri masuk `dibuatJs`.
{
  const app = readFileSync("assets/app.js", "utf8");
  const pemilik = {
    asisten: ["asisten.html"], "isi-halaman": ["metodologi.html"],
    "isi-pelajaran": ["pelajaran.html"], "judul-pelajaran": ["pelajaran.html"], "sub-pelajaran": ["pelajaran.html"],
    "judul-profil": ["emiten.html"], "sub-profil": ["emiten.html"], profil: ["emiten.html"],
    "istilah-hari": ["index.html"], "kabar-beranda": ["index.html"], "lanjutkan-belajar": ["index.html"],
    "mini-peringkat": ["index.html"], "musim-beranda": ["index.html"],
    kabar: ["kabar.html"], "kamus-istilah": ["belajar.html"], rujukan: ["belajar.html"],
    peringkat: ["peringkat.html"], radar: ["radar.html"],
    pita: ["emiten.html", "peringkat.html", "radar.html"],
  };
  const dibuatJs = ["ket-sektor"];
  const cekWadah = (js, isiHalaman) => {
    const salah = [];
    for (const [, id] of js.matchAll(/getElementById\("([^"]+)"\)/g)) {
      if (dibuatJs.includes(id)) continue;
      if (!pemilik[id]) { salah.push(`id "${id}" di app.js belum didaftarkan di peta pemilik cek 2j`); continue; }
      for (const [f, html] of Object.entries(isiHalaman)) {
        const ada = new RegExp(`\\bid="${id}"`).test(html);
        if (ada && !pemilik[id].includes(f)) salah.push(`${f}: id="${id}" bentrok dengan wadah ${pemilik[id].join("/")}`);
        if (!ada && pemilik[id].includes(f)) salah.push(`${f}: wadah id="${id}" hilang`);
      }
    }
    return [...new Set(salah)];
  };
  const isiHalaman = Object.fromEntries(halaman.map((f) => [f, readFileSync(f, "utf8")]));
  for (const pesan of cekWadah(app, isiHalaman)) ok(false, pesan);
  // Uji negatif: id bentrok, wadah hilang, dan id baru tak terdaftar harus tertangkap
  ok(cekWadah(app, { ...isiHalaman, "metodologi.html": isiHalaman["metodologi.html"] + '<h2 id="radar">x</h2>' }).length > 0,
    "cek 2j tidak menangkap id bentrok");
  ok(cekWadah(app, { ...isiHalaman, "kabar.html": isiHalaman["kabar.html"].replace(/\bid="kabar"/, 'id="kabar-x"') }).length > 0,
    "cek 2j tidak menangkap wadah yang hilang");
  ok(cekWadah(app + 'document.getElementById("wadah-baru")', isiHalaman).length > 0,
    "cek 2j tidak menangkap id baru yang belum didaftarkan");
}

// 2k. Nina + Arif (7 Nov 18.08): bagian yang merender ulang isinya (saringan sektor Peringkat, Radar,
//  Kabar, Bandingkan di profil) harus memanggil pasangIstilah lagi pada wadahnya, agar istilah tetap ditandai.
{
  const app = readFileSync("assets/app.js", "utf8");
  const potong = (js, awal, akhir) => { const i = js.indexOf(awal); if (i < 0) return null; const j = js.indexOf(akhir, i); return j < 0 ? null : js.slice(i, j); };
  const RENDER_ULANG = [
    ["Peringkat (tab & saringan sektor)", "function tampilkan(kunci) {", "Object.keys(KRITERIA).forEach", "pasangIstilah(panel)"],
    ["Radar (pilih emiten)", "function renderRadar() {", "pilih.addEventListener(\"change\", tampil)", "pasangIstilah(hasil)"],
    ["Kabar (saringan & Tampilkan lagi)", "function renderKabar() {", "function renderKabarBeranda()", "pasangIstilah(ul)"],
    ["Bandingkan di profil", "pilih.addEventListener(\"change\", function () {\n      // Arif (7 Nov 18.08)", "return wadah;", "pasangIstilah(hasil)"],
  ];
  const cekUlang = (js) => RENDER_ULANG.filter(([, awal, akhir, panggil]) => { const b = potong(js, awal, akhir); return !b || !b.includes(panggil); }).map(([n]) => n);
  for (const n of cekUlang(app)) ok(false, `${n}: isi yang dirender ulang harus ditandai istilah lagi (pasangIstilah)`);
  ok(cekUlang(app.replace("      pasangIstilah(hasil);\n    });\n    return wadah;", "    });\n    return wadah;")).length === 1,
    "cek 2k tidak menangkap Bandingkan yang lupa menandai istilah");
}

// 2l. Nina + Arif (7 Nov 19.09): tombol istilah di tabel punya bidang ketuk >= 24px (padding atas-bawah >= 2px
//  pada teks 22px), dan tombol di kepala tabel kartu yang disembunyikan di HP tidak bisa difokus keyboard.
{
  const css = readFileSync("assets/styles.css", "utf8");
  const app = readFileSync("assets/app.js", "utf8");
  const cekSentuh = (c, js) => {
    const salah = [];
    const m = c.match(/table button\.istilah\s*\{([^}]*)\}/);
    const pad = m && m[1].match(/padding:\s*(\d+(?:\.\d+)?)px/);
    if (!pad || parseFloat(pad[1]) < 2) salah.push("CSS: table button.istilah butuh padding atas-bawah minimal 2px");
    const fn = js.match(/function pasangIstilah\(wadah(?:, sudah)?\) \{[\s\S]*?\n  \}\n/);
    if (!fn || !fn[0].includes("aturIstilahKepalaKartu(wadah)")) salah.push("JS: pasangIstilah harus memanggil aturIstilahKepalaKartu(wadah)");
    if (!/\.tabel-kartu thead button\.istilah[\s\S]{0,200}tabindex", "-1"/.test(js)) salah.push("JS: tombol istilah di kepala tabel kartu harus diberi tabindex -1 di HP");
    return salah;
  };
  for (const pesan of cekSentuh(css, app)) ok(false, `cek 2l: ${pesan}`);
  ok(cekSentuh(css.replace(/table button\.istilah\s*\{[^}]*\}/, ""), app).length === 1, "cek 2l tidak menangkap padding tombol istilah yang hilang");
  ok(cekSentuh(css, app.replace("    aturIstilahKepalaKartu(wadah);\n", "")).length === 1, "cek 2l tidak menangkap pasangIstilah yang lupa mengatur kepala tabel");
}

// 2n. Nina + Arif (8 Nov 07.09): di HP kepala tabel Peringkat disembunyikan, jadi istilah "emiten" dan "sektor"
//  harus disebut di baris "Bingung istilahnya?" (sebelum tabel) agar tetap bisa diketuk di kartu.
{
  const app = readFileSync("assets/app.js", "utf8");
  const kurang = (js) => {
    const m = js.match(/"Bingung istilahnya\? Ketuk: ([^"]*)"/);
    if (!m) return ["baris Bingung istilahnya?"];
    return ["emiten", "sektor"].filter((k) => !new RegExp(`\\b${k}\\b`, "i").test(m[1]));
  };
  for (const k of kurang(app)) ok(false, `cek 2n: baris istilah Peringkat harus menyebut "${k}"`);
  ok(kurang(app.replace("Ketuk: emiten, sektor, ", "Ketuk: ")).length === 2, "cek 2n tidak menangkap istilah emiten/sektor yang hilang");
}

// 2o (Nina, 8 Nov 10.08): istilah di kepala halaman gelap harus bergaris emas (terlihat di --malam),
// kotak istilah di sana tidak mewarisi teks pucat kepala halaman, dan kalimat pembuka Kabar tidak ditandai ganda.
{
  const css = readFileSync("assets/styles.css", "utf8");
  const app = readFileSync("assets/app.js", "utf8");
  const garis = (c) => /\.judul-halaman button\.istilah\s*\{[^}]*text-decoration-color:\s*var\(--bulan\)/.test(c);
  ok(garis(css), "cek 2o: .judul-halaman button.istilah harus bergaris var(--bulan)");
  ok(/\.judul-halaman \.kotak-istilah p\s*\{[^}]*color:\s*var\(--tinta-2\)/.test(css), "cek 2o: teks kotak istilah di kepala halaman harus var(--tinta-2)");
  // Sejak 8 Nov 14.10 kalimat pembuka Kabar ditandai lewat pasangIstilahKepala() (cek 2p), bukan pasangIstilah() langsung,
  // agar istilah yang sudah ada di kartu kabar tidak ganda.
  ok(!app.includes('pasangIstilah(document.querySelector(".judul-halaman .wadah > p"))'), "cek 2o: kalimat pembuka Kabar harus ditandai lewat pasangIstilahKepala(), bukan langsung (agar tidak ganda)");
  ok(!garis(css.replace("text-decoration-color: var(--bulan); }\n.judul-halaman button.istilah:hover", "}\n.judul-halaman button.istilah:hover")), "cek 2o tidak menangkap garis emas yang hilang");
}

// 2p (Nina, 8 Nov 13.08): kalimat pembuka kepala halaman lain ikut ditandai lewat pasangIstilahKepala(),
// yang melewati istilah yang sudah ditandai di isi halaman (agar tidak ganda).
{
  const app = readFileSync("assets/app.js", "utf8");
  const fungsi = (c) => /function pasangIstilahKepala\(\)\s*\{[\s\S]*?!b\.closest\("\.judul-halaman"\)[\s\S]*?pasangIstilah\(p, sudah\)/.test(c);
  ok(fungsi(app), "cek 2p: pasangIstilahKepala() harus melewati istilah yang sudah ditandai di isi halaman");
  ok(/if \(sudah\) Object\.keys\(sudah\)\.forEach\(function \(k\) \{ dipakai\[k\] = true; \}\)/.test(app), "cek 2p: pasangIstilah() harus menerima daftar istilah yang sudah dipakai");
  ok(/\n  if \(!document\.querySelector\("\.judul-halaman button\.istilah"\)\) pasangIstilahKepala\(\);/.test(app), "cek 2p: pasangIstilahKepala() harus dipanggil setelah isi halaman dirender");
  ok(!fungsi(app.replace("!b.closest(\".judul-halaman\")", "true")), "cek 2p tidak menangkap penyaringan yang hilang");
}

// 2q (Nina, 8 Nov 15.10): setiap halaman yang memuat app.js juga memuat data/istilah.js sebelum app.js,
//  agar istilah di kalimat pembuka (mis. Asisten AI) bisa ditandai. Sebelumnya Asisten AI tidak memuat kamus.
{
  const muatKamus = (isi) => {
    const k = isi.indexOf('<script src="data/istilah.js"></script>');
    const a = isi.indexOf('<script src="assets/app.js"></script>');
    return a < 0 || (k >= 0 && k < a);
  };
  for (const f of halaman) ok(muatKamus(readFileSync(f, "utf8")), `cek 2q: ${f} harus memuat data/istilah.js sebelum assets/app.js`);
  ok(!muatKamus('<script src="assets/app.js"></script>'), "cek 2q tidak menangkap halaman tanpa kamus");
}

// 2r (Nina, 8 Nov 17.08): Beranda menandai istilah di hero dan kartu "Alat bantu analisis" dengan satu himpunan bersama
//  (tiap istilah sekali), dan istilah di latar gelap (hero, kartu Radar) bergaris emas dengan teks kotak tidak pucat.
{
  const css = readFileSync("assets/styles.css", "utf8");
  const app = readFileSync("assets/app.js", "utf8");
  const js = (c) => {
    const f = c.match(/function istilahBeranda\(\) \{[\s\S]*?\n  \}\n/);
    return !!f && f[0].includes("pasangIstilah(hero, sudah)") && f[0].includes("function (p) { pasangIstilah(p, sudah)")
      && /\n  istilahBeranda\(\);/.test(c);
  };
  const gaya = (c) => /\.hero button\.istilah, \.panel-gelap button\.istilah\s*\{[^}]*text-decoration-color:\s*var\(--bulan\)/.test(c)
    && /\.hero \.kotak-istilah p, \.panel-gelap \.kotak-istilah p\s*\{[^}]*color:\s*var\(--tinta-2\)/.test(c);
  ok(js(app), "cek 2r: Beranda harus menandai hero dan kartu alat lewat istilahBeranda() dengan himpunan bersama");
  ok(gaya(css), "cek 2r: istilah di hero dan kartu gelap harus bergaris var(--bulan), teks kotak var(--tinta-2)");
  ok(!js(app.replace("function (p) { pasangIstilah(p, sudah)", "function (p) { pasangIstilah(p)")), "cek 2r tidak menangkap kartu yang menandai ganda");
  ok(!gaya(css.replace(".hero .kotak-istilah p, .panel-gelap .kotak-istilah p", ".hero .kotak-istilah p")), "cek 2r tidak menangkap gaya kotak yang hilang");
}

// 3. Aturan Hana (syariah): halaman tidak boleh memakai bahasa ajakan
const terlarang = /\b(wajib beli|pasti naik|buruan (beli|jual)|dijamin untung|rekomendasi beli)\b/i;
for (const f of [...halaman, "data/modul.js", "data/istilah.js", "assets/app.js"]) {
  // Frasa di dalam tanda kutip dianggap contoh yang dibahas, bukan ajakan
  const isi = readFileSync(f, "utf8").replace(/[“"][^“”"\n]{1,40}[”"]/g, "");
  ok(!terlarang.test(isi), `${f} memuat bahasa ajakan yang dilarang`);
}

// Nina (9 Nov 07.09): halaman 404 ramah. Vercel menampilkannya untuk alamat yang tidak ada,
// juga alamat bertingkat (mis. /a/b), jadi semua rujukan lokal wajib alamat absolut (/...).
{
  const isi = existsSync("404.html") ? readFileSync("404.html", "utf8") : "";
  ok(isi, "404.html tidak ada");
  for (const [, url] of isi.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|#)/.test(url)) continue;
    ok(url.startsWith("/"), `404.html: rujukan ${url} harus alamat absolut (/...)`);
  }
  for (const h of ["/index.html", "/belajar.html", "/emiten.html"]) ok(isi.includes(`href="${h}"`), `404.html: tautan ke ${h} tidak ada`);
  ok(/<meta name="robots" content="noindex">/.test(isi), "404.html: harus noindex");
  ok(!/<script/.test(isi), "404.html: tidak memakai JavaScript");
}

// Tampilan cetak (Nina, 9 Nov, IDE.md #26): @media print ada, menyembunyikan kuis/tombol/navigasi,
// dan penafian di kaki halaman (.kaki) tidak pernah disembunyikan saat dicetak.
{
  const css = readFileSync("assets/styles.css", "utf8");
  const m = css.match(/@media print\s*\{([\s\S]*)$/);
  ok(m, "styles.css: @media print belum ada");
  if (m) {
    const cetak = m[1];
    for (const k of [".nav", ".kuis", ".tandai-selesai", ".navigasi-pelajaran"]) {
      ok(new RegExp("\\" + k + "[^{]*\\{[^}]*display:\\s*none").test(cetak) || new RegExp("\\" + k + "\\s*,[^{]*\\{[^}]*display:\\s*none").test(cetak), `cetak: ${k} harus disembunyikan`);
    }
    for (const [, sel, isi] of cetak.matchAll(/([^{}]+)\{([^}]*)\}/g))
      if (/display:\s*none|visibility:\s*hidden/.test(isi)) ok(!/\.kaki\b|footer/.test(sel), "cetak: penafian (.kaki) tidak boleh disembunyikan");
  }
}

// Nina & Arif (9 Nov 13.15): setiap sinyal Radar di periksa() harus punya aturan tertulis di Metodologi
// (bagian "Radar Risiko memeriksa fakta berikut"), dan Metodologi tidak boleh menyebut sinyal yang tidak dijalankan kode.
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  const awal = app.indexOf("function periksa(e)");
  const badan = awal >= 0 ? app.slice(awal, app.indexOf("var urut", awal)) : "";
  ok(badan.length > 0, "app.js: function periksa(e) tidak ditemukan");
  const judul = [...badan.matchAll(/judul:\s*"([^"]+)"/g)].map(m => m[1]);
  const m = metod.match(/Radar Risiko<\/strong> memeriksa fakta berikut[\s\S]*?<\/ul>/);
  ok(m, "metodologi.html: daftar aturan Radar Risiko tidak ditemukan");
  const aturan = m ? m[0] : "";
  // Tiap judul sinyal → kata kunci yang wajib ada di daftar aturan Metodologi.
  const PETA = {
    "Tidak lagi tercatat sebagai saham syariah": /Tidak lagi tercatat di DES/,
    "Merugi pada 2025": /Rugi bersih pada 2025/,
    "Laba turun lebih dari separuh": /laba turun 50% atau lebih/,
    "Laba menurun": /Laba turun kurang dari 50%/,
    "Pendapatan menurun": /pendapatan turun/,
    "Merugi dalam 9 bulan pertama 2026": /Laba 9 bulan 2026[^<]*rugi/,
    "Laba 9 bulan 2026 turun lebih dari separuh": /turun 50% atau lebih = <strong>tinggi/,
    "Laba 9 bulan 2026 menurun": /turun kurang dari 50% = <strong>sedang/,
    "Laba 9 bulan 2026 naik": /naik = catatan informasi/,
    "Perbandingan laba 9 bulan tidak sebanding": null, // dijelaskan di bagian #sekali-waktu
    "Catatan laba 9 bulan": /keterangan khusus laba 9 bulan/,
    "Utang tinggi dibanding modal": /DER lebih dari 2 kali/,
    "Catatan data dari tim kami": /Catatan dari tim kami/,
    "Tidak ada tanda risiko dari pemeriksaan ini": /Tidak ada tanda risiko dari pemeriksaan ini/,
  };
  ok(judul.length >= 10, `app.js: hanya ${judul.length} judul sinyal Radar terbaca`);
  for (const j of judul) {
    ok(j in PETA, `Radar: sinyal "${j}" belum punya aturan tertulis di Metodologi (tambahkan ke metodologi.html dan ke PETA di tes ini)`);
    if (PETA[j]) ok(PETA[j].test(aturan), `metodologi.html: aturan untuk sinyal Radar "${j}" tidak ditemukan`);
  }
  ok(/Perbandingan laba 9 bulan tidak sebanding/.test(metod), "metodologi.html: aturan \"Perbandingan laba 9 bulan tidak sebanding\" tidak ada");
  for (const j of Object.keys(PETA)) ok(judul.includes(j), `tes: sinyal "${j}" ada di PETA tetapi tidak lagi dijalankan app.js`);
  // Sinyal yang sudah dihapus tidak boleh masih dijanjikan di Metodologi.
  ok(!/dihentikan bursa|suspensi/i.test(aturan), "metodologi.html: aturan Radar masih menyebut penghentian perdagangan, padahal sinyalnya tidak dijalankan");
}

// Arif & Nina (9 Nov 14.15): angka batas Radar & sekali-waktu di app.js harus sama dengan angka di Metodologi.
// Kedua angka dibaca dari file masing-masing; bila salah satu diubah tanpa yang lain, tes gagal.
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  const awal = app.indexOf("function periksa(e)");
  const badan = awal >= 0 ? app.slice(awal, app.indexOf("var urut", awal)) : "";
  const m = metod.match(/Radar Risiko<\/strong> memeriksa fakta berikut[\s\S]*?<\/ul>/);
  const aturan = m ? m[0] : "";
  const sw = metod.match(/id="sekali-waktu"[\s\S]*?<\/ul>/);
  const sekali = sw ? sw[0] : "";
  const fSw9 = app.slice(app.indexOf("function sekaliWaktu9b"), app.indexOf("function periksa(e)"));
  const BATAS = [
    ["laba tahunan turun tajam (tinggi)", badan.match(/gl <= -(\d+)/), aturan.match(/laba turun (\d+)% atau lebih/)],
    ["laba tahunan menurun (sedang)", badan.match(/gl <= -(\d+)/), aturan.match(/Laba turun kurang dari (\d+)%/)],
    ["laba 9 bulan turun tajam (tinggi)", badan.match(/g9 <= -(\d+)/), aturan.match(/turun (\d+)% atau lebih = <strong>tinggi/)],
    ["laba 9 bulan menurun (sedang)", badan.match(/g9 <= -(\d+)/), aturan.match(/turun kurang dari (\d+)% = <strong>sedang/)],
    ["DER tinggi", badan.match(/d > (\d+(?:\.\d+)?)\)/), aturan.match(/DER lebih dari (\d+(?:,\d+)?) kali/)],
    ["sekali-waktu 9 bulan", fSw9.match(/porsi < (\d+)\)/), sekali.match(/nilainya (\d+)% atau lebih dari laba 9 bulan/)],
  ];
  for (const [nama, k, t] of BATAS) {
    ok(k, `app.js: angka batas "${nama}" tidak terbaca (pola kode berubah? sesuaikan tes ini)`);
    ok(t, `metodologi.html: angka batas "${nama}" tidak ditemukan`);
    if (k && t) ok(Number(k[1]) === Number(t[1].replace(",", ".")), `Batas "${nama}" berbeda: app.js ${k[1]}, Metodologi ${t[1]}`);
  }
  // Batas nol: "menurun" berarti di bawah 0, "naik" selain itu.
  ok(/gl < 0\)/.test(badan) && /gp < 0\)/.test(badan) && /g9 < 0\)/.test(badan), "app.js: batas nol sinyal 'menurun' berubah, sesuaikan Metodologi & tes");
  // Sekali-waktu tahunan juga 25% (aturan data, ditandai tim): angkanya harus sama dengan 9 bulan.
  const swT = sekali.match(/Seperempat \((\d+)%\) atau lebih/);
  ok(swT && fSw9.match(/porsi < (\d+)\)/) && swT[1] === fSw9.match(/porsi < (\d+)\)/)[1], "metodologi.html: batas sekali-waktu tahunan dan 9 bulan harus sama");
}

// Nina & Tegar (9 Nov 15.13): rumus ROE & DER harus sama di empat tempat: kode roe()/der(), Metodologi,
// ubin penjelasan di profil emiten, dan teks `metode` Peringkat ROE. Bila satu diubah tanpa yang lain, tes gagal.
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  const fRoe = (app.match(/function roe\(e\) \{([^\n]*)\}/) || [])[1] || "";
  const fDer = (app.match(/function der\(e\) \{([^\n]*)\}/) || [])[1] || "";
  ok(/laba25\(e\) \/ e\.ekuitas2025 \* 100/.test(fRoe), "app.js: rumus roe() bukan lagi laba 2025 ÷ ekuitas 2025 × 100, sesuaikan Metodologi, profil & tes");
  ok(/e\.liabilitas2025 \/ e\.ekuitas2025/.test(fDer), "app.js: rumus der() bukan lagi liabilitas 2025 ÷ ekuitas 2025, sesuaikan Metodologi, profil & tes");
  ok(/e\.ekuitas2025 > 0/.test(fRoe) && /e\.ekuitas2025 > 0/.test(fDer), "app.js: roe()/der() tidak lagi mensyaratkan ekuitas > 0, sesuaikan Metodologi");
  ok(/<strong>ROE<\/strong>: laba bersih 2025 ÷ total ekuitas akhir 2025 × 100%/.test(metod), "metodologi.html: kalimat rumus ROE tidak sama dengan kode (laba bersih 2025 ÷ total ekuitas akhir 2025 × 100%)");
  ok(/<strong>DER<\/strong>: total liabilitas akhir 2025 ÷ total ekuitas akhir 2025/.test(metod), "metodologi.html: kalimat rumus DER tidak sama dengan kode (total liabilitas akhir 2025 ÷ total ekuitas akhir 2025)");
  ok(/ubin\("ROE 2025", strip\(roe\(e\)[^\n]*"Laba bersih ÷ ekuitas"\)/.test(app), "app.js: ubin ROE di profil harus memakai roe(e) dengan keterangan \"Laba bersih ÷ ekuitas\"");
  ok(/ubin\("DER akhir 2025", strip\(der\(e\)[^\n]*"Liabilitas ÷ ekuitas"\)/.test(app), "app.js: ubin DER di profil harus memakai der(e) dengan keterangan \"Liabilitas ÷ ekuitas\"");
  ok(/metode: "Laba bersih 2025 dibagi total ekuitas akhir 2025\./.test(app), "app.js: teks metode Peringkat ROE tidak sama dengan rumus Metodologi");
}

// Nina & Arif (9 Nov 16.10): teks `metode` Peringkat pertumbuhan laba & pendapatan ("2025 dibanding 2024")
// harus cocok dengan fungsi di kode (tumbuh(2024 → 2025)), dengan kriteria yang memakai fungsi itu, dan dengan Metodologi.
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  const fT = (app.match(/function tumbuh\(a, b\) \{([^\n]*)\}/) || [])[1] || "";
  ok(/\(b - a\) \/ Math\.abs\(a\) \* 100/.test(fT), "app.js: rumus tumbuh() bukan lagi (b − a) ÷ |a| × 100, sesuaikan Metodologi & tes");
  ok(/function tumbuhLaba\(e\) \{[^\n]*tumbuh\(e\.labaTahun\[2024\], e\.labaTahun\[2025\]\)/.test(app), "app.js: tumbuhLaba() tidak lagi membandingkan laba 2025 dengan 2024, sesuaikan teks metode & Metodologi");
  ok(/function tumbuhPendapatan\(e\) \{[^\n]*tumbuh\(e\.pendapatan\[2024\], e\.pendapatan\[2025\]\)/.test(app), "app.js: tumbuhPendapatan() tidak lagi membandingkan pendapatan 2025 dengan 2024, sesuaikan teks metode & Metodologi");
  ok(/tumbuhLaba: \{\s*label: "Pertumbuhan laba", nilai: tumbuhLaba,[^}]*kolom: "Laba 2025 vs 2024",\s*metode: "Perubahan laba bersih 2025 dibanding 2024\."/.test(app), "app.js: kriteria Pertumbuhan laba harus memakai tumbuhLaba dengan kolom & metode '2025 dibanding 2024'");
  ok(/tumbuh: \{\s*label: "Pertumbuhan pendapatan", nilai: tumbuhPendapatan,[^}]*kolom: "Pendapatan 2025 vs 2024",\s*metode: "Perubahan pendapatan 2025 dibanding 2024\."/.test(app), "app.js: kriteria Pertumbuhan pendapatan harus memakai tumbuhPendapatan dengan kolom & metode '2025 dibanding 2024'");
  ok(/<strong>Pertumbuhan laba<\/strong> dan <strong>pertumbuhan pendapatan<\/strong>: \(angka 2025 − angka 2024\) ÷ angka 2024 × 100%/.test(metod), "metodologi.html: rumus pertumbuhan tidak sama dengan kode ((angka 2025 − angka 2024) ÷ angka 2024 × 100%)");
  ok(/pembaginya memakai angka 2024 tanpa tanda minus/.test(metod), "metodologi.html: penjelasan pembagi tanpa tanda minus (Math.abs) hilang, padahal kode memakainya");
}

// Nina & Fajar (9 Nov 16.10): setiap judul sumber di data emiten harus menyebut tahun (periode atau tanggal baca),
// supaya pembaca tahu angka itu dari tahun buku mana.
{
  const raw = readFileSync("data/emiten-asli.js", "utf8");
  for (const m of raw.matchAll(/judul: "([^"]*)"/g)) ok(/20\d\d/.test(m[1]), "data/emiten-asli.js: judul sumber tanpa tahun: " + m[1]);
}

// Nina & Arif (9 Nov 17.09): Peringkat "Laba bersih terbesar" hanya membandingkan emiten berlaporan rupiah.
// Teks metode, kode penyaring (rupiahSaja + usd()), dan Metodologi harus mengatakan hal yang sama.
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  ok(/laba: \{\s*label: "Laba bersih terbesar", nilai: laba25,[^}]*rupiahSaja: true,[^}]*kolom: "Laba 2025",\s*metode: "Laba bersih tahun buku 2025\. Emiten yang melapor dalam dolar AS tidak ikut urutan ini/.test(app), "app.js: kriteria 'Laba bersih terbesar' harus memakai laba25, rupiahSaja: true, dan teks metode yang menyebut emiten dolar AS tidak ikut");
  ok(/function usd\(e\) \{ return e && e\.mataUang === "USD"; \}/.test(app), "app.js: usd() tidak lagi membaca mataUang === \"USD\", penyaring rupiahSaja bisa bocor");
  const fPeserta = (app.match(/function peserta\(kunci\) \{[\s\S]*?\n  \}/) || [""])[0];
  ok(/!\(k\.rupiahSaja && usd\(e\)\)/.test(fPeserta), "app.js: peserta() tidak lagi menyaring emiten dolar AS untuk kriteria rupiahSaja");
  const rupiahSaja = (app.match(/rupiahSaja: true/g) || []).length;
  ok(rupiahSaja === 1, "app.js: rupiahSaja: true dipakai " + rupiahSaja + " kali; Metodologi hanya menyebut 'Laba bersih terbesar' yang khusus rupiah");
  ok(/Untuk "Laba bersih terbesar", hanya emiten yang melapor dalam rupiah yang dibandingkan\./.test(metod), "metodologi.html: kalimat 'Laba bersih terbesar hanya emiten rupiah' hilang, padahal kode menyaringnya");
  for (const e of ASLI) ok(e.mataUang === undefined || e.mataUang === "USD" || e.mataUang === "IDR", "data/emiten-asli.js: mataUang " + e.kode + " tidak dikenal (" + e.mataUang + "), penyaring usd() bisa salah");
}

// Nina & Arif (9 Nov 18.14): kotak "Laba 9 bulan" di profil emiten harus memakai istilah yang sama dengan Metodologi:
// Januari–September, 2025 dibanding 2026, laporan kuartalan belum diaudit; dan setiap laba 9 bulan di data
// wajib punya catatan yang menyebut apakah angkanya laba diatribusikan kepada pemilik entitas induk (aturan Metodologi bagian Laba bersih).
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  ok(/"Laba Januari–September: " \+ rp\(N\[2025\]\) \+ " \(2025\) → " \+ rp\(N\[2026\]\) \+ " \(2026\), " \+ ubah\(g9\) \+ "\. Laporan kuartalan umumnya belum diaudit\."/.test(app), "app.js: kalimat laba 9 bulan di profil tidak lagi 'Laba Januari–September: … (2025) → … (2026)' + 'belum diaudit', sesuaikan Metodologi");
  ok(/"Laba Januari–September 2026 belum kami masukkan: laporan kuartal III belum rilis atau angkanya belum bisa dipastikan\."/.test(app), "app.js: kalimat 'belum kami masukkan' laba 9 bulan di profil berubah, cek Metodologi bagian jadwal");
  ok(/"Jan–Sep " \+ th/.test(app) && /\[2025, 2026\]\.forEach\(function \(th\)/.test(app), "app.js: label batang 9 bulan harus 'Jan–Sep 2025' dan 'Jan–Sep 2026'");
  ok(/Laba 9 bulan \(Januari–September\) mulai ditambahkan bertahap/.test(metod) && /Radar Risiko membandingkannya dengan periode yang sama tahun lalu\. Laporan kuartalan biasanya belum diaudit\./.test(metod), "metodologi.html: kalimat jadwal laba 9 bulan (Januari–September, periode sama tahun lalu, belum diaudit) hilang");
  ok(/Laba 9 bulan 2026 dibanding 9 bulan 2025/.test(metod), "metodologi.html: aturan Radar 'Laba 9 bulan 2026 dibanding 9 bulan 2025' hilang");
  ok(/Bila sumber tidak memisahkannya, kami tulis keterangannya di catatan emiten\./.test(metod), "metodologi.html: aturan 'bila sumber tidak memisahkan laba atribusi, ditulis di catatan' hilang");
  for (const e of ASLI) {
    const n = e.laba9b || {};
    if (n[2025] == null && n[2026] == null) continue;
    ok(/diatribusikan/.test(e.catatan9b || ""), "data/emiten-asli.js: " + e.kode + " punya laba 9 bulan tetapi catatan9b tidak menyebut apakah angkanya laba diatribusikan kepada pemilik entitas induk");
  }
}

// Nina & Arif (9 Nov 19.16): sinyal Radar laba 9 bulan dijalankan langsung (bukan hanya dibaca polanya) dengan
// contoh angka, lalu tingkat & kalimat buktinya dicocokkan dengan aturan Metodologi bagian Radar:
// rugi atau turun ≥ batas = tinggi, turun < batas = sedang, naik = catatan informasi; bukti selalu menyebut
// "Laba Januari–September: … (2025) → … (2026), …".
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  const aturan = (metod.match(/Laba 9 bulan 2026 dibanding 9 bulan 2025[^<]*(?:<[^>]+>[^<]*)*?<\/li>/) || [""])[0];
  ok(/rugi atau turun (\d+)% atau lebih = <strong>tinggi<\/strong>, turun kurang dari \1% = <strong>sedang<\/strong>, naik = catatan informasi/.test(aturan),
    "metodologi.html: aturan Radar laba 9 bulan tidak lagi 'rugi atau turun N% atau lebih = tinggi, turun kurang dari N% = sedang, naik = catatan informasi'");
  const batas = Number((aturan.match(/turun (\d+)% atau lebih/) || [])[1]);
  const mulai = app.indexOf("// Laba 9 bulan (Januari–September) 2026");
  const akhir = app.indexOf("var sw9", mulai);
  const helper = ["ubah", "ada", "tumbuh"].map(n => (app.match(new RegExp("function " + n + "\\([^\\n]*")) || [""])[0]).join("\n");
  ok(mulai >= 0 && akhir > mulai && helper.split("\n").every(Boolean), "app.js: blok Radar laba 9 bulan atau fungsi bantu (ubah/ada/tumbuh) tidak ditemukan, sesuaikan tes ini");
  if (mulai >= 0 && akhir > mulai && batas) {
    const sinyal9 = vm.runInNewContext(`(function (e) {
      function persen(p) { return p.toFixed(1) + "%"; }
      function rp(v) { return "Rp" + v; }
      ${helper}
      var s = [];
      ${app.slice(mulai, akhir)} }
      return s; })`);
    const contoh = [
      ["rugi", { 2025: 100, 2026: -10 }, "tinggi"],
      ["turun tepat batas", { 2025: 100, 2026: 100 - batas }, "tinggi"],
      ["turun sedikit di bawah batas", { 2025: 100, 2026: 100 - batas + 1 }, "sedang"],
      ["turun tipis", { 2025: 100, 2026: 99.9 }, "sedang"],
      ["tetap", { 2025: 100, 2026: 100 }, "info"],
      ["naik", { 2025: 100, 2026: 130 }, "info"],
    ];
    for (const [nama, laba9b, harap] of contoh) {
      const s = sinyal9({ laba9b });
      ok(s.length === 1 && s[0].tingkat === harap, `app.js: Radar laba 9 bulan contoh "${nama}" memberi tingkat ${s.map(x => x.tingkat).join(",") || "(tidak ada)"}, Metodologi mengatur ${harap}`);
      ok(s[0] && /^Laba Januari–September: Rp\S+ \(2025\) → Rp\S+ \(2026\), [+-]?\S+%\.$/.test(s[0].bukti), `app.js: bukti Radar laba 9 bulan contoh "${nama}" tidak berbentuk 'Laba Januari–September: … (2025) → … (2026), …%.' (${s[0] && s[0].bukti})`);
      ok(s[0] && /Januari–September 2026/.test(s[0].isi), `app.js: isi sinyal Radar laba 9 bulan contoh "${nama}" tidak menyebut periode Januari–September 2026`);
    }
    ok(sinyal9({ laba9b: { 2026: 50 } }).length === 0, "app.js: Radar laba 9 bulan muncul tanpa pembanding 2025, padahal Metodologi membandingkan dengan periode yang sama tahun lalu");
    ok(/belum diaudit/.test((sinyal9({ laba9b: { 2025: 100, 2026: 130 } })[0] || {}).isi || ""), "app.js: sinyal 'Laba 9 bulan 2026 naik' harus mengingatkan laporan kuartalan umumnya belum diaudit (sama dengan Metodologi)");
  }
}

// Nina & Arif (9 Nov 20.16): sinyal Radar tahunan dijalankan langsung lewat fungsi periksa() di app.js
// (bukan hanya dibaca polanya) dengan contoh angka, lalu dicocokkan dengan Metodologi bagian Radar:
// rugi 2025 atau laba turun ≥50% = tinggi; laba turun <50% atau pendapatan turun = sedang; DER > 2 = sedang;
// tanpa tanda tinggi/sedang → "Tidak ada tanda risiko dari pemeriksaan ini".
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  ok(/Rugi bersih pada 2025, atau laba turun (\d+)% atau lebih: tanda <strong>tinggi<\/strong>/.test(metod), "metodologi.html: aturan Radar 'Rugi bersih pada 2025, atau laba turun N% atau lebih: tinggi' hilang");
  ok(/Laba turun kurang dari (\d+)%, atau pendapatan turun: tanda <strong>sedang<\/strong>/.test(metod), "metodologi.html: aturan Radar 'Laba turun kurang dari N%, atau pendapatan turun: sedang' hilang");
  ok(/DER lebih dari 2 kali: tanda <strong>sedang<\/strong>/.test(metod), "metodologi.html: aturan Radar 'DER lebih dari 2 kali: sedang' hilang");
  const batas = Number((metod.match(/laba turun (\d+)% atau lebih: tanda <strong>tinggi/) || [])[1]);
  const batas2 = Number((metod.match(/Laba turun kurang dari (\d+)%/) || [])[1]);
  ok(batas && batas === batas2, "metodologi.html: batas 'laba turun N%' untuk tinggi dan sedang tidak sama");
  // Ambil satu fungsi utuh dari app.js dengan menghitung kurung kurawal.
  const fungsi = nama => {
    const i = app.indexOf("function " + nama + "(");
    if (i < 0) return "";
    let k = app.indexOf("{", i), d = 0;
    for (let j = k; j < app.length; j++) { if (app[j] === "{") d++; else if (app[j] === "}" && --d === 0) return app.slice(i, j + 1); }
    return "";
  };
  const nama = ["uang", "rupiahMiliar", "dolarJuta", "usd", "persen", "ubah", "ada", "tumbuh", "tumbuhLaba", "tumbuhPendapatan", "der", "sekaliWaktu9b", "periksa"];
  const kode = nama.map(fungsi);
  const des = (app.match(/var DES_LABEL = [^\n]*/) || [""])[0];
  const fmt = ["angka", "angka2"].map(n => (app.match(new RegExp("var " + n + " = [^\\n]*")) || [""])[0]).join("\n");
  ok(kode.every(Boolean) && des && fmt.split("\n").every(Boolean), "app.js: fungsi periksa() atau fungsi bantunya (" + nama.filter((n, i) => !kode[i]).join(", ") + ") tidak ditemukan, sesuaikan tes ini");
  if (kode.every(Boolean) && des && fmt && batas) {
    const periksa = vm.runInNewContext(`(function () { ${des}\n${fmt}\n${kode.join("\n")}\n return periksa; })()`);
    const tanda = e => periksa(Object.assign({ kode: "CONTOH", labaTahun: { 2024: 100, 2025: 100 }, pendapatan: { 2024: 1000, 2025: 1000 }, ekuitas2025: 100, liabilitas2025: 100 }, e));
    const tingkatJudul = (s, re) => (s.find(x => re.test(x.judul)) || {}).tingkat;
    const contoh = [
      ["rugi 2025", { labaTahun: { 2024: 100, 2025: -10 } }, /^Merugi pada 2025$/, "tinggi", /^Laba 2025: .+\.$/],
      ["laba turun tepat batas", { labaTahun: { 2024: 100, 2025: 100 - batas } }, /^Laba turun lebih dari separuh$/, "tinggi", /^Laba: .+ \(2024\) → .+ \(2025\), −\S+%\.$/],
      ["laba turun di bawah batas", { labaTahun: { 2024: 100, 2025: 100 - batas + 1 } }, /^Laba menurun$/, "sedang", /^Laba: .+ \(2024\) → .+ \(2025\), −\S+%\.$/],
      ["laba turun tipis", { labaTahun: { 2024: 100, 2025: 99.9 } }, /^Laba menurun$/, "sedang", /−0,1%/],
      ["pendapatan turun", { pendapatan: { 2024: 1000, 2025: 990 } }, /^Pendapatan menurun$/, "sedang", /^Pendapatan: .+ → .+ \(−1%\)\.$/],
      ["DER di atas 2", { liabilitas2025: 201 }, /^Utang tinggi dibanding modal$/, "sedang", /^DER akhir 2025: 2x\.$/],
    ];
    for (const [nm, e, judul, harap, bukti] of contoh) {
      const s = tanda(e), x = s.find(y => judul.test(y.judul));
      ok(x && x.tingkat === harap, `app.js: Radar tahunan contoh "${nm}" memberi tingkat ${x ? x.tingkat : "(tidak ada)"}, Metodologi mengatur ${harap}`);
      ok(x && bukti.test(x.bukti), `app.js: bukti Radar tahunan contoh "${nm}" tidak sesuai bentuk yang diharapkan (${x && x.bukti})`);
      ok(!s.some(y => y.tingkat === "aman"), `app.js: Radar contoh "${nm}" punya tanda ${harap} tetapi tetap menulis "Tidak ada tanda risiko"`);
    }
    // Batas yang TIDAK boleh memberi tanda
    ok(!tingkatJudul(tanda({ liabilitas2025: 200 }), /^Utang tinggi/), "app.js: DER tepat 2 kali sudah diberi tanda, padahal Metodologi: 'lebih dari 2 kali'");
    ok(!tingkatJudul(tanda({ labaTahun: { 2024: 100, 2025: 130 }, pendapatan: { 2024: 1000, 2025: 1200 } }), /^(Laba|Pendapatan)/), "app.js: laba/pendapatan naik malah diberi tanda Radar");
    const bersih = tanda({});
    ok(bersih.length === 1 && bersih[0].tingkat === "aman" && bersih[0].judul === "Tidak ada tanda risiko dari pemeriksaan ini",
      "app.js: emiten tanpa tanda harus mendapat satu sinyal 'Tidak ada tanda risiko dari pemeriksaan ini' (sesuai Metodologi)");
    const dobel = tanda({ labaTahun: { 2024: 100, 2025: 40 }, liabilitas2025: 300 });
    ok(dobel[0] && dobel[0].tingkat === "tinggi" && dobel.every((x, i) => i === 0 || ["tinggi", "sedang", "info", "aman"].indexOf(x.tingkat) >= ["tinggi", "sedang", "info", "aman"].indexOf(dobel[i - 1].tingkat)),
      "app.js: sinyal Radar tidak diurutkan tinggi → sedang → info");
    ok(tingkatJudul(tanda({ keluarDES: true }), /^Tidak lagi tercatat sebagai saham syariah$/) === "tinggi", "app.js: emiten keluar DES tidak diberi tanda tinggi (Metodologi: tinggi)");
    // Emiten dolar AS: bukti memakai US$, bukan Rp
    const dolar = tanda({ mataUang: "USD", labaTahun: { 2024: 100, 2025: 40 } }).find(x => /^Laba turun/.test(x.judul));
    ok(dolar && /US\$/.test(dolar.bukti) && !/Rp/.test(dolar.bukti), `app.js: bukti Radar emiten dolar AS harus memakai US$ (${dolar && dolar.bukti})`);
  }
}

// Nina & Arif (9 Nov 21.14): aturan ikut/tidak ikut Peringkat dijalankan langsung lewat peserta() dan urutkan()
// di app.js dengan contoh emiten, lalu dicocokkan dengan Metodologi: hanya saham di DES, angka lengkap,
// tanda periksa ulang & sekali-waktu tidak ikut, emiten dolar AS hanya keluar dari "Laba bersih terbesar",
// bank syariah (DER tidak dihitung) tetap ikut ukuran yang angkanya ada.
{
  const app = readFileSync("assets/app.js", "utf8");
  const metod = readFileSync("metodologi.html", "utf8");
  ok(/Hanya saham yang masih tercatat di DES dan angkanya lengkap yang ikut diurutkan/.test(metod), "metodologi.html: kalimat 'Hanya saham yang masih tercatat di DES dan angkanya lengkap yang ikut diurutkan' hilang");
  ok(/tanda <strong>periksa ulang<\/strong>[^<]*tidak ikut Peringkat sampai angkanya pasti/.test(metod), "metodologi.html: aturan 'periksa ulang → tidak ikut Peringkat' hilang");
  ok(/Seperempat \(25%\) atau lebih: emiten <strong>tidak ikut Peringkat<\/strong>/.test(metod), "metodologi.html: aturan sekali-waktu 25% hilang");
  ok(/emiten ini tetap ikut Peringkat untuk ukuran tersebut\. Untuk "Laba bersih terbesar", hanya emiten yang melapor dalam rupiah yang dibandingkan/.test(metod), "metodologi.html: aturan emiten dolar AS di Peringkat hilang");
  const blok = (awal) => {
    const i = app.indexOf(awal);
    if (i < 0) return "";
    let k = app.indexOf("{", i), d = 0;
    for (let j = k; j < app.length; j++) { if (app[j] === "{") d++; else if (app[j] === "}" && --d === 0) return app.slice(i, j + 1) + ";"; }
    return "";
  };
  const nama = ["uang", "rupiahMiliar", "dolarJuta", "usd", "persen", "ubah", "ada", "tumbuh", "laba25", "tumbuhLaba", "tumbuhPendapatan", "roe", "syariahAktif", "diluarPeringkat", "peserta", "urutkan"];
  const kode = nama.map(n => blok("function " + n + "("));
  const krit = blok("var KRITERIA = {");
  const fmt = ["angka", "angka2"].map(n => (app.match(new RegExp("var " + n + " = [^\\n]*")) || [""])[0]).join("\n");
  ok(kode.every(Boolean) && krit && fmt.split("\n").every(Boolean), "app.js: fungsi Peringkat (" + nama.filter((n, i) => !kode[i]).join(", ") + ") atau KRITERIA tidak ditemukan, sesuaikan tes ini");
  if (kode.every(Boolean) && krit) {
    const dasar = { desBaris: 1, labaTahun: { 2024: 100, 2025: 120 }, pendapatan: { 2024: 1000, 2025: 1100 }, ekuitas2025: 600, sektor: "Contoh" };
    const contoh = [
      ["BIASA", {}],
      ["NONDES", { desBaris: null }],
      ["KELUAR", { keluarDES: true }],
      ["ULANG", { periksaUlang: "dua sumber berbeda" }],
      ["SEKALI", { sekaliWaktu: "laba penjualan anak usaha sekitar 30%." }],
      ["DOLAR", { mataUang: "USD", labaTahun: { 2024: 100, 2025: 900 }, ekuitas2025: 1000 }],
      ["BANK", { pendapatan: null, catatan: "Bank syariah: DER tidak dihitung." }],
      ["KOSONG", { labaTahun: { 2025: 50 } }],
    ].map(([kd, x]) => Object.assign({ kode: kd }, dasar, x));
    const r = vm.runInNewContext(`(function (EMITEN) { ${fmt}\n${kode.join("\n")}\n${krit}\n return { peserta: peserta, urutkan: urutkan, KRITERIA: KRITERIA }; })`)(contoh);
    const ikut = k => r.peserta(k).map(e => e.kode).sort().join(",");
    ok(ikut("laba") === "BANK,BIASA,KOSONG", `app.js: peserta 'Laba bersih terbesar' = ${ikut("laba")}, Metodologi: tanpa non-DES, keluar DES, periksa ulang, sekali-waktu, dan dolar AS`);
    ok(ikut("tumbuhLaba") === "BANK,BIASA,DOLAR", `app.js: peserta 'Pertumbuhan laba' = ${ikut("tumbuhLaba")}, Metodologi: dolar AS tetap ikut, angka tak lengkap (laba 2024 kosong) tidak ikut`);
    ok(ikut("tumbuh") === "BIASA,DOLAR,KOSONG", `app.js: peserta 'Pertumbuhan pendapatan' = ${ikut("tumbuh")}, bank tanpa angka pendapatan tidak boleh ikut`);
    ok(ikut("roe") === "BANK,BIASA,DOLAR,KOSONG", `app.js: peserta 'ROE tertinggi' = ${ikut("roe")}, bank syariah & dolar AS tetap ikut ROE`);
    const urut = r.urutkan("tumbuhLaba").map(e => e.kode).join(",");
    ok(urut === "DOLAR,BANK,BIASA" || urut === "DOLAR,BIASA,BANK", `app.js: urutan 'Pertumbuhan laba' salah (${urut}); DOLAR (+800%) harus di atas`);
    ok(r.urutkan("laba", "Lain").length === 0 && r.urutkan("laba", "Contoh").length === 3, "app.js: saring sektor di Peringkat tidak bekerja");
    ok(Object.keys(r.KRITERIA).filter(k => r.KRITERIA[k].rupiahSaja).join() === "laba", "app.js: hanya 'Laba bersih terbesar' yang boleh rupiahSaja (Metodologi)");
  }
}

// Nina & Arif (10 Nov 07.10): kotak "Posisi di Peringkat" di profil emiten dijalankan langsung lewat posisi()
// di app.js dengan contoh emiten, lalu dicocokkan dengan Metodologi (DES, periksa ulang, sekali-waktu, angka
// lengkap) dan dengan peserta() Peringkat: nomor urut dan jumlah emiten harus sama dengan halaman Peringkat.
{
  const app = readFileSync("assets/app.js", "utf8");
  const blok = (awal) => {
    const i = app.indexOf(awal);
    if (i < 0) return "";
    let k = app.indexOf("{", i), d = 0;
    for (let j = k; j < app.length; j++) { if (app[j] === "{") d++; else if (app[j] === "}" && --d === 0) return app.slice(i, j + 1) + ";"; }
    return "";
  };
  const nama = ["uang", "rupiahMiliar", "dolarJuta", "usd", "persen", "ubah", "ada", "tumbuh", "laba25", "tumbuhLaba", "tumbuhPendapatan", "roe", "syariahAktif", "diluarPeringkat", "peserta", "urutkan", "posisi"];
  const kode = nama.map(n => blok("function " + n + "("));
  const krit = blok("var KRITERIA = {");
  const fmt = ["angka", "angka2"].map(n => (app.match(new RegExp("var " + n + " = [^\\n]*")) || [""])[0]).join("\n");
  ok(kode.every(Boolean) && krit, "app.js: fungsi Posisi di Peringkat (" + nama.filter((n, i) => !kode[i]).join(", ") + ") atau KRITERIA tidak ditemukan, sesuaikan tes ini");
  if (kode.every(Boolean) && krit) {
    const dasar = { desBaris: 1, pendapatan: { 2024: 1000, 2025: 1100 }, ekuitas2025: 1000, sektor: "Contoh" };
    const contoh = [
      ["ATAS", { labaTahun: { 2024: 100, 2025: 300 } }],      // laba +200%, ROE 30%
      ["TENGAH", { labaTahun: { 2024: 100, 2025: 150 } }],    // laba +50%, ROE 15%
      ["DOLAR", { mataUang: "USD", labaTahun: { 2024: 100, 2025: 110 } }], // laba +10%, ROE 11%
      ["KOSONG", { labaTahun: { 2025: 200 } }],               // laba 2024 kosong, ROE 20%
      ["NONDES", { desBaris: null, labaTahun: { 2024: 1, 2025: 900 } }],
      ["KELUAR", { keluarDES: true, labaTahun: { 2024: 1, 2025: 900 } }],
      ["ULANG", { periksaUlang: "dua sumber berbeda", labaTahun: { 2024: 1, 2025: 900 } }],
      ["SEKALI", { sekaliWaktu: "laba penjualan anak usaha sekitar 30%.", labaTahun: { 2024: 1, 2025: 900 } }],
    ].map(([kd, x]) => Object.assign({ kode: kd }, dasar, x));
    const buat = vm.runInNewContext(`(function (EMITEN, e) { ${fmt}\n${kode.join("\n")}\n${krit}\n return { posisi: posisi, peserta: peserta }; })`);
    const pos = (kd, kunci) => { const e = contoh.find(x => x.kode === kd); return buat(contoh, e).posisi(kunci, "X"); };
    const harap = [
      ["ATAS", "tumbuhLaba", /^X: urutan 1 dari 3 emiten \(/],
      ["TENGAH", "tumbuhLaba", /^X: urutan 2 dari 3 emiten \(/],
      ["DOLAR", "tumbuhLaba", /^X: urutan 3 dari 3 emiten \(/],
      ["ATAS", "roe", /^X: urutan 1 dari 4 emiten \(/],
      ["KOSONG", "roe", /^X: urutan 2 dari 4 emiten \(/],
      ["DOLAR", "roe", /^X: urutan 4 dari 4 emiten \(/],
      ["KOSONG", "tumbuhLaba", /^X: belum ikut Peringkat karena datanya belum lengkap\.$/],
      ["NONDES", "roe", /^X: tidak ikut Peringkat karena tidak tercatat di Daftar Efek Syariah terbaru\.$/],
      ["KELUAR", "tumbuhLaba", /^X: tidak ikut Peringkat karena tidak tercatat di Daftar Efek Syariah terbaru\.$/],
      ["ULANG", "roe", /^X: belum ikut Peringkat karena angkanya sedang dicek ulang/],
      ["SEKALI", "tumbuhLaba", /^X: tidak ikut Peringkat karena laba 2025 banyak ditopang keuntungan sekali-waktu/],
    ];
    harap.forEach(([kd, kunci, re]) => { const t = pos(kd, kunci); ok(re.test(t), `app.js: Posisi di Peringkat ${kd}/${kunci} = "${t}", tidak sesuai aturan Metodologi`); });
    // Jumlah "dari N emiten" harus sama dengan peserta() halaman Peringkat
    const r = buat(contoh, contoh[0]);
    ["tumbuhLaba", "roe"].forEach(k => ok(new RegExp("dari " + r.peserta(k).length + " emiten").test(pos("ATAS", k)), `app.js: Posisi di Peringkat (${k}) memakai jumlah emiten berbeda dari Peringkat`));
    ok(/Urutan 1 = angka tertinggi[^"]*bukan saran membeli atau menjual/.test(app), "app.js: catatan 'Urutan 1 = angka tertinggi … bukan saran membeli atau menjual' di kotak Posisi hilang");
    ok(/posisi\("tumbuhLaba"[^)]*\)[\s\S]{0,120}posisi\("roe"/.test(app), "app.js: kotak Posisi harus menampilkan Pertumbuhan laba dan ROE");
  }
}

if (gagal) { console.error(`\n${gagal} pemeriksaan gagal.`); process.exit(1); }
console.log(`Semua pemeriksaan lolos: ${halaman.length} halaman, ${MODUL.length} pelajaran, ${ASLI.length} emiten asli.`);

