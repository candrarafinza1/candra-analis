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
// Nina & Tegar (13 Nov 18.11) menambah skenario ketiga: kuis dengan keyboard saja dan saringan sektor Peringkat.
// Nina & Tegar (13 Nov 19.12) menambah skenario keempat: saringan jenis + "Tampilkan lagi" di Kabar dan pencarian kamus istilah.
// Nina & Tegar (14 Nov 07.10) menambah skenario kelima: pindah profil emiten (judul & document.title) dan tautan kembali di 404.
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

// Nina & Tegar (13 Nov 18.11): skenario interaksi ketiga.
// (a) Kuis pelajaran pertama dengan keyboard saja. Putaran 1: tiap soal dimasuki dengan Tab, Spasi memilih pilihan
// pertama, panah bawah memindah ke jawaban SALAH; Tab ke "Periksa jawaban", Enter. Lalu Tab ke "Ulangi kuis", Enter
// (fokus harus kembali ke pilihan pertama). Putaran 2: sama, tetapi ke jawaban BENAR. Sesudah tiap Enter: pesan hasil
// ada di elemen aria-live/role=status dan berbunyi "0 dari N benar" lalu "N dari N benar", umpan tiap soal terlihat,
// fokus tidak hilang, id unik. Sabot: aria-live & role dicabut dari pesan hasil (putaran 1) dan fokus dilepas ke <body>
// (putaran 2). Hasil sabot harus memuat jenis "aria-live" dan "fokus hilang".
async function skenarioKuis(p, sabot) {
  await p.goto('http://localhost:8765/pelajaran.html'); await p.waitForTimeout(400);
  const temuan = [];
  const kunci = await p.evaluate(() => {
    const id = new URLSearchParams(location.search).get('m');
    const m = window.MODUL.find((x) => x.id === id) || window.MODUL[0];
    return m.kuis.map((q) => ({ benar: q.benar, n: q.pilihan.length }));
  });
  if (!kunci.length) return ['kuis tidak ada di pelajaran pertama'];
  const fokusInfo = () => p.evaluate(() => { const a = document.activeElement; return { tag: a && a.tagName, name: a && a.name, id: a && a.id, teks: a && (a.textContent || '').trim() }; });
  await p.focus('#kuis-0-0');
  for (const putaran of ['salah', 'benar']) {
    for (let i = 0; i < kunci.length; i++) {
      if (i > 0) await p.keyboard.press('Tab');
      const f = await fokusInfo();
      if (f.name !== 'soal-' + i) temuan.push(`putaran ${putaran}: Tab tidak masuk ke soal ${i + 1} (fokus di <${(f.tag || '').toLowerCase()} id="${f.id}">)`);
      await p.keyboard.press('Space');
      const tuju = putaran === 'benar' ? kunci[i].benar : (kunci[i].benar + 1) % kunci[i].n;
      for (let j = 0; j < tuju; j++) await p.keyboard.press('ArrowDown');
      const dipilih = await p.evaluate((i) => { const r = document.querySelector('input[name="soal-' + i + '"]:checked'); return r ? +r.value : -1; }, i);
      if (dipilih !== tuju) temuan.push(`putaran ${putaran}: soal ${i + 1} terpilih pilihan ${dipilih + 1}, seharusnya ${tuju + 1}`);
    }
    await p.keyboard.press('Tab');
    const fk = await fokusInfo();
    if (fk.teks !== 'Periksa jawaban') temuan.push(`putaran ${putaran}: Tab tidak sampai ke "Periksa jawaban" (fokus di "${fk.teks}")`);
    if (sabot && putaran === 'salah') await p.evaluate(() => { const h = document.querySelector('.kuis-hasil'); h.removeAttribute('aria-live'); h.removeAttribute('role'); });
    await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    if (sabot && putaran === 'benar') await p.evaluate(() => document.activeElement.blur());
    const harap = `${putaran === 'benar' ? kunci.length : 0} dari ${kunci.length} benar`;
    const st = await p.evaluate(() => {
      const h = document.querySelector('.kuis-hasil');
      return { teks: h ? h.textContent : '', live: !!h && (['polite', 'assertive'].includes(h.getAttribute('aria-live')) || h.getAttribute('role') === 'status'),
        umpan: [...document.querySelectorAll('.kuis-umpan')].filter((u) => !u.hidden && u.textContent.trim()).length };
    });
    if (!st.live) temuan.push(`putaran ${putaran}: aria-live/role=status tidak ada pada pesan hasil`);
    if (!st.teks.startsWith(harap)) temuan.push(`putaran ${putaran}: pesan hasil "${st.teks}" (harus diawali "${harap}")`);
    if (st.umpan !== kunci.length) temuan.push(`putaran ${putaran}: umpan terlihat ${st.umpan} dari ${kunci.length} soal`);
    (await cekDom(p)).forEach((t) => temuan.push(`putaran ${putaran} sesudah Enter: ${t}`));
    if (putaran === 'salah') {
      await p.keyboard.press('Tab');
      const fu = await fokusInfo();
      if (fu.teks !== 'Ulangi kuis') temuan.push(`Tab tidak sampai ke "Ulangi kuis" (fokus di "${fu.teks}")`);
      await p.keyboard.press('Enter'); await p.waitForTimeout(100);
      const fr = await fokusInfo();
      if (fr.id !== 'kuis-0-0') temuan.push(`sesudah "Ulangi kuis" fokus tidak ke pilihan pertama (fokus di <${(fr.tag || '').toLowerCase()} id="${fr.id}">)`);
    }
  }
  return temuan;
}

