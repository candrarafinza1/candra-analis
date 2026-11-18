// Dewi & Kirana (12 Nov 10.08): audit kontras otomatis (WCAG AA: 4,5:1 teks biasa, 3:1 teks besar).
// Memeriksa semua teks terlihat + teks contoh (placeholder) di 10 halaman (17 Nov: + beranda, Belajar, pelajaran dengan kuis terjawab benar & salah, 404), mode gelap & terang, lebar 390px & 1280px,
// termasuk hasil Radar 4 emiten, kotak istilah terbuka, semua <details> terbuka, contoh pesan Asisten & pesan galat.
// Halaman "UJI" sengaja memasang judul abu di atas abu; audit wajib menangkapnya (uji balik), jadi hasil sehat = tepat 4 temuan UJI.
// 17 Nov 08.xx (Dewi & Kirana): juga cek garis fokus keyboard: Tab 10× per halaman; tiap elemen yang terfokus wajib punya
// garis fokus terlihat (outline ≥2px, atau box-shadow/border berubah) dengan kontras ≥3:1 terhadap latar di sekitarnya.
// Halaman "UJI-FOKUS" sengaja mematikan outline; audit wajib menangkapnya (uji balik).
// 17 Nov 09.xx (Dewi & Tegar): Tab sampai habis, + keadaan istilah terbuka, hasil Radar UNTR, kuis terjawab; cek border kotak tanya Asisten.
// Cara pakai: python3 -m http.server 8765 (di akar repo), lalu: node tools/audit-kontras.js (AUDIT=fokus: hanya garis fokus & fokus tertutup; AUDIT=zoom: hanya zoom 200% & layar pendek HP; AUDIT=jarak: hanya jarak teks WCAG 1.4.12; AUDIT=orientasi: hanya orientasi layar WCAG 1.3.4; AUDIT=sentuh: hanya ukuran sasaran sentuh WCAG 2.5.8; AUDIT=sorot: hanya konten saat diarahkan/difokus WCAG 1.4.13; AUDIT=label: hanya label dalam nama WCAG 2.5.3; AUDIT=status: hanya pesan status WCAG 4.1.3; AUDIT=judul: hanya judul halaman & urutan judul WCAG 2.4.2/1.3.1; AUDIT=bahasa: hanya bahasa halaman & bagian WCAG 3.1.1/3.1.2; AUDIT=isian: hanya label/petunjuk & pesan salah isian WCAG 3.3.2/3.3.1; AUDIT=urutan: hanya urutan fokus WCAG 2.4.3; AUDIT=nonteks: hanya kontras non-teks WCAG 1.4.11; AUDIT=warna: hanya penggunaan warna WCAG 1.4.1; AUDIT=tautan: hanya tujuan tautan WCAG 2.4.4; AUDIT=konsisten: hanya identifikasi konsisten WCAG 3.2.4; AUDIT=penunjuk: hanya pembatalan penunjuk WCAG 2.5.2; AUDIT=gerak: hanya gerakan penunjuk & gerakan perangkat WCAG 2.5.1/2.5.4; AUDIT=teks: hanya ubah ukuran teks 200% WCAG 1.4.4)
// Butuh Playwright + Chromium (sudah ada di lingkungan kerja tim); tidak dijalankan oleh tests/cek.mjs.
const { chromium } = require('playwright');
// 17 Nov 14.xx (Dewi & Nina): langkah Tab maju & Shift+Tab mundur untuk cek fokus tertutup, dipakai bersama oleh
// audit fokus tertutup dan audit zoom 200% / layar pendek HP.
// 17 Nov 14.xx (Dewi & Nina): zoom 200% dan layar pendek HP (WCAG 1.4.10 Reflow, 2.4.11 Focus Not Obscured).
// Zoom 200% di layar 1280×900 setara jendela 640×450 piksel CSS (deviceScaleFactor 2). Layar pendek HP: 390×600,
// dan 390×360 = papan ketik terbuka (kotak tanya Asisten & kotak ketik Radar terfokus, papan ketik menutup ±240px).
// Tiap halaman: tidak boleh scroll horizontal, lalu Tab maju & Shift+Tab mundur: fokus tidak boleh tertutup elemen lengket.
// Keadaan papan ketik: kotak isian difokus → wajib tampil utuh di layar dan tidak tertutup elemen lengket.
// Uji balik: UJI-LEBAR (elemen 900px) wajib tertangkap sebagai scroll horizontal; UJI-TUTUP (lapisan fixed) sebagai fokus tertutup.
async function auditZoom(b) {
  const ukuran = [
    {nama:'zoom200', viewport:{width:640,height:450}, dsf:2, halaman:['peringkat.html','emiten.html?kode=ANTM','asisten.html','pelajaran.html?m=apa-itu-saham#benar','radar.html#UNTR','index.html','UJI-LEBAR','UJI-TUTUP']},
    {nama:'hp-pendek', viewport:{width:390,height:600}, dsf:1, halaman:['peringkat.html','emiten.html?kode=ANTM','asisten.html','pelajaran.html?m=apa-itu-saham#benar','UJI-LEBAR','UJI-TUTUP']},
  ];
  let totalZoom=0, ujiLebar=0, ujiTutupZ=0, catatanZ=0;
  for (const scheme of ['dark','light']) for (const u of ukuran) {
    const ctx = await b.newContext({ viewport:u.viewport, deviceScaleFactor:u.dsf, colorScheme:scheme });
    const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
    for (const pg of u.halaman) {
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      if (path==='UJI-LEBAR') await p.evaluate(()=>{ const d=document.createElement('div'); d.style.cssText='width:900px;height:4px'; document.querySelector('main').appendChild(d); });
      if (path==='UJI-TUTUP') await p.addStyleTag({content:'body::after{content:"";position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.01)}'});
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (path==='asisten.html') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      const tag=`zoom ${scheme} ${u.nama} ${u.viewport.width}x${u.viewport.height} ${pg}`;
      const sw = await p.evaluate(()=>document.documentElement.scrollWidth);
      if (sw>u.viewport.width) { console.log(tag,'TEMUAN scroll horizontal',sw); if(path==='UJI-LEBAR') ujiLebar++; else totalZoom++; }
      if (path==='UJI-LEBAR') continue;
      await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
      const {temuan, sebagian, dicek} = await tabTutup(p);
      console.log(tag,'lebar',sw,'dicek',dicek); [...temuan.values()].forEach(o=>console.log(tag,'TEMUAN',o)); [...sebagian.values()].forEach(o=>console.log(tag,'sebagian',o));
      if (path==='UJI-TUTUP') ujiTutupZ+=temuan.size; else { totalZoom+=temuan.size; catatanZ+=sebagian.size; }
    }
    if (errs.length) { console.log('zoom',scheme,u.nama,'JS errors',errs); totalZoom+=errs.length; }
    await ctx.close();
  }
  // papan ketik terbuka: 390×360, kotak isian difokus lewat Tab (bukan .focus() langsung, agar peramban yang menggulir)
  for (const scheme of ['dark','light']) {
    const ctx = await b.newContext({ viewport:{width:390,height:360}, colorScheme:scheme });
    const p = await ctx.newPage();
    for (const [pg,sel] of [['asisten.html','.form-tanya textarea'],['radar.html','#ketik-saham, input[list]'],['UJI-KETIK','.form-tanya textarea']]) {
      await p.goto('http://localhost:8765/'+(pg==='UJI-KETIK'?'asisten.html':pg)); await p.waitForTimeout(300);
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      if (pg!=='radar.html') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
      if (pg==='UJI-KETIK') await p.addStyleTag({content:'body::after{content:"";position:fixed;left:0;right:0;bottom:0;height:100vh;z-index:50;background:rgba(0,0,0,.01)}'});
      const tag=`ketik ${scheme} 390x360 ${pg}`;
      const ada = await p.$(sel); if (!ada) { console.log(tag,'TEMUAN kotak isian tidak ketemu',sel); if(pg==='UJI-KETIK') ujiTutupZ++; else totalZoom++; continue; }
      await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
      let ok=false; for (let i=0;i<200;i++) { await p.keyboard.press('Tab'); await p.waitForTimeout(20); if (await p.evaluate((sel)=>document.activeElement&&document.activeElement.matches(sel),sel)) { ok=true; break; } }
      if (!ok) { console.log(tag,'TEMUAN kotak isian tidak tercapai dengan Tab'); totalZoom++; continue; }
      const r = await p.evaluate(()=>{ const el=document.activeElement; const rc=el.getBoundingClientRect(); const m=[];
        if (rc.top<-1||rc.bottom>innerHeight+1) m.push('tidak tampil utuh (top '+Math.round(rc.top)+', bawah '+Math.round(rc.bottom)+', tinggi layar '+innerHeight+')');
        let tutup=0; for (const fx of [.15,.5,.85]) for (const fy of [.2,.5,.8]) { const x=rc.left+rc.width*fx, y=Math.min(Math.max(rc.top+rc.height*fy,0),innerHeight-1); const a=document.elementFromPoint(x,y);
          if (a===document.body||a===document.documentElement) { if(getComputedStyle(document.body,'::after').position==='fixed') tutup++; continue; }
          if (a && a!==el && !el.contains(a) && !a.contains(el)) { for(let e=a;e&&e!==document.documentElement;e=e.parentElement){ const ps=getComputedStyle(e).position; if(ps==='sticky'||ps==='fixed'){tutup++;break;} } } }
        if (tutup) m.push('tertutup elemen lengket di '+tutup+'/9 titik'); return m.join('; '); });
      console.log(tag, r?'TEMUAN '+r:'lolos');
      if (r) { if(pg==='UJI-KETIK') ujiTutupZ++; else totalZoom++; }
    }
    await ctx.close();
  }
  console.log('total temuan zoom/layar pendek',totalZoom,'(sebagian tertutup:',catatanZ,'; uji balik UJI-LEBAR tertangkap:',ujiLebar,'; UJI-TUTUP/UJI-KETIK tertangkap:',ujiTutupZ,')');
}
// (lanjutan) fungsi bersama Tab maju & mundur
async function tabTutup(p) {
      const temuan=new Map(), sebagian=new Map(); let dicek=0;
      for (const tombol of ['Tab','Shift+Tab']) {
        let pertama=null;
        for (let i=0;i<400;i++) {
          await p.keyboard.press(tombol); await p.waitForTimeout(30);
          const r = await p.evaluate(() => {
            const el=document.activeElement; if(!el||el===document.body) return {habis:true};
            if(!window.__idT) window.__idT=new WeakMap(), window.__nT=0;
            if(!window.__idT.has(el)) window.__idT.set(el,++window.__nT);
            const rc=el.getBoundingClientRect(); const nama=el.tagName.toLowerCase()+' "'+(el.textContent||el.getAttribute('aria-label')||el.id||'').trim().slice(0,30)+'"';
            if(rc.width===0||rc.height===0) return {id:window.__idT.get(el), lewat:true};
            const lengket=e=>{ for(;e&&e!==document.documentElement;e=e.parentElement){ const ps=getComputedStyle(e).position; if(ps==='sticky'||ps==='fixed') return e; } const a=getComputedStyle(document.body,'::after'); return null; };
            let tutup=0, oleh=new Set(), titik=0;
            for (const fx of [.15,.5,.85]) for (const fy of [.15,.5,.85]) {
              const x=rc.left+rc.width*fx, y=rc.top+rc.height*fy;
              if (x<0||y<0||x>=innerWidth||y>=innerHeight) { tutup++; titik++; oleh.add('di luar layar'); continue; }
              titik++; const atas=document.elementFromPoint(x,y);
              if (!atas || atas===el || el.contains(atas) || atas.contains(el)) { if(atas===document.body||atas===document.documentElement){ /* lapisan semu body::after */ if(getComputedStyle(document.body,'::after').position==='fixed'){tutup++;oleh.add('body::after');} } continue; }
              const l=lengket(atas); if (l && !l.contains(el)) { tutup++; oleh.add(l.tagName.toLowerCase()+'.'+(l.className||'').toString().split(' ')[0]); }
            }
            return {id:window.__idT.get(el), nama, tutup, titik, oleh:[...oleh].join(',')};
          });
          if (r.habis) { if (pertama!==null) break; else continue; }
          if (pertama===null) pertama=r.id; else if (r.id===pertama) break;
          if (r.lewat) continue; dicek++;
          const ket=`${tombol} ${r.nama} tertutup ${r.tutup}/${r.titik} oleh ${r.oleh}`;
          if (r.tutup===r.titik && !temuan.has(r.nama)) temuan.set(r.nama, ket); else if (r.tutup>0 && r.tutup<r.titik && !sebagian.has(r.nama)) sebagian.set(r.nama, ket);
        }
      }
  return {temuan, sebagian, dicek};
}
// 17 Nov 15.xx (Dewi & Nina): jarak teks (WCAG 1.4.12 Text Spacing). Pengguna boleh memasang sendiri
// line-height 1,5×, jarak paragraf 2×, letter-spacing 0,12×, word-spacing 0,16× ukuran huruf; tidak boleh ada isi hilang.
// Tiap halaman (gelap/terang, 390px & 1280px): gaya jarak dipasang, lalu dicek: (1) tidak ada scroll horizontal,
// (2) tidak ada teks terpotong oleh kotak ber-overflow hidden/clip (termasuk elipsis "…"),
// (3) tidak ada dua baris teks yang saling menumpuk (kotak teks berpotongan ≥3px).
// Kotak melayang (position fixed, mis. kotak istilah) hanya dibandingkan dengan teks di dalam kotak itu sendiri.
// Teks khusus pembaca layar (kotak 1px / clip) dan isi yang sengaja bisa digulir (overflow auto/scroll) tidak dihitung terpotong.
// Uji balik: UJI-POTONG (judul diberi tinggi tetap 1em + overflow hidden) dan UJI-TUMPUK (judul tinggi tetap 1em, overflow terlihat)
// wajib tertangkap.
const GAYA_JARAK='*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';
// 17 Nov 16.xx (Dewi & Nina): orientasi layar (WCAG 1.3.4). HP mendatar 844×390 dan tablet mendatar 1024×768.
// Tiap halaman: (1) isi tidak terkunci orientasi: panjang teks <main> yang terlihat saat mendatar ≥90% dari saat tegak
// (390×844 / 768×1024); (2) tanpa scroll horizontal; (3) setelah digulir, elemen lengket (sticky/fixed) yang menempel
// di layar tidak menutupi lebih dari separuh tinggi layar; (4) Tab maju & mundur: fokus tidak tertutup elemen lengket;
// (5) kotak tanya Asisten tercapai dengan Tab dan tampil utuh. Juga cek statis: tidak ada screen.orientation.lock.
// Uji balik: UJI-KUNCI (isi <main> disembunyikan saat mendatar) dan UJI-LENGKET (kepala lengket 60% tinggi layar) wajib tertangkap.
async function auditOrientasi(b) {
  const fs=require('fs'), path=require('path'); const akar=path.join(__dirname,'..');
  let total=0, ujiKunci=0, ujiLengket=0;
  for (const f of fs.readdirSync(akar).filter(f=>f.endsWith('.html')).concat(fs.readdirSync(path.join(akar,'assets')).filter(f=>f.endsWith('.js')).map(f=>'assets/'+f))) {
    const t=fs.readFileSync(path.join(akar,f),'utf8'); if (/orientation\s*\.\s*lock|orientation\s*:\s*(portrait|landscape)/.test(t.replace(/@media[^{]*orientation[^{]*\{/g,''))) { console.log('orientasi statis TEMUAN kunci orientasi di',f); total++; }
  }
  const halaman=['peringkat.html','emiten.html?kode=ANTM','radar.html#UNTR','pelajaran.html?m=apa-itu-saham#benar','asisten.html','index.html','UJI-KUNCI','UJI-LENGKET'];
  const ukuran=[{nama:'hp-mendatar',datar:{width:844,height:390},tegak:{width:390,height:844},hp:true},{nama:'tablet-mendatar',datar:{width:1024,height:768},tegak:{width:768,height:1024},hp:false}];
  const buka=async(p,pg)=>{ const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
    await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
    await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
    if (path==='UJI-KUNCI') await p.addStyleTag({content:'@media (orientation:landscape){main{display:none!important}}'});
    if (path==='UJI-LENGKET') await p.addStyleTag({content:'body::before{content:"";display:block;position:sticky;top:0;height:60vh;z-index:40;background:#888}'});
    if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
    if (path==='asisten.html') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
    if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
      await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
      await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
    await p.$$eval('details', d=>d.forEach(x=>x.open=true)); return path; };
  const teks=p=>p.evaluate(()=>{ const m=document.querySelector('main'); return m&&m.getClientRects().length&&m.checkVisibility()?m.innerText.replace(/\s+/g,' ').trim().length:0; });
  for (const scheme of ['dark','light']) for (const u of ukuran) {
    const opsi=v=>({viewport:v, colorScheme:scheme, isMobile:u.hp, hasTouch:u.hp, deviceScaleFactor:1});
    const cT=await b.newContext(opsi(u.tegak)), pT=await cT.newPage();
    const cD=await b.newContext(opsi(u.datar)), pD=await cD.newPage(); const errs=[]; pD.on('pageerror',e=>errs.push(e.message));
    for (const pg of halaman) {
      const tag=`orientasi ${scheme} ${u.nama} ${u.datar.width}x${u.datar.height} ${pg}`; let n=0;
      await buka(pT,pg); const path=await buka(pD,pg); const lT=await teks(pT), lD=await teks(pD);
      if (lD<lT*0.9) { console.log(tag,'TEMUAN isi berkurang saat mendatar',lD,'dari',lT); n++; }
      const sw=await pD.evaluate(()=>document.documentElement.scrollWidth); if (sw>u.datar.width) { console.log(tag,'TEMUAN scroll horizontal',sw); n++; }
      const lengket=await pD.evaluate(()=>{ window.scrollTo(0,Math.min(600,document.documentElement.scrollHeight)); let tinggi=0;
        const cek=(e,r)=>{ if(r.bottom<=0||r.top>=innerHeight||r.height===0) return; tinggi=Math.max(tinggi,Math.min(r.bottom,innerHeight)-Math.max(r.top,0)); };
        for (const e of document.querySelectorAll('body *')) { const ps=getComputedStyle(e).position; if(ps==='sticky'||ps==='fixed') cek(e,e.getBoundingClientRect()); }
        const sb=getComputedStyle(document.body,'::before'); if(sb.position==='sticky'||sb.position==='fixed') tinggi=Math.max(tinggi,parseFloat(sb.height)||0);
        return Math.round(tinggi); });
      if (lengket>u.datar.height/2) { console.log(tag,'TEMUAN elemen lengket menutupi',lengket,'px dari',u.datar.height); n++; }
      if (path!=='UJI-KUNCI') { await pD.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
        const {temuan,dicek}=await tabTutup(pD); [...temuan.values()].forEach(o=>console.log(tag,'TEMUAN fokus tertutup',o)); if(path!=='UJI-LENGKET') n+=temuan.size; else if(temuan.size) n++;
        if (path==='asisten.html') { await pD.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
          let ok=false; for (let i=0;i<200;i++){ await pD.keyboard.press('Tab'); await pD.waitForTimeout(20); if (await pD.evaluate(()=>document.activeElement&&document.activeElement.matches('.form-tanya textarea'))){ok=true;break;} }
          const r=ok?await pD.evaluate(()=>{ const rc=document.activeElement.getBoundingClientRect(); return rc.top<-1||rc.bottom>innerHeight+1?'kotak tanya tidak tampil utuh (top '+Math.round(rc.top)+', bawah '+Math.round(rc.bottom)+')':''; }):'kotak tanya tidak tercapai dengan Tab';
          if (r) { console.log(tag,'TEMUAN',r); n++; } }
        console.log(tag,'teks',lD+'/'+lT,'lebar',sw,'lengket',lengket,'dicek',dicek, n?'':'lolos'); }
      else console.log(tag,'teks',lD+'/'+lT,'lebar',sw,'lengket',lengket);
      if (path==='UJI-KUNCI') ujiKunci+=n?1:0; else if (path==='UJI-LENGKET') ujiLengket+=n?1:0; else total+=n;
    }
    if (errs.length) { console.log('orientasi',scheme,u.nama,'JS errors',errs); total+=errs.length; }
    await cT.close(); await cD.close();
  }
  console.log('total temuan orientasi',total,'(uji balik UJI-KUNCI tertangkap:',ujiKunci,'dari 4; UJI-LENGKET tertangkap:',ujiLengket,'dari 4)');
}
// 17 Nov 17.xx (Dewi & Nina): ukuran sasaran sentuh (WCAG 2.5.8 Target Size Minimum) di HP 390px, gelap/terang.
// Setiap tautan/tombol/isian yang bisa ditekan wajib minimal 24×24px, ATAU lingkaran berdiameter 24px di tengahnya tidak
// menyentuh sasaran lain maupun lingkaran sasaran kecil lain (pengecualian jarak). Tautan di dalam kalimat dikecualikan.
// Kotak centang/pilihan diukur bersama label-nya (label ikut bisa ditekan). Uji balik: UJI-SENTUH (dua tombol 12px berdempetan).
async function auditSentuh(b) {
  const halaman=['peringkat.html','peringkat.html#istilah','emiten.html?kode=ANTM','radar.html#UNTR','pelajaran.html?m=apa-itu-saham','pelajaran.html?m=apa-itu-saham#benar','asisten.html',
    'index.html','kabar.html','belajar.html','metodologi.html','404.html','UJI-SENTUH'];
  let total=0, ujiSentuh=0;
  for (const scheme of ['dark','light']) {
    const ctx=await b.newContext({ viewport:{width:390,height:844}, colorScheme:scheme, isMobile:true, hasTouch:true, deviceScaleFactor:1 });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    for (const pg of halaman) {
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
      if (path==='UJI-SENTUH') await p.evaluate(()=>{ document.querySelector('main').insertAdjacentHTML('afterbegin','<p><button style="all:unset;display:inline-block;width:12px;height:12px;background:#888">a</button><button style="all:unset;display:inline-block;width:12px;height:12px;background:#888">b</button></p>'); });
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (path==='asisten.html') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('.istilah, [data-istilah], button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} }
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      const r=await p.evaluate(()=>{
        const sel='a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[tabindex]:not([tabindex="-1"])';
        const blok=e=>{ for(let x=e.parentElement;x;x=x.parentElement){ const d=getComputedStyle(x).display; if(!d.startsWith('inline')&&d!=='contents') return x; } return document.body; };
        const dalamKalimat=e=>{ if(!getComputedStyle(e).display.startsWith('inline')||getComputedStyle(e).display==='inline-block') return false;
          const bk=blok(e); let t=bk.innerText; for (const a of bk.querySelectorAll(sel)) t=t.split(a.innerText).join(' '); return /[A-Za-z0-9]{3,}/.test(t); };
        const sasaran=[]; let kecuali=0;
        for (const e of document.querySelectorAll(sel)) {
          if (e.disabled||!e.checkVisibility({visibilityProperty:true,opacityProperty:true})) continue;
          let el=e; if (e.matches('input[type=checkbox],input[type=radio]')) { const l=e.closest('label')||(e.id&&document.querySelector('label[for="'+e.id+'"]')); if(l) el=l; }
          if (e.matches('input,textarea,select')===false && e.closest('label')&&e.closest('label')!==e) {}
          const rc=el.getBoundingClientRect(); if (rc.width<2||rc.height<2) continue;
          const cs=getComputedStyle(e); if (cs.position==='absolute'&&(cs.clip.startsWith('rect(0')||cs.clipPath.includes('inset(50%'))) continue;
          if (dalamKalimat(e)) { kecuali++; continue; }
          if (sasaran.some(s=>s.el===el)) continue;
          sasaran.push({el, rc, nama:(e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' "'+(e.innerText||e.value||e.getAttribute('aria-label')||'').trim().slice(0,30)+'"')});
        }
        const temuan=[]; let kecil=0;
        const pusat=s=>[s.rc.left+s.rc.width/2, s.rc.top+s.rc.height/2];
        const jarakKeKotak=([x,y],r)=>Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));
        for (const s of sasaran) {
          if (s.rc.width>=23.5&&s.rc.height>=23.5) continue; kecil++;
          const c=pusat(s); let tabrak=null;
          for (const o of sasaran) { if (o===s||o.el.contains(s.el)||s.el.contains(o.el)) continue;
            const kecilO=!(o.rc.width>=23.5&&o.rc.height>=23.5);
            if (jarakKeKotak(c,o.rc)<12 || (kecilO && Math.hypot(c[0]-pusat(o)[0],c[1]-pusat(o)[1])<24)) { tabrak=o; break; } }
          if (tabrak) temuan.push(`${s.nama} ${Math.round(s.rc.width)}×${Math.round(s.rc.height)}px terlalu dekat dengan ${tabrak.nama}`);
        }
        return {temuan, n:sasaran.length, kecil, kecuali, sw:document.documentElement.scrollWidth};
      });
      const tag=`sentuh ${scheme} 390 ${pg}`;
      r.temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      if (r.sw>390) { console.log(tag,'TEMUAN scroll horizontal',r.sw); r.temuan.push('scroll'); }
      console.log(tag,'sasaran',r.n,'di bawah 24px',r.kecil,'tautan dalam kalimat',r.kecuali, r.temuan.length?'':'lolos');
      if (path==='UJI-SENTUH') ujiSentuh+=r.temuan.length?1:0; else total+=r.temuan.length;
    }
    if (errs.length) { console.log('sentuh',scheme,'JS errors',errs); total+=errs.length; }
    await ctx.close();
  }
  console.log('total temuan sasaran sentuh',total,'(uji balik UJI-SENTUH tertangkap:',ujiSentuh,'dari 2)');
}
async function auditJarak(b) {
  const halaman=['peringkat.html','peringkat.html#istilah','emiten.html?kode=ANTM','radar.html#UNTR','pelajaran.html?m=apa-itu-saham#benar','asisten.html','asisten.html#jawab',
    'index.html','kabar.html','belajar.html','metodologi.html','404.html','UJI-POTONG','UJI-TUMPUK'];
  let totalJarak=0, ujiPotong=0, ujiTumpuk=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, colorScheme:scheme });
    const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
    for (const pg of halaman) {
      const [path,hash]=pg.split('#');
      await p.goto('http://localhost:8765/'+(path.startsWith('UJI-')?'peringkat.html':path)); await p.waitForTimeout(300);
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate(id=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('.istilah, [data-istilah], button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} }
      if (hash==='jawab') await p.evaluate(()=>{const log=document.querySelector('[aria-live="polite"]'); if(log) log.insertAdjacentHTML('beforeend','<div class="pesan pesan-galat"><span class="pesan-label">Asisten</span><p>Maaf, server galat</p></div><div class="pesan pesan-asisten"><span class="pesan-label">Asisten</span><p>Contoh jawaban <strong>tebal</strong> yang agak panjang supaya terbungkus beberapa baris.</p><ul><li>Butir satu</li><li>Butir dua</li></ul></div>');});
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      await p.addStyleTag({content:GAYA_JARAK});
      if (path==='UJI-POTONG') await p.addStyleTag({content:'h1{height:1em!important;overflow:hidden!important}'});
      if (path==='UJI-TUMPUK') await p.addStyleTag({content:'h1{height:1em!important;overflow:visible!important;margin-bottom:0!important}h1+*{margin-top:0!important}'});
      await p.waitForTimeout(250);
      const res = await p.evaluate(() => {
        const tersembunyi = el => { for(let e=el;e;e=e.parentElement){ const s=getComputedStyle(e); if(s.display==='none'||s.visibility==='hidden'||s.clipPath.includes('inset(50%')||(s.clip&&s.clip.startsWith('rect(0'))) return true; const r=e.getBoundingClientRect(); if(r.width<=1&&r.height<=1&&s.overflow==='hidden') return true; } return false; };
        const potong=[], kotak=[]; const dicekEl=new Set();
        const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
        while(n=w.nextNode()){ if(!n.textContent.trim()) continue; const el=n.parentElement; if(!el||['SCRIPT','STYLE','NOSCRIPT','OPTION','TEXTAREA'].includes(el.tagName)) continue; if(tersembunyi(el)) continue;
          const rg=document.createRange(); rg.selectNodeContents(n);
          let lapis=null; for(let e=el;e;e=e.parentElement){ if(getComputedStyle(e).position==='fixed'){ lapis=e; break; } }
          for (const r of rg.getClientRects()) if (r.width>1&&r.height>1) kotak.push({r, el, lapis, t:n.textContent.trim().slice(0,30)});
          // terpotong: cari leluhur ber-overflow hidden/clip yang kotaknya tidak memuat teks
          for (let e=el;e&&e!==document.body;e=e.parentElement){ const s=getComputedStyle(e);
            const ox=s.overflowX, oy=s.overflowY; if(['auto','scroll'].includes(ox)&&['auto','scroll'].includes(oy)) break;
            const hX=ox==='hidden'||ox==='clip', hY=oy==='hidden'||oy==='clip'; if(!hX&&!hY) continue;
            if (dicekEl.has(e)) break; dicekEl.add(e);
            const lebih = (hX&&e.scrollWidth>e.clientWidth+1)||(hY&&e.scrollHeight>e.clientHeight+1);
            if (lebih) potong.push(`<${e.tagName.toLowerCase()} class="${e.className}"> ${hY?'tinggi '+e.clientHeight+'/'+e.scrollHeight:''} ${hX?'lebar '+e.clientWidth+'/'+e.scrollWidth:''} "${(e.textContent||'').trim().slice(0,40)}"`);
            break; }
        }
        // tumpuk: dua kotak baris dari elemen berbeda yang berpotongan ≥3px di kedua sumbu
        const tumpuk=[]; kotak.sort((a,b)=>a.r.top-b.r.top);
        for (let i=0;i<kotak.length&&tumpuk.length<10;i++) for (let j=i+1;j<kotak.length;j++){ const a=kotak[i], c=kotak[j]; if(c.r.top>=a.r.bottom-3) break; if(a.el===c.el) continue; if(a.lapis!==c.lapis) continue; // kotak melayang (mis. kotak istilah, position fixed) memang menutupi isi di bawahnya
          if (a.el.contains(c.el)||c.el.contains(a.el)) { /* teks bertingkat dalam satu baris: tetap dicek */ }
          const ox=Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left), oy=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
          if (ox>=3&&oy>=3) { tumpuk.push(`"${a.t}" ⟂ "${c.t}" (${Math.round(ox)}×${Math.round(oy)}px)`); break; } }
        return {sw:document.documentElement.scrollWidth, potong, tumpuk, n:kotak.length};
      });
      const tag=`jarak ${scheme} ${w} ${pg}`; const masalah=[];
      if (res.sw>w) masalah.push('scroll horizontal '+res.sw);
      res.potong.forEach(x=>masalah.push('terpotong '+x)); res.tumpuk.forEach(x=>masalah.push('tumpuk '+x));
      console.log(tag, 'baris teks dicek', res.n, masalah.length?'TEMUAN '+masalah.length:'lolos'); masalah.forEach(m=>console.log('   ',m));
      if (path==='UJI-POTONG') ujiPotong+=res.potong.length; else if (path==='UJI-TUMPUK') ujiTumpuk+=res.tumpuk.length; else totalJarak+=masalah.length;
    }
    if (errs.length) { console.log('jarak',scheme,w,'galat JS',errs); totalJarak+=errs.length; }
    await ctx.close();
  }
  console.log('total temuan jarak teks',totalJarak,'(uji balik UJI-POTONG tertangkap:',ujiPotong,'; UJI-TUMPUK tertangkap:',ujiTumpuk,')');
}
// 17 Nov 18.xx (Dewi & Nina): konten yang muncul saat diarahkan/difokus (WCAG 1.4.13 Content on Hover or Focus).
// Tiap elemen yang bisa difokus diarahkan penunjuk (hover) lalu difokus keyboard; bila ada konten baru yang tampil, konten itu wajib:
// (1) bisa ditutup dengan Escape tanpa memindah penunjuk/fokus, (2) tetap tampil saat penunjuk digeser ke atasnya,
// (3) tidak hilang sendiri (dicek 3 detik). Kotak istilah (dibuka dengan klik/Enter) diuji khusus: Escape menutup & fokus
// kembali ke tombolnya, tetap tampil saat penunjuk di atas kotak, saat penunjuk pergi, dan setelah 3 detik.
// 390px & 1280px × gelap/terang. Uji balik: UJI-SOROT (kotak hilang saat mouseout/blur, tanpa Escape) dan
// UJI-HILANG (kotak hilang sendiri setelah 1 detik) wajib tertangkap.
async function auditSorot(b) {
  const halaman=['peringkat.html','emiten.html?kode=ANTM','radar.html#UNTR','pelajaran.html?m=apa-itu-saham#benar','asisten.html',
    'index.html','kabar.html','belajar.html','metodologi.html','404.html','UJI-SOROT','UJI-HILANG'];
  let total=0, ujiSorot=0, ujiHilang=0;
  const PASANG=()=>{ window.__tampil=()=>{ const out=[]; for (const e of document.querySelectorAll('body *')) {
      if (!e.checkVisibility({visibilityProperty:true,opacityProperty:true})) continue;
      const r=e.getBoundingClientRect(); if (r.width<1||r.height<1) continue;
      if (r.right+scrollX<=0||r.bottom+scrollY<=0) continue; const cs=getComputedStyle(e);
      if (cs.position==='absolute'&&(cs.clip.startsWith('rect(0')||cs.clipPath.includes('inset(50%'))) continue; out.push(e); } return out; };
    window.__awal=()=>{ window.__set=new Set(window.__tampil()); };
    window.__baru=()=>{ const b=window.__tampil().filter(e=>!window.__set.has(e)); const atas=b.filter(e=>!b.some(o=>o!==e&&o.contains(e)));
      window.__konten=atas; const semua=window.__tampil();
      // Konten yang tidak menutupi elemen lain (ikut alur halaman) dikecualikan dari syarat Escape (WCAG 1.4.13).
      const menutupi=e=>{ const r=e.getBoundingClientRect(); return semua.some(o=>{ if(o===e||o.contains(e)||e.contains(o)||atas.some(a=>a.contains(o))) return false;
        if (o.children.length&&![...o.childNodes].some(n=>n.nodeType===3&&/\S/.test(n.nodeValue))) return false; const q=o.getBoundingClientRect();
        return Math.min(r.right,q.right)-Math.max(r.left,q.left)>2&&Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>2; }); };
      return atas.map(e=>{ const r=e.getBoundingClientRect(); return {tutup:menutupi(e), nama:e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:'')+' "'+(e.innerText||e.textContent||'').trim().slice(0,30)+'"', x:r.left+r.width/2, y:r.top+r.height/2}; }); };
    window.__masih=()=>window.__konten.filter(e=>document.contains(e)&&e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getBoundingClientRect().right+scrollX>0).length; };
  // Empat keadaan (gelap/terang × 390/1280) dijalankan bersamaan agar audit selesai < 5 menit; hasil dicetak per keadaan.
  const keadaan=[]; for (const scheme of ['dark','light']) for (const w of [390,1280]) keadaan.push([scheme,w]);
  const hasil=await Promise.all(keadaan.map(async ([scheme,w])=>{ const log=[]; const console={log:(...a)=>log.push(a.join(' '))}; let total=0, ujiSorot=0, ujiHilang=0;
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1 });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    for (const pg of halaman) {
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-'); const tag=`sorot ${scheme} ${w} ${pg}`;
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      if (path==='UJI-SOROT') await p.evaluate(()=>{ document.querySelector('main').insertAdjacentHTML('afterbegin','<p style="position:relative"><button id="uji-sorot">uji</button><span id="uji-tip" hidden style="position:absolute;left:0;top:48px;background:#888;padding:8px">keterangan</span></p>');
        const t=document.getElementById('uji-sorot'), s=document.getElementById('uji-tip'); const buka=()=>s.hidden=false, tutup=()=>s.hidden=true;
        t.addEventListener('mouseenter',buka); t.addEventListener('mouseleave',tutup); t.addEventListener('focus',buka); t.addEventListener('blur',tutup); });
      if (path==='UJI-HILANG') await p.evaluate(()=>{ document.querySelector('main').insertAdjacentHTML('afterbegin','<p style="position:relative"><button id="uji-sorot">uji</button><span id="uji-tip" hidden style="position:absolute;left:0;top:100%;background:#888;padding:8px">keterangan</span></p>');
        const t=document.getElementById('uji-sorot'), s=document.getElementById('uji-tip'); let w;
        const buka=()=>{ s.hidden=false; clearTimeout(w); w=setTimeout(()=>s.hidden=true,1000); }; t.addEventListener('mouseenter',buka); t.addEventListener('focus',buka);
        document.addEventListener('keydown',e=>{ if(e.key==='Escape') s.hidden=true; }); });
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (path==='asisten.html') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      await p.evaluate(PASANG);
      const n=await p.evaluate(()=>{ const sel='a[href],button,input:not([type=hidden]),select,textarea,summary,[tabindex]:not([tabindex="-1"])';
        const d=[...document.querySelectorAll(sel)].filter(e=>!e.disabled&&e.checkVisibility()); d.forEach((e,i)=>e.dataset.sorot=i); return d.length; });
      const temuan=[]; let muncul=0;
      const netral=async()=>{ await p.mouse.move(w-2,843); await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); }); };
      for (let i=0;i<n;i++) {
        for (const cara of ['arah','fokus']) {
          await netral(); const sel=`[data-sorot="${i}"]`;
          const pos=await p.evaluate((sel)=>{ const e=document.querySelector(sel); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); window.__awal(); return {x:r.left+r.width/2,y:r.top+r.height/2,nama:e.tagName.toLowerCase()+' "'+(e.innerText||e.value||e.getAttribute('aria-label')||'').trim().slice(0,30)+'"'}; },sel);
          if (!pos) continue;
          if (cara==='arah') { if (pos.x<0||pos.x>w||pos.y<0||pos.y>844) continue; await p.mouse.move(pos.x,pos.y); }
          else await p.focus(sel);
          await p.waitForTimeout(80); const baru=await p.evaluate(()=>window.__baru());
          if (!baru.length) continue; muncul++;
          const nama=`${pos.nama} (${cara==='arah'?'diarahkan':'difokus'}) → ${baru.map(x=>x.nama).join(', ')}`;
          // (3) tidak hilang sendiri
          await p.waitForTimeout(3000); if ((await p.evaluate(()=>window.__masih()))<baru.length) temuan.push(nama+': hilang sendiri sebelum 3 detik');
          // (2) bisa diarahkan: geser penunjuk dari pemicu ke atas konten
          if (cara==='arah') { await p.mouse.move(pos.x,pos.y); await p.waitForTimeout(50);
            for (const k of baru) { await p.mouse.move(k.x,k.y,{steps:8}); await p.waitForTimeout(100);
              if ((await p.evaluate(()=>window.__masih()))<baru.length) { temuan.push(nama+': hilang saat penunjuk digeser ke atasnya'); break; } }
            await p.mouse.move(pos.x,pos.y); await p.waitForTimeout(100); }
          // (1) bisa ditutup dengan Escape tanpa memindah penunjuk/fokus
          if ((await p.evaluate(()=>window.__masih()))>0) { await p.keyboard.press('Escape'); await p.waitForTimeout(100);
            const r=await p.evaluate((sel)=>({sisa:window.__masih(), fokus:document.activeElement===document.querySelector(sel)}),sel);
            if (r.sisa>0&&baru.some(k=>k.tutup)) temuan.push(nama+': tidak tertutup dengan Escape (dan menutupi isi lain)');
            else if (cara==='fokus'&&!r.fokus) temuan.push(nama+': Escape memindah fokus'); }
        }
      }
      // Kotak istilah (dibuka dengan klik/Enter)
      let istilah='tidak ada tombol istilah';
      if (!uji && await p.$('button.istilah')) {
        await netral(); const bt=await p.evaluate(()=>{ const t=[...document.querySelectorAll('button.istilah')].find(x=>x.checkVisibility()&&x.tabIndex>=0); if(!t) return null; t.scrollIntoView({block:'center'}); t.dataset.sorotIstilah='1'; const r=t.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; });
        if (bt) { const st='[data-sorot-istilah="1"]', buka=()=>p.evaluate(()=>{ const k=document.getElementById('kotak-istilah'); return !!(k&&!k.hidden&&k.checkVisibility()); });
          const masalah=[];
          await p.mouse.click(bt.x,bt.y); await p.waitForTimeout(150);
          if (!await buka()) masalah.push('kotak tidak terbuka saat diklik');
          else { const k=await p.evaluate(()=>{ const r=document.getElementById('kotak-istilah').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; });
            await p.mouse.move(k.x,k.y,{steps:8}); await p.waitForTimeout(100); if (!await buka()) masalah.push('hilang saat penunjuk digeser ke atas kotak');
            await p.mouse.move(Math.min(w-2,k.x+400),Math.min(843,k.y+300),{steps:8}); await p.waitForTimeout(100); if (!await buka()) masalah.push('hilang saat penunjuk pergi (mouseout)');
            await p.waitForTimeout(3000); if (!await buka()) masalah.push('hilang sendiri sebelum 3 detik');
            await p.keyboard.press('Escape'); await p.waitForTimeout(100); if (await buka()) masalah.push('tidak tertutup dengan Escape (dibuka klik)');
            await p.focus(st); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
            if (!await buka()) masalah.push('kotak tidak terbuka dengan Enter');
            else { await p.keyboard.press('Escape'); await p.waitForTimeout(100);
              if (await buka()) masalah.push('tidak tertutup dengan Escape (dibuka Enter)');
              else if (!await p.evaluate((st)=>document.activeElement===document.querySelector(st),st)) masalah.push('fokus tidak kembali ke tombol istilah setelah Escape');
              await p.keyboard.press('Enter'); await p.waitForTimeout(150);
              if (await p.$('#kotak-istilah a')) { await p.keyboard.press('Tab'); await p.waitForTimeout(50); await p.keyboard.press('Escape'); await p.waitForTimeout(100);
                if (await buka()) masalah.push('tidak tertutup dengan Escape dari tautan di dalam kotak');
                else if (!await p.evaluate((st)=>document.activeElement===document.querySelector(st),st)) masalah.push('fokus tidak kembali ke tombol istilah dari tautan di kotak'); } } }
          masalah.forEach(m=>temuan.push('kotak istilah: '+m)); istilah=masalah.length?'kotak istilah bermasalah':'kotak istilah lolos'; }
      }
      temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      console.log(tag,'elemen dicek',n,'konten muncul',muncul,istilah, temuan.length?'':'lolos');
      if (path==='UJI-SOROT') ujiSorot+=temuan.length?1:0; else if (path==='UJI-HILANG') ujiHilang+=temuan.length?1:0; else total+=temuan.length;
    }
    if (errs.length) { console.log('sorot',scheme,w,'JS errors',errs); total+=errs.length; }
    await ctx.close(); return {log,total,ujiSorot,ujiHilang};
  }));
  for (const h of hasil) { h.log.forEach(l=>console.log(l)); total+=h.total; ujiSorot+=h.ujiSorot; ujiHilang+=h.ujiHilang; }
  console.log('total temuan konten sorot',total,'(uji balik UJI-SOROT tertangkap:',ujiSorot,'dari 4; UJI-HILANG tertangkap:',ujiHilang,'dari 4)');
}
// 17 Nov 19.xx (Dewi & Nina): audit label dalam nama (WCAG 2.5.3). Setiap tautan/tombol/isian/ringkasan yang punya teks
// terlihat (atau <label> terlihat) wajib punya nama aksesibel yang MEMUAT teks terlihat itu (dibandingkan tanpa huruf besar,
// tanda baca, dan spasi ganda), supaya pengguna perintah suara bisa menyebut apa yang dilihatnya. Nama dihitung dari
// aria-labelledby → aria-label → isi (isi selalu memuat teks terlihat). Teks tersembunyi khusus pembaca layar tidak dihitung
// sebagai teks terlihat. Juga dicatat: nama yang tidak DIAWALI teks terlihat (saran WCAG, bukan temuan).
// 12 keadaan × gelap/terang × 390/1280px. Uji balik: UJI-LABEL (tombol "Kirim" ber-aria-label "Tutup") wajib tertangkap.
async function auditLabel(b) {
  const halaman=['peringkat.html','peringkat.html#istilah','emiten.html?kode=ANTM','radar.html#UNTR','pelajaran.html?m=apa-itu-saham','pelajaran.html?m=apa-itu-saham#benar','asisten.html',
    'index.html','kabar.html','belajar.html','metodologi.html','404.html','UJI-LABEL'];
  let total=0, saran=0, ujiLabel=0, dicekSemua=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1 });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    for (const pg of halaman) {
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
      if (path==='UJI-LABEL') await p.evaluate(()=>{ document.querySelector('main').insertAdjacentHTML('afterbegin','<p><button aria-label="Tutup">Kirim</button></p>'); });
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('.istilah, [data-istilah], button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} }
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      const r=await p.evaluate(()=>{
        const sel='a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=checkbox],[role=radio]';
        const norm=t=>(t||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
        const srOnly=e=>{ for(let x=e;x&&x!==document.body;x=x.parentElement){ const cs=getComputedStyle(x);
          if (cs.position==='absolute'&&(cs.clip.startsWith('rect(0')||cs.clipPath.includes('inset(50%'))) return true;
          if (x.getAttribute('aria-hidden')==='true'&&x!==e) return false; } return false; };
        const terlihat=e=>{ let t=''; const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
          for (let n=w.nextNode();n;n=w.nextNode()){ const pe=n.parentElement; if(!pe||!pe.checkVisibility({visibilityProperty:true,opacityProperty:true})||srOnly(pe)) continue;
            if (['SELECT','OPTION','TEXTAREA','SCRIPT','STYLE'].includes(pe.tagName)) continue; t+=' '+n.nodeValue; } return t; };
        const isi=e=>{ let t=''; const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
          for (let n=w.nextNode();n;n=w.nextNode()){ const pe=n.parentElement; if(pe&&pe.closest('[aria-hidden="true"]')&&!e.closest('[aria-hidden="true"]')) continue; t+=' '+n.nodeValue; }
          e.querySelectorAll('img[alt]').forEach(i=>t+=' '+i.alt); return t; };
        const temuan=[], saran=[]; let n=0;
        for (const e of document.querySelectorAll(sel)) {
          if (!e.checkVisibility({visibilityProperty:true,opacityProperty:true})||srOnly(e)) continue;
          let lihat, nama, sumber;
          if (e.matches('input,select,textarea')) {
            if (e.matches('input[type=submit],input[type=button],input[type=reset]')) lihat=e.value;
            else { const l=e.closest('label')||(e.id&&document.querySelector('label[for="'+CSS.escape(e.id)+'"]')); lihat=l?terlihat(l):''; }
          } else lihat=terlihat(e);
          if (!norm(lihat)) continue; n++;
          const lb=e.getAttribute('aria-labelledby');
          if (lb) { nama=lb.split(/\s+/).map(id=>{ const x=document.getElementById(id); return x?(x.getAttribute('aria-label')||x.textContent):''; }).join(' '); sumber='aria-labelledby'; }
          else if (e.hasAttribute('aria-label')) { nama=e.getAttribute('aria-label'); sumber='aria-label'; }
          else if (e.matches('input,select,textarea')) { nama=lihat; sumber='label'; }
          else { nama=isi(e); sumber='isi'; }
          const L=norm(lihat), N=norm(nama);
          const label=e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:'');
          if (!(' '+N+' ').includes(' '+L+' ')) temuan.push(`${label} teks terlihat "${lihat.trim().replace(/\s+/g,' ').slice(0,40)}" tidak termuat di nama (${sumber}) "${(nama||'').trim().slice(0,50)}"`);
          else if (!N.startsWith(L)) saran.push(`${label} nama "${(nama||'').trim().slice(0,50)}" tidak diawali teks terlihat "${lihat.trim().slice(0,30)}"`);
        }
        return {temuan,saran,n};
      });
      const tag=`label ${scheme} ${w} ${pg}`;
      r.temuan.forEach(t=>console.log(tag,'TEMUAN',t)); [...new Set(r.saran)].forEach(t=>console.log(tag,'saran',t));
      console.log(tag,'elemen bertekst terlihat',r.n, r.temuan.length?'':'lolos'); dicekSemua+=r.n;
      if (path==='UJI-LABEL') ujiLabel+=r.temuan.length?1:0; else { total+=r.temuan.length; saran+=r.saran.length; }
    }
    if (errs.length) { console.log('label',scheme,w,'JS errors',errs); total+=errs.length; }
    await ctx.close();
  }
  console.log('total temuan label dalam nama',total,'(elemen dicek:',dicekSemua,'; saran urutan:',saran,'; uji balik UJI-LABEL tertangkap:',ujiLabel,'dari 4)');
}
// 17 Nov 20.xx (Dewi & Nina): audit pesan status (WCAG 4.1.3). Pesan yang muncul tanpa memindah fokus wajib berada di
// wilayah role="status"/"alert"/"log" atau aria-live (bukan "off") yang SUDAH ADA dan tampil (bukan hidden/display:none)
// sebelum aksi pengguna dilakukan. Wilayah yang baru dibuat/ditampilkan bersamaan dengan pesannya sering tidak diumumkan.
// Skenario: saring sektor Peringkat, cari Kamus (cocok & kosong), kuis (jawab & kosong), Tandai selesai, Salin tautan
// (berhasil & cadangan), kotak ketik Radar & Bandingkan (1 cocok, banyak, tidak ada), pilih Radar, saring Kabar,
// Asisten (status belum aktif, menunggu jawaban, galat server, koneksi putus). Uji balik UJI-STATUS: pesan di <p> tanpa
// aria-live dan wilayah status yang dibuat bersamaan dengan pesan; keduanya wajib tertangkap.
async function auditStatus(b) {
  const AKTIF=[['peringkat.html',async p=>{ const v=await p.$eval('#pilih-sektor',s=>s.options[1].value); await p.selectOption('#pilih-sektor',v); },'#ket-sektor','saring sektor'],
    ['belajar.html',async p=>{ await p.fill('#cari-istilah','dividen'); },'.info-kamus','cari kamus cocok'],
    ['belajar.html',async p=>{ await p.fill('#cari-istilah','zzzqqq'); },'.info-kamus','cari kamus kosong'],
    ['pelajaran.html?m=apa-itu-saham',async p=>{ await p.evaluate(()=>{ const m=window.MODUL.find(x=>x.id==='apa-itu-saham'); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); }); await p.click('.kuis button[type="submit"]'); },'.kuis-hasil','kuis dijawab'],
    ['pelajaran.html?m=apa-itu-saham',async p=>{ await p.click('.kuis button[type="submit"]'); },'.kuis-hasil','kuis kosong'],
    ['pelajaran.html?m=apa-itu-saham',async p=>{ await p.click('.tombol-tandai'); },'.tandai-info','tandai selesai'],
    ['emiten.html?kode=ANTM',async p=>{ await p.click('.tombol-salin'); },'#salin-info','salin tautan berhasil'],
    ['emiten.html?kode=ANTM#cadangan',async p=>{ await p.click('.tombol-salin'); },'#salin-info','salin tautan cadangan'],
    ['radar.html',async p=>{ await p.fill('#radar-ketik','ANTM'); },'#radar-info','ketik Radar 1 cocok'],
    ['radar.html',async p=>{ await p.fill('#radar-ketik','B'); },'#radar-info','ketik Radar banyak'],
    ['radar.html',async p=>{ await p.fill('#radar-ketik','zzzz'); },'#radar-info','ketik Radar tidak ada'],
    ['radar.html',async p=>{ await p.selectOption('#pilih-saham','UNTR'); },'#hasil-radar','pilih Radar'],
    ['emiten.html?kode=ANTM',async p=>{ await p.fill('#banding-ketik','TLKM'); },'#banding-info','ketik Bandingkan'],
    ['emiten.html?kode=ANTM',async p=>{ await p.selectOption('#pilih-banding','TLKM'); },'#hasil-banding','pilih Bandingkan'],
    ['kabar.html',async p=>{ const v=await p.$eval('#pilih-jenis',s=>s.options[1].value); await p.selectOption('#pilih-jenis',v); },'#ket-jenis','saring kabar'],
    ['asisten.html#mati',async p=>{ await p.waitForTimeout(900); },'.pita-demo','Asisten belum aktif'],
    ['asisten.html#galat',async p=>{ await p.fill('#kotak-tanya','Apa itu ROE?'); await p.click('.form-tanya button[type="submit"]'); await p.waitForTimeout(150); },'.mengetik','Asisten menunggu'],
    ['asisten.html#galat',async p=>{ await p.fill('#kotak-tanya','Apa itu ROE?'); await p.click('.form-tanya button[type="submit"]'); await p.waitForTimeout(1600); },'.pesan-galat','Asisten galat server'],
    ['asisten.html#putus',async p=>{ await p.fill('#kotak-tanya','Apa itu ROE?'); await p.click('.form-tanya button[type="submit"]'); await p.waitForTimeout(1600); },'.pesan-galat','Asisten koneksi putus'],
    ['UJI-STATUS',async p=>{ await p.evaluate(()=>{ document.getElementById('uji-tanpa').textContent='Tautan disalin.';
      const r=document.createElement('p'); r.id='uji-baru'; r.setAttribute('role','status'); r.textContent='Hasil disaring.'; document.querySelector('main').appendChild(r); }); },'#uji-tanpa, #uji-baru','uji balik'],
  ];
  let total=0, ujiStatus=0, catatan=0, dicek=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    for (const [pg,aksi,selPesan,nama] of AKTIF) {
      const [path,hash]=pg.split('#'); const uji=path==='UJI-STATUS';
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1,
        permissions: hash==='cadangan'?[]:['clipboard-read','clipboard-write'] });
      if (hash==='cadangan') await ctx.addInitScript(()=>{ Object.defineProperty(navigator,'clipboard',{ value:{ writeText:()=>Promise.reject(new Error('ditolak')) }, configurable:true }); });
      if (path==='asisten.html') await ctx.route('**/api/tanya', async r=>{
        const req=r.request();
        if (req.method()==='GET') { await new Promise(x=>setTimeout(x,hash==='mati'?600:0)); return r.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({aktif:hash!=='mati'}) }); }
        await new Promise(x=>setTimeout(x,1200));
        if (hash==='putus') return r.abort('failed');
        return r.fulfill({ status:500, contentType:'application/json', body:JSON.stringify({galat:'Asisten tidak bisa menjawab saat ini. Coba lagi sebentar lagi.'}) }); });
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(hash==='mati'?200:400);
      if (uji) await p.evaluate(()=>{ const x=document.createElement('p'); x.id='uji-tanpa'; document.querySelector('main').appendChild(x); });
      // Tandai semua wilayah hidup yang sudah ada & tampil SEBELUM aksi.
      await p.evaluate(()=>{ document.querySelectorAll('[aria-live]:not([aria-live="off"]),[role=status],[role=alert],[role=log]').forEach(e=>{ if (e.checkVisibility()) e.dataset.auditSiap='1'; }); });
      await aksi(p); await p.waitForTimeout(250);
      const r=await p.evaluate((sel)=>{
        const temuan=[], cat=[]; const els=[...document.querySelectorAll(sel)];
        if (!els.length) cat.push('pesan '+sel+' tidak ditemukan');
        for (const e of els) {
          const t=(e.textContent||'').trim().replace(/\s+/g,' ');
          if (!t) { cat.push('pesan '+sel+' kosong'); continue; }
          if (!e.checkVisibility()) { cat.push('pesan '+sel+' tidak tampil'); continue; }
          const w=e.closest('[aria-live]:not([aria-live="off"]),[role=status],[role=alert],[role=log]');
          if (!w) temuan.push(`"${t.slice(0,45)}" tidak berada di wilayah role=status/aria-live`);
          else if (w.dataset.auditSiap!=='1') temuan.push(`"${t.slice(0,45)}" berada di wilayah ${w.tagName.toLowerCase()}${w.className?'.'+w.className.split(' ')[0]:''} yang baru dibuat/ditampilkan bersama pesannya`);
          else if (w.getAttribute('aria-live')==='off') temuan.push(`"${t.slice(0,45)}" di wilayah aria-live=off`);
        }
        return {temuan,cat,n:els.length};
      },selPesan);
      const tag=`status ${scheme} ${w} ${nama}`;
      r.temuan.forEach(t=>console.log(tag,'TEMUAN',t)); r.cat.forEach(t=>console.log(tag,'catatan',t));
      console.log(tag, r.temuan.length?'':'lolos'); dicek+=r.n; catatan+=r.cat.length;
      if (uji) ujiStatus+=r.temuan.length===2?1:0; else total+=r.temuan.length;
      if (errs.length) { console.log(tag,'JS errors',errs); total+=errs.length; }
      await ctx.close();
    }
  }
  console.log('total temuan pesan status',total,'(skenario:',AKTIF.length-1,'× 4 keadaan; pesan dicek:',dicek,'; catatan:',catatan,'; uji balik UJI-STATUS tertangkap:',ujiStatus,'dari 4)');
}
// 17 Nov 21.xx (Dewi & Nina): audit judul halaman & urutan judul (WCAG 2.4.2 Page Titled, 1.3.1 Info and Relationships).
// Tiap keadaan: <title> tidak kosong & unik antar-keadaan yang isinya beda (profil per emiten, pelajaran per modul),
// tepat satu <h1> terlihat, judul pertama di <main> = h1, dan tingkat judul tidak melompat turun (mis. h2 → h4).
// Keadaan dengan isi berbeda di halaman yang sama (kunci: halaman + h1 + pesan status) wajib berjudul berbeda.
// Uji balik: UJI-JUDUL (h1 kedua + h4 langsung setelah h2) wajib tertangkap; UJI-TITLE (title kosong) juga.
async function auditJudul(b) {
  const halaman=['index.html','peringkat.html','peringkat.html#istilah','radar.html','radar.html#UNTR','emiten.html','emiten.html?kode=ANTM','emiten.html?kode=TPIA',
    'kabar.html','belajar.html','pelajaran.html?m=apa-itu-saham','pelajaran.html?m=saham-syariah','pelajaran.html?m=apa-itu-saham#benar','metodologi.html','asisten.html','404.html','emiten.html?kode=ZZZZ','pelajaran.html?m=tidak-ada','UJI-JUDUL','UJI-TITLE'];
  let total=0, ujiJudul=0, ujiTitle=0, dicek=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1 });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    const judulKe=new Map();
    for (const pg of halaman) {
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
      if (path==='UJI-JUDUL') await p.evaluate(()=>{ document.querySelector('main').insertAdjacentHTML('beforeend','<h1>Judul kedua</h1><h2>Sub</h2><h4>Lompat</h4>'); });
      if (path==='UJI-TITLE') await p.evaluate(()=>{ document.title=''; });
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('.istilah, [data-istilah], button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} }
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      const r=await p.evaluate(()=>{
        const temuan=[]; const title=document.title.trim();
        if (!title) temuan.push('<title> kosong');
        const lihat=e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true});
        const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].filter(e=>lihat(e)&&!e.closest('[aria-hidden="true"]'));
        const lv=e=>e.getAttribute('aria-level')?+e.getAttribute('aria-level'):(/^H\d$/.test(e.tagName)?+e.tagName[1]:2);
        const teks=e=>e.textContent.trim().replace(/\s+/g,' ').slice(0,40);
        const h1=hs.filter(e=>lv(e)===1);
        if (h1.length!==1) temuan.push(`jumlah h1 terlihat ${h1.length} (${h1.map(teks).join(' | ')})`);
        h1.forEach(e=>{ if(!teks(e)) temuan.push('h1 tanpa teks'); });
        const diMain=hs.filter(e=>e.closest('main'));
        if (diMain.length && lv(diMain[0])!==1) temuan.push(`judul pertama di <main> bukan h1: h${lv(diMain[0])} "${teks(diMain[0])}"`);
        let prev=0;
        for (const e of hs) { const l=lv(e); if (prev && l>prev+1) temuan.push(`lompat h${prev} → h${l} "${teks(e)}"`); if(!teks(e)) temuan.push(`h${l} kosong`); prev=l; }
        return {title, temuan, n:hs.length, garis:hs.map(e=>'h'+lv(e)).join(' '), h1:h1.map(teks).join('|'), status:(document.querySelector('main [role=status] strong')||{}).textContent||''};
      });
      const tag=`judul ${scheme} ${w} ${pg}`; dicek+=r.n;
      // keunikan: keadaan dengan isi berbeda (path + query) wajib punya title berbeda
      // kunci = halaman + h1 + pesan status: keadaan yang tampil sama (mis. ?m=tidak-ada menampilkan pelajaran 1 utuh) boleh berjudul sama
      if (!uji) { const kunci=path.split('?')[0]+'|'+r.h1+'|'+r.status; const lain=[...judulKe.entries()].find(([k,t])=>t===r.title&&k!==kunci&&r.title);
        if (lain) r.temuan.push(`<title> "${r.title}" sama dengan ${lain[0]}`); judulKe.set(kunci,r.title); }
      r.temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      console.log(tag,`"${r.title}"`,'judul',r.n,r.temuan.length?'':'lolos', scheme==='dark'&&w===390?r.garis:'');
      if (path==='UJI-JUDUL') ujiJudul+=r.temuan.length>=2?1:0; else if (path==='UJI-TITLE') ujiTitle+=r.temuan.some(t=>t.includes('kosong'))?1:0; else total+=r.temuan.length;
    }
    if (errs.length) { console.log('judul',scheme,w,'JS errors',errs); total+=errs.length; }
    await ctx.close();
  }
  console.log('total temuan judul',total,'(judul dicek:',dicek,'; uji balik UJI-JUDUL tertangkap:',ujiJudul,'dari 4; UJI-TITLE:',ujiTitle,'dari 4)');
}
// 18 Nov 07.xx (Dewi & Nina): bahasa halaman & bagian (WCAG 3.1.1 & 3.1.2).
// 3.1.1: <html lang> wajib "id". 3.1.2: istilah Inggris yang terlihat di teks wajib berada di dalam [lang="en"];
// setiap atribut lang wajib bernilai id/en. Uji balik UJI-LANG (lang <html> dihapus) dan UJI-EN (span lang="en" diubah ke "id",
// perubahan atribut tidak dibungkus ulang oleh pemantau) wajib tertangkap.
const KATA_EN=["Sharia Online Trading System","Sharia Virtual Trading","Single Investor Identification","Jakarta Islamic Index","Price to Earnings Ratio","Debt to Equity Ratio","Return on Equity","year on year","limited review","core profit","dividend payout","payout ratio","Dividend yield","Capital gain","Capital loss","Short selling","buyback","payout","Matched","fee"];
async function auditBahasa(b) {
  const halaman=['index.html','peringkat.html','peringkat.html#istilah','radar.html','radar.html#UNTR','emiten.html','emiten.html?kode=ANTM','emiten.html?kode=TPIA',
    'kabar.html','belajar.html','pelajaran.html?m=apa-itu-saham','pelajaran.html?m=saham-syariah','pelajaran.html?m=apa-itu-saham#benar','metodologi.html','asisten.html','404.html','UJI-LANG','UJI-EN'];
  let total=0, ujiLang=0, ujiEn=0, ditandai=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1 });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    for (const pg of halaman) {
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
      // UJI-EN memakai Belajar karena kamus istilah memuat banyak istilah Inggris
      await p.goto('http://localhost:8765/'+(path==='UJI-LANG'?'peringkat.html':path==='UJI-EN'?'belajar.html':path)); await p.waitForTimeout(300);
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} }
      await p.$$eval('details', d=>d.forEach(x=>x.open=true)); await p.waitForTimeout(100);
      if (path==='UJI-LANG') await p.evaluate(()=>document.documentElement.removeAttribute('lang'));
      if (path==='UJI-EN') await p.evaluate(()=>document.querySelectorAll('span[lang="en"]').forEach(s=>s.setAttribute('lang','id')));
      const r=await p.evaluate((KATA)=>{
        const temuan=[]; const lh=document.documentElement.getAttribute('lang');
        if (lh!=='id') temuan.push(`<html lang> = ${lh===null?'tidak ada':'"'+lh+'"'} (wajib "id")`);
        document.querySelectorAll('body [lang]').forEach(e=>{ if(!/^(id|en)$/.test(e.getAttribute('lang'))) temuan.push(`lang tidak dikenal "${e.getAttribute('lang')}" pada <${e.tagName.toLowerCase()}>`); });
        const RE=new RegExp('(?<!\\p{L})('+KATA.join('|')+')(?!\\p{L})','giu');
        const TOLAK=/^(SCRIPT|STYLE|TEXTAREA|SELECT|OPTION|TITLE|CODE|svg)$/;
        const jalan=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n, en=0; const tak=new Map();
        while((n=jalan.nextNode())){
          const pa=n.parentElement; if(!pa) continue; let tolak=false;
          for(let q=pa;q;q=q.parentElement) if(TOLAK.test(q.nodeName)){tolak=true;break;}
          if(tolak||!pa.checkVisibility({visibilityProperty:true})||pa.closest('[aria-hidden="true"]')) continue;
          const bhs=(pa.closest('[lang]')||{getAttribute:()=>null}).getAttribute('lang')||'';
          RE.lastIndex=0; let m;
          while((m=RE.exec(n.nodeValue))){ if(/^en/i.test(bhs)) en++; else { const k=m[0].toLowerCase(); tak.set(k,(tak.get(k)||0)+1); } }
        }
        tak.forEach((v,k)=>temuan.push(`"${k}" ×${v} tanpa lang="en"`));
        return {temuan, en};
      },KATA_EN);
      const tag=`bahasa ${scheme} ${w} ${pg}`; if(!uji) ditandai+=r.en;
      r.temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      console.log(tag,'istilah Inggris bertanda',r.en,r.temuan.length?'':'lolos');
      if (path==='UJI-LANG') ujiLang+=r.temuan.some(t=>t.startsWith('<html'))?1:0;
      else if (path==='UJI-EN') ujiEn+=r.temuan.some(t=>t.includes('tanpa lang'))?1:0;
      else total+=r.temuan.length;
    }
    // lebar layar: tanpa scroll horizontal sesudah penandaan
    await p.goto('http://localhost:8765/belajar.html'); await p.waitForTimeout(300);
    const geser=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    if (geser) { console.log('bahasa',scheme,w,'TEMUAN scroll horizontal di belajar.html'); total++; }
    if (errs.length) { console.log('bahasa',scheme,w,'JS errors',errs); total+=errs.length; }
    await ctx.close();
  }
  console.log('total temuan bahasa',total,'(istilah Inggris bertanda:',ditandai,'; uji balik UJI-LANG tertangkap:',ujiLang,'dari 4; UJI-EN:',ujiEn,'dari 4)');
}

