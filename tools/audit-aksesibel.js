// Nina & Tegar (12 Nov 17.09): audit aksesibilitas pada DOM yang sudah dirender (bukan hanya HTML statis),
// untuk semua 10 halaman + keadaan interaktif (Radar memilih emiten, kotak istilah terbuka, profil emiten, pelajaran dengan kuis dijawab).
// Diperiksa: setiap <img> punya atribut alt (boleh kosong untuk hiasan); setiap <button> punya nama
// (teks, aria-label, aria-labelledby, atau title); setiap <input>/<textarea>/<select> yang terlihat punya <label>,
// aria-label, atau aria-labelledby; aria-labelledby/aria-describedby/for menunjuk id yang ada; tidak ada id ganda.
// Nina & Arif (12 Nov 18.12) menambah: setiap <a href> yang terlihat punya nama (teks, alt gambar, aria-label/labelledby, title);
// setiap target="_blank" memakai rel berisi noopener dan menyebut "tab baru" di teks/aria-label/title; urutan judul h1→h6
// di dalam <main> tidak melompat turun (mis. h2 langsung ke h4) dan judul pertama di <main> adalah h1.
// Halaman "UJI" sengaja memasang 8 pelanggaran; audit wajib menangkapnya (uji balik), jadi hasil sehat = tepat 8 temuan UJI.
// Nina & Tegar (13 Nov 16.10) menambah skenario interaksi Peringkat (lihat skenarioPeringkat di atas).
// Nina & Tegar (13 Nov 17.10) menambah skenario kedua: panah kiri/kanan di tab Peringkat dan ganti emiten di Radar.
// Cara pakai: python3 -m http.server 8765 (di akar repo), lalu: node tools/audit-aksesibel.js
// Butuh Playwright + Chromium (sudah ada di lingkungan kerja tim); tidak dijalankan oleh tests/cek.mjs.
const { chromium } = require('playwright');

