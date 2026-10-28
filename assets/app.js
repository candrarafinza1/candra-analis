/* Candra Analis — logika halaman (tanpa framework, tanpa build).
   Setiap fungsi hanya berjalan bila elemen tujuannya ada di halaman. */
(function () {
  "use strict";

  var MODUL = window.MODUL || [];
  var EMITEN = window.EMITEN || [];
  var META = window.DATA_META || {};

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
  function jumlah(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }
  function labaSetahun(e) { return jumlah(e.labaKuartal); }
  function tumbuhPendapatan(e) { var p = e.pendapatan; return (p[1] - p[0]) / Math.abs(p[0]) * 100; }
  function syariahAktif(e) { return e.syariah && !e.keluarDES; }

  function selKode(e) {
    return el("td", null, [el("span", { class: "kode", text: e.kode }), el("span", { class: "nama-emiten", text: e.nama })]);
  }

  function pitaDemo(wadah) {
    if (!wadah || !META.contoh) return;
    wadah.appendChild(el("div", { class: "pita-demo", role: "note" }, [
      el("strong", { text: "Data contoh. " }),
      "Kode dan nama emiten di halaman ini fiktif, dipakai untuk uji tampilan. Data laporan keuangan sungguhan dari BEI dan Daftar Efek Syariah OJK sedang disiapkan."
    ]));
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

  /* ---------- Peringkat ---------- */
  var KRITERIA = {
    laba: {
      label: "Laba bersih tertinggi",
      nilai: labaSetahun, tampil: rupiahMiliar, kolom: "Laba 4 kuartal",
      metode: "Jumlah laba bersih empat kuartal terakhir."
    },
    dividen: {
      label: "Dividend yield tertinggi",
      nilai: function (e) { return e.divYield; }, tampil: persen, kolom: "Dividend yield",
      metode: "Dividen yang dibagikan dalam setahun terakhir dibanding harga saham."
    },
    tumbuh: {
      label: "Pertumbuhan pendapatan",
      nilai: tumbuhPendapatan, tampil: persen, kolom: "Pendapatan YoY",
      metode: "Perubahan pendapatan tahun berjalan dibanding tahun sebelumnya."
    },
    roe: {
      label: "ROE tertinggi",
      nilai: function (e) { return e.roe; }, tampil: persen, kolom: "ROE",
      metode: "Laba bersih dibagi total ekuitas. Mengukur efisiensi memakai modal pemilik."
    }
  };

  function urutkan(kunci) {
    var k = KRITERIA[kunci];
    return EMITEN.filter(syariahAktif)
      .sort(function (a, b) { return k.nilai(b) - k.nilai(a); })
      .slice(0, 10);
  }

  function renderMini() {
    var tb = document.getElementById("mini-peringkat");
    if (!tb) return;
    urutkan("laba").slice(0, 3).forEach(function (e, i) {
      tb.appendChild(el("tr", null, [
        el("td", { class: "peringkat-no", text: String(i + 1) }),
        selKode(e),
        el("td", { class: "angka", text: rupiahMiliar(labaSetahun(e)) })
      ]));
    });
  }

  function renderPeringkat() {
    var akar = document.getElementById("peringkat");
    if (!akar) return;
    pitaDemo(document.getElementById("pita"));

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
      var tbody = el("tbody");
      urutkan(kunci).forEach(function (e, i) {
        var g = tumbuhPendapatan(e);
        tbody.appendChild(el("tr", null, [
          el("td", { class: "peringkat-no", text: String(i + 1) }),
          selKode(e),
          el("td", { text: e.sektor }),
          el("td", { class: "angka", text: k.tampil(k.nilai(e)) }),
          kunci === "laba" ? null : el("td", { class: "angka", text: rupiahMiliar(labaSetahun(e)) }),
          el("td", { class: "angka " + (g >= 0 ? "naik" : "turun"), text: persen(g) }),
          el("td", { class: "angka", text: angka.format(e.der) + "x" })
        ]));
      });
      panel.appendChild(el("div", { class: "tabel-wadah" }, [
        el("table", null, [
          el("caption", { class: "keterangan-tabel", text: "Sepuluh saham syariah teratas: " + k.label.toLowerCase() }),
          el("thead", null, [el("tr", null, [
            el("th", { scope: "col", text: "#" }),
            el("th", { scope: "col", text: "Emiten" }),
            el("th", { scope: "col", text: "Sektor" }),
            el("th", { scope: "col", class: "angka", text: k.kolom }),
            kunci === "laba" ? null : el("th", { scope: "col", class: "angka", text: "Laba 4 kuartal" }),
            el("th", { scope: "col", class: "angka", text: "Pendapatan YoY" }),
            el("th", { scope: "col", class: "angka", text: "DER" })
          ])]),
          tbody
        ])
      ]));
      panel.appendChild(el("p", { class: "catatan-metode", style: "margin-top:12px" },
        ["Cara menghitung: " + k.metode + " Hanya emiten yang tercatat di Daftar Efek Syariah. Urutan ini menggambarkan data, bukan saran membeli."]));
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

  /* ---------- Radar Risiko ---------- */
  // Mengembalikan daftar sinyal { tingkat: tinggi|sedang|aman, judul, isi, bukti }
  function periksa(e) {
    var s = [], L = e.labaKuartal, n = L.length;

    if (e.keluarDES) s.push({ tingkat: "tinggi", judul: "Tidak lagi tercatat sebagai saham syariah",
      isi: "Emiten ini tidak ada di Daftar Efek Syariah periode terbaru.",
      bukti: "Sumber: Daftar Efek Syariah OJK, " + META.periodeDES + "." });

    if (e.suspensi) s.push({ tingkat: "tinggi", judul: "Perdagangan sedang dihentikan sementara",
      isi: "Bursa menghentikan sementara perdagangan saham ini. Selama suspensi, saham tidak bisa dibeli atau dijual di pasar reguler.",
      bukti: "Sumber: pengumuman Bursa Efek Indonesia." });

    if (e.notasiKhusus) s.push({ tingkat: "sedang", judul: "Mendapat notasi khusus dari bursa",
      isi: "Notasi khusus diberikan bursa sebagai tanda kondisi tertentu pada emiten, misalnya ekuitas negatif atau laporan keuangan bermasalah.",
      bukti: "Sumber: pengumuman Bursa Efek Indonesia." });

    if (L[n - 1] < 0) s.push({ tingkat: "tinggi", judul: "Kuartal terakhir merugi",
      isi: "Perusahaan mencatat rugi bersih pada kuartal terakhir.",
      bukti: "Laba kuartal terakhir: " + rupiahMiliar(L[n - 1]) + "." });

    var turunBeruntun = 0;
    for (var i = n - 1; i > 0 && L[i] < L[i - 1]; i--) turunBeruntun++;
    if (turunBeruntun >= 2) s.push({ tingkat: turunBeruntun >= 3 ? "tinggi" : "sedang",
      judul: "Laba turun " + turunBeruntun + " kuartal berturut-turut",
      isi: "Laba bersih terus menurun dibanding kuartal sebelumnya.",
      bukti: "Laba per kuartal: " + L.map(rupiahMiliar).join(", ") + " (terlama ke terbaru)." });

    var g = tumbuhPendapatan(e);
    if (g < 0) s.push({ tingkat: "sedang", judul: "Pendapatan menurun",
      isi: "Penjualan tahun berjalan lebih rendah daripada tahun sebelumnya.",
      bukti: "Pendapatan: " + rupiahMiliar(e.pendapatan[0]) + " ke " + rupiahMiliar(e.pendapatan[1]) + " (" + persen(g) + ")." });

    if (e.der > 2) s.push({ tingkat: "sedang", judul: "Utang tinggi dibanding modal",
      isi: "Total utang lebih dari dua kali modal sendiri. Beban bunga dan cicilan bisa menekan laba saat kondisi sulit.",
      bukti: "DER: " + angka.format(e.der) + "x." });

    if (!s.length) s.push({ tingkat: "aman", judul: "Tidak ada tanda risiko dari pemeriksaan ini",
      isi: "Laba, pendapatan, utang, status syariah, dan pengumuman bursa tidak menunjukkan tanda yang kami pantau.",
      bukti: "Tetap pantau laporan kuartal berikutnya." });

    var urut = { tinggi: 0, sedang: 1, aman: 2 };
    return s.sort(function (a, b) { return urut[a.tingkat] - urut[b.tingkat]; });
  }

  function renderRadar() {
    var akar = document.getElementById("radar");
    if (!akar) return;
    pitaDemo(document.getElementById("pita"));

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
        hasil.appendChild(el("p", { class: "catatan-metode", text: "Pilih satu kode saham untuk melihat hasil pemeriksaan." }));
        return;
      }
      var s = periksa(e);
      var jml = s.filter(function (x) { return x.tingkat !== "aman"; }).length;
      hasil.appendChild(el("h2", { style: "font-size:1.35rem", text: e.kode + ": " + (jml ? jml + " tanda yang perlu Anda perhatikan" : "tidak ada tanda risiko") }));
      var ul = el("ul", { class: "sinyal-daftar" });
      s.forEach(function (x) {
        ul.appendChild(el("li", { class: "sinyal sinyal-" + x.tingkat }, [
          el("h4", { text: x.judul }), el("p", { text: x.isi }), el("p", { class: "bukti", text: x.bukti })
        ]));
      });
      hasil.appendChild(ul);
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
})();