// (b) Peringkat: pilih tab kedua, lalu saringan sektor diganti 2× (sektor pertama & terakhir di daftar) dan kembali ke
// "Semua sektor". Sesudah tiap ganti: #ket-sektor menyebut sektor & jumlah baris tabel (kosong untuk "Semua sektor"),
// tab terpilih tetap tab kedua, id unik, rujukan aria tepat, fokus tidak hilang. Sabot: #ket-sektor dibuat basi (ganti
// ke-2), tab lain ikut dipilih (ganti ke-2), dan id ganda (kembali ke semua). Hasil sabot harus memuat jenis
// "ket-sektor", "tab terpilih", "id ganda".
async function skenarioSektor(p, sabot) {
  await p.goto('http://localhost:8765/peringkat.html'); await p.waitForTimeout(400);
  const temuan = [];
  const tab = await p.$$('[role=tab]');
  if (tab.length < 2 || !(await p.$('#pilih-sektor'))) return ['tab Peringkat atau #pilih-sektor tidak ketemu'];
  await tab[1].click(); await p.waitForTimeout(120);
  const tabId = await tab[1].getAttribute('id');
  const opsi = await p.$$eval('#pilih-sektor option', (o) => o.map((x) => x.value).filter(Boolean));
  if (opsi.length < 2) return ['sektor di saringan kurang dari 2'];
  const urutan = [opsi[0], opsi[opsi.length - 1], ''];
  for (let s = 0; s < urutan.length; s++) {
    const v = urutan[s];
    await p.selectOption('#pilih-sektor', v); await p.focus('#pilih-sektor'); await p.waitForTimeout(150);
    const nama = v ? `sektor "${v}"` : 'Semua sektor';
    if (sabot && s === 1) await p.evaluate(() => { document.getElementById('ket-sektor').textContent = 'basi'; document.querySelectorAll('[role=tab]')[0].setAttribute('aria-selected', 'true'); });
    if (sabot && s === 2) await p.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend', '<p id="ket-sektor">salinan</p>'));
    const st = await p.evaluate(() => ({ ket: (document.querySelector('#ket-sektor') || {}).textContent || '', baris: document.querySelectorAll('#panel-peringkat tbody tr').length,
      pilih: [...document.querySelectorAll('[role=tab]')].filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.id) }));
    if (v ? !(st.ket.includes(v.toLowerCase()) && st.ket.startsWith(st.baris + ' emiten')) : st.ket !== '') temuan.push(`${nama}: ket-sektor tidak sesuai ("${st.ket}", ${st.baris} baris)`);
    if (st.pilih.length !== 1 || st.pilih[0] !== tabId) temuan.push(`${nama}: tab terpilih berubah (${st.pilih.join(', ')}; harus ${tabId})`);
    (await cekDom(p)).forEach((t) => temuan.push(`${nama}: ${t}`));
    if (sabot && s === 2) await p.evaluate(() => document.querySelectorAll('main > p#ket-sektor').forEach((x) => x.remove()));
  }
  return temuan;
}