// Nina & Tegar (13 Nov 16.10): skenario interaksi Peringkat di DOM sungguhan. Setiap tab diklik; satu tombol istilah
// di panel dibuka; Escape menutupnya (fokus harus kembali ke tombol istilah); istilah dibuka lagi lalu tab berikutnya diklik.
// Sesudah tiap langkah: id unik, aria-controls/aria-labelledby menunjuk tepat satu elemen, tepat satu tab terpilih,
// dan fokus tidak hilang (bukan <body>, masih di dokumen). Mode "sabot" sengaja merusak 3 hal (uji balik): id ganda,
// aria-controls ke id yang tidak ada, fokus dilepas ke <body>. Hasil sehat: skenario asli 0 temuan, sabot tepat 3 jenis.
async function skenarioPeringkat(p, sabot) {
  await p.goto('http://localhost:8765/peringkat.html'); await p.waitForTimeout(400);
  const temuan = [];
  const cek = async (langkah) => {
    const out = await p.evaluate(() => {
      const o = [];
      const hit = {}; document.querySelectorAll('[id]').forEach((el) => { hit[el.id] = (hit[el.id] || 0) + 1; });
      Object.entries(hit).forEach(([i, n]) => { if (n > 1) o.push(`id ganda: id="${i}" dipakai ${n}×`); });
      document.querySelectorAll('[aria-controls], [aria-labelledby]').forEach((el) => {
        ['aria-controls', 'aria-labelledby'].forEach((a) => {
          (el.getAttribute(a) || '').split(/\s+/).filter(Boolean).forEach((i) => {
            const n = document.querySelectorAll('[id="' + i + '"]').length;
            if (n !== 1) o.push(`rujukan: <${el.tagName.toLowerCase()}${el.id ? ' id="' + el.id + '"' : ''}> ${a}="${i}" menunjuk ${n} elemen`);
          });
        });
      });
      const dipilih = document.querySelectorAll('[role=tab][aria-selected=true]').length;
      if (dipilih !== 1) o.push(`tab terpilih: ${dipilih} (harus 1)`);
      const a = document.activeElement;
      if (!a || a === document.body || !a.isConnected) o.push('fokus hilang ke <body>');
      return o;
    });
    out.forEach((t) => temuan.push(`${langkah}: ${t}`));
  };
  const tab = await p.$$('[role=tab]');
  if (!tab.length) { temuan.push('tab Peringkat tidak ketemu'); return temuan; }
  for (let i = 0; i < tab.length; i++) {
    const nama = (await tab[i].textContent()).trim();
    await tab[i].click(); await p.waitForTimeout(150);
    await cek(`klik tab "${nama}"`);
    const ist = await p.$('#panel-peringkat button.istilah:visible');
    if (!ist) { temuan.push(`tab "${nama}": tombol istilah di panel tidak ketemu`); continue; }
    await ist.click(); await p.waitForTimeout(150);
    if (sabot && i === 0) await p.evaluate(() => { const k = document.getElementById('kotak-istilah'); k.insertAdjacentHTML('afterend', '<p id="kotak-istilah">salinan</p>'); });
    await cek(`tab "${nama}" + istilah terbuka`);
    if (sabot && i === 0) await p.evaluate(() => document.querySelectorAll('p#kotak-istilah').forEach((x) => x.remove()));
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    const kembali = await ist.evaluate((b) => document.activeElement === b);
    if (!kembali) temuan.push(`tab "${nama}": sesudah Escape fokus tidak kembali ke tombol istilah`);
    await ist.click(); await p.waitForTimeout(100);
    const lanjut = tab[(i + 1) % tab.length];
    await lanjut.click(); await p.waitForTimeout(150);
    if (sabot && i === 1) await p.evaluate(() => document.querySelector('[role=tab]').setAttribute('aria-controls', 'tidak-ada'));
    if (sabot && i === 2) await p.evaluate(() => document.activeElement.blur());
    await cek(`tab "${nama}" + istilah terbuka → klik tab "${(await lanjut.textContent()).trim()}"`);
    if (sabot && i === 1) await p.evaluate(() => document.querySelector('[role=tab]').setAttribute('aria-controls', 'panel-peringkat'));
  }
  return temuan;
}
// Nina & Tegar (13 Nov 17.10): skenario interaksi kedua. Pemeriksaan bersama sesudah tiap langkah: id unik,
// aria-controls/aria-labelledby/aria-describedby/label[for] menunjuk tepat satu elemen, fokus tidak hilang, dan bila ada tab:
// tepat satu tab terpilih dan tabindex 0 hanya pada tab terpilih.
async function cekDom(p) {
  return p.evaluate(() => {
    const o = [];
    const hit = {}; document.querySelectorAll('[id]').forEach((el) => { hit[el.id] = (hit[el.id] || 0) + 1; });
    Object.entries(hit).forEach(([i, n]) => { if (n > 1) o.push(`id ganda: id="${i}" dipakai ${n}×`); });
    document.querySelectorAll('[aria-controls], [aria-labelledby], [aria-describedby], label[for]').forEach((el) => {
      ['aria-controls', 'aria-labelledby', 'aria-describedby', 'for'].forEach((a) => {
        (el.getAttribute(a) || '').split(/\s+/).filter(Boolean).forEach((i) => {
          const n = document.querySelectorAll('[id="' + i + '"]').length;
          if (n !== 1) o.push(`rujukan: <${el.tagName.toLowerCase()}${el.id ? ' id="' + el.id + '"' : ''}> ${a}="${i}" menunjuk ${n} elemen`);
        });
      });
    });
    const tab = [...document.querySelectorAll('[role=tab]')];
    if (tab.length) {
      const dipilih = tab.filter((t) => t.getAttribute('aria-selected') === 'true');
      if (dipilih.length !== 1) o.push(`tab terpilih: ${dipilih.length} (harus 1)`);
      tab.forEach((t) => { if ((t.tabIndex === 0) !== (t.getAttribute('aria-selected') === 'true')) o.push(`tabindex: tab "${t.textContent.trim()}" tabindex=${t.tabIndex}, aria-selected=${t.getAttribute('aria-selected')}`); });
    }
    const a = document.activeElement;
    if (!a || a === document.body || !a.isConnected) o.push('fokus hilang ke <body>');
    return o;
  });
}

// (a) Peringkat: fokus tab pertama, panah kanan 4× lalu panah kiri 1×. Fokus dan aria-selected harus ikut pindah ke tab
// yang diharapkan (berputar di ujung). Sabot: tabindex 0 dipasang di tab yang tidak terpilih (langkah kanan ke-2)
// dan fokus dilepas ke <body> (langkah kiri). Hasil sabot harus memuat jenis "tabindex" dan "fokus".
async function skenarioPanah(p, sabot) {
  await p.goto('http://localhost:8765/peringkat.html'); await p.waitForTimeout(400);
  const temuan = [];
  const tab = await p.$$('[role=tab]');
  if (tab.length < 2) return ['tab Peringkat kurang dari 2'];
  await tab[0].focus();
  let harap = 0;
  const langkah = ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowLeft'];
  for (let s = 0; s < langkah.length; s++) {
    const k = langkah[s];
    await p.keyboard.press(k); await p.waitForTimeout(120);
    harap = (harap + (k === 'ArrowRight' ? 1 : -1) + tab.length) % tab.length;
    const nama = `${k === 'ArrowRight' ? 'kanan' : 'kiri'} ke-${s < 4 ? s + 1 : 1}`;
    if (sabot && s === 1) await p.evaluate((h) => { const t = document.querySelectorAll('[role=tab]'); t[(h + 1) % t.length].tabIndex = 0; }, harap);
    if (sabot && s === 4) await p.evaluate(() => document.activeElement.blur());
    (await cekDom(p)).forEach((t) => temuan.push(`${nama}: ${t}`));
    const st = await p.evaluate((h) => { const t = document.querySelectorAll('[role=tab]')[h]; return { fokus: document.activeElement === t, pilih: t.getAttribute('aria-selected') === 'true' }; }, harap);
    if (!st.pilih) temuan.push(`${nama}: aria-selected tidak pindah ke tab ke-${harap + 1}`);
    if (!st.fokus && !(sabot && s === 4)) temuan.push(`${nama}: fokus tidak pindah ke tab ke-${harap + 1}`);
  }
  return temuan;
}