// 18 Nov 08.xx (Dewi & Nina): audit label & petunjuk isian (WCAG 3.3.2) dan pesan salah isian (WCAG 3.3.1).
// Keadaan salah: kuis dikirim kosong & sebagian, kotak tanya Asisten dikirim kosong & diisi 600 karakter,
// kotak ketik Radar & Bandingkan diisi kode tak dikenal; keadaan benar (ANTM) tidak boleh bertanda salah.
// Aturan: tiap isian terlihat punya label bertulisan; isian ber-maxlength wajib punya petunjuk yang menyebut batasnya
// (lewat aria-describedby); isian aria-invalid="true" wajib punya pesan teks terlihat lewat aria-describedby;
// tiap pesan salah yang tampil wajib dirujuk aria-describedby oleh isian/kelompok isiannya.
// Uji balik: UJI-ISIAN (isian aria-invalid tanpa pesan, textarea maxlength tanpa petunjuk, pesan salah tak terhubung) → 3 temuan.
async function auditIsian(b) {
  const AKSI=[
    ['pelajaran.html?m=apa-itu-saham',async p=>{ await p.click('.kuis button[type="submit"]'); },'kuis kosong',true],
    ['pelajaran.html?m=apa-itu-saham',async p=>{ await p.check('#kuis-0-0'); await p.click('.kuis button[type="submit"]'); },'kuis sebagian',true],
    ['asisten.html',async p=>{ await p.click('.form-tanya button[type="submit"]'); },'Asisten kosong',true],
    ['asisten.html',async p=>{ await p.fill('#kotak-tanya','a'.repeat(600)); },'Asisten 600 karakter',true],
    ['asisten.html',async p=>{ await p.click('.form-tanya button[type="submit"]'); await p.fill('#kotak-tanya','Apa itu ROE?'); },'Asisten kosong lalu diisi',false],
    ['radar.html',async p=>{ await p.fill('#radar-ketik','zzzz'); },'Radar kode tak dikenal',true],
    ['radar.html',async p=>{ await p.fill('#radar-ketik','zzzz'); await p.fill('#radar-ketik','ANTM'); },'Radar kode dikenal',false],
    ['emiten.html?kode=ANTM',async p=>{ await p.fill('#banding-ketik','zzzz'); },'Bandingkan kode tak dikenal',true],
    ['belajar.html',async p=>{ await p.fill('#cari-istilah','zzzqqq'); },'cari kamus kosong',false],
    ['UJI-ISIAN',async p=>{ await p.evaluate(()=>{ const m=document.querySelector('main');
      m.insertAdjacentHTML('beforeend','<label for="uji-a">Uji A</label><input id="uji-a" aria-invalid="true"><label for="uji-b">Uji B</label><textarea id="uji-b" maxlength="50"></textarea><p class="galat-isian">Isian uji salah.</p>'); }); },'uji balik',true],
  ];
  let total=0, ujiIsian=0, dicek=0, salahTampil=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    for (const [pg,aksi,nama,harusAdaSalah] of AKSI) {
      const uji=pg==='UJI-ISIAN', path=uji?'asisten.html':pg;
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme });
      if (path==='asisten.html') await ctx.route('**/api/tanya', r=>r.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({aktif:true}) }));
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+path); await p.waitForTimeout(400);
      await aksi(p); await p.waitForTimeout(250);
      const r=await p.evaluate(()=>{
        const temuan=[], tampil=e=>e&&e.checkVisibility()&&(e.textContent||'').trim(), rapi=t=>(t||'').trim().replace(/\s+/g,' ');
        const desk=e=>(e.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean).map(id=>document.getElementById(id)).filter(Boolean);
        const nama=e=>{ if (e.getAttribute('aria-label')) return e.getAttribute('aria-label');
          const lb=(e.getAttribute('aria-labelledby')||'').split(/\s+/).map(id=>document.getElementById(id)).filter(Boolean);
          if (lb.length) return lb.map(x=>x.textContent).join(' ');
          return [...(e.labels||[])].filter(l=>l.checkVisibility()).map(l=>l.textContent).join(' '); };
        const isian=[...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e=>e.checkVisibility());
        for (const e of isian) {
          const id='#'+(e.id||e.name||e.tagName.toLowerCase());
          const kel=e.type==='radio'?e.closest('fieldset'):null;
          if (!rapi(nama(e)) && !(kel&&rapi((kel.querySelector('legend')||{}).textContent))) temuan.push(id+' tanpa label bertulisan');
          if (e.maxLength>0 && e.maxLength<100000 && !desk(e).some(d=>rapi(d.textContent).includes(String(e.maxLength)))) temuan.push(id+' maxlength '+e.maxLength+' tanpa petunjuk batas di aria-describedby');
          if (e.getAttribute('aria-invalid')==='true') { const d=desk(e).filter(tampil); if (!d.length) temuan.push(id+' aria-invalid="true" tanpa pesan teks terlihat di aria-describedby'); }
        }
        const pesan=[...document.querySelectorAll('.kuis-kosong,.galat-isian,.info-ketik')].filter(tampil)
          .filter(e=>!e.classList.contains('info-ketik')||/Tidak ada emiten/.test(e.textContent));
        for (const m of pesan) {
          const dirujuk=[...document.querySelectorAll('[aria-describedby]')].some(e=>(e.getAttribute('aria-describedby')||'').split(/\s+/).includes(m.id)&&m.id);
          if (!dirujuk) temuan.push(`pesan salah "${rapi(m.textContent).slice(0,40)}" tidak dirujuk aria-describedby isiannya`);
        }
        const invalid=isian.filter(e=>e.getAttribute('aria-invalid')==='true').length;
        return {temuan, n:isian.length, pesan:pesan.length, invalid};
      });
      const tag=`isian ${scheme} ${w} ${nama}`;
      r.temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      const adaSalah=r.pesan>0;
      if (!uji && adaSalah!==harusAdaSalah) { console.log(tag,'TEMUAN pesan salah',harusAdaSalah?'tidak muncul':'muncul padahal isian benar'); total++; }
      if (!uji && nama.startsWith('Asisten')&&nama.includes('kosong')&&!nama.includes('diisi')&&!r.invalid) { console.log(tag,'TEMUAN kotak tanya kosong tidak aria-invalid'); total++; }
      if (!uji && nama.includes('kode tak dikenal')&&!r.invalid) { console.log(tag,'TEMUAN kotak ketik tak dikenal tidak aria-invalid'); total++; }
      if (!uji && !harusAdaSalah && r.invalid) { console.log(tag,'TEMUAN aria-invalid pada isian benar'); total++; }
      console.log(tag,'isian',r.n,'pesan salah',r.pesan,r.temuan.length?'':'lolos');
      dicek+=r.n; salahTampil+=r.pesan;
      if (uji) ujiIsian+=r.temuan.length===3?1:0; else total+=r.temuan.length;
      if (errs.length) { console.log(tag,'JS errors',errs); total+=errs.length; }
      await ctx.close();
    }
  }
  console.log('total temuan isian',total,'(keadaan:',AKSI.length-1,'× 4; isian dicek:',dicek,'; pesan salah tampil:',salahTampil,'; uji balik UJI-ISIAN tertangkap:',ujiIsian,'dari 4)');
}