// Nina & Tegar (13 Nov 19.12): skenario interaksi keempat.
// (a) Kabar: saringan jenis diganti 2× dengan keyboard (fokus di #pilih-jenis, panah bawah sampai jenis yang dituju:
// jenis dengan kabar paling sedikit, lalu jenis dengan kabar paling banyak), lalu "Tampilkan lagi" ditekan Enter sampai
// habis. Sesudah tiap langkah: #ket-jenis tetap aria-live dan isinya cocok dengan jumlah kartu yang tampil & total jenis itu,
// tombol "Tampilkan lagi" tersembunyi bila tidak ada sisa, fokus pindah ke kartu pertama yang baru tampil, id unik,
// rujukan aria tepat. Sabot: aria-live dicabut dan #ket-jenis dibuat basi (ganti ke-2), fokus dilepas ke <body>
// (Tampilkan lagi pertama). Hasil sabot harus memuat jenis "aria-live", "ket-jenis", "fokus".
async function skenarioKabar(p, sabot) {
  await p.goto('http://localhost:8765/kabar.html'); await p.waitForTimeout(400);
  const temuan = [];
  if (!(await p.$('#pilih-jenis'))) return ['#pilih-jenis tidak ketemu'];
  const hitung = await p.evaluate(() => {
    const opsi = [...document.querySelectorAll('#pilih-jenis option')].map((o) => o.value);
    const n = {}; (window.KABAR || []).forEach((k) => { n[k.jenis] = (n[k.jenis] || 0) + 1; });
    return { opsi, n };
  });
  const jenis = hitung.opsi.filter(Boolean).sort((a, b) => hitung.n[a] - hitung.n[b]);
  if (jenis.length < 2) return ['jenis kabar di saringan kurang dari 2'];
  const total = (j) => (j ? hitung.n[j] : Object.values(hitung.n).reduce((a, b) => a + b, 0));
  const keadaan = (j) => p.evaluate(() => ({
    ket: (document.getElementById('ket-jenis') || {}).textContent || '', live: (document.getElementById('ket-jenis') || { getAttribute: () => null }).getAttribute('aria-live'),
    kartu: document.querySelectorAll('#kabar ul.kabar-daftar > li').length, lagi: !document.getElementById('kabar-lagi').hidden }));
  const cekKet = (nama, j, st) => {
    const n = total(j), sisa = n - st.kartu;
    const harap = (sisa > 0 ? `Menampilkan ${st.kartu} dari ` : '') + `${n} kabar` + (j ? ` jenis ${j}` : '');
    if (!['polite', 'assertive'].includes(st.live)) temuan.push(`${nama}: aria-live hilang dari #ket-jenis`);
    if (!st.ket.startsWith(harap)) temuan.push(`${nama}: ket-jenis tidak sesuai ("${st.ket}", harus diawali "${harap}")`);
    if (st.kartu > n) temuan.push(`${nama}: kartu tampil ${st.kartu} melebihi ${n}`);
    if (st.lagi !== sisa > 0) temuan.push(`${nama}: tombol "Tampilkan lagi" ${st.lagi ? 'terlihat' : 'tersembunyi'} padahal sisa ${sisa}`);
  };
  const urutan = [jenis[0], jenis[jenis.length - 1]];
  for (let s = 0; s < urutan.length; s++) {
    const j = urutan[s];
    await p.focus('#pilih-jenis');
    const kini = await p.$eval('#pilih-jenis', (x) => x.selectedIndex);
    const tuju = hitung.opsi.indexOf(j);
    for (let k = kini; k !== tuju; k += tuju > kini ? 1 : -1) await p.keyboard.press(tuju > kini ? 'ArrowDown' : 'ArrowUp');
    await p.waitForTimeout(150);
    if ((await p.$eval('#pilih-jenis', (x) => x.value)) !== j) { temuan.push(`ganti ke-${s + 1}: panah tidak memilih "${j}"`); await p.selectOption('#pilih-jenis', j); await p.waitForTimeout(150); }
    if (sabot && s === 1) await p.evaluate(() => { const k = document.getElementById('ket-jenis'); k.removeAttribute('aria-live'); k.textContent = 'basi'; });
    const nama = `ganti ke-${s + 1} "${j}"`;
    cekKet(nama, j, await keadaan(j));
    (await cekDom(p)).forEach((t) => temuan.push(`${nama}: ${t}`));
    if (sabot && s === 1) await p.evaluate(() => document.getElementById('ket-jenis').setAttribute('aria-live', 'polite'));
  }
  const j = urutan[1];
  for (let ke = 1; ke <= 5 && (await keadaan(j)).lagi; ke++) {
    const awal = (await keadaan(j)).kartu;
    await p.focus('#kabar-lagi'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    if (sabot && ke === 1) await p.evaluate(() => document.activeElement.blur());
    const nama = `Tampilkan lagi ke-${ke}`;
    const st = await keadaan(j);
    if (st.kartu <= awal) temuan.push(`${nama}: kartu tidak bertambah (${awal} → ${st.kartu})`);
    cekKet(nama, j, st);
    const f = await p.evaluate((i) => { const li = document.querySelectorAll('#kabar ul.kabar-daftar > li')[i]; return { ok: !!li && document.activeElement === li, body: document.activeElement === document.body }; }, awal);
    if (f.body) temuan.push(`${nama}: fokus hilang ke <body>`);
    else if (!f.ok) temuan.push(`${nama}: fokus tidak pindah ke kabar ke-${awal + 1} (kabar pertama yang baru tampil)`);
    (await cekDom(p)).filter((t) => !(f.body && t.startsWith('fokus hilang'))).forEach((t) => temuan.push(`${nama}: ${t}`));
  }
  return temuan;
}

// (b) Belajar, kamus istilah: ketik kata yang ada ("dividen"), ketik kata yang tidak ada, lalu hapus isinya (Ctrl+A,
// Backspace). Sesudah tiap langkah: .info-kamus tetap role=status/aria-live dan menyebut "n dari N istilah cocok"
// (atau "N istilah" bila kosong) dengan n = jumlah istilah yang terlihat; pesan "Tidak ada istilah yang cocok" hanya
// terlihat bila n = 0; fokus tetap di kotak cari. Sabot: role & aria-live dicabut (langkah 1) dan isi .info-kamus dibuat
// basi (langkah 3). Hasil sabot harus memuat jenis "info-kamus status" dan "info-kamus jumlah".
async function skenarioKamus(p, sabot) {
  await p.goto('http://localhost:8765/belajar.html'); await p.waitForTimeout(400);
  const temuan = [];
  if (!(await p.$('#cari-istilah'))) return ['#cari-istilah tidak ketemu'];
  await p.focus('#cari-istilah');
  const langkah = [['ketik "dividen"', 'dividen'], ['ketik kata yang tidak ada', 'zzqx'], ['hapus isi', '']];
  for (let s = 0; s < langkah.length; s++) {
    const [nama, kata] = langkah[s];
    await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace');
    if (kata) await p.keyboard.type(kata, { delay: 20 });
    await p.waitForTimeout(150);
    if (sabot && s === 0) await p.evaluate(() => { const i = document.querySelector('.info-kamus'); i.removeAttribute('role'); i.removeAttribute('aria-live'); });
    if (sabot && s === 2) await p.evaluate(() => { document.querySelector('.info-kamus').textContent = '3 dari 40 istilah cocok'; });
    const st = await p.evaluate(() => {
      const i = document.querySelector('.info-kamus');
      const dt = [...document.querySelectorAll('.daftar-kamus dt')];
      return { teks: i ? i.textContent : '', status: !!i && (i.getAttribute('role') === 'status' || ['polite', 'assertive'].includes(i.getAttribute('aria-live'))),
        n: dt.filter((d) => !d.hidden).length, N: dt.length, kosong: !document.querySelector('.kosong-kamus').hidden,
        fokus: document.activeElement && document.activeElement.id };
    });
    const harap = kata ? `${st.n} dari ${st.N} istilah cocok` : `${st.N} istilah`;
    if (!st.status) temuan.push(`${nama}: info-kamus status hilang (role=status/aria-live)`);
    if (st.teks !== harap) temuan.push(`${nama}: info-kamus jumlah tidak sesuai ("${st.teks}", harus "${harap}")`);
    if (kata === 'dividen' && st.n === 0) temuan.push(`${nama}: tidak ada istilah yang cocok untuk kata yang ada`);
    if (kata === 'zzqx' && st.n !== 0) temuan.push(`${nama}: ${st.n} istilah cocok untuk kata yang tidak ada`);
    if (st.kosong !== (st.n === 0)) temuan.push(`${nama}: pesan "Tidak ada istilah yang cocok" ${st.kosong ? 'terlihat' : 'tersembunyi'} padahal ${st.n} cocok`);
    if (st.fokus !== 'cari-istilah') temuan.push(`${nama}: fokus pindah dari kotak cari (ke id="${st.fokus}")`);
    (await cekDom(p)).forEach((t) => temuan.push(`${nama}: ${t}`));
  }
  return temuan;
}

// Nina & Tegar (14 Nov 07.10): skenario interaksi kelima.
// (a) Profil emiten: dari emiten.html (daftar semua emiten) tautan ANTM difokuskan lalu Enter; di profil ANTM pilih TLKM
// di "Bandingkan", lalu tautan "profil TLKM" di hasil difokuskan dan Enter. Sesudah tiap pindah emiten: h1 = kode,
// document.title = "KODE · Nama · Candra Analis" (nama dari data), Tab pertama mendarat di tautan "Langsung ke isi"
// (fokus tidak hilang setelah halaman baru dimuat), id unik, rujukan aria tepat. Sabot: h1 dibuat basi (pindah ke-1),
// document.title basi + id ganda (pindah ke-2). Hasil sabot harus memuat jenis "judul h1", "document.title", "id ganda".
async function skenarioProfil(p, sabot) {
  await p.goto('http://localhost:8765/emiten.html'); await p.waitForTimeout(400);
  const temuan = [];
  const langkah = [
    ['ANTM', 'pindah ke-1 (daftar → ANTM)', async () => '#profil a[href="emiten.html?kode=ANTM"]'],
    ['TLKM', 'pindah ke-2 (Bandingkan → TLKM)', async () => {
      if (!(await p.$('#pilih-banding'))) return null;
      await p.selectOption('#pilih-banding', 'TLKM'); await p.waitForTimeout(150);
      return '#hasil-banding a[href="emiten.html?kode=TLKM"]';
    }]];
  for (let s = 0; s < langkah.length; s++) {
    const [kode, nama, cari] = langkah[s];
    const sel = await cari();
    if (!sel || !(await p.$(sel))) { temuan.push(`${nama}: tautan ke profil ${kode} tidak ketemu`); return temuan; }
    await p.focus(sel);
    await Promise.all([p.waitForNavigation(), p.keyboard.press('Enter')]); await p.waitForTimeout(400);
    if (sabot && s === 0) await p.evaluate(() => { document.getElementById('judul-profil').textContent = 'Profil emiten'; });
    if (sabot && s === 1) await p.evaluate(() => { document.title = 'Profil emiten · Candra Analis'; document.querySelector('main').insertAdjacentHTML('beforeend', '<p id="judul-profil">salinan</p>'); });
    const st = await p.evaluate((k) => {
      const e = (window.EMITEN_ASLI || []).find((x) => x.kode === k);
      return { h1: (document.querySelector('main h1') || {}).textContent || '', title: document.title, harapTitle: e ? `${k} · ${e.nama} · Candra Analis` : null, url: location.search };
    }, kode);
    if (st.url !== '?kode=' + kode) temuan.push(`${nama}: alamat tidak pindah ke ?kode=${kode} (${st.url})`);
    if (st.h1.trim() !== kode) temuan.push(`${nama}: judul h1 "${st.h1.trim()}", harus "${kode}"`);
    if (!st.harapTitle || st.title !== st.harapTitle) temuan.push(`${nama}: document.title "${st.title}", harus "${st.harapTitle}"`);
    await p.keyboard.press('Tab'); await p.waitForTimeout(80);
    if (!(await p.evaluate(() => document.activeElement && document.activeElement.matches('a.lompat')))) temuan.push(`${nama}: Tab pertama tidak mendarat di "Langsung ke isi"`);
    (await cekDom(p)).forEach((t) => temuan.push(`${nama}: ${t}`));
    if (sabot && s === 1) await p.evaluate(() => document.querySelectorAll('main > p#judul-profil').forEach((x) => x.remove()));
  }
  return temuan;
}

// (b) 404: Tab dari awal halaman (maks. 40×) harus mencapai tautan "Beranda" di daftar 404 (tautan kembali), lalu Enter
// harus membuka beranda (/index.html dengan h1 dan judul Candra Analis). Sabot: tautan diberi tabindex=-1 (tidak
// tercapai Tab) dan href diarahkan ke halaman lain (belajar.html), bukan beranda. Hasil sabot harus memuat jenis "Tab" dan "kembali".
async function skenario404(p, sabot) {
  await p.goto('http://localhost:8765/404.html'); await p.waitForTimeout(300);
  const temuan = [];
  const sel = 'main .daftar-404 a[href="/index.html"]';
  if (!(await p.$(sel))) return ['404: tautan kembali ke Beranda tidak ketemu'];
  if (sabot) await p.evaluate((s) => { const a = document.querySelector(s); a.tabIndex = -1; a.setAttribute('href', '/belajar.html'); a.setAttribute('data-uji', '1'); }, sel);
  const target = sabot ? 'main .daftar-404 a[data-uji]' : sel;
  let ke = 0, sampai = false;
  for (ke = 1; ke <= 40; ke++) {
    await p.keyboard.press('Tab');
    if (await p.evaluate((s) => document.activeElement === document.querySelector(s), target)) { sampai = true; break; }
  }
  if (!sampai) temuan.push('404: Tab tidak mencapai tautan kembali "Beranda" dalam 40 langkah');
  else (await cekDom(p)).forEach((t) => temuan.push(`404 (Tab ke-${ke}): ${t}`));
  await p.focus(target);
  await Promise.all([p.waitForNavigation().catch(() => null), p.keyboard.press('Enter')]); await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ path: location.pathname, h1: !!document.querySelector('main h1'), title: document.title }));
  if (st.path !== '/index.html' || !st.h1 || !st.title.includes('Candra Analis')) temuan.push(`404: kembali tidak berfungsi (Enter membuka ${st.path}, h1 ${st.h1 ? 'ada' : 'tidak ada'}, judul "${st.title}")`);
  return temuan;
}

