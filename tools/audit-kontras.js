// Dewi & Kirana (12 Nov 10.08): audit kontras otomatis (WCAG AA: 4,5:1 teks biasa, 3:1 teks besar).
// Memeriksa semua teks terlihat + teks contoh (placeholder) di 7 halaman, mode gelap & terang, lebar 390px & 1280px,
// termasuk hasil Radar 4 emiten, kotak istilah terbuka, semua <details> terbuka, contoh pesan Asisten & pesan galat.
// Halaman "UJI" sengaja memasang judul abu di atas abu; audit wajib menangkapnya (uji balik), jadi hasil sehat = tepat 4 temuan UJI.
// Cara pakai: python3 -m http.server 8765 (di akar repo), lalu: node tools/audit-kontras.js
// Butuh Playwright + Chromium (sudah ada di lingkungan kerja tim); tidak dijalankan oleh tests/cek.mjs.
const { chromium } = require('playwright');
const pages = ['radar.html#UNTR','radar.html#INTP','radar.html#TPIA','radar.html#HEAL','peringkat.html#istilah','asisten.html#jawab','UJI','peringkat.html','radar.html','emiten.html?kode=ANTM','emiten.html?kode=TPIA','kabar.html','metodologi.html','asisten.html'];
(async () => {
  const b = await chromium.launch();
  let total = 0;
  for (const scheme of ['dark','light']) for (const w of [390,1280]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, colorScheme:scheme });
    const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
    for (const pg of pages) {
      const [path,hash]=pg.split('#'); await p.goto('http://localhost:8765/'+(path==='UJI'?'peringkat.html':path)); await p.waitForTimeout(400);
      if (path==='UJI') await p.addStyleTag({content:'h1{color:#999!important;background:#aaa!important}'});
      if (path==='radar.html'&&hash){ await p.selectOption('#pilih-saham',hash); await p.waitForTimeout(300); console.log('radar',hash, await p.$eval('#hasil-radar h2',x=>x.textContent)); }
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
  console.log('total temuan',total); await b.close();
})();