// 18 Nov 09.xx (Dewi & Nina): urutan fokus (WCAG 2.4.3 Focus Order). Tab sampai habis di tiap keadaan (gelap/terang, 390px & 1280px):
// (1) tidak boleh ada tabindex positif (tabindex > 0 mengacak urutan Tab dari urutan baca);
// (2) elemen yang terfokus wajib terlihat: lolos checkVisibility, berukuran ≥2px, di dalam lebar dokumen & layar sesudah fokus,
//     tidak di dalam aria-hidden="true"/inert, tidak terpotong teknik "khusus pembaca layar" (clip/clip-path);
// (3) urutan Tab mengikuti urutan baca di layar: antara dua fokus berturutan, berikutnya tidak boleh di sebelah kiri pada baris
//     yang sama, dan tidak boleh lebih atas, kecuali pindah ke kolom di sebelah kanan (kisi kartu, kolom samping). Posisi diukur
//     di posisi gulir 0 (kepala lengket di tempat asalnya); kotak melayang (position fixed, mis. kotak istilah) hanya dicek letaknya
//     di DOM: fokus sesudah tombol istilah yang terbuka wajib masuk ke kotak itu.
// Keadaan tambahan: kotak istilah terbuka, kuis sesudah Periksa (lewat Enter) dan sesudah "Ulangi soal yang salah",
// Radar sesudah memilih UNTR, profil ANTM sesudah memilih pembanding di Bandingkan.
// Uji balik: UJI-POSITIF (tabindex="2" di tautan kaki), UJI-SEMBUNYI (tautan di left:-9999px & tautan opacity 0),
// UJI-BALIK (menu atas row-reverse: urutan Tab kanan→kiri) wajib tertangkap.
async function auditUrutan(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['peringkat.html','istilah',async p=>{ const t=await p.$('main button.istilah:visible'); await t.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(200); return 'kotak'; }],
    ['pelajaran.html?m=apa-itu-saham','periksa',async p=>{ await p.evaluate(()=>{ const m=window.MODUL.find(x=>x.id==='apa-itu-saham'); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+(i?q.benar:(q.benar+1)%q.pilihan.length)+'"]').checked=true; }); });
      await p.focus('.kuis button[type="submit"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(200); }],
    ['pelajaran.html?m=apa-itu-saham','ulangi soal salah',async p=>{ await p.evaluate(()=>{ const m=window.MODUL.find(x=>x.id==='apa-itu-saham'); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+(i?q.benar:(q.benar+1)%q.pilihan.length)+'"]').checked=true; }); });
      await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(150);
      const u=await p.$('.kuis button:visible:has-text("salah")'); if(!u) return 'tombol ulangi soal salah tidak ada'; await u.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(200); }],
    ['radar.html','UNTR',async p=>{ await p.focus('#pilih-saham'); await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); }],
    ['emiten.html?kode=ANTM','Bandingkan',async p=>{ const s=await p.$('select.pilih-banding'); if(!s) return 'select.pilih-banding tidak ada';
      const v=await s.$$eval('option',o=>o.map(x=>x.value).filter(x=>x&&x!=='ANTM')); await s.focus(); await s.selectOption(v[0]); await p.waitForTimeout(300); }],
    ['index.html','UJI-POSITIF',async p=>{ await p.evaluate(()=>{ const a=[...document.querySelectorAll('footer a')].pop(); a.setAttribute('tabindex','2'); }); }],
    ['index.html','UJI-SEMBUNYI',async p=>{ await p.evaluate(()=>{ document.querySelector('main').insertAdjacentHTML('afterbegin','<a href="#a" style="position:absolute;left:-9999px">uji kiri</a><a href="#b" style="opacity:0">uji bening</a>'); }); }],
    ['index.html','UJI-BALIK',async p=>{ await p.addStyleTag({content:'.nav{flex-direction:row-reverse!important;flex-wrap:nowrap!important}'}); }],
  ];
  let total=0, dicek=0; const uji={'UJI-POSITIF':0,'UJI-SEMBUNYI':0,'UJI-BALIK':0};
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    for (const [pg,ket,aksi] of KEADAAN) {
      const isUji=ket&&ket.startsWith('UJI-');
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme });
      if (pg==='asisten.html') await ctx.route('**/api/tanya', r=>r.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({aktif:true}) }));
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      const temuan=[];
      let mulaiKotak=false;
      if (aksi) { const r=await aksi(p); if (r==='kotak') mulaiKotak=true; else if (r) temuan.push('keadaan gagal dibuat: '+r); }
      if (!aksi || isUji) await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
      // (1) tabindex positif
      (await p.evaluate(()=>[...document.querySelectorAll('[tabindex]')].filter(e=>+e.getAttribute('tabindex')>0).map(e=>e.tagName.toLowerCase()+' "'+(e.textContent||'').trim().slice(0,30)+'" tabindex='+e.getAttribute('tabindex'))))
        .forEach(t=>temuan.push('tabindex positif: '+t));
      // titik mulai: elemen yang sedang terfokus sesudah aksi (bila ada) ikut dicatat sebagai elemen pertama
      await p.evaluate(()=>{ window.__urut=[]; window.__urutSet=new Set(); window.__kotak=document.getElementById('kotak-istilah'); window.__kotakBuka=!!(window.__kotak&&!window.__kotak.hidden); const a=document.activeElement; if(a&&a!==document.body){ window.__urut.push({el:a, rc:null}); window.__urutSet.add(a);} });
      let habis=false;
      for (let i=0;i<500;i++) {
        await p.keyboard.press('Tab'); await p.waitForTimeout(25);
        const r=await p.evaluate(()=>{
          const el=document.activeElement; if(!el||el===document.body) return {habis:true};
          if (window.__urutSet.has(el)) return {ulang:true};
          window.__urutSet.add(el);
          const rc=el.getBoundingClientRect(); const nama=el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')+' "'+((el.textContent||'').trim()||el.getAttribute('aria-label')||el.id||'').replace(/\s+/g,' ').slice(0,30)+'"';
          const salah=[];
          if (!el.checkVisibility({visibilityProperty:true,opacityProperty:true})) salah.push('tidak terlihat (display/visibility/opacity)');
          if (rc.width<2||rc.height<2) salah.push(`ukuran ${Math.round(rc.width)}×${Math.round(rc.height)}px`);
          if (rc.right+scrollX<=0||rc.left+scrollX>=document.documentElement.scrollWidth||rc.bottom+scrollY<=0) salah.push('di luar dokumen');
          else if (rc.bottom<=0||rc.top>=innerHeight||rc.right<=0||rc.left>=innerWidth) salah.push('di luar layar sesudah fokus');
          if (el.closest('[aria-hidden="true"]')) salah.push('di dalam aria-hidden="true"');
          if (el.closest('[inert]')) salah.push('di dalam inert');
          for (let e=el;e&&e!==document.documentElement;e=e.parentElement){ const s=getComputedStyle(e);
            if (s.clipPath.includes('inset(50%')||(s.clip&&s.clip.startsWith('rect(0')&&s.position==='absolute')) { salah.push('terpotong (khusus pembaca layar)'); break; } }
          // tetap: kotak melayang
          let tetap=false; for (let e=el;e;e=e.parentElement) if (getComputedStyle(e).position==='fixed') { tetap=true; break; }
          window.__urut.push({el, rc:{t:rc.top+scrollY,b:rc.bottom+scrollY,l:rc.left+scrollX,r:rc.right+scrollX}, tetap, nama});
          return {nama, salah};
        });
        if (r.habis||r.ulang) { habis=true; break; }
        r.salah.forEach(s=>temuan.push(`fokus ke elemen tersembunyi: ${r.nama} ${s}`));
      }
      if (!habis) temuan.push('Tab tidak pernah kembali ke awal (500 langkah)');
      // (3) urutan baca: ukur ulang di posisi gulir 0
      const hasil=await p.evaluate((mulaiKotak)=>{
        window.scrollTo(0,0);
        const ukur=x=>{ const rs=[...x.el.getClientRects()].filter(r=>r.width>0&&r.height>0);
          if (!rs.length||(rs[0].width<2&&x.rc)) return x.rc&&{pertama:x.rc,akhir:x.rc};
          const d=r=>({t:r.top+scrollY,b:r.bottom+scrollY,l:r.left+scrollX,r:r.right+scrollX}); return {pertama:d(rs[0]),akhir:d(rs[rs.length-1])}; };
        const temuan=[]; const L=window.__urut;
        const nama=x=>x.nama||(x.el.tagName.toLowerCase()+' "'+(x.el.textContent||'').trim().replace(/\s+/g,' ').slice(0,30)+'"');
        if (mulaiKotak) { const k=window.__kotak; const ber=L[1];
          if (!window.__kotakBuka) temuan.push('kotak istilah tidak terbuka'); else if (k.querySelector('a') && !(ber&&k.contains(ber.el))) temuan.push('sesudah tombol istilah terbuka, Tab tidak masuk ke kotak istilah ('+(ber?nama(ber):'tidak ada')+')'); }
        let prev=null, pn=null;
        for (const x of L) {
          const tetap=(()=>{ for (let e=x.el;e;e=e.parentElement) if (getComputedStyle(e).position==='fixed') return true; return false; })();
          if (tetap) { continue; }
          const u=ukur(x); if (!u) continue;
          if (prev) { const a=prev.akhir, c=u.pertama;
            const sebaris=c.t<a.b-2&&c.b>a.t+2;
            if (sebaris && c.r<=a.l+4) temuan.push(`urutan kanan→kiri: ${nama(pn)} → ${nama(x)}`);
            else if (!sebaris && c.b<=a.t+2 && c.l<prev.pertama.r-4) temuan.push(`urutan naik ${Math.round(a.t-c.t)}px tanpa pindah kolom: ${nama(pn)} → ${nama(x)}`);
          }
          prev=u; pn=x;
        }
        return {temuan, n:L.length};
      }, mulaiKotak);
      temuan.push(...hasil.temuan);
      const tag=`urutan ${scheme} ${w} ${pg}${ket?' ['+ket+']':''}`;
      temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      console.log(tag,'fokus',hasil.n,temuan.length?'':'lolos');
      if (errs.length) { console.log(tag,'JS errors',errs); total+=errs.length; }
      if (isUji) { const ok = ket==='UJI-POSITIF'?temuan.some(t=>t.startsWith('tabindex positif')):ket==='UJI-SEMBUNYI'?temuan.filter(t=>t.includes('uji ')).length>=2:temuan.some(t=>t.includes('kanan→kiri')); uji[ket]+=ok?1:0; }
      else { total+=temuan.length; dicek+=hasil.n; }
      await ctx.close();
    }
  }
  console.log('total temuan urutan',total,'(keadaan:',KEADAAN.length-3,'× 4; fokus dicek:',dicek,'; uji balik UJI-POSITIF',uji['UJI-POSITIF'],'UJI-SEMBUNYI',uji['UJI-SEMBUNYI'],'UJI-BALIK',uji['UJI-BALIK'],'dari 4)');
}