const halaman = ['index.html', 'belajar.html', 'pelajaran.html', 'pelajaran.html#kuis', 'peringkat.html', 'peringkat.html#istilah', 'radar.html',
  'radar.html#UNTR', 'emiten.html', 'emiten.html?kode=ANTM', 'kabar.html', 'metodologi.html', 'asisten.html', '404.html', 'UJI'];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
  const galat = []; p.on('pageerror', (e) => { galat.push(e.message); if (process.env.JEJAK) console.log('[galat di ' + p.url() + ']', e.message); });
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
  const sk3 = [...(await skenarioKuis(p, false)), ...(await skenarioSektor(p, false))];
  console.log(`\nSkenario ketiga (kuis dengan keyboard saja: salah lalu benar; saringan sektor 2× lalu Semua sektor): ${sk3.length} temuan`);
  sk3.forEach((t) => console.log('  - ' + t));
  const sab3 = [...(await skenarioKuis(p, true)), ...(await skenarioSektor(p, true))];
  const jenis3 = ['aria-live', 'fokus hilang', 'ket-sektor', 'tab terpilih', 'id ganda'].filter((j) => sab3.some((t) => (t.split(': ')[1] || '').startsWith(j)));
  console.log(`Skenario ketiga UJI (sabot): ${sab3.length} temuan, jenis tertangkap: ${jenis3.join(', ')} (harus 5)`);
  sab3.forEach((t) => console.log('  - ' + t));
  const sk4 = [...(await skenarioKabar(p, false)), ...(await skenarioKamus(p, false))];
  console.log(`\nSkenario keempat (saringan Kabar 2× dengan panah + "Tampilkan lagi" sampai habis; cari di kamus istilah lalu hapus): ${sk4.length} temuan`);
  sk4.forEach((t) => console.log('  - ' + t));
  const sab4 = [...(await skenarioKabar(p, true)), ...(await skenarioKamus(p, true))];
  const jenis4 = ['aria-live', 'ket-jenis', 'fokus hilang', 'info-kamus status', 'info-kamus jumlah'].filter((j) => sab4.some((t) => (t.split(': ')[1] || '').startsWith(j)));
  console.log(`Skenario keempat UJI (sabot): ${sab4.length} temuan, jenis tertangkap: ${jenis4.join(', ')} (harus 5)`);
  sab4.forEach((t) => console.log('  - ' + t));
  const sk5 = [...(await skenarioProfil(p, false)), ...(await skenario404(p, false))];
  console.log(`\nSkenario kelima (profil emiten: daftar → ANTM → TLKM lewat Bandingkan; 404: Tab ke tautan kembali + Enter): ${sk5.length} temuan`);
  sk5.forEach((t) => console.log('  - ' + t));
  const sab5 = [...(await skenarioProfil(p, true)), ...(await skenario404(p, true))];
  const jenis5 = ['judul h1', 'document.title', 'id ganda', 'Tab', 'kembali'].filter((j) => sab5.some((t) => (t.split(': ')[1] || '').startsWith(j)));
  console.log(`Skenario kelima UJI (sabot): ${sab5.length} temuan, jenis tertangkap: ${jenis5.join(', ')} (harus 5)`);
  sab5.forEach((t) => console.log('  - ' + t));
  if (galat.length) console.log('Galat JS:', galat);
  console.log(`\nTotal temuan halaman asli: ${total}. Temuan UJI: ${totalUji} (harus 8).`);
  await b.close();
  const sabotOk = jenis.size === 3 && ['id ganda', 'rujukan', 'fokus hilang'].every((j) => [...jenis].some((x) => x.startsWith(j)));
  process.exit(total === 0 && totalUji === 8 && sk.length === 0 && sabotOk && sk2.length === 0 && jenis2.length === 4 && sk3.length === 0 && jenis3.length === 5 && sk4.length === 0 && jenis4.length === 5 && sk5.length === 0 && jenis5.length === 5 && !galat.length ? 0 : 1);
})();
