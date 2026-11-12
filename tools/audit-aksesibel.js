// Nina & Tegar (12 Nov 17.09): audit aksesibilitas pada DOM yang sudah dirender (bukan hanya HTML statis),
// untuk semua 10 halaman + keadaan interaktif (Radar memilih emiten, kotak istilah terbuka, profil emiten, pelajaran dengan kuis dijawab).
// Diperiksa: setiap <img> punya atribut alt (boleh kosong untuk hiasan); setiap <button> punya nama
// (teks, aria-label, aria-labelledby, atau title); setiap <input>/<textarea>/<select> yang terlihat punya <label>,
// aria-label, atau aria-labelledby; aria-labelledby/aria-describedby/for menunjuk id yang ada; tidak ada id ganda.
// Nina & Arif (12 Nov 18.12) menambah: setiap <a href> yang terlihat punya nama (teks, alt gambar, aria-label/labelledby, title);
// setiap target="_blank" memakai rel berisi noopener dan menyebut "tab baru" di teks/aria-label/title; urutan judul h1→h6
// di dalam <main> tidak melompat turun (mis. h2 langsung ke h4) dan judul pertama di <main> adalah h1.
// Halaman "UJI" sengaja memasang 8 pelanggaran; audit wajib menangkapnya (uji balik), jadi hasil sehat = tepat 8 temuan UJI.
// Cara pakai: python3 -m http.server 8765 (di akar repo), lalu: node tools/audit-aksesibel.js
// Butuh Playwright + Chromium (sudah ada di lingkungan kerja tim); tidak dijalankan oleh tests/cek.mjs.
const { chromium } = require('playwright');
const halaman = ['index.html', 'belajar.html', 'pelajaran.html', 'pelajaran.html#kuis', 'peringkat.html', 'peringkat.html#istilah', 'radar.html',
  'radar.html#UNTR', 'emiten.html', 'emiten.html?kode=ANTM', 'kabar.html', 'metodologi.html', 'asisten.html', '404.html', 'UJI'];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
  const galat = []; p.on('pageerror', (e) => galat.push(e.message));
  let total = 0, totalUji = 0;
  for (const h of halaman) {
    const [jalur, pagar] = h.split('#');
    await p.goto('http://localhost:8765/' + (jalur === 'UJI' ? 'peringkat.html' : jalur)); await p.waitForTimeout(400);
    if (jalur === 'UJI') await p.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend',
      '<img src="x.png"><button></button><input type="text"><p id="isi">ganda</p>' +
      '<a href="#"></a><a href="https://example.com" target="_blank">luar</a><h4>lompat</h4>'));
    if (jalur === 'radar.html' && pagar) { await p.selectOption('#pilih-saham', pagar); await p.waitForTimeout(300); }
    if (pagar === 'kuis') { const r = await p.$$('main input[type=radio]'); if (r[0]) { await r[0].check(); const t = await p.$('main form button, main button[type=submit]'); if (t) await t.click(); await p.waitForTimeout(200); } }
    if (pagar === 'istilah') { const t = await p.$('main button.istilah:visible'); if (t) { await t.click(); await p.waitForTimeout(200); } else console.log('tombol istilah tidak ketemu'); }
    await p.$$eval('details', (d) => d.forEach((x) => (x.open = true)));
    const temuan = await p.evaluate(() => {
      const out = [];
      const terlihat = (el) => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
      const nama = (el) => {
        if ((el.getAttribute('aria-label') || '').trim()) return true;
        const lb = el.getAttribute('aria-labelledby'); if (lb && lb.split(/\s+/).some((i) => (document.getElementById(i)?.textContent || '').trim())) return true;
        if ((el.getAttribute('title') || '').trim()) return true;
        return false;
      };
      const ket = (el) => `<${el.tagName.toLowerCase()}${el.id ? ' id="' + el.id + '"' : ''}${el.className ? ' class="' + el.className + '"' : ''}>`;
      document.querySelectorAll('img').forEach((el) => { if (!el.hasAttribute('alt')) out.push(`${ket(el)} tanpa atribut alt`); });
      document.querySelectorAll('button').forEach((el) => {
        if (!terlihat(el)) return;
        const teks = (el.textContent || '').trim() || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim();
        if (!teks && !nama(el)) out.push(`${ket(el)} tanpa nama (teks/aria-label)`);
      });
      document.querySelectorAll('input:not([type=hidden]), textarea, select').forEach((el) => {
        if (!terlihat(el)) return;
        const punyaLabel = (el.labels && [...el.labels].some((l) => (l.textContent || '').trim())) || nama(el);
        if (!punyaLabel) out.push(`${ket(el)} tanpa <label>/aria-label`);
      });
      document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], label[for]').forEach((el) => {
        ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'].forEach((a) => {
          const v = el.getAttribute(a); if (!v) return;
          v.split(/\s+/).forEach((i) => { if (i && !document.getElementById(i)) out.push(`${ket(el)} ${a}="${i}" menunjuk id yang tidak ada`); });
        });
      });
      document.querySelectorAll('a[href]').forEach((el) => {
        if (!terlihat(el)) return;
        const teks = (el.textContent || '').trim() || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim();
        if (!teks && !nama(el)) out.push(`${ket(el)} tautan tanpa nama (teks/aria-label)`);
        if (el.getAttribute('target') === '_blank') {
          const rel = (el.getAttribute('rel') || '').toLowerCase().split(/\s+/);
          if (!rel.includes('noopener')) out.push(`${ket(el)} target="_blank" tanpa rel="noopener"`);
          const label = [el.textContent, el.getAttribute('aria-label'), el.getAttribute('title')].join(' ').toLowerCase();
          if (!label.includes('tab baru')) out.push(`${ket(el)} target="_blank" tidak menyebut "tab baru"`);
        }
      });
      const main = document.querySelector('main');
      if (main) {
        let sebelum = 0;
        main.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
          if (!terlihat(el)) return;
          const lv = +el.tagName[1];
          if (sebelum === 0 && lv !== 1) out.push(`judul pertama di <main> ${ket(el)} bukan h1`);
          else if (sebelum && lv > sebelum + 1) out.push(`urutan judul melompat h${sebelum} → h${lv} di ${ket(el)} "${(el.textContent || '').trim().slice(0, 40)}"`);
          sebelum = lv;
        });
      }
      const hit = {}; document.querySelectorAll('[id]').forEach((el) => { hit[el.id] = (hit[el.id] || 0) + 1; });
      Object.entries(hit).forEach(([i, n]) => { if (n > 1) out.push(`id="${i}" dipakai ${n}×`); });
      return { out, n: { a: document.querySelectorAll('a[href]').length, img: document.querySelectorAll('img').length, button: document.querySelectorAll('button').length, isian: document.querySelectorAll('input, textarea, select').length } };
    });
    console.log(`${h}: ${temuan.out.length} temuan (a ${temuan.n.a}, img ${temuan.n.img}, button ${temuan.n.button}, isian ${temuan.n.isian})`);
    temuan.out.forEach((t) => console.log('  - ' + t));
    if (jalur === 'UJI') totalUji = temuan.out.length; else total += temuan.out.length;
  }
  if (galat.length) console.log('Galat JS:', galat);
  console.log(`\nTotal temuan halaman asli: ${total}. Temuan UJI: ${totalUji} (harus 8).`);
  await b.close();
  process.exit(total === 0 && totalUji === 8 && !galat.length ? 0 : 1);
})();