// 18 Nov 10.xx (Dewi & Nina): kontras non-teks (WCAG 1.4.11 Non-text Contrast), gelap/terang × 390/1280px.
// Wajib ≥3:1 terhadap latar di sebelahnya (latar dihitung dari leluhur, warna transparan dicampur):
// (1) kotak isian (input, textarea, select) yang aktif: garis tepi ≥3:1, ATAU isi kotak sendiri ≥3:1 terhadap latar luar;
// (2) tombol sekunder bergaris (.tombol-garis, .tombol-salin, .tombol-lagi, .tab yang tidak terpilih, .chip): aturan sama;
// (3) lingkaran pilihan kuis & kotak centang bawaan peramban: diukur dari piksel tangkapan layar (warna paling kontras
//     di dalam lingkaran terhadap latar);
// (4) batang 9 bulan / batang tahun Radar / batang musim laporan: isi batang terhadap jalurnya;
// (5) penanda Radar: lampu panduan terhadap latar kotak, garis kiri kartu tanda terhadap isi kartu dan latar luar.
// Kotak isian & tombol yang disabled dikecualikan (WCAG: komponen tidak aktif). Keadaan: 10 halaman + Radar UNTR,
// profil ANTM + Bandingkan, kuis sesudah Periksa, Asisten aktif + kirim kosong (aria-invalid).
// Uji balik: UJI-PUDAR (garis tepi isian disamakan dengan isi kotak) dan UJI-LAMPU (lampu panduan = warna garis) wajib tertangkap.
async function auditNonteks(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['radar.html','UNTR',async p=>{ await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); }],
    ['emiten.html?kode=ANTM','Bandingkan',async p=>{ const s=await p.$('select.pilih-banding'); if(!s) return 'select.pilih-banding tidak ada';
      const v=await s.$$eval('option',o=>o.map(x=>x.value).filter(x=>x&&x!=='ANTM')); await s.selectOption(v[0]); await p.waitForTimeout(300); }],
    ['pelajaran.html?m=apa-itu-saham','periksa',async p=>{ await p.evaluate(()=>{ const m=window.MODUL.find(x=>x.id==='apa-itu-saham'); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+(i?q.benar:(q.benar+1)%q.pilihan.length)+'"]').checked=true; }); });
      await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }],
    ['asisten.html','kirim kosong',async p=>{ await p.click('.form-tanya button[type="submit"]'); await p.waitForTimeout(200); await p.evaluate(()=>document.activeElement&&document.activeElement.blur()); }],
    ['radar.html','UJI-PUDAR',async p=>{ await p.addStyleTag({content:'input,textarea,select{border-color:var(--putih)!important}'}); }],
    ['radar.html','UJI-LAMPU',async p=>{ await p.addStyleTag({content:'.lampu{background:var(--garis)!important}'}); }],
  ];
  let total=0, dicek=0; const uji={'UJI-PUDAR':0,'UJI-LAMPU':0}; const jenisDicek={};
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    for (const [pg,ket,aksi] of KEADAAN) {
      const isUji=ket&&ket.startsWith('UJI-'); const tag=`nonteks ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:2, reducedMotion:'reduce' });
      if (pg==='asisten.html') await ctx.route('**/api/tanya', r=>r.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({aktif:true}) }));
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
      const temuan=[];
      if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
      const r=await p.evaluate(()=>{
        const cv=document.createElement('canvas'); cv.width=cv.height=1; const x=cv.getContext('2d',{willReadFrequently:true});
        const rgba=c=>{ x.clearRect(0,0,1,1); x.fillStyle='rgba(0,0,0,0)'; x.fillStyle=c; x.fillRect(0,0,1,1); const d=x.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
        const campur=(atas,bawah)=>[0,1,2].map(k=>atas[k]*atas[3]+bawah[k]*(1-atas[3]));
        const latar=el=>{ const lap=[]; for(let e=el;e;e=e.parentElement){ const c=rgba(getComputedStyle(e).backgroundColor); if(c[3]>0){ lap.push(c); if(c[3]>=1) break; } }
          let dasar=[255,255,255]; for(let i=lap.length-1;i>=0;i--) dasar=campur(lap[i],dasar); return dasar; };
        const lum=c=>{ const f=v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }; return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]); };
        const rasio=(a,b)=>{ const A=lum(a),B=lum(b); return (Math.max(A,B)+.05)/(Math.min(A,B)+.05); };
        const hex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
        const tampak=e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getBoundingClientRect().width>=2;
        const nama=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/).join('.'):'');
        const hasil=[], cek=[], radio=[];
        const garisAtauIsi=(e,jenis)=>{ const s=getComputedStyle(e); const luar=latar(e.parentElement), dalam=latar(e);
          const sisi=['Top','Right','Bottom','Left'].map(k=>({w:parseFloat(s['border'+k+'Width'])||0,c:rgba(s['border'+k+'Color'])})).filter(o=>o.w>=1&&o.c[3]>0&&s['border'+'Top'+'Style']!=='none');
          const rIsi=rasio(dalam,luar); let rGaris=0, warna='';
          if (sisi.length) { const g=sisi.map(o=>({r:rasio(campur(o.c,luar),luar),c:campur(o.c,luar)})).sort((a,b)=>a.r-b.r)[0]; rGaris=g.r; warna=hex(g.c); }
          cek.push(jenis);
          if (rGaris<3&&rIsi<3) hasil.push(`${jenis} ${nama(e)}: garis tepi ${rGaris?rGaris.toFixed(2):'tidak ada'}:1${warna?' ('+warna+')':''}, isi kotak ${rIsi.toFixed(2)}:1 (${hex(dalam)}) terhadap latar ${hex(luar)}`); };
        // (1) kotak isian aktif
        document.querySelectorAll('input:not([type=radio]):not([type=checkbox]):not([type=hidden]), textarea, select').forEach(e=>{ if(!tampak(e)||e.disabled) return; garisAtauIsi(e,'isian'); });
        // (2) tombol sekunder bergaris
        document.querySelectorAll('.tombol-garis, .tombol-salin, .tombol-lagi, .tab:not([aria-selected="true"]), .chip').forEach(e=>{ if(!tampak(e)||e.disabled) return; garisAtauIsi(e,'tombol'); });
        // (3) lingkaran pilihan & kotak centang: dicatat untuk diukur dari piksel
        document.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(e=>{ if(!tampak(e)||e.disabled) return; const rc=e.getBoundingClientRect();
          radio.push({nama:nama(e)+(e.checked?' (terpilih)':''), luar:latar(e.parentElement), x:rc.left+scrollX, y:rc.top+scrollY, w:rc.width, h:rc.height}); });
        // (4) batang terhadap jalurnya
        document.querySelectorAll('.batang9-isi, .musim-isi').forEach(e=>{ if(!tampak(e)) return; const isi=latar(e), jalur=latar(e.parentElement), rr=rasio(isi,jalur); cek.push('batang');
          if (rr<3) hasil.push(`batang ${nama(e)}: isi ${hex(isi)} terhadap jalur ${hex(jalur)} ${rr.toFixed(2)}:1`); });
        // (5) penanda Radar
        document.querySelectorAll('.lampu').forEach(e=>{ if(!tampak(e)) return; const isi=latar(e), luar=latar(e.parentElement), rr=rasio(isi,luar); cek.push('lampu');
          if (rr<3) hasil.push(`lampu ${nama(e)}: ${hex(isi)} terhadap latar ${hex(luar)} ${rr.toFixed(2)}:1`); });
        document.querySelectorAll('.sinyal').forEach(e=>{ if(!tampak(e)) return; const s=getComputedStyle(e); if((parseFloat(s.borderLeftWidth)||0)<3) return;
          const dalam=latar(e), luar=latar(e.parentElement), g=campur(rgba(s.borderLeftColor),luar), r1=rasio(g,dalam), r2=rasio(g,luar); cek.push('penanda');
          if (Math.min(r1,r2)<3) hasil.push(`penanda ${nama(e)}: garis kiri ${hex(g)} terhadap isi kartu ${hex(dalam)} ${r1.toFixed(2)}:1, latar luar ${hex(luar)} ${r2.toFixed(2)}:1`); });
        return {hasil, cek, radio, sw:document.documentElement.scrollWidth};
      });
      r.hasil.forEach(t=>temuan.push(t)); r.cek.forEach(j=>jenisDicek[j]=(jenisDicek[j]||0)+1); dicek+=r.cek.length;
      // (3) piksel lingkaran pilihan
      for (const o of r.radio) {
        const buf=await p.screenshot({clip:{x:o.x,y:o.y,width:o.w,height:o.h}, fullPage:true});
        const rr=await p.evaluate(async ([b64,luar])=>{ const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
          const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height; const x=cv.getContext('2d'); x.drawImage(img,0,0); const d=x.getImageData(0,0,cv.width,cv.height).data;
          const lum=c=>{ const f=v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }; return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]); };
          const L=lum(luar); let maks=0; for(let i=0;i<d.length;i+=4){ const A=lum([d[i],d[i+1],d[i+2]]); const q=(Math.max(A,L)+.05)/(Math.min(A,L)+.05); if(q>maks) maks=q; } return maks; }, [buf.toString('base64'), o.luar]);
        jenisDicek.pilihan=(jenisDicek.pilihan||0)+1; dicek++;
        if (rr<3) temuan.push(`pilihan ${o.nama}: piksel paling kontras ${rr.toFixed(2)}:1 terhadap latar`);
      }
      if (r.sw>w) temuan.push('scroll horizontal '+r.sw);
      errs.forEach(e=>temuan.push('galat JS: '+e));
      temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      if (isUji) { const ok = ket==='UJI-PUDAR'?temuan.some(t=>t.startsWith('isian')):temuan.some(t=>t.startsWith('lampu')); uji[ket]+=ok?1:0; }
      else total+=temuan.length;
      await ctx.close();
    }
  }
  console.log('total temuan non-teks',total,'(komponen dicek:',dicek,JSON.stringify(jenisDicek),'; uji balik UJI-PUDAR tertangkap:',uji['UJI-PUDAR'],'dari 4; UJI-LAMPU:',uji['UJI-LAMPU'],'dari 4)');
}

// 18 Nov 13.xx (Dewi & Nina): penggunaan warna (WCAG 1.4.1 Use of Color), gelap/terang × 390/1280px.
// (1) Tautan & tombol istilah di dalam blok teks (ada teks lain di blok yang sama): wajib bergaris bawah/garis tepi bawah,
//     ATAU kontras warna ≥3:1 terhadap teks sekitar DAN muncul garis bawah saat diarahkan (hover) — kalau tidak, TEMUAN.
// (2) Penanda keadaan berwarna wajib punya teks/ikon yang terlihat (teks tersembunyi khusus pembaca layar tidak dihitung):
//     kartu temuan Radar (.sinyal-*: label tingkat), lampu panduan (label tingkat di baris yang sama), angka naik/turun
//     (tanda +/−), umpan kuis (✓ Benar / ✗ Belum tepat), status syariah (teks), batang 9 bulan & batang tahun
//     (angka tertulis di setiap baris), batang musim laporan (teks "n dari m").
// Keadaan: 10 halaman + Radar UNTR, profil ANTM + Bandingkan, kuis sesudah Periksa.
// Uji balik: UJI-GARIS (garis bawah tautan dihapus) dan UJI-TINGKAT (label tingkat temuan disembunyikan) wajib tertangkap.
async function auditWarna(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['radar.html','UNTR',async p=>{ await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); }],
    ['emiten.html?kode=ANTM','Bandingkan',async p=>{ const s=await p.$('select.pilih-banding'); if(!s) return 'select.pilih-banding tidak ada';
      const v=await s.$$eval('option',o=>o.map(x=>x.value).filter(x=>x&&x!=='ANTM')); await s.selectOption(v[0]); await p.waitForTimeout(300); }],
    ['pelajaran.html?m=apa-itu-saham','periksa',async p=>{ await p.evaluate(()=>{ const m=window.MODUL.find(x=>x.id==='apa-itu-saham'); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+(i?q.benar:(q.benar+1)%q.pilihan.length)+'"]').checked=true; }); });
      await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }],
    ['index.html','UJI-GARIS',async p=>{ await p.addStyleTag({content:'a,a:hover,a:focus{text-decoration:none!important;border-bottom:0!important}'}); }],
    ['radar.html','UJI-TINGKAT',async p=>{ await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); await p.addStyleTag({content:'.sinyal-tingkat{display:none!important}'}); }],
  ];
  let total=0, dicek=0; const uji={'UJI-GARIS':0,'UJI-TINGKAT':0}; const jenisDicek={};
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    for (const [pg,ket,aksi] of KEADAAN) {
      const isUji=ket&&ket.startsWith('UJI-'); const tag=`warna ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1, reducedMotion:'reduce' });
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
      const temuan=[];
      if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
      const r=await p.evaluate(()=>{
        const cv=document.createElement('canvas'); cv.width=cv.height=1; const x=cv.getContext('2d',{willReadFrequently:true});
        const rgba=c=>{ x.clearRect(0,0,1,1); x.fillStyle='rgba(0,0,0,0)'; x.fillStyle=c; x.fillRect(0,0,1,1); const d=x.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
        const lum=c=>{ const f=v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }; return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]); };
        const rasio=(a,b)=>{ const A=lum(a),B=lum(b); return (Math.max(A,B)+.05)/(Math.min(A,B)+.05); };
        const tampak=e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getBoundingClientRect().width>=1;
        const nama=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/).join('.'):'');
        // teks yang benar-benar terlihat (lewati elemen tersembunyi & teks khusus pembaca layar)
        const teksTampak=root=>{ let t=''; const jalan=n=>{ if(n.nodeType===3){ t+=n.nodeValue; return; } if(n.nodeType!==1) return;
          if(!n.checkVisibility({visibilityProperty:true,opacityProperty:true})) return; if(n.classList.contains('khusus-pembaca-layar')) return;
          const r=n.getBoundingClientRect(); if(r.width<=1&&r.height<=1&&getComputedStyle(n).overflow==='hidden') return; n.childNodes.forEach(jalan); }; jalan(root); return t.replace(/\s+/g,' ').trim(); };
        const hasil=[], cek=[], tautanPolos=[];
        // (1) tautan & tombol istilah di dalam blok teks
        const BLOK='p, li, dd, td, th, figcaption, blockquote, summary';
        document.querySelectorAll('a[href], button.istilah').forEach((a,i)=>{ if(!tampak(a)) return; if(a.closest('.nav, .kepala, .tombol-baris')) return;
          if(/\btombol\b|tombol-|\bchip\b|\btab\b/.test(a.className)) return;
          const blok=a.parentElement&&a.parentElement.closest(BLOK); if(!blok) return;
          const sisa=teksTampak(blok).replace(teksTampak(a),'').replace(/[\s.,;:()·—–\-→↑]/g,''); if(sisa.length<2) return;
          cek.push('tautan'); const s=getComputedStyle(a);
          const garis=s.textDecorationLine.includes('underline')||((parseFloat(s.borderBottomWidth)||0)>=1&&s.borderBottomStyle!=='none');
          if (garis) return;
          const r=rasio(rgba(s.color),rgba(getComputedStyle(blok).color));
          if (r<3) { hasil.push(`tautan ${nama(a)} "${teksTampak(a).slice(0,30)}": tanpa garis bawah, beda warna dengan teks sekitar ${r.toFixed(2)}:1 (<3:1)`); return; }
          a.setAttribute('data-uji-warna',i); tautanPolos.push({sel:`[data-uji-warna="${i}"]`, nama:nama(a)+' "'+teksTampak(a).slice(0,30)+'"'}); });
        // (2) penanda keadaan berwarna
        const LABEL={tinggi:/tanda berat/i, sedang:/perlu dicermati/i, info:/keterangan/i, aman:/tanpa tanda risiko/i};
        document.querySelectorAll('.sinyal').forEach(e=>{ if(!tampak(e)) return; const t=(e.className.match(/sinyal-(tinggi|sedang|info|aman)/)||[])[1]; if(!t) return; cek.push('sinyal');
          const lab=e.querySelector('.sinyal-tingkat'); const tl=lab?teksTampak(lab):'';
          if(!LABEL[t].test(tl)) hasil.push(`sinyal ${nama(e)} "${(e.querySelector('.sinyal-judul')||e).textContent.slice(0,40)}": tingkat "${t}" hanya ditandai warna (label terlihat: "${tl}")`); });
        document.querySelectorAll('.lampu').forEach(e=>{ if(!tampak(e)) return; const t=(e.className.match(/lampu-(tinggi|sedang|info|aman)/)||[])[1]; if(!t) return; cek.push('lampu');
          if(!LABEL[t].test(teksTampak(e.parentElement))) hasil.push(`lampu ${nama(e)}: baris panduan tanpa label tingkat "${t}"`); });
        document.querySelectorAll('.naik, .turun').forEach(e=>{ if(!tampak(e)||!/^(td|th|span|p|strong|b)$/i.test(e.tagName)) return; const t=teksTampak(e); if(!t) return; cek.push('naikturun');
          const naik=e.classList.contains('naik'); const ok=naik?/^[+▲↑]|^0(,0+)?\s?%|naik/i.test(t):/^[−\-▼↓]|turun/i.test(t);
          if(!ok) hasil.push(`angka ${nama(e)} "${t}": arah ${naik?'naik':'turun'} hanya ditandai warna (tanpa tanda ${naik?'+':'−'})`); });
        document.querySelectorAll('.kuis-tepat, .kuis-salah').forEach(e=>{ if(!tampak(e)) return; cek.push('kuis'); const t=teksTampak(e);
          const ok=e.classList.contains('kuis-tepat')?/✓|benar/i.test(t):/✗|✕|belum tepat|salah/i.test(t); if(!ok) hasil.push(`umpan kuis ${nama(e)} "${t.slice(0,40)}": benar/salah hanya ditandai warna`); });
        document.querySelectorAll('.status-syariah').forEach(e=>{ if(!tampak(e)) return; cek.push('status'); if(!/syariah/i.test(teksTampak(e))) hasil.push(`status ${nama(e)}: tanpa teks status`); });
        document.querySelectorAll('.batang9-baris').forEach(e=>{ if(!tampak(e)) return; const isi=e.querySelector('.batang9-isi'); if(!isi) return; cek.push('batang');
          const ang=e.querySelector('.batang9-angka'); if(!ang||!/\d/.test(teksTampak(ang))) hasil.push(`batang ${nama(isi)}: baris tanpa angka tertulis, naik/turun hanya dari warna`); });
        document.querySelectorAll('.musim-isi').forEach(e=>{ if(!tampak(e)) return; cek.push('musim'); const kotak=e.closest('.musim-laporan, .musim-beranda')||e.parentElement.parentElement;
          if(!/\d+\s+dari\s+\d+/.test(teksTampak(kotak))) hasil.push(`batang musim ${nama(e)}: tanpa teks "n dari m"`); });
        return {hasil, cek, tautanPolos, sw:document.documentElement.scrollWidth};
      });
      r.hasil.forEach(t=>temuan.push(t)); r.cek.forEach(j=>jenisDicek[j]=(jenisDicek[j]||0)+1); dicek+=r.cek.length;
      // (1b) tautan tanpa garis bawah tetapi kontras ≥3:1: wajib bergaris saat diarahkan
      for (const o of r.tautanPolos) { await p.hover(o.sel).catch(()=>{}); await p.waitForTimeout(50);
        const g=await p.$eval(o.sel,a=>{ const s=getComputedStyle(a); return s.textDecorationLine.includes('underline')||((parseFloat(s.borderBottomWidth)||0)>=1&&s.borderBottomStyle!=='none'); }).catch(()=>false);
        if(!g) temuan.push(`tautan ${o.nama}: tanpa garis bawah, juga saat diarahkan`); }
      if (r.sw>w) temuan.push('scroll horizontal '+r.sw);
      errs.forEach(e=>temuan.push('galat JS: '+e));
      temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      if (isUji) { const ok = ket==='UJI-GARIS'?temuan.some(t=>t.startsWith('tautan')):temuan.some(t=>t.startsWith('sinyal')); uji[ket]+=ok?1:0; }
      else total+=temuan.length;
      await ctx.close();
    }
  }
  console.log('total temuan warna',total,'(penanda dicek:',dicek,JSON.stringify(jenisDicek),'; uji balik UJI-GARIS tertangkap:',uji['UJI-GARIS'],'dari 4; UJI-TINGKAT:',uji['UJI-TINGKAT'],'dari 4)');
}