// (b) Radar: ganti emiten 3× (UNTR, ANTM, TLKM), buka satu istilah di hasil, lalu Escape (fokus kembali ke tombol istilah).
// Sabot: id ganda di hasil (sesudah ganti ke ANTM) dan aria-describedby ke id yang tidak ada (sesudah istilah dibuka).
// Hasil sabot harus memuat jenis "id ganda" dan "rujukan".
async function skenarioRadar(p, sabot) {
  await p.goto('http://localhost:8765/radar.html'); await p.waitForTimeout(400);
  const temuan = [];
  if (!(await p.$('#pilih-saham'))) return ['#pilih-saham tidak ketemu'];
  for (const kode of ['UNTR', 'ANTM', 'TLKM']) {
    await p.selectOption('#pilih-saham', kode); await p.focus('#pilih-saham'); await p.waitForTimeout(250);
    if (sabot && kode === 'ANTM') await p.evaluate(() => document.getElementById('hasil-radar').insertAdjacentHTML('beforeend', '<p id="pilih-saham">salinan</p>'));
    (await cekDom(p)).forEach((t) => temuan.push(`pilih ${kode}: ${t}`));
    if (sabot && kode === 'ANTM') await p.evaluate(() => document.querySelectorAll('p#pilih-saham').forEach((x) => x.remove()));
  }
  const ist = await p.$('#hasil-radar button.istilah:visible');
  if (!ist) { temuan.push('tombol istilah di hasil Radar tidak ketemu'); return temuan; }
  await ist.click(); await p.waitForTimeout(150);
  if (sabot) await p.evaluate(() => document.querySelector('#hasil-radar').setAttribute('aria-describedby', 'tidak-ada'));
  (await cekDom(p)).forEach((t) => temuan.push(`TLKM + istilah terbuka: ${t}`));
  if (sabot) await p.evaluate(() => document.querySelector('#hasil-radar').removeAttribute('aria-describedby'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  (await cekDom(p)).forEach((t) => temuan.push(`TLKM + Escape: ${t}`));
  if (!(await ist.evaluate((b) => b.isConnected && document.activeElement === b))) temuan.push('sesudah Escape fokus tidak kembali ke tombol istilah');
  return temuan;
}

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
  const sk = await skenarioPeringkat(p, false);
  console.log(`\nSkenario Peringkat (klik tiap tab, buka istilah, Escape, pindah tab): ${sk.length} temuan`);
  sk.forEach((t) => console.log('  - ' + t));
  const skSabot = await skenarioPeringkat(p, true);
  const jenis = new Set(skSabot.map((t) => t.split(': ')[1]));
  console.log(`Skenario UJI (sabot): ${skSabot.length} temuan, ${jenis.size} jenis (harus 3: id ganda, rujukan, fokus hilang)`);
  skSabot.forEach((t) => console.log('  - ' + t));
  const sk2 = [...(await skenarioPanah(p, false)), ...(await skenarioRadar(p, false))];
  console.log(`\nSkenario kedua (panah kanan 4× & kiri 1× di tab Peringkat; ganti emiten 3× + istilah + Escape di Radar): ${sk2.length} temuan`);
  sk2.forEach((t) => console.log('  - ' + t));
  const sab2 = [...(await skenarioPanah(p, true)), ...(await skenarioRadar(p, true))];
  const jenis2 = ['tabindex', 'fokus hilang', 'id ganda', 'rujukan'].filter((j) => sab2.some((t) => t.split(': ')[1].startsWith(j)));
  console.log(`Skenario kedua UJI (sabot): ${sab2.length} temuan, jenis tertangkap: ${jenis2.join(', ')} (harus 4)`);
  sab2.forEach((t) => console.log('  - ' + t));
  if (galat.length) console.log('Galat JS:', galat);
  console.log(`\nTotal temuan halaman asli: ${total}. Temuan UJI: ${totalUji} (harus 8).`);
  await b.close();
  const sabotOk = jenis.size === 3 && ['id ganda', 'rujukan', 'fokus hilang'].every((j) => [...jenis].some((x) => x.startsWith(j)));
  process.exit(total === 0 && totalUji === 8 && sk.length === 0 && sabotOk && sk2.length === 0 && jenis2.length === 4 && !galat.length ? 0 : 1);
})();
