/* Candra Analis — logika halaman (tanpa framework, tanpa build).
   Setiap fungsi hanya berjalan bila elemen tujuannya ada di halaman. */
(function () {
  "use strict";

  var MODUL = window.MODUL || [];
  // Data asli (tim Fajar). Hanya emiten yang barisnya ditemukan di Daftar Efek Syariah OJK.
  var EMITEN = window.EMITEN_ASLI || [];
  var DES_LABEL = "Daftar Efek Syariah OJK periode I 2026 (KEP-21/D.04/2026, berlaku 1 Juni 2026)";

  /* ---------- Utilitas ---------- */
  var angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
  var angka2 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

  function el(tag, attrs, isi) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (isi || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  // Miliar rupiah → teks ringkas (M = miliar, T = triliun)
  function rupiahMiliar(m) {
    var neg = m < 0, a = Math.abs(m);
    var t = a >= 1000 ? "Rp" + angka2.format(a / 1000) + " T" : "Rp" + angka.format(a) + " M";
    return neg ? "−" + t : t;
  }
  function persen(p) { return (p < 0 ? "−" : "") + angka.format(Math.abs(p)) + "%"; }
  function ada(v) { return typeof v === "number" && isFinite(v); }
  function tumbuh(a, b) { return ada(a) && ada(b) && a !== 0 ? (b - a) / Math.abs(a) * 100 : null; }
  // Rumus tim Galih: semua dari angka tahun buku 2025 di sumber
  function laba25(e) { return e.labaTahun ? e.labaTahun[2025] : null; }
  function tumbuhLaba(e) { return e.labaTahun ? tumbuh(e.labaTahun[2024], e.labaTahun[2025]) : null; }
  function tumbuhPendapatan(e) { return e.pendapatan ? tumbuh(e.pendapatan[2024], e.pendapatan[2025]) : null; }
  function roe(e) { return ada(laba25(e)) && ada(e.ekuitas2025) && e.ekuitas2025 > 0 ? laba25(e) / e.ekuitas2025 * 100 : null; }
  function der(e) { return ada(e.liabilitas2025) && ada(e.ekuitas2025) && e.ekuitas2025 > 0 ? e.liabilitas2025 / e.ekuitas2025 : null; }
  function syariahAktif(e) { return ada(e.desBaris) && !e.keluarDES; }
  function strip(v, f) { return ada(v) ? f(v) : "–"; }

  function selKode(e) {
    return el("td", null, [el("span", { class: "kode", text: e.kode }), el("span", { class: "nama-emiten", text: e.nama })]);
  }

  function pitaSumber(wadah) {
    if (!wadah) return;
    wadah.appendChild(el("div", { class: "pita-sumber", role: "note" }, [
      el("strong", { text: EMITEN.length + " emiten syariah. " }),
      "Angka tahun buku 2024–2025 dari laporan keuangan emiten sebagaimana diberitakan media; tiap emiten punya tautan sumber. Status syariah: " + DES_LABEL + ". Angka yang belum bisa dipastikan sengaja dikosongkan (–)."
    ]));
  }
  function tautanSumber(e) {
    var s = (e.sumber || [])[0];
    return s ? el("a", { href: s.url, target: "_blank", rel: "noopener", text: "Sumber" }) : document.createTextNode("–");
  }

  /* ---------- Jalur belajar ---------- */
  function renderJalur(id, lengkap) {
    var ol = document.getElementById(id);
    if (!ol) return;
    MODUL.forEach(function (m, i) {
      var li = el("li", { "data-no": String(i + 1) }, [
        el("h3", null, [el("a", { href: "pelajaran.html?m=" + m.id, text: m.judul })]),
        el("p", { text: m.ringkas }),
        lengkap ? el("span", { class: "durasi", text: m.durasi }) : null
      ]);
      ol.appendChild(li);
    });
  }

  /* ---------- Halaman pelajaran ---------- */
  function renderPelajaran() {
    var wadah = document.getElementById("isi-pelajaran");
    if (!wadah) return;
    var id = new URLSearchParams(location.search).get("m");
    var idx = MODUL.findIndex(function (m) { return m.id === id; });
    if (idx < 0) idx = 0;
    var m = MODUL[idx];

    document.title = m.judul + " · Belajar · Candra Analis";
    document.getElementById("judul-pelajaran").textContent = m.judul;
    document.getElementById("sub-pelajaran").textContent =
      "Pelajaran " + (idx + 1) + " dari " + MODUL.length + " · " + m.durasi;

    wadah.innerHTML = m.isi; // isi berasal dari file kurikulum kita sendiri

    var nav = el("nav", { class: "navigasi-pelajaran", "aria-label": "Pelajaran lain" });
    nav.appendChild(idx > 0
      ? el("a", { href: "pelajaran.html?m=" + MODUL[idx - 1].id, text: "Sebelumnya: " + MODUL[idx - 1].judul })
      : el("a", { href: "belajar.html", text: "Kembali ke daftar pelajaran" }));
    nav.appendChild(idx < MODUL.length - 1
      ? el("a", { href: "pelajaran.html?m=" + MODUL[idx + 1].id, text: "Berikutnya: " + MODUL[idx + 1].judul })
      : el("a", { href: "peringkat.html", text: "Selesai. Coba baca tabel peringkat" }));
    wadah.appendChild(nav);
  }

  /* ---------- Peringkat (tim Galih) ---------- */
  var KRITERIA = {
    laba: {
      label: "Laba bersih terbesar", nilai: laba25, tampil: rupiahMiliar, kolom: "Laba 2025",
      metode: "Laba bersih tahun buku 2025."
    },
    tumbuhLaba: {
      label: "Pertumbuhan laba", nilai: tumbuhLaba, tampil: persen, kolom: "Laba 2025 vs 2024",
      metode: "Perubahan laba bersih 2025 dibanding 2024."
    },
    tumbuh: {
      label: "Pertumbuhan pendapatan", nilai: tumbuhPendapatan, tampil: persen, kolom: "Pendapatan 2025 vs 2024",
      metode: "Perubahan pendapatan 2025 dibanding 2024."
    },
    roe: {
      label: "ROE tertinggi", nilai: roe, tampil: persen, kolom: "ROE 2025",
      metode: "Laba bersih 2025 dibagi total ekuitas akhir 2025. Mengukur efisiensi memakai modal."
    }
  };

  // Emiten bertanda periksaUlang tidak ikut diperingkat sampai angkanya dipastikan (aturan Hana).
  function peserta(kunci) {
    var k = KRITERIA[kunci];
    return EMITEN.filter(function (e) { return syariahAktif(e) && !e.periksaUlang && ada(k.nilai(e)); });
  }
  function urutkan(kunci) {
    var k = KRITERIA[kunci];
    return peserta(kunci).sort(function (a, b) { return k.nilai(b) - k.nilai(a); }).slice(0, 10);
  }

  function renderMini() {
    var tb = document.getElementById("mini-peringkat");
    if (!tb) return;
    urutkan("laba").slice(0, 3).forEach(function (e, i) {
      tb.appendChild(el("tr", null, [
        el("td", { class: "peringkat-no", text: String(i + 1) }),
        selKode(e),
        el("td", { class: "angka", text: rupiahMiliar(laba25(e)) })
      ]));
    });
  }

  function renderPeringkat() {
    var akar = document.getElementById("peringkat");
    if (!akar) return;
    pitaSumber(document.getElementById("pita"));

    var tabBaris = el("div", { class: "tab-baris", role: "tablist", "aria-label": "Pilih dasar peringkat" });
    var panel = el("div", { role: "tabpanel", id: "panel-peringkat" });
    akar.appendChild(tabBaris);
    akar.appendChild(panel);

    function tampilkan(kunci) {
      Array.prototype.forEach.call(tabBaris.children, function (t) {
        t.setAttribute("aria-selected", String(t.dataset.k === kunci));
        t.tabIndex = t.dataset.k === kunci ? 0 : -1;
      });
      var k = KRITERIA[kunci];
      panel.setAttribute("aria-labelledby", "tab-" + kunci);
      panel.innerHTML = "";
      var daftar = urutkan(kunci);
      var tbody = el("tbody");
      daftar.forEach(function (e, i) {
        var g = tumbuhPendapatan(e);
        tbody.appendChild(el("tr", null, [
          el("td", { class: "peringkat-no", text: String(i + 1) }),
          selKode(e),
          el("td", { class: "sel-sektor", "data-label": "Sektor", text: e.sektor }),
          el("td", { class: "angka sel-utama", "data-label": k.kolom, text: k.tampil(k.nilai(e)) }),
          kunci === "laba" ? null : el("td", { class: "angka", "data-label": "Laba 2025", text: strip(laba25(e), rupiahMiliar) }),
          kunci === "tumbuh" ? null : el("td", { class: "angka " + (ada(g) ? (g >= 0 ? "naik" : "turun") : ""), "data-label": "Pendapatan YoY", text: strip(g, persen) }),
          el("td", { class: "angka", "data-label": "DER", text: strip(der(e), function (v) { return angka.format(v) + "x"; }) }),
          el("td", { class: "sel-sumber", "data-label": "Data" }, [tautanSumber(e)])
        ]));
      });
      panel.appendChild(el("div", { class: "tabel-wadah" }, [
        el("table", { class: "tabel-kartu" }, [
          el("caption", { class: "keterangan-tabel", text: (daftar.length < 10 ? daftar.length : "Sepuluh") + " saham syariah teratas: " + k.label.toLowerCase() }),
          el("thead", null, [el("tr", null, [
            el("th", { scope: "col", text: "#" }),
            el("th", { scope: "col", text: "Emiten" }),
            el("th", { scope: "col", text: "Sektor" }),
            el("th", { scope: "col", class: "angka", text: k.kolom }),
            kunci === "laba" ? null : el("th", { scope: "col", class: "angka", text: "Laba 2025" }),
            kunci === "tumbuh" ? null : el("th", { scope: "col", class: "angka", text: "Pendapatan YoY" }),
            el("th", { scope: "col", class: "angka", text: "DER" }),
            el("th", { scope: "col", text: "Data" })
          ])]),
          tbody
        ])
      ]));
      var keluar = EMITEN.filter(function (e) { return syariahAktif(e) && (e.periksaUlang || !ada(k.nilai(e))); })
        .map(function (e) { return e.kode; });
      panel.appendChild(el("p", { class: "catatan-metode", style: "margin-top:12px" },
        ["Cara menghitung: " + k.metode + " Hanya emiten yang tercatat di Daftar Efek Syariah. Urutan ini menggambarkan data, bukan saran membeli." +
          (keluar.length ? " Belum ikut diperingkat karena angkanya kosong atau sedang dicek ulang: " + keluar.join(", ") + "." : "")]));
    }

    Object.keys(KRITERIA).forEach(function (kunci) {
      var t = el("button", { class: "tab", type: "button", role: "tab", id: "tab-" + kunci, "aria-controls": "panel-peringkat", text: KRITERIA[kunci].label });
      t.dataset.k = kunci;
      t.addEventListener("click", function () { tampilkan(kunci); });
      t.addEventListener("keydown", function (ev) {
        var kunciList = Object.keys(KRITERIA), i = kunciList.indexOf(kunci);
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          var j = (i + (ev.key === "ArrowRight" ? 1 : -1) + kunciList.length) % kunciList.length;
          tampilkan(kunciList[j]);
          tabBaris.children[j].focus();
        }
      });
      tabBaris.appendChild(t);
    });
    tampilkan("laba");
  }

  /* ---------- Radar Risiko (tim Galih) ---------- */
  // Mengembalikan daftar sinyal { tingkat: tinggi|sedang|info|aman, judul, isi, bukti }
  function periksa(e) {
    var s = [];
    var L = e.labaTahun || {}, P = e.pendapatan || {};

    if (e.keluarDES) s.push({ tingkat: "tinggi", judul: "Tidak lagi tercatat sebagai saham syariah",
      isi: "Emiten ini tidak ada di Daftar Efek Syariah periode terbaru.", bukti: "Sumber: " + DES_LABEL + "." });

    if (e.suspensi) s.push({ tingkat: "tinggi", judul: "Perdagangan sedang dihentikan sementara",
      isi: "Bursa menghentikan sementara perdagangan saham ini.", bukti: "Sumber: pengumuman Bursa Efek Indonesia." });

    if (ada(L[2025]) && L[2025] < 0) s.push({ tingkat: "tinggi", judul: "Merugi pada 2025",
      isi: "Perusahaan mencatat rugi bersih pada tahun buku 2025.", bukti: "Laba 2025: " + rupiahMiliar(L[2025]) + "." });

    var gl = tumbuhLaba(e);
    if (ada(gl) && gl <= -50) s.push({ tingkat: "tinggi", judul: "Laba turun lebih dari separuh",
      isi: "Laba bersih 2025 turun tajam dibanding 2024.",
      bukti: "Laba: " + rupiahMiliar(L[2024]) + " (2024) → " + rupiahMiliar(L[2025]) + " (2025), " + persen(gl) + "." });
    else if (ada(gl) && gl < 0) s.push({ tingkat: "sedang", judul: "Laba menurun",
      isi: "Laba bersih 2025 lebih rendah daripada 2024.",
      bukti: "Laba: " + rupiahMiliar(L[2024]) + " (2024) → " + rupiahMiliar(L[2025]) + " (2025), " + persen(gl) + "." });

    var gp = tumbuhPendapatan(e);
    if (ada(gp) && gp < 0) s.push({ tingkat: "sedang", judul: "Pendapatan menurun",
      isi: "Penjualan 2025 lebih rendah daripada 2024.",
      bukti: "Pendapatan: " + rupiahMiliar(P[2024]) + " → " + rupiahMiliar(P[2025]) + " (" + persen(gp) + ")." });

    var d = der(e);
    if (ada(d) && d > 2) s.push({ tingkat: "sedang", judul: "Utang tinggi dibanding modal",
      isi: "Total liabilitas lebih dari dua kali ekuitas. Beban kewajiban bisa menekan laba saat kondisi sulit.",
      bukti: "DER akhir 2025: " + angka.format(d) + "x." });

    if (e.catatan) s.push({ tingkat: "info", judul: "Catatan data dari tim kami",
      isi: e.catatan, bukti: "Angka bertanda catatan sedang dicek ke laporan keuangan resmi." });

    if (!s.some(function (x) { return x.tingkat !== "info"; })) s.push({ tingkat: "aman", judul: "Tidak ada tanda risiko dari pemeriksaan ini",
      isi: "Laba, pendapatan, utang, dan status syariah tidak menunjukkan tanda yang kami pantau.",
      bukti: "Tetap pantau laporan kuartal berikutnya." });

    var urut = { tinggi: 0, sedang: 1, info: 2, aman: 3 };
    return s.sort(function (a, b) { return urut[a.tingkat] - urut[b.tingkat]; });
  }

  function renderRadar() {
    var akar = document.getElementById("radar");
    if (!akar) return;
    pitaSumber(document.getElementById("pita"));

    var pilih = el("select", { id: "pilih-saham" });
    pilih.appendChild(el("option", { value: "", text: "Pilih kode saham" }));
    EMITEN.slice().sort(function (a, b) { return a.kode.localeCompare(b.kode); }).forEach(function (e) {
      pilih.appendChild(el("option", { value: e.kode, text: e.kode + " · " + e.nama }));
    });
    var form = el("div", { class: "radar-form" }, [
      el("label", { for: "pilih-saham", text: "Saham yang Anda pegang" }), pilih
    ]);
    var hasil = el("div", { id: "hasil-radar", "aria-live": "polite" });
    akar.appendChild(form);
    akar.appendChild(hasil);

    function tampil() {
      hasil.innerHTML = "";
      var e = EMITEN.find(function (x) { return x.kode === pilih.value; });
      if (!e) {
        hasil.appendChild(el("p", { class: "catatan-metode", text: "Pilih satu kode saham untuk melihat hasil pemeriksaan. Saham yang belum ada di daftar sedang dikumpulkan datanya." }));
        return;
      }
      var s = periksa(e);
      var jml = s.filter(function (x) { return x.tingkat === "tinggi" || x.tingkat === "sedang"; }).length;
      hasil.appendChild(el("h2", { style: "font-size:1.35rem", text: e.kode + ": " + (jml ? jml + " tanda yang perlu Anda perhatikan" : "tidak ada tanda risiko") }));
      hasil.appendChild(el("p", { class: "catatan-metode", text: "Tercatat di " + DES_LABEL + ", baris " + e.desBaris + "." }));
      var ul = el("ul", { class: "sinyal-daftar" });
      s.forEach(function (x) {
        ul.appendChild(el("li", { class: "sinyal sinyal-" + x.tingkat }, [
          el("h4", { text: x.judul }), el("p", { text: x.isi }), el("p", { class: "bukti", text: x.bukti })
        ]));
      });
      hasil.appendChild(ul);
      var sumber = el("ul", { class: "daftar-sumber" });
      (e.sumber || []).forEach(function (x) {
        sumber.appendChild(el("li", null, [el("a", { href: x.url, target: "_blank", rel: "noopener", text: x.judul })]));
      });
      hasil.appendChild(el("h3", { style: "margin-top:20px;font-size:1.05rem", text: "Sumber data" }));
      hasil.appendChild(sumber);
      hasil.appendChild(el("p", { class: "catatan-metode", style: "margin-top:16px", text: "Radar menyajikan fakta dari data. Ini bukan perintah menjual atau mempertahankan saham. Keputusan ada di tangan Anda." }));
    }
    pilih.addEventListener("change", tampil);
    var awal = new URLSearchParams(location.search).get("kode");
    if (awal) pilih.value = awal.toUpperCase();
    tampil();
  }

  /* ---------- Rujukan belajar ---------- */
  function renderRujukan() {
    var akar = document.getElementById("rujukan");
    if (!akar || !window.RUJUKAN) return;
    window.RUJUKAN.forEach(function (k) {
      var ul = el("ul", { class: "rujukan-daftar" });
      k.item.forEach(function (r) {
        ul.appendChild(el("li", null, [
          el("a", { href: r.url, target: "_blank", rel: "noopener", text: r.judul }),
          el("p", { text: r.ket })
        ]));
      });
      akar.appendChild(el("div", { class: "rujukan-kelompok" }, [el("h3", { text: k.kelompok }), ul]));
    });
  }

  /* ---------- Asisten AI (tim Arif) ---------- */
  // Ubah teks jawaban (markdown sederhana) menjadi elemen yang aman: tanpa innerHTML dari server.
  function teksKeElemen(teks) {
    var wadah = el("div", { class: "jawaban-isi" });
    var daftar = null;
    function sebaris(str, tujuan) {
      str.split(/(\*\*[^*]+\*\*)/g).forEach(function (bag) {
        if (/^\*\*[^*]+\*\*$/.test(bag)) tujuan.appendChild(el("strong", { text: bag.slice(2, -2) }));
        else if (bag) tujuan.appendChild(document.createTextNode(bag));
      });
    }
    teks.split(/\n+/).forEach(function (baris) {
      baris = baris.trim();
      if (!baris) return;
      var poin = baris.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (poin) {
        if (!daftar) { daftar = el("ul"); wadah.appendChild(daftar); }
        var li = el("li"); sebaris(poin[1], li); daftar.appendChild(li);
      } else {
        daftar = null;
        var p = el("p"); sebaris(baris.replace(/^#+\s*/, ""), p); wadah.appendChild(p);
      }
    });
    return wadah;
  }

  function renderAsisten() {
    var akar = document.getElementById("asisten");
    if (!akar) return;
    var riwayat = [];
    var contoh = [
      "Apa bedanya saham syariah dan saham biasa?",
      "Bagaimana cara menghitung ROE? Beri contoh angka.",
      "Laba naik tapi harga saham turun, kenapa bisa begitu?",
      "Apa yang perlu saya periksa sebelum membeli saham pertama?"
    ];

    var status = el("div", { class: "pita-demo", role: "status", hidden: "hidden" });
    var log = el("div", { class: "obrolan", "aria-live": "polite", "aria-label": "Percakapan dengan asisten" });
    var chips = el("div", { class: "contoh-tanya" });
    var area = el("textarea", { id: "kotak-tanya", rows: "3", maxlength: "600", placeholder: "Tulis pertanyaan Anda" });
    var tombol = el("button", { class: "tombol tombol-gelap", type: "submit", text: "Kirim pertanyaan" });
    var hitung = el("span", { class: "hitung-karakter", text: "0/600" });
    var form = el("form", { class: "form-tanya" }, [
      el("label", { for: "kotak-tanya", class: "label-tanya", text: "Pertanyaan Anda" }),
      area, el("div", { class: "form-bawah" }, [hitung, tombol])
    ]);

    contoh.forEach(function (c) {
      var b = el("button", { type: "button", class: "chip", text: c });
      b.addEventListener("click", function () { area.value = c; area.focus(); perbaruiHitung(); });
      chips.appendChild(b);
    });

    akar.appendChild(status);
    akar.appendChild(log);
    akar.appendChild(el("p", { class: "label-tanya", text: "Coba tanyakan:" }));
    akar.appendChild(chips);
    akar.appendChild(form);
    akar.appendChild(el("p", { class: "catatan-metode", style: "margin-top:16px",
      text: "Asisten AI bisa keliru. Selalu cek angka di laporan keuangan resmi. Jawaban asisten bukan rekomendasi membeli atau menjual efek. Jangan menuliskan data pribadi seperti nomor KTP atau rekening." }));

    function perbaruiHitung() { hitung.textContent = area.value.length + "/600"; }
    area.addEventListener("input", perbaruiHitung);
    area.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });

    function tambahPesan(peran, isiEl) {
      var kelas = "pesan pesan-" + peran;
      var label = peran === "pengguna" ? "Anda" : "Asisten";
      var p = el("div", { class: kelas }, [el("span", { class: "pesan-label", text: label }), isiEl]);
      log.appendChild(p);
      p.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return p;
    }

    function setAktif(aktif, pesan) {
      area.disabled = !aktif; tombol.disabled = !aktif;
      if (pesan) { status.hidden = false; status.textContent = ""; status.appendChild(el("strong", { text: "Asisten belum aktif. " })); status.appendChild(document.createTextNode(pesan)); }
      else status.hidden = true;
    }

    fetch("api/tanya", { method: "GET" })
      .then(function (r) { return r.ok ? r.json() : { aktif: false }; })
      .then(function (d) { if (!d.aktif) setAktif(false, "Kami sedang menyiapkan layanan ini. Sementara itu, silakan pelajari materi di halaman Belajar."); })
      .catch(function () { setAktif(false, "Layanan asisten tidak bisa dihubungi dari halaman ini."); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = area.value.trim();
      if (!q || tombol.disabled) return;
      tambahPesan("pengguna", el("p", { text: q }));
      area.value = ""; perbaruiHitung();
      tombol.disabled = true; tombol.textContent = "Menunggu jawaban";
      var tunggu = tambahPesan("asisten", el("p", { class: "mengetik", text: "Sedang menyusun jawaban" }));

      fetch("api/tanya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pertanyaan: q, riwayat: riwayat })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (h) {
          tunggu.remove();
          if (h.ok && h.d.jawaban) {
            tambahPesan("asisten", teksKeElemen(h.d.jawaban));
            riwayat.push({ peran: "pengguna", teks: q }, { peran: "asisten", teks: h.d.jawaban });
            riwayat = riwayat.slice(-6);
          } else {
            tambahPesan("asisten", el("p", { class: "pesan-galat", text: h.d.galat || "Asisten tidak bisa menjawab saat ini. Coba lagi sebentar lagi." }));
          }
        })
        .catch(function () {
          tunggu.remove();
          tambahPesan("asisten", el("p", { class: "pesan-galat", text: "Koneksi terputus. Periksa internet Anda lalu kirim ulang pertanyaan." }));
        })
        .then(function () { tombol.disabled = false; tombol.textContent = "Kirim pertanyaan"; area.focus(); });
    });
  }

  /* ---------- Tandai menu aktif ---------- */
  function tandaiMenu() {
    var hal = location.pathname.split("/").pop() || "index.html";
    if (hal === "pelajaran.html") hal = "belajar.html";
    document.querySelectorAll(".nav a").forEach(function (a) {
      if (a.getAttribute("href") === hal) a.setAttribute("aria-current", "page");
    });
  }

  tandaiMenu();
  renderJalur("jalur-ringkas", false);
  renderJalur("jalur-lengkap", true);
  renderPelajaran();
  renderMini();
  renderPeringkat();
  renderRadar();
  renderRujukan();
  renderAsisten();
})();