// 18 Nov 14.xx (Dewi & Nina): tujuan tautan (WCAG 2.4.4 Link Purpose (In Context)), gelap/terang × 390/1280px.
// (1) Setiap tautan & tombol yang tampil wajib punya nama (teks, aria-label, aria-labelledby, alt gambar, atau title).
// (2) Nama tidak boleh samar bila berdiri sendiri: "di sini", "klik", "selengkapnya", "lihat", "lanjut", "lainnya", "ini", dst.
// (3) Tautan bernama sama di satu halaman wajib menuju tempat yang sama (alamat + jangkar); kalau beda, namanya dibedakan.
// Keadaan: 10 halaman + Radar UNTR, profil ANTM + Bandingkan, kuis sesudah Periksa, kotak istilah terbuka.
// Uji balik: UJI-DISINI (tautan "di sini" disisipkan) dan UJI-KEMBAR (tautan "Belajar" ke halaman lain) wajib tertangkap.
async function auditTautan(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['radar.html','UNTR',async p=>{ await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); }],
    ['emiten.html?kode=ANTM','Bandingkan',async p=>{ const s=await p.$('select.pilih-banding'); if(!s) return 'select.pilih-banding tidak ada';
      const v=await s.$$eval('option',o=>o.map(x=>x.value).filter(x=>x&&x!=='ANTM')); await s.selectOption(v[0]); await p.waitForTimeout(300); }],
    ['pelajaran.html?m=apa-itu-saham','periksa',async p=>{ await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }],
    ['peringkat.html','istilah',async p=>{ const t=await p.$('button.istilah'); if(!t) return 'button.istilah tidak ada'; await t.click(); await p.waitForTimeout(200); }],
    ['metodologi.html','UJI-DISINI',async p=>{ await p.evaluate(()=>{ const q=document.createElement('p'); q.innerHTML='Cara menghitung ada <a href="metodologi.html#roe">di sini</a>.'; document.querySelector('main').appendChild(q); }); }],
    ['index.html','UJI-KEMBAR',async p=>{ await p.evaluate(()=>{ const q=document.createElement('p'); q.innerHTML='<a href="peringkat.html">Belajar</a>'; document.querySelector('main').appendChild(q); }); }],
  ];
  let total=0, dicek=0; const uji={'UJI-DISINI':0,'UJI-KEMBAR':0};
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    for (const [pg,ket,aksi] of KEADAAN) {
      const isUji=ket&&ket.startsWith('UJI-'); const tag=`tautan ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1, reducedMotion:'reduce' });
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
      const temuan=[];
      if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
      const r=await p.evaluate(()=>{
        const tampak=e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getBoundingClientRect().width>=1;
        const rapi=t=>(t||'').replace(/\s+/g,' ').trim();
        const namaAks=e=>{ const lb=e.getAttribute('aria-labelledby');
          if (lb) { const t=rapi(lb.split(/\s+/).map(id=>{ const x=document.getElementById(id); return x?x.textContent:''; }).join(' ')); if (t) return t; }
          if (rapi(e.getAttribute('aria-label'))) return rapi(e.getAttribute('aria-label'));
          let t=''; const jalan=n=>{ if(n.nodeType===3){ t+=n.nodeValue; return; } if(n.nodeType!==1) return; if(n.getAttribute('aria-hidden')==='true') return;
            if(n.tagName==='IMG'||n.tagName==='svg'){ t+=' '+(n.getAttribute('alt')||n.getAttribute('aria-label')||'')+' '; return; } n.childNodes.forEach(jalan); };
          e.childNodes.forEach(jalan); return rapi(t)||rapi(e.getAttribute('title')); };
        const SAMAR=/^(di ?sini|klik( di ?sini)?|tekan di ?sini|selengkapnya|baca selengkapnya|lihat( selengkapnya| di sini)?|lanjut(kan)?|lainnya|tautan|link|ini|ke sini|more|read more|here|click here|\W*)$/i;
        const hasil=[], peta={}; let n=0;
        document.querySelectorAll('a[href], button').forEach(e=>{ if(!tampak(e)) return; n++;
          const nm=namaAks(e), jenis=e.tagName==='A'?'tautan':'tombol';
          if (!nm) { hasil.push(`${jenis} tanpa nama: ${e.outerHTML.slice(0,80)}`); return; }
          if (SAMAR.test(nm)) hasil.push(`${jenis} bernama samar "${nm}" (tujuan tidak jelas)`);
          if (jenis==='tautan') { const u=new URL(e.href,location.href); const k=u.origin===location.origin?u.pathname.replace(/\/index\.html$/,'/')+u.search+u.hash:u.href;
            const key=nm.toLowerCase(); (peta[key]=peta[key]||{nm,tuju:new Set()}).tuju.add(k); } });
        Object.values(peta).forEach(o=>{ if(o.tuju.size>1) hasil.push(`tautan kembar "${o.nm}" menuju ${o.tuju.size} tempat berbeda: ${[...o.tuju].join(' | ')}`); });
        return {hasil, n, sw:document.documentElement.scrollWidth};
      });
      r.hasil.forEach(t=>temuan.push(t)); dicek+=r.n;
      if (r.sw>w) temuan.push('scroll horizontal '+r.sw);
      errs.forEach(e=>temuan.push('galat JS: '+e));
      temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      if (isUji) { const ok = ket==='UJI-DISINI'?temuan.some(t=>t.includes('samar "di sini"')):temuan.some(t=>t.includes('kembar "Belajar"')); uji[ket]+=ok?1:0; }
      else total+=temuan.length;
      await ctx.close();
    }
  }
  console.log('total temuan tautan',total,'(tautan & tombol dicek:',dicek,'; uji balik UJI-DISINI tertangkap:',uji['UJI-DISINI'],'dari 4; UJI-KEMBAR:',uji['UJI-KEMBAR'],'dari 4)');
}

// 18 Nov 15.xx (Dewi & Nina): identifikasi konsisten (WCAG 3.2.4 Consistent Identification), gelap/terang × 390/1280px.
// Komponen yang fungsinya sama di beberapa halaman wajib bernama sama: tautan "Langsung ke isi", logo beranda, label
// menu utama & tiap tautan menu (+ urutan menu, WCAG 3.2.3), tautan kaki, tautan unduhan, label kotak "Ketik kode",
// pola tombol istilah ("Apa itu …?", aria-expanded), label kotak istilah, tombol "Salin tautan profil".
// Juga: satu nama di menu/kaki tidak boleh menuju dua tempat. Halaman dibandingkan satu sama lain per skema & lebar.
// Uji balik: UJI-MENU (tautan menu "Radar Risiko" di Kabar diganti "Cek Risiko") dan UJI-KAKI (tautan kaki Metodologi
// di Belajar diganti "Metodologi") wajib tertangkap sebagai nama berbeda.
async function auditKonsisten(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['emiten.html?kode=TPIA'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['peringkat.html','istilah',async p=>{ const t=await p.$('button.istilah'); if(!t) return 'button.istilah tidak ada'; await t.click(); await p.waitForTimeout(200); }],
    ['pelajaran.html?m=apa-itu-saham','istilah',async p=>{ const t=await p.$('main button.istilah'); if(!t) return 'button.istilah tidak ada'; await t.click(); await p.waitForTimeout(200); }],
    ['kabar.html','UJI-MENU',async p=>{ await p.evaluate(()=>{ document.querySelector('.nav a[href$="radar.html"]').textContent='Cek Risiko'; }); }],
    ['belajar.html','UJI-KAKI',async p=>{ await p.evaluate(()=>{ document.querySelector('footer a[href$="metodologi.html"]').textContent='Metodologi'; }); }],
  ];
  const ambil=async p=>p.evaluate(()=>{
    const tampak=e=>e.checkVisibility({visibilityProperty:true,opacityProperty:true})&&e.getBoundingClientRect().width>=1;
    const rapi=t=>(t||'').replace(/\s+/g,' ').trim();
    const nama=e=>{ if (rapi(e.getAttribute('aria-label'))) return rapi(e.getAttribute('aria-label'));
      let t=''; const jalan=n=>{ if(n.nodeType===3){ t+=n.nodeValue; return; } if(n.nodeType!==1||n.getAttribute('aria-hidden')==='true') return;
        if(n.tagName==='IMG') { t+=' '+(n.getAttribute('alt')||'')+' '; return; } n.childNodes.forEach(jalan); };
      e.childNodes.forEach(jalan); return rapi(t)||rapi(e.getAttribute('title')); };
    const tuju=a=>{ const u=new URL(a.href,location.href); return u.origin===location.origin?u.pathname.replace(/\/index\.html$/,'/')+u.hash:u.href; };
    const k=[]; const catat=(kunci,nilai)=>k.push([kunci,nilai]);
    document.querySelectorAll('a.lompat').forEach(a=>catat('tautan lompat '+tuju(a).replace(/^.*#/,'#'),nama(a)));
    document.querySelectorAll('a.merek').forEach(a=>catat('logo '+tuju(a),nama(a)));
    document.querySelectorAll('nav.nav').forEach(n=>{ catat('label menu utama',n.getAttribute('aria-label')||'(tanpa label)');
      const a=[...n.querySelectorAll('a[href]')]; catat('urutan menu',a.map(tuju).join(' > '));
      a.forEach(x=>catat('menu '+tuju(x),nama(x))); });
    document.querySelectorAll('footer a[href]').forEach(a=>catat('kaki '+tuju(a),nama(a)));
    document.querySelectorAll('a[download]').forEach(a=>{ if(tampak(a)) catat('unduhan '+tuju(a),nama(a)); });
    document.querySelectorAll('.kotak-ketik').forEach(d=>{ const i=d.querySelector('input[list]'); const l=i&&document.querySelector('label[for="'+i.id+'"]');
      catat('label kotak ketik kode',l?rapi(l.textContent):'(tanpa label)'); catat('atribut kotak ketik kode',i?['type','inputmode','autocomplete'].map(x=>x+'='+i.getAttribute(x)).join(' '):'(tanpa isian)'); });
    document.querySelectorAll('button.istilah').forEach(t=>{ const ti=t.getAttribute('title')||''; const nm=rapi(t.textContent);
      catat('pola tombol istilah',(/^Apa itu .+\?$/.test(ti)?'Apa itu …?':'title "'+ti+'"')+' · aria-expanded '+(t.hasAttribute('aria-expanded')?'ada':'tidak ada')+' · type='+t.getAttribute('type')+(nm?'':' · tanpa nama')); });
    document.querySelectorAll('.kotak-istilah').forEach(d=>{ if(tampak(d)) catat('kotak istilah',(d.getAttribute('role')||'-')+' "'+(d.getAttribute('aria-label')||'')+'"'); });
    document.querySelectorAll('button.tombol-salin').forEach(t=>catat('tombol salin tautan',nama(t)));
    return {k, sw:document.documentElement.scrollWidth};
  });
  // Bandingkan: kunci → nilai → daftar halaman. Satu kunci punya >1 nilai = temuan. Satu nama menu/kaki → >1 tujuan = temuan.
  const banding=data=>{ const peta={}, namaKe={}, out=[];
    data.forEach(([hal,k])=>k.forEach(([kunci,nilai])=>{ ((peta[kunci]=peta[kunci]||{})[nilai]=peta[kunci][nilai]||new Set()).add(hal);
      const m=kunci.match(/^(menu|kaki) (.*)$/); if (m) ((namaKe[m[1]+' "'+nilai+'"']=namaKe[m[1]+' "'+nilai+'"']||new Set())).add(m[2]); }));
    Object.entries(peta).forEach(([kunci,v])=>{ const n=Object.keys(v); if(n.length>1) out.push(`${kunci} dinamai berbeda: `+n.map(x=>`"${x}" (${[...v[x]].join(', ')})`).join(' | ')); });
    Object.entries(namaKe).forEach(([nm,t])=>{ if(t.size>1) out.push(`${nm} menuju ${t.size} tempat: ${[...t].join(' | ')}`); });
    return out; };
  let total=0, dicek=0; const uji={'UJI-MENU':0,'UJI-KAKI':0};
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const sehat=[], ujiData={};
    for (const [pg,ket,aksi] of KEADAAN) {
      const isUji=ket&&ket.startsWith('UJI-'); const tag=`konsisten ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
      const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1, reducedMotion:'reduce' });
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
      const temuan=[];
      if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
      const r=await ambil(p); dicek+=r.k.length;
      if (r.sw>w) temuan.push('scroll horizontal '+r.sw);
      errs.forEach(e=>temuan.push('galat JS: '+e));
      temuan.forEach(t=>console.log(tag,'TEMUAN',t));
      const hal=pg+(ket?' ('+ket+')':'');
      if (isUji) ujiData[ket]=[hal,r.k]; else { total+=temuan.length; sehat.push([hal,r.k]); }
      await ctx.close();
    }
    const t=banding(sehat); t.forEach(x=>console.log(`konsisten ${scheme} ${w}`,'TEMUAN',x)); total+=t.length;
    for (const u of Object.keys(uji)) { const tu=banding([...sehat,ujiData[u]]); const kunci=u==='UJI-MENU'?'menu /radar.html dinamai berbeda':'kaki /metodologi.html dinamai berbeda';
      if (tu.some(x=>x.startsWith(kunci)&&x.includes(u))) uji[u]++; }
  }
  console.log('total temuan konsisten',total,'(komponen dicek:',dicek,'; uji balik UJI-MENU tertangkap:',uji['UJI-MENU'],'dari 4; UJI-KAKI:',uji['UJI-KAKI'],'dari 4)');
}

