// Dewi & Kirana (12 Nov 10.08): audit kontras otomatis (WCAG AA: 4,5:1 teks biasa, 3:1 teks besar).
// Memeriksa semua teks terlihat + teks contoh (placeholder) di 10 halaman (17 Nov: + beranda, Belajar, pelajaran dengan kuis terjawab benar & salah, 404), mode gelap & terang, lebar 390px & 1280px,
// termasuk hasil Radar 4 emiten, kotak istilah terbuka, semua <details> terbuka, contoh pesan Asisten & pesan galat.
// Halaman "UJI" sengaja memasang judul abu di atas abu; audit wajib menangkapnya (uji balik), jadi hasil sehat = tepat 4 temuan UJI.
// 17 Nov 08.xx (Dewi & Kirana): juga cek garis fokus keyboard: Tab 10× per halaman; tiap elemen yang terfokus wajib punya
// garis fokus terlihat (outline ≥2px, atau box-shadow/border berubah) dengan kontras ≥3:1 terhadap latar di sekitarnya.
// Halaman "UJI-FOKUS" sengaja mematikan outline; audit wajib menangkapnya (uji balik).
// 17 Nov 09.xx (Dewi & Tegar): Tab sampai habis, + keadaan istilah terbuka, hasil Radar UNTR, kuis terjawab; cek border kotak tanya Asisten.
// Cara pakai: python3 -m http.server 8765 (di akar repo), lalu: node tools/audit-kontras.js (AUDIT=fokus: hanya garis fokus)
// Butuh Playwright + Chromium (sudah ada di lingkungan kerja tim); tidak dijalankan oleh tests/cek.mjs.
const { chromium } = require('playwright');
const pages = ['radar.html#UNTR','radar.html#INTP','radar.html#TPIA','radar.html#HEAL','peringkat.html#istilah','asisten.html#jawab','UJI','peringkat.html','radar.html','emiten.html?kode=ANTM','emiten.html?kode=TPIA','kabar.html','metodologi.html','asisten.html',
  'index.html','belajar.html','pelajaran.html?m=apa-itu-saham#benar','pelajaran.html?m=saham-syariah#salah','404.html'];
const halamanFokus = ['index.html','peringkat.html','peringkat.html#istilah','radar.html','radar.html#UNTR','emiten.html?kode=ANTM','kabar.html','belajar.html','pelajaran.html?m=apa-itu-saham','pelajaran.html?m=apa-itu-saham#benar','metodologi.html','asisten.html','404.html','UJI-FOKUS','UJI-FOKUS-BORDER'];
(async () => {
  const b = await chromium.launch();
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
  console.log('total temuan',total); await b.close();
})();
