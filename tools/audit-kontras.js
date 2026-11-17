// Dewi & Kirana (12 Nov 10.08): audit kontras otomatis (WCAG AA: 4,5:1 teks biasa, 3:1 teks besar).
// Memeriksa semua teks terlihat + teks contoh (placeholder) di 10 halaman (17 Nov: + beranda, Belajar, pelajaran dengan kuis terjawab benar & salah, 404), mode gelap & terang, lebar 390px & 1280px,
// termasuk hasil Radar 4 emiten, kotak istilah terbuka, semua <details> terbuka, contoh pesan Asisten & pesan galat.
// Halaman "UJI" sengaja memasang judul abu di atas abu; audit wajib menangkapnya (uji balik), jadi hasil sehat = tepat 4 temuan UJI.
// 17 Nov 08.xx (Dewi & Kirana): juga cek garis fokus keyboard: Tab 10× per halaman; tiap elemen yang terfokus wajib punya
// garis fokus terlihat (outline ≥2px, atau box-shadow/border berubah) dengan kontras ≥3:1 terhadap latar di sekitarnya.
// Halaman "UJI-FOKUS" sengaja mematikan outline; audit wajib menangkapnya (uji balik).
// 17 Nov 09.xx (Dewi & Tegar): Tab sampai habis, + keadaan istilah terbuka, hasil Radar UNTR, kuis terjawab; cek border kotak tanya Asisten.
// Cara pakai: python3 -m http.server 8765 (di akar repo), lalu: node tools/audit-kontras.js (AUDIT=fokus: hanya garis fokus & fokus tertutup; AUDIT=zoom: hanya zoom 200% & layar pendek HP; AUDIT=jarak: hanya jarak teks WCAG 1.4.12; AUDIT=orientasi: hanya orientasi layar WCAG 1.3.4; AUDIT=sentuh: hanya ukuran sasaran sentuh WCAG 2.5.8)
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
      if (path==='UJI-FOKUS-BORDER') await p.addStyleTag({content:'.form-tanya textarea:focus{border-color:var(--garis)!important}'});
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
  await auditZoom(b);
  await auditJarak(b);
  await auditOrientasi(b);
  await auditSentuh(b);
  console.log('total temuan',total); await b.close();
})();