// 18 Nov 16.xx (Dewi & Nina): pembatalan penunjuk (WCAG 2.5.2 Pointer Cancellation), gelap/terang × 390/1280px.
// (1) Pendengar `mousedown`/`pointerdown`/`touchstart` yang dipasang lewat addEventListener atau properti on… dicatat
//     (skrip pemantau dipasang sebelum app.js jalan); tiap pendengar seperti itu = temuan.
// (2) Setiap elemen yang bisa ditekan dikirimi pointerdown + mousedown + touchstart tiruan (tanpa lepas/klik): DOM, alamat,
//     posisi gulir, dan status centang tidak boleh berubah.
// (3) Tekan sungguhan lalu geser keluar dan lepas di area kosong (batal): pada tombol istilah, tab Peringkat, pilihan kuis,
//     Periksa, Salin tautan, tautan menu, logo, chip Asisten, Tampilkan lagi: tidak boleh ada aksi.
// Uji balik: UJI-TEKAN (tab Peringkat kedua dipasangi pointerdown yang langsung memilih tab) wajib tertangkap.
async function auditPenunjuk(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['peringkat.html','istilah',async p=>{ const t=await p.$('button.istilah'); if(!t) return 'button.istilah tidak ada'; await t.click(); await p.waitForTimeout(200); }],
    ['radar.html','UNTR',async p=>{ await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); }],
    ['peringkat.html','UJI-TEKAN',async p=>{ const ok=await p.evaluate(()=>{ const t=document.querySelectorAll('[role="tab"]')[1]; if(!t) return false;
      t.addEventListener('pointerdown',()=>t.click()); return true; }); if(!ok) return 'tab kedua tidak ada'; }],
  ];
  const PEMANTAU=()=>{ window.__turun=[]; const JENIS=['mousedown','pointerdown','touchstart'];
    const asli=EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener=function(t,f,o){ if(JENIS.includes(String(t).toLowerCase())) {
      const e=this; window.__turun.push(t+' pada '+(e===window?'window':e===document?'document':(e.tagName||'?').toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')));
    } return asli.call(this,t,f,o); }; };
  const SASARAN='a[href],button,input,select,textarea,summary,label,[role="tab"],[role="button"],[tabindex]:not([tabindex="-1"])';
  let total=0, dicek=0, batal=0, ujiTangkap=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) for (const [pg,ket,aksi] of KEADAAN) {
    const isUji=ket==='UJI-TEKAN'; const tag=`penunjuk ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1, reducedMotion:'reduce', hasTouch:w===390 });
    await ctx.addInitScript(PEMANTAU);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
    const temuan=[];
    // Pendengar dicatat sebelum keadaan dibuat: klik Playwright sendiri memasang pendengar sementara di window.
    const turun=await p.evaluate(()=>[...new Set(window.__turun)]);
    if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
    if (isUji) turun.push(...await p.evaluate(()=>window.__turun.filter(x=>!x.endsWith('pada window'))));
    // (1) + (2): pendengar turun & tekan tiruan
    const r=await p.evaluate(async ([SASARAN,turun])=>{
      const out=[...new Set(turun)].map(x=>'pendengar turun: '+x);
      const ON=['onmousedown','onpointerdown','ontouchstart'];
      [window,document,...document.querySelectorAll('*')].forEach(e=>ON.forEach(o=>{ if (typeof e[o]==='function') out.push('properti '+o+' pada '+(e.tagName||'window').toLowerCase()); }));
      const keadaan=()=>location.href+'|'+scrollX+','+scrollY+'|'+[...document.querySelectorAll('input')].map(i=>i.checked?1:0).join('')+'|'+document.body.innerHTML.length;
      const el=[...document.querySelectorAll(SASARAN)];
      const mo=new MutationObserver(()=>{}); mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
      for (const e of el) {
        const a=keadaan(); mo.takeRecords();
        const o={bubbles:true,cancelable:true,composed:true,button:0,buttons:1};
        e.dispatchEvent(new PointerEvent('pointerdown',{...o,pointerType:'mouse',isPrimary:true}));
        e.dispatchEvent(new MouseEvent('mousedown',o));
        e.dispatchEvent(new Event('touchstart',{bubbles:true,cancelable:true}));
        await new Promise(r=>setTimeout(r,0));
        const m=mo.takeRecords(); const z=keadaan();
        if (m.length||z!==a) { const nm=(e.getAttribute('aria-label')||e.textContent||e.id||e.tagName).replace(/\s+/g,' ').trim().slice(0,40);
          out.push('aksi saat ditekan: '+e.tagName.toLowerCase()+' "'+nm+'" ('+m.length+' perubahan DOM'+(z!==a?', keadaan berubah':'')+')'); }
      }
      mo.disconnect();
      return {out, n:el.length, sw:document.documentElement.scrollWidth};
    }, [SASARAN,turun]);
    dicek+=r.n; r.out.forEach(x=>temuan.push(x));
    // (3) tekan sungguhan, geser keluar, lepas di area kosong
    if (!isUji) {
      const PILIH=['button.istilah','[role="tab"][aria-selected="false"]','.kuis input[type="radio"]','.kuis button[type="submit"]','button.tombol-salin','.nav a[href]','a.merek','.contoh-tanya button','footer a[href]','main button'];
      for (const s of PILIH) {
        const h=await p.$(s); if (!h || !(await h.isVisible())) continue;
        await h.scrollIntoViewIfNeeded(); const box=await h.boundingBox(); if (!box) continue;
        const kosong=await p.evaluate(()=>{ const I='a,button,input,select,textarea,label,summary,[role="tab"],[tabindex],.kotak-istilah';
          for (let y=innerHeight-20;y>20;y-=23) for (let x=8;x<innerWidth;x+=29) { const e=document.elementFromPoint(x,y); if (e&&!e.closest(I)&&!e.closest('.kuis')) return [x,y]; } return null; });
        if (!kosong) continue;
        const ambil=()=>p.evaluate(()=>location.href+'|'+[...document.querySelectorAll('input')].map(i=>i.checked?1:0).join('')+'|'+[...document.querySelectorAll('[aria-expanded],[aria-selected]')].map(e=>(e.getAttribute('aria-expanded')||'')+(e.getAttribute('aria-selected')||'')).join(',')+'|'+document.querySelectorAll('.kotak-istilah').length+'|'+(document.querySelector('[role="status"]')||{textContent:''}).textContent);
        const a=await ambil();
        await p.mouse.move(box.x+box.width/2, box.y+box.height/2); await p.mouse.down(); await p.waitForTimeout(80);
        const d=await ambil();
        await p.mouse.move(kosong[0],kosong[1],{steps:4}); await p.mouse.up(); await p.waitForTimeout(250);
        const z=await ambil(); batal++;
        if (d!==a) temuan.push('aksi saat ditekan sungguhan: '+s+' (sebelum dilepas)');
        // Kotak istilah yang sedang terbuka boleh tertutup karena lepas di luar kotak (klik di luar = tutup, terjadi saat dilepas).
        else if (z!==a && ket!=='istilah') temuan.push('batal gagal: '+s+' tetap menjalankan aksi setelah ditekan lalu digeser keluar');
        if (!p.url().startsWith('http://localhost:8765/'+pg.split('#')[0].split('?')[0])) { temuan.push('batal gagal: '+s+' berpindah halaman'); await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(300); if (aksi) await aksi(p); }
      }
    }
    if (r.sw>w) temuan.push('scroll horizontal '+r.sw);
    errs.forEach(e=>temuan.push('galat JS: '+e));
    if (isUji) { if (temuan.some(x=>x.includes('pendengar turun: pointerdown'))&&temuan.some(x=>x.startsWith('aksi saat ditekan'))) ujiTangkap++; }
    else { temuan.forEach(t=>console.log(tag,'TEMUAN',t)); total+=temuan.length; }
    await ctx.close();
  }
  console.log('total temuan penunjuk',total,'(elemen ditekan tiruan:',dicek,'; tekan-geser-batal sungguhan:',batal,'; uji balik UJI-TEKAN tertangkap:',ujiTangkap,'dari 4)');
}

// 18 Nov 17.xx (Dewi & Nina): gerakan penunjuk (WCAG 2.5.1 Pointer Gestures) & aktivasi gerakan perangkat
// (WCAG 2.5.4 Motion Actuation), gelap/terang × 390/1280px.
// (1) Pendengar gerakan (`touchmove`, `pointermove`, `gesturestart/change/end`, `dragstart`, `drag`, `drop`, `wheel`)
//     dan gerakan perangkat (`devicemotion`, `deviceorientation`, `deviceorientationabsolute`) yang dipasang lewat
//     addEventListener atau properti on… dicatat (skrip pemantau dipasang sebelum app.js); tiap pendengar = temuan.
//     Elemen draggable="true" juga temuan.
// (2) Tiap tab (role="tab") harus bisa dipilih dengan satu ketuk/klik (aria-selected jadi "true").
// (3) Geser sungguhan (tekan, seret 200px ke kiri, lepas) di tengah isi halaman: tidak boleh ada aksi selain gulir.
// (4) Goyang tiruan: devicemotion + deviceorientation dikirim ke window: DOM & alamat tidak boleh berubah.
// Uji balik: UJI-GOYANG (window dipasangi devicemotion yang memilih tab) dan UJI-GESER (daftar tab dipasangi touchmove)
// wajib tertangkap.
async function auditGerak(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['peringkat.html','istilah',async p=>{ const t=await p.$('button.istilah'); if(!t) return 'button.istilah tidak ada'; await t.click(); await p.waitForTimeout(200); }],
    ['radar.html','UNTR',async p=>{ await p.selectOption('#pilih-saham','UNTR'); await p.waitForTimeout(300); }],
    ['peringkat.html','UJI-GOYANG',async p=>{ const ok=await p.evaluate(()=>{ const t=document.querySelectorAll('[role="tab"]')[1]; if(!t) return false;
      window.addEventListener('devicemotion',()=>t.click()); return true; }); if(!ok) return 'tab kedua tidak ada'; }],
    ['peringkat.html','UJI-GESER',async p=>{ const ok=await p.evaluate(()=>{ const t=document.querySelector('[role="tablist"]'); if(!t) return false;
      t.addEventListener('touchmove',()=>{}); return true; }); if(!ok) return 'daftar tab tidak ada'; }],
  ];
  const JENIS=['touchmove','pointermove','gesturestart','gesturechange','gestureend','dragstart','drag','drop','wheel','devicemotion','deviceorientation','deviceorientationabsolute'];
  const PEMANTAU=(JENIS)=>{ window.__gerak=[];
    const asli=EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener=function(t,f,o){ if(JENIS.includes(String(t).toLowerCase())) {
      const e=this; window.__gerak.push(t+' pada '+(e===window?'window':e===document?'document':(e.tagName||'?').toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')));
    } return asli.call(this,t,f,o); }; };
  let total=0, tab=0, geser=0, goyang=0, ujiTangkap=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) for (const [pg,ket,aksi] of KEADAAN) {
    const isUji=!!ket&&ket.startsWith('UJI-'); const tag=`gerak ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1, reducedMotion:'reduce', hasTouch:w===390 });
    await ctx.addInitScript(PEMANTAU, JENIS);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
    const temuan=[];
    // Pendengar dicatat sebelum keadaan dibuat: alat uji sendiri bisa memasang pendengar sementara di window.
    const awal=await p.evaluate(()=>[...new Set(window.__gerak)]);
    if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
    const daftar=isUji ? await p.evaluate(()=>[...new Set(window.__gerak)]) : awal;
    daftar.forEach(x=>temuan.push('pendengar gerak: '+x));
    // (1) properti on… & draggable
    const r=await p.evaluate((JENIS)=>{ const out=[];
      const ON=JENIS.map(j=>'on'+j);
      [window,document,...document.querySelectorAll('*')].forEach(e=>ON.forEach(o=>{ if (typeof e[o]==='function') out.push('properti '+o+' pada '+(e.tagName||'window').toLowerCase()); }));
      document.querySelectorAll('[draggable="true"]').forEach(e=>out.push('elemen bisa diseret: '+e.tagName.toLowerCase()));
      return {out, sw:document.documentElement.scrollWidth};
    }, JENIS);
    r.out.forEach(x=>temuan.push(x));
    if (!isUji) {
      // (2) tiap tab dipilih dengan satu klik
      const nTab=await p.$$eval('[role="tab"]',t=>t.length);
      for (let i=0;i<nTab;i++) { const h=(await p.$$('[role="tab"]'))[i]; if (!(await h.isVisible())) continue;
        await h.click(); await p.waitForTimeout(120); tab++;
        if (await h.getAttribute('aria-selected')!=='true') temuan.push('tab ke-'+(i+1)+' tidak terpilih dengan satu klik'); }
      // (3) geser sungguhan di tengah isi
      const titik=await p.evaluate(()=>{ const I='a,button,input,select,textarea,label,summary,[role="tab"],[tabindex],.kotak-istilah';
        for (let y=Math.round(innerHeight*0.6);y>60;y-=23) for (let x=Math.round(innerWidth*0.8);x>8;x-=29) { const e=document.elementFromPoint(x,y); if (e&&!e.closest(I)) return [x,y]; } return null; });
      const ambil=()=>p.evaluate(()=>location.href+'|'+[...document.querySelectorAll('input')].map(i=>i.checked?1:0).join('')+'|'+[...document.querySelectorAll('[aria-expanded],[aria-selected]')].map(e=>(e.getAttribute('aria-expanded')||'')+(e.getAttribute('aria-selected')||'')).join(',')+'|'+document.querySelectorAll('.kotak-istilah').length+'|'+document.body.innerHTML.length);
      if (titik) { const a=await ambil();
        await p.mouse.move(titik[0],titik[1]); await p.mouse.down(); await p.mouse.move(Math.max(4,titik[0]-200),titik[1],{steps:6}); await p.mouse.up(); await p.waitForTimeout(200);
        geser++; if (await ambil()!==a) temuan.push('aksi karena geser di isi halaman'); }
    }
    // (4) goyang tiruan
    const g=await p.evaluate(async ()=>{ const kd=()=>location.href+'|'+document.body.innerHTML.length+'|'+[...document.querySelectorAll('[aria-selected]')].map(e=>e.getAttribute('aria-selected')).join(',');
      const a=kd(); const mo=new MutationObserver(()=>{}); mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
      for (let i=0;i<5;i++) { window.dispatchEvent(new Event('devicemotion')); window.dispatchEvent(new Event('deviceorientation')); await new Promise(r=>setTimeout(r,20)); }
      const m=mo.takeRecords().length; mo.disconnect(); return m||kd()!==a ? m+' perubahan DOM'+(kd()!==a?', keadaan berubah':'') : ''; });
    goyang++; if (g) temuan.push('aksi karena goyang perangkat: '+g);
    if (r.sw>w) temuan.push('scroll horizontal '+r.sw);
    errs.forEach(e=>temuan.push('galat JS: '+e));
    if (ket==='UJI-GOYANG') { if (temuan.some(x=>x.includes('pendengar gerak: devicemotion'))&&temuan.some(x=>x.startsWith('aksi karena goyang'))) ujiTangkap++; }
    else if (ket==='UJI-GESER') { if (temuan.some(x=>x.includes('pendengar gerak: touchmove'))) ujiTangkap++; }
    else { temuan.forEach(t=>console.log(tag,'TEMUAN',t)); total+=temuan.length; }
    await ctx.close();
  }
  console.log('total temuan gerak',total,'(tab dipilih satu klik:',tab,'; geser sungguhan:',geser,'; goyang tiruan:',goyang,'; uji balik UJI-GOYANG/UJI-GESER tertangkap:',ujiTangkap,'dari 8)');
}

// 18 Nov 18.xx (Dewi & Nina): ubah ukuran teks 200% (WCAG 1.4.4 Resize Text). Bukan zoom halaman: ukuran huruf dasar peramban
// dinaikkan dari 16px ke 32px (CDP Page.setFontSizes, sama seperti setelan "Ukuran font" di Chrome), lebar layar tetap
// 390px & 1280px, gelap/terang. Tiap keadaan diukur dua kali (100% lalu 200%) di halaman yang sama:
// (1) teks wajib membesar (ukuran huruf 200% ≥ 1,2× ukuran 100%; di bawah 1,9× dicatat saja karena judul memakai clamp/vw),
// (2) tidak ada teks terpotong wadah ber-overflow hidden/clip, (3) tidak ada baris teks yang tumpang tindih,
// (4) tanpa scroll horizontal, (5) tanpa galat JS. Uji balik: UJI-PX (tinggi tetap 40px + overflow hidden pada h1)
// wajib tertangkap sebagai terpotong; UJI-TETAP (body font-size 17px) wajib tertangkap sebagai teks tidak membesar.
// Dewi & Nina (18 Nov 19.xx): audit jeda, hentikan, sembunyikan (WCAG 2.2.2).
// Gerak/kedip yang mulai sendiri tidak boleh berjalan lebih dari 5 detik tanpa tombol jeda,
// dan semua animasi wajib mati saat prefers-reduced-motion: reduce.
// (1) gerak bebas: 5,2 detik setelah halaman/keadaan dibuat, document.getAnimations() tidak boleh ada yang masih berjalan;
//     juga dicek waktu selesai tiap animasi (getComputedTiming().endTime) ≤ 5000 ms, jadi animasi tak berujung tertangkap walau sedang jeda.
// (2) gerak dikurangi: tidak ada animasi sama sekali (berjalan/menunggu) sesudah halaman/keadaan dibuat.
// Uji balik UJI-ANIMASI: animasi tak berujung disisipkan di judul → wajib tertangkap di kedua mode.
// AUDIT=animasi node tools/audit-kontras.js
async function auditAnimasi(b) {
  const KEADAAN=[
    ['index.html'],['peringkat.html'],['radar.html'],['emiten.html?kode=ANTM'],['kabar.html'],['belajar.html'],
    ['pelajaran.html?m=apa-itu-saham'],['metodologi.html'],['asisten.html'],['404.html'],
    ['peringkat.html','istilah',async p=>{ const t=await p.$('button.istilah'); if(!t) return 'button.istilah tidak ada'; await t.click(); }],
    ['radar.html','UNTR',async p=>{ await p.selectOption('#pilih-saham','UNTR'); }],
    // penanda "sedang menyusun jawaban" Asisten AI (situs tim belum bisa memanggil /api/tanya, jadi pesannya disisipkan)
    ['asisten.html','mengetik',async p=>{ await p.evaluate(()=>{ const x=document.createElement('p'); x.className='mengetik'; x.textContent='Sedang menyusun jawaban'; (document.querySelector('main')||document.body).appendChild(x); }); }],
    ['index.html','UJI-ANIMASI',async p=>{ await p.addStyleTag({content:'h1{animation:uji-kedip 1s linear infinite alternate!important}@keyframes uji-kedip{from{opacity:1}to{opacity:.6}}'}); }],
  ];
  let total=0, ujiTangkap=0, ujiJumlah=0, dicek=0;
  for (const gerak of ['no-preference','reduce']) for (const scheme of ['dark','light']) for (const w of [390,1280]) for (const [pg,ket,aksi] of KEADAAN) {
    const isUji=ket==='UJI-ANIMASI'; const tag=`animasi ${gerak} ${scheme} ${w} ${pg}${ket?' ('+ket+')':''}`;
    const ctx=await b.newContext({ viewport:{width:w,height:844}, colorScheme:scheme, deviceScaleFactor:1, reducedMotion:gerak });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(150);
    const temuan=[];
    if (aksi) { const r=await aksi(p); if (r) temuan.push('keadaan gagal dibuat: '+r); }
    const nama=a=>{ const t=a.effect&&a.effect.target; const e=t? (t.tagName||'?').toLowerCase()+(t.id?'#'+t.id:'')+(typeof t.className==='string'&&t.className?'.'+t.className.trim().split(/\s+/)[0]:'') + (a.effect.pseudoElement||'') : '?';
      return (a.animationName||a.transitionProperty||a.constructor.name)+' pada '+e; };
    if (gerak==='reduce') {
      const ada=await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'||a.pending).map(a=>{ const t=a.effect&&a.effect.target;
        return (a.animationName||a.transitionProperty||a.constructor.name)+' pada '+(t?(t.tagName||'?').toLowerCase()+(t.id?'#'+t.id:'')+(typeof t.className==='string'&&t.className?'.'+t.className.trim().split(/\s+/)[0]:'')+(a.effect.pseudoElement||''):'?'); }));
      [...new Set(ada)].forEach(x=>temuan.push('animasi tetap jalan saat gerak dikurangi: '+x));
    } else {
      // waktu selesai tiap animasi, diukur dari awal waktu dokumen
      const lama=await p.evaluate(()=>document.getAnimations().map(a=>{ const t=a.effect&&a.effect.target; const ct=a.effect?a.effect.getComputedTiming():{endTime:0};
        const mulai=(a.startTime??document.timeline.currentTime)||0;
        return {n:(a.animationName||a.transitionProperty||a.constructor.name)+' pada '+(t?(t.tagName||'?').toLowerCase()+(t.id?'#'+t.id:'')+(typeof t.className==='string'&&t.className?'.'+t.className.trim().split(/\s+/)[0]:'')+(a.effect.pseudoElement||''):'?'),
          selesai: ct.endTime===Infinity?Infinity: mulai+ct.endTime/(a.playbackRate||1)}; }));
      const aksiMs=await p.evaluate(()=>document.timeline.currentTime);
      // batas 5 detik dihitung sejak gerak mulai: sejak halaman dimuat, atau sejak keadaan (klik) dibuat
      const pangkal = aksi ? aksiMs : 0;
      [...new Map(lama.filter(x=>x.selesai===Infinity||x.selesai-pangkal>5000).map(x=>[x.n,x])).values()]
        .forEach(x=>temuan.push('animasi lebih dari 5 detik tanpa jeda: '+x.n+' ('+(x.selesai===Infinity?'tak berujung':Math.round(x.selesai-pangkal)+' ms')+')'));
      await p.waitForTimeout(5200);
      const masih=await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
      if (masih && !temuan.length) temuan.push(masih+' animasi masih berjalan 5,2 detik setelah dimuat');
    }
    if (errs.length) temuan.push('galat JS: '+errs.join(' | '));
    dicek++;
    console.log(tag, temuan.length?'TEMUAN '+temuan.join('; '):'lolos');
    if (isUji) { ujiJumlah++; if (temuan.length) ujiTangkap++; } else total+=temuan.length;
    await ctx.close();
  }
  console.log('total temuan animasi',total,'dari',dicek,'keadaan×mode (uji balik UJI-ANIMASI tertangkap:',ujiTangkap+'/'+ujiJumlah+')');
  return total;
}

async function auditTeks(b) {
  const halaman=['index.html','peringkat.html','peringkat.html#istilah','radar.html#UNTR','emiten.html?kode=ANTM','kabar.html','belajar.html',
    'pelajaran.html?m=apa-itu-saham#benar','metodologi.html','asisten.html','asisten.html#jawab','404.html','UJI-PX','UJI-TETAP'];
  let total=0, catatan=0, ujiPx=0, ujiTetap=0, dicekTotal=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, colorScheme:scheme });
    for (const pg of halaman) {
      const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
      const cdp = await ctx.newCDPSession(p);
      const [path,hash]=pg.split('#'); const uji=path.startsWith('UJI-');
      await p.goto('http://localhost:8765/'+(uji?'peringkat.html':path)); await p.waitForTimeout(300);
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate(id=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} }
      if (hash==='jawab') await p.evaluate(()=>{const log=document.querySelector('[aria-live="polite"]'); if(log) log.insertAdjacentHTML('beforeend','<div class="pesan pesan-galat"><span class="pesan-label">Asisten</span><p>Maaf, server galat</p></div><div class="pesan pesan-asisten"><span class="pesan-label">Asisten</span><p>Contoh jawaban <strong>tebal</strong> yang agak panjang supaya terbungkus beberapa baris.</p><ul><li>Butir satu</li><li>Butir dua</li></ul></div>');});
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      if (path==='UJI-PX') await p.addStyleTag({content:'h1{height:40px!important;overflow:hidden!important}'});
      if (path==='UJI-TETAP') await p.addStyleTag({content:'body{font-size:17px!important}'});
      // ukuran 100%: tandai tiap elemen pemilik teks dengan ukuran hurufnya
      await p.evaluate(()=>{ const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n, i=0;
        while(n=w.nextNode()){ const el=n.parentElement; if(!n.textContent.trim()||!el||['SCRIPT','STYLE','NOSCRIPT','OPTION','TEXTAREA'].includes(el.tagName)) continue;
          if(!el.dataset.ukuranAwal) el.dataset.ukuranAwal=parseFloat(getComputedStyle(el).fontSize); } });
      await cdp.send('Page.setFontSizes',{fontSizes:{standard:32,fixed:26}}); await p.waitForTimeout(300);
      const res = await p.evaluate(() => {
        const tersembunyi = el => { for(let e=el;e;e=e.parentElement){ const s=getComputedStyle(e); if(s.display==='none'||s.visibility==='hidden'||s.clipPath.includes('inset(50%')||(s.clip&&s.clip.startsWith('rect(0'))) return true; const r=e.getBoundingClientRect(); if(r.width<=1&&r.height<=1&&s.overflow==='hidden') return true; } return false; };
        const potong=[], kotak=[], kecil=[], kurang=[]; const dicekEl=new Set(), dicekUkuran=new Set();
        const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
        while(n=w.nextNode()){ if(!n.textContent.trim()) continue; const el=n.parentElement; if(!el||['SCRIPT','STYLE','NOSCRIPT','OPTION','TEXTAREA'].includes(el.tagName)) continue; if(tersembunyi(el)) continue;
          if (el.dataset.ukuranAwal && !dicekUkuran.has(el)) { dicekUkuran.add(el); const a=+el.dataset.ukuranAwal, z=parseFloat(getComputedStyle(el).fontSize), r=z/a;
            const ket=`<${el.tagName.toLowerCase()}${el.className&&typeof el.className==='string'?' class="'+el.className+'"':''}> ${a}px→${z}px "${n.textContent.trim().slice(0,30)}"`;
            if (r<1.2) kecil.push(ket); else if (r<1.9) kurang.push(ket); }
          const rg=document.createRange(); rg.selectNodeContents(n);
          let lapis=null; for(let e=el;e;e=e.parentElement){ if(getComputedStyle(e).position==='fixed'){ lapis=e; break; } }
          for (const r of rg.getClientRects()) if (r.width>1&&r.height>1) kotak.push({r, el, lapis, t:n.textContent.trim().slice(0,30)});
          for (let e=el;e&&e!==document.body;e=e.parentElement){ const s=getComputedStyle(e);
            const ox=s.overflowX, oy=s.overflowY; if(['auto','scroll'].includes(ox)&&['auto','scroll'].includes(oy)) break;
            const hX=ox==='hidden'||ox==='clip', hY=oy==='hidden'||oy==='clip'; if(!hX&&!hY) continue;
            if (dicekEl.has(e)) break; dicekEl.add(e);
            const lebih = (hX&&e.scrollWidth>e.clientWidth+1)||(hY&&e.scrollHeight>e.clientHeight+1);
            if (lebih) potong.push(`<${e.tagName.toLowerCase()} class="${e.className}"> ${hY?'tinggi '+e.clientHeight+'/'+e.scrollHeight:''} ${hX?'lebar '+e.clientWidth+'/'+e.scrollWidth:''} "${(e.textContent||'').trim().slice(0,40)}"`);
            break; }
        }
        const tumpuk=[]; kotak.sort((a,b)=>a.r.top-b.r.top);
        for (let i=0;i<kotak.length&&tumpuk.length<10;i++) for (let j=i+1;j<kotak.length;j++){ const a=kotak[i], c=kotak[j]; if(c.r.top>=a.r.bottom-3) break; if(a.el===c.el) continue; if(a.lapis!==c.lapis) continue;
          const ox=Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left), oy=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
          if (ox>=3&&oy>=3) { tumpuk.push(`"${a.t}" ⟂ "${c.t}" (${Math.round(ox)}×${Math.round(oy)}px)`); break; } }
        return {sw:document.documentElement.scrollWidth, potong, tumpuk, kecil, kurang, n:kotak.length, dasar:getComputedStyle(document.body).fontSize};
      });
      const tag=`teks ${scheme} ${w} ${pg}`; const masalah=[];
      if (res.sw>w) masalah.push('scroll horizontal '+res.sw);
      res.potong.forEach(x=>masalah.push('terpotong '+x)); res.tumpuk.forEach(x=>masalah.push('tumpuk '+x));
      res.kecil.slice(0,10).forEach(x=>masalah.push('tidak membesar '+x)); if (res.kecil.length>10) masalah.push('tidak membesar … +'+(res.kecil.length-10)+' lagi');
      errs.forEach(e=>masalah.push('galat JS '+e));
      console.log(tag, 'huruf dasar', res.dasar, 'baris teks dicek', res.n, masalah.length?'TEMUAN '+masalah.length:'lolos', res.kurang.length?'(catatan <1,9×: '+res.kurang.length+')':'');
      if (path==='UJI-PX') { if (res.potong.length) ujiPx++; }
      else if (path==='UJI-TETAP') { if (res.kecil.length) ujiTetap++; }
      else { masalah.forEach(m=>console.log('   ',m)); total+=masalah.length; catatan+=res.kurang.length; dicekTotal+=res.n; }
      await p.close();
    }
    await ctx.close();
  }
  console.log('total temuan ubah ukuran teks',total,'(baris teks dicek:',dicekTotal,'; catatan judul <1,9×:',catatan,'; uji balik UJI-PX tertangkap:',ujiPx,'dari 4; UJI-TETAP tertangkap:',ujiTetap,'dari 4)');
}

const pages = ['radar.html#UNTR','radar.html#INTP','radar.html#TPIA','radar.html#HEAL','peringkat.html#istilah','asisten.html#jawab','UJI','peringkat.html','radar.html','emiten.html?kode=ANTM','emiten.html?kode=TPIA','kabar.html','metodologi.html','asisten.html',
  'index.html','belajar.html','pelajaran.html?m=apa-itu-saham#benar','pelajaran.html?m=saham-syariah#salah','404.html'];
const halamanFokus = ['index.html','peringkat.html','peringkat.html#istilah','radar.html','radar.html#UNTR','emiten.html?kode=ANTM','kabar.html','belajar.html','pelajaran.html?m=apa-itu-saham','pelajaran.html?m=apa-itu-saham#benar','metodologi.html','asisten.html','404.html','UJI-FOKUS','UJI-FOKUS-BORDER'];
(async () => {
  const b = await chromium.launch();
  // AUDIT=zoom node tools/audit-kontras.js → hanya zoom 200% & layar pendek HP
  if (process.env.AUDIT==='zoom') { await auditZoom(b); await b.close(); return; }
  // AUDIT=jarak node tools/audit-kontras.js → hanya jarak teks (WCAG 1.4.12)
  if (process.env.AUDIT==='jarak') { await auditJarak(b); await b.close(); return; }
  // AUDIT=orientasi node tools/audit-kontras.js → hanya orientasi layar (WCAG 1.3.4)
  if (process.env.AUDIT==='orientasi') { await auditOrientasi(b); await b.close(); return; }
  // AUDIT=sentuh node tools/audit-kontras.js → hanya ukuran sasaran sentuh (WCAG 2.5.8)
  if (process.env.AUDIT==='sentuh') { await auditSentuh(b); await b.close(); return; }
  // AUDIT=sorot node tools/audit-kontras.js → hanya konten saat diarahkan/difokus (WCAG 1.4.13)
  if (process.env.AUDIT==='sorot') { await auditSorot(b); await b.close(); return; }
  // AUDIT=label node tools/audit-kontras.js → hanya label dalam nama (WCAG 2.5.3)
  if (process.env.AUDIT==='label') { await auditLabel(b); await b.close(); return; }
  // AUDIT=status node tools/audit-kontras.js → hanya pesan status (WCAG 4.1.3)
  if (process.env.AUDIT==='status') { await auditStatus(b); await b.close(); return; }
  // AUDIT=judul node tools/audit-kontras.js → hanya judul halaman & urutan judul (WCAG 2.4.2 & 1.3.1)
  if (process.env.AUDIT==='judul') { await auditJudul(b); await b.close(); return; }
  // AUDIT=bahasa node tools/audit-kontras.js → hanya bahasa halaman & bagian (WCAG 3.1.1 & 3.1.2)
  if (process.env.AUDIT==='bahasa') { await auditBahasa(b); await b.close(); return; }
  // AUDIT=isian node tools/audit-kontras.js → hanya label/petunjuk & pesan salah isian (WCAG 3.3.2 & 3.3.1)
  if (process.env.AUDIT==='isian') { await auditIsian(b); await b.close(); return; }
  // AUDIT=urutan node tools/audit-kontras.js → hanya urutan fokus (WCAG 2.4.3)
  if (process.env.AUDIT==='urutan') { await auditUrutan(b); await b.close(); return; }
  // AUDIT=nonteks node tools/audit-kontras.js → hanya kontras non-teks (WCAG 1.4.11)
  if (process.env.AUDIT==='nonteks') { await auditNonteks(b); await b.close(); return; }
  // AUDIT=warna node tools/audit-kontras.js → hanya penggunaan warna (WCAG 1.4.1)
  if (process.env.AUDIT==='warna') { await auditWarna(b); await b.close(); return; }
  // AUDIT=tautan node tools/audit-kontras.js → hanya tujuan tautan (WCAG 2.4.4)
  if (process.env.AUDIT==='tautan') { await auditTautan(b); await b.close(); return; }
  // AUDIT=konsisten node tools/audit-kontras.js → hanya identifikasi konsisten (WCAG 3.2.4)
  if (process.env.AUDIT==='konsisten') { await auditKonsisten(b); await b.close(); return; }
  // AUDIT=penunjuk node tools/audit-kontras.js → hanya pembatalan penunjuk (WCAG 2.5.2)
  if (process.env.AUDIT==='penunjuk') { await auditPenunjuk(b); await b.close(); return; }
  // AUDIT=gerak node tools/audit-kontras.js → hanya gerakan penunjuk & gerakan perangkat (WCAG 2.5.1 & 2.5.4)
  if (process.env.AUDIT==='gerak') { await auditGerak(b); await b.close(); return; }
  // AUDIT=teks node tools/audit-kontras.js → hanya ubah ukuran teks 200% (WCAG 1.4.4)
  if (process.env.AUDIT==='teks') { await auditTeks(b); await b.close(); return; }
  // AUDIT=animasi node tools/audit-kontras.js → hanya jeda, hentikan, sembunyikan (WCAG 2.2.2)
  if (process.env.AUDIT==='animasi') { await auditAnimasi(b); await b.close(); return; }
  let total = 0;
  // AUDIT=fokus node tools/audit-kontras.js → hanya cek garis fokus (lebih cepat)
  if (process.env.AUDIT!=='fokus') for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, colorScheme:scheme });
    const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
    for (const pg of pages) {
      const [path,hash]=pg.split('#'); await p.goto('http://localhost:8765/'+(path==='UJI'?'peringkat.html':path)); await p.waitForTimeout(400);
      if (path==='UJI') await p.addStyleTag({content:'h1{color:#999!important;background:#aaa!important}'});
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); console.log('radar',hash, await p.$eval('#hasil-radar h2',x=>x.textContent)); }
      if (hash==='benar'||hash==='salah'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate(([id,mode])=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ const j=mode==='benar'?q.benar:(q.benar+1)%q.pilihan.length; document.getElementById(document.querySelector('input[name="soal-'+i+'"][value="'+j+'"]').id).checked=true; }); },[id,hash]);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); console.log('kuis',hash, await p.$eval('.kuis-hasil',x=>x.textContent.trim().slice(0,60))); }
      if (hash==='istilah'){ const t=await p.$('.istilah, [data-istilah], button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} else console.log('tombol istilah tidak ketemu'); }
      if (hash==='jawab'){ await p.evaluate(()=>{const log=document.querySelector('[aria-live="polite"]'); if(log) log.insertAdjacentHTML('beforeend','<div class="pesan pesan-galat"><span class="pesan-label">Asisten</span><p>Maaf, server galat</p></div><div class="pesan pesan-asisten"><span class="pesan-label">Asisten</span><strong>Asisten</strong><p>Contoh jawaban <strong>tebal</strong></p><ul><li>poin</li></ul></div><div class="pesan pesan-anda"><strong>Anda</strong><p>tanya</p></div>');}); }
      // pilih emiten di radar agar temuan tampil
      if (false) { const s = await p.$('select'); if (s) { const v = await s.$$eval('option', o=>o.map(x=>x.value).filter(Boolean)); if (v[0]) await s.selectOption(v.find(x=>x==='UNTR')||v[0]); await p.waitForTimeout(300);} }
      if (pg.startsWith('emiten')) { const s = await p.$('select'); if (s) { const v = await s.$$eval('option', o=>o.map(x=>x.value).filter(Boolean)); if (v[1]) await s.selectOption(v[1]); await p.waitForTimeout(300);} }
      // buka semua details
      await p.$$eval('details', d=>d.forEach(x=>x.open=true));
      const res = await p.evaluate(() => {
        const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [a[0],a[1],a[2],a[3]===undefined?1:a[3]]; };
        const lum = ([r,g,b]) => { const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
        const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
        const bgOf = el => { let layers=[]; for(let e=el;e;e=e.parentElement){ const cs=getComputedStyle(e); if (cs.backgroundImage!=='none') return {img:true}; const c=parse(cs.backgroundColor); if(c&&c[3]>0){layers.push(c); if(c[3]>=1) break;} } let base=parse(getComputedStyle(document.body).backgroundColor)||[255,255,255,1]; if(!layers.length||layers[layers.length-1][3]<1) layers.push(base[3]?base:[255,255,255,1]); let col=layers.pop().slice(0,3); while(layers.length){const l=layers.pop(); col=col.map((v,i)=>v*(1-l[3])+l[i]*l[3]);} return {col}; };
        const out=[]; const seen=new Set(); let cek=0, img=[];
        const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
        let n; while(n=walker.nextNode()){ if(!n.textContent.trim()) continue; const el=n.parentElement; if(seen.has(el)) continue; seen.add(el);
          const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); if(r.width===0||cs.visibility==='hidden'||cs.opacity==='0') continue;
          if (el.closest('[aria-hidden="true"]') && !el.closest('main')) {}
          let hidden=false; for(let e=el;e;e=e.parentElement){const s=getComputedStyle(e); if(s.display==='none'||s.clipPath.includes('inset(50%')||(s.position==='absolute'&&s.clip&&s.clip.startsWith('rect(0'))) {hidden=true;break;}} if(hidden) continue;
          const fg=parse(cs.color); const bg=bgOf(el); if(bg.img){img.push(el.tagName+'.'+el.className+':'+n.textContent.trim().slice(0,25)); continue;} cek++;
          let f=fg.slice(0,3); if(fg[3]<1) f=f.map((v,i)=>v*fg[3]+bg.col[i]*(1-fg[3]));
          const k=ratio(f,bg.col); const size=parseFloat(cs.fontSize); const bold=+cs.fontWeight>=700; const large=size>=24||(bold&&size>=18.66);
          const need=large?3:4.5; if(k<need) out.push(`${k.toFixed(2)}:1 <${el.tagName.toLowerCase()} class="${el.className}"> "${n.textContent.trim().slice(0,40)}" ${cs.color} on rgb(${bg.col.map(Math.round)})`);
        }
        for (const i of document.querySelectorAll('input[placeholder],textarea[placeholder]')) { const c=parse(getComputedStyle(i,'::placeholder').color); const bg=bgOf(i); if(c&&!bg.img){ let f=c.slice(0,3); if(c[3]<1) f=f.map((v,j)=>v*c[3]+bg.col[j]*(1-c[3])); const k=ratio(f,bg.col); if(k<4.5) out.push(`placeholder ${k.toFixed(2)}:1 ${i.id||i.name}`);} }
        if(window.__UJI){out.push('UJI');} return {out, sw: document.documentElement.scrollWidth, cek, img};
      });
      const tag=`${scheme} ${w} ${pg}`;
      if (res.sw>w) console.log(tag,'SCROLL HORIZONTAL',res.sw);
      console.log(tag,'dicek',res.cek,'latar gambar',res.img.length, res.img.slice(0,4).join(' | ')); res.out.forEach(o=>console.log(tag,o)); total+=res.out.length;
    }
    if (errs.length) console.log(scheme,w,'JS errors',errs);
    await ctx.close();
  }
  // Garis fokus keyboard, mode gelap & terang, 390px & 1280px.
  // 17 Nov 09.xx (Dewi & Tegar): Tab sampai habis (sampai fokus kembali ke elemen pertama / keluar halaman, maks. 400×),
  // termasuk keadaan: hasil Radar UNTR, kuis terjawab, kotak istilah terbuka. Kotak tanya Asisten memakai warna border
  // sebagai tanda fokus: border wajib ≥3:1 terhadap latar di sekitarnya DAN berubah ≥3:1 dibanding saat tidak terfokus.
  // Uji balik: UJI-FOKUS (outline dimatikan) dan UJI-FOKUS-BORDER (border fokus kotak tanya disamakan dengan border biasa).
  let totalFokus=0, ujiFokus=0, ujiBorder=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, colorScheme:scheme });
    const p = await ctx.newPage();
    for (const pg of halamanFokus) {
      const [path,hash]=pg.split('#');
      await p.goto('http://localhost:8765/'+(path==='UJI-FOKUS'?'index.html':path==='UJI-FOKUS-BORDER'?'asisten.html':path)); await p.waitForTimeout(300);
      // 17 Nov 13.xx (Dewi): gulir halus (profil, Peringkat, Kabar) dimatikan; tanpa ini elemen yang baru difokus kadang masih di
      // luar layar saat diukur, latar diambil dari titik yang salah → temuan palsu (select.pilih-banding 2,38:1 di profil 1280px)
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      if (path==='UJI-FOKUS') await p.addStyleTag({content:'*:focus,*:focus-visible{outline:none!important;box-shadow:none!important}'});
      if (path==='UJI-FOKUS-BORDER') await p.addStyleTag({content:'.form-tanya textarea:focus{border-color:var(--garis-kontrol)!important}'});
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      // Asisten di lingkungan uji "belum aktif" (kotak tanya dinonaktifkan): aktifkan agar kotak tanya ikut diperiksa
      if (path==='asisten.html'||path==='UJI-FOKUS-BORDER') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('.istilah, [data-istilah], button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} else console.log('tombol istilah tidak ketemu'); }
      // mulai Tab dari awal dokumen (kecuali kotak istilah: mulai dari tombol istilah yang terbuka)
      if (hash!=='istilah') await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
      // warna border kotak tanya saat tidak terfokus (pembanding perubahan border)
      const borderBiasa = await p.evaluate(()=>{ const t=document.querySelector('.form-tanya textarea'); return t?getComputedStyle(t).borderTopColor:null; });
      const temuan=new Map(); let dicek=0, pertama=null, langkah=0;
      for (; langkah<400; langkah++) {
        await p.keyboard.press('Tab'); await p.waitForTimeout(40);
        const r = await p.evaluate((borderBiasa) => {
          const el=document.activeElement; if(!el||el===document.body) return {habis:true};
          if(!window.__idFokus) window.__idFokus=new WeakMap(), window.__nFokus=0;
          if(!window.__idFokus.has(el)) window.__idFokus.set(el,++window.__nFokus);
          const id=window.__idFokus.get(el);
          const parse = c => { const m = c&&c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [a[0],a[1],a[2],a[3]===undefined?1:a[3]]; };
          const lum = ([r,g,b]) => { const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
          const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
          const bgOf = e0 => { for(let e=e0;e;e=e.parentElement){ const c=parse(getComputedStyle(e).backgroundColor); if(c&&c[3]>=0.99) return c.slice(0,3);} return parse(getComputedStyle(document.body).backgroundColor).slice(0,3); };
          const cs=getComputedStyle(el); const nama=el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')+(el.getAttribute('aria-current')?'[aktif]':'')+' "'+(el.textContent||el.getAttribute('aria-label')||el.id||'').trim().slice(0,30)+'"';
          const rc=el.getBoundingClientRect(); if(rc.width===0&&rc.height===0) return {id, nama, k:99, jenis:'tak terlihat (dilewati)'};
          const ow=parseFloat(cs.outlineWidth)||0;
          // latar tepat di luar elemen, diambil dari titik di samping kiri (atau kanan) garis fokus, bukan induk DOM
          const jarak=(ow||3)+(parseFloat(cs.outlineOffset)||0)+1;
          let x=rc.left-jarak; if(x<0) x=rc.right+jarak; const y=Math.min(Math.max(rc.top+rc.height/2,0),innerHeight-1);
          const di=document.elementsFromPoint(Math.min(x,innerWidth-1),y).find(e=>e!==el&&!el.contains(e));
          const luar=bgOf(di||el.parentElement||el);
          if (cs.outlineStyle!=='none' && ow>=2 && (parseFloat(cs.outlineOffset)||0)<=-ow) { const oc=parse(cs.outlineColor); return {id, nama, k:ratio(oc.slice(0,3),bgOf(el)), jenis:'outline dalam '+ow+'px'}; }
          if (cs.outlineStyle!=='none' && ow>=2) { const oc=parse(cs.outlineColor); return {id, nama, k:ratio(oc.slice(0,3),luar), jenis:'outline '+ow+'px'}; }
          if (cs.boxShadow && cs.boxShadow!=='none') { const sc=parse(cs.boxShadow); if (sc) return {id, nama, k:ratio(sc.slice(0,3),luar), jenis:'box-shadow'}; }
          const bc=parse(cs.borderTopColor); const bw=parseFloat(cs.borderTopWidth)||0;
          if (bw>=2 && bc) { const kLuar=ratio(bc.slice(0,3),luar); const bb=el.matches('.form-tanya textarea')?parse(borderBiasa):null;
            const kUbah=bb?ratio(bc.slice(0,3),bb.slice(0,3)):99; return {id, nama, k:Math.min(kLuar,kUbah), jenis:'border '+bw+'px (latar '+kLuar.toFixed(2)+', berubah '+(kUbah===99?'-':kUbah.toFixed(2))+')'}; }
          return {id, nama, k:0, jenis:'tanpa garis fokus'};
        }, borderBiasa);
        if (r.habis) { if (pertama!==null) break; else continue; }
        if (pertama===null) pertama=r.id; else if (r.id===pertama) break;
        dicek++;
        if (r.k<3 && !temuan.has(r.nama)) temuan.set(r.nama, `${r.jenis} ${r.k.toFixed(2)}:1 ${r.nama}`);
      }
      const tag=`fokus ${scheme} ${w} ${pg}`;
      console.log(tag,'dicek',dicek,'langkah Tab',langkah+1); [...temuan.values()].forEach(o=>console.log(tag,o));
      if (path==='UJI-FOKUS') ujiFokus+=temuan.size; else if (path==='UJI-FOKUS-BORDER') ujiBorder+=temuan.size; else totalFokus+=temuan.size;
    }
    await ctx.close();
  }
  console.log('total temuan fokus',totalFokus,'(uji balik UJI-FOKUS tertangkap:',ujiFokus,'; UJI-FOKUS-BORDER tertangkap:',ujiBorder,')');
  // 17 Nov 10.xx (Dewi & Nina): fokus tidak boleh tertutup elemen lengket/menumpuk (WCAG 2.2, 2.4.11 Focus Not Obscured).
  // Tab maju lalu Shift+Tab mundur sampai habis; setelah peramban menggulir elemen ke layar, 9 titik di dalam elemen
  // dicek dengan elementsFromPoint: bila elemen teratas di titik itu bukan elemen terfokus (atau isinya) dan berasal
  // dari elemen sticky/fixed → titik tertutup. Semua 9 titik tertutup = temuan (2.4.11); sebagian = catatan (2.4.12, AAA).
  // Uji balik: UJI-TUTUP memasang lapisan fixed setinggi layar di atas halaman; audit wajib menangkapnya.
  // 17 Nov 13.xx (Dewi & Nina): + Kabar, Belajar (Kamus istilah: daftar biasa, tanpa tombol istilah melayang), pelajaran (kuis terjawab), Asisten, 404.
  const halamanTutup = ['peringkat.html','peringkat.html#istilah','metodologi.html','radar.html#UNTR','emiten.html?kode=ANTM','index.html',
    'kabar.html','belajar.html','pelajaran.html?m=apa-itu-saham#benar','asisten.html','404.html','UJI-TUTUP'];
  let totalTutup=0, ujiTutup=0, catatanTutup=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:700}, colorScheme:scheme });
    const p = await ctx.newPage();
    for (const pg of halamanTutup) {
      const [path,hash]=pg.split('#');
      await p.goto('http://localhost:8765/'+(path==='UJI-TUTUP'?'peringkat.html':path)); await p.waitForTimeout(300);
      // gulir halus (scroll-behavior: smooth) dimatikan agar posisi akhir langsung terbaca; posisi akhirnya sama
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      if (path==='UJI-TUTUP') await p.addStyleTag({content:'body::after{content:"";position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.01)}'});
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); }
      if (path==='asisten.html') await p.evaluate(()=>{ document.querySelectorAll('.form-tanya textarea, .form-tanya button').forEach(e=>e.disabled=false); });
      if (hash==='benar'){ const id=new URL('http://x/'+path).searchParams.get('m');
        await p.evaluate((id)=>{ const m=window.MODUL.find(x=>x.id===id); m.kuis.forEach((q,i)=>{ document.querySelector('input[name="soal-'+i+'"][value="'+q.benar+'"]').checked=true; }); },id);
        await p.click('.kuis button[type="submit"]'); await p.waitForTimeout(200); }
      if (hash==='istilah'){ const t=await p.$('button.istilah'); if(t){await t.click(); await p.waitForTimeout(200);} else console.log('tutup',pg,'tombol istilah tidak ketemu'); }
      else await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); window.scrollTo(0,0); });
      const {temuan, sebagian, dicek} = await tabTutup(p);
      const tag=`tutup ${scheme} ${w} ${pg}`;
      console.log(tag,'dicek',dicek); [...temuan.values()].forEach(o=>console.log(tag,'TEMUAN',o)); [...sebagian.values()].forEach(o=>console.log(tag,'sebagian',o));
      if (path==='UJI-TUTUP') ujiTutup+=temuan.size; else { totalTutup+=temuan.size; catatanTutup+=sebagian.size; }
    }
    await ctx.close();
  }
  console.log('total temuan tertutup',totalTutup,'(sebagian tertutup:',catatanTutup,'; uji balik UJI-TUTUP tertangkap:',ujiTutup,')');
  // 17 Nov 13.xx (Dewi & Nina): tombol "Kembali ke atas" (.ke-atas) di Peringkat & Kabar. Dari bawah halaman, Tab ke tautan,
  // tekan Enter: awal isi (#isi) harus kembali tampil di layar dan tidak tertutup elemen lengket; tautan tidak boleh tertutup.
  // Uji balik UJI-KEATAS: tujuan tautan diganti ke id yang tidak ada → halaman tidak bergulir → wajib tertangkap.
  let totalAtas=0, ujiAtas=0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:700}, colorScheme:scheme });
    const p = await ctx.newPage();
    for (const pg of ['peringkat.html','kabar.html','UJI-KEATAS']) {
      await p.goto('http://localhost:8765/'+(pg==='UJI-KEATAS'?'kabar.html':pg)); await p.waitForTimeout(300);
      await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      if (pg==='UJI-KEATAS') await p.evaluate(()=>document.querySelectorAll('.ke-atas').forEach(a=>a.setAttribute('href','#tidak-ada')));
      const ada = await p.$('.ke-atas'); const tag=`ke-atas ${scheme} ${w} ${pg}`;
      if (!ada) { console.log(tag,'TEMUAN tautan .ke-atas tidak ada'); if(pg==='UJI-KEATAS') ujiAtas++; else totalAtas++; continue; }
      await p.evaluate(()=>{ window.scrollTo(0,document.documentElement.scrollHeight); document.querySelector('.ke-atas').focus(); });
      const r0 = await p.evaluate(()=>{ const rc=document.querySelector('.ke-atas').getBoundingClientRect(); return rc.top>=0&&rc.bottom<=innerHeight; });
      await p.keyboard.press('Enter'); await p.waitForTimeout(200);
      const r = await p.evaluate(()=>{
        const t=document.getElementById('isi'); if(!t) return {masalah:'#isi tidak ada'};
        const rc=t.getBoundingClientRect(); let lengket=0;
        document.querySelectorAll('body *').forEach(e=>{ const ps=getComputedStyle(e).position; if((ps==='sticky'||ps==='fixed')&&!e.contains(t)){ const r2=e.getBoundingClientRect(); if(r2.height>0&&r2.top<=1&&r2.bottom>lengket&&r2.bottom<innerHeight/2) lengket=r2.bottom; } });
        const masalah=[]; if(rc.top<-1||rc.top>innerHeight*0.5) masalah.push('awal isi tidak tampil (top '+Math.round(rc.top)+'px, scrollY '+Math.round(scrollY)+')');
        if(rc.top<lengket-1) masalah.push('awal isi tertutup elemen lengket (top '+Math.round(rc.top)+' < '+Math.round(lengket)+')');
        return {masalah:masalah.join('; '), scrollY:Math.round(scrollY)};
      });
      const masalah=[!r0&&'tautan .ke-atas tidak tampil penuh saat terfokus', r.masalah].filter(Boolean).join('; ');
      console.log(tag, masalah?'TEMUAN '+masalah:'lolos (scrollY sesudah Enter '+r.scrollY+')');
      if (masalah) { if(pg==='UJI-KEATAS') ujiAtas++; else totalAtas++; }
    }
    await ctx.close();
  }
  console.log('total temuan ke-atas',totalAtas,'(uji balik UJI-KEATAS tertangkap:',ujiAtas,')');
  await auditTeks(b);
  await auditZoom(b);
  await auditJarak(b);
  await auditOrientasi(b);
  await auditSentuh(b);
  await auditSorot(b);
  await auditLabel(b);
  await auditStatus(b);
  await auditJudul(b);
  await auditBahasa(b);
  await auditUrutan(b);
  await auditIsian(b);
  await auditNonteks(b);
  await auditWarna(b);
  await auditTautan(b);
  await auditKonsisten(b);
  await auditPenunjuk(b);
  await auditGerak(b);
  await auditAnimasi(b);
  console.log('total temuan',total); await b.close();
})();
