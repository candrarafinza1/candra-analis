"""Membuat modul PDF dari kurikulum website (data/modul.js) dan rujukan (data/rujukan.js).
Tim Laras (Guru & Kurator Belajar). Jalankan dari akar repo:

    python3 tools/buat-modul-pdf.py

Hasil: assets/modul/modul-candra-analis.pdf
Butuh: node (untuk membaca file data) dan reportlab.
"""
import json
import os
import subprocess
from datetime import date
from html.parser import HTMLParser

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KELUAR = os.path.join(AKAR, "assets", "modul", "modul-candra-analis.pdf")

MALAM = HexColor("#1b1f4b")
TINTA = HexColor("#1c2230")
TINTA2 = HexColor("#4a5266")
NAIK = HexColor("#1f8a5b")
NAIK_MUDA = HexColor("#e3f2ea")
KERTAS = HexColor("#f6f7f2")
GARIS = HexColor("#dfe2d8")
BULAN = HexColor("#e9c46a")

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("Sans", f"{FONT_DIR}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sans-Bold", f"{FONT_DIR}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Sans-Oblique", f"{FONT_DIR}/DejaVuSans-Oblique.ttf"))
pdfmetrics.registerFont(TTFont("Sans-BoldOblique", f"{FONT_DIR}/DejaVuSans-BoldOblique.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Sans", normal="Sans", bold="Sans-Bold", italic="Sans-Oblique", boldItalic="Sans-BoldOblique")


def baca_data(berkas, nama):
    kode = (
        "const vm=require('vm');const fs=require('fs');const c={window:{}};vm.createContext(c);"
        f"vm.runInContext(fs.readFileSync({json.dumps(berkas)},'utf8'),c);"
        f"process.stdout.write(JSON.stringify(c.window.{nama}));"
    )
    return json.loads(subprocess.check_output(["node", "-e", kode], cwd=AKAR))


GAYA = {
    "isi": ParagraphStyle("isi", fontName="Sans", fontSize=10.5, leading=16.5, textColor=TINTA, spaceAfter=7),
    "h1": ParagraphStyle("h1", fontName="Sans-Bold", fontSize=21, leading=26, textColor=TINTA, spaceAfter=4),
    "meta": ParagraphStyle("meta", fontName="Sans", fontSize=9.5, leading=13, textColor=TINTA2, spaceAfter=16),
    "h2": ParagraphStyle("h2", fontName="Sans-Bold", fontSize=13.5, leading=18, textColor=MALAM, spaceBefore=12, spaceAfter=6),
    "li": ParagraphStyle("li", fontName="Sans", fontSize=10.5, leading=16, textColor=TINTA, spaceAfter=4),
    "kotak": ParagraphStyle("kotak", fontName="Sans", fontSize=10.5, leading=16, textColor=TINTA),
    "rumus": ParagraphStyle("rumus", fontName="Sans-Bold", fontSize=10.5, leading=15, textColor=TINTA),
    "kecil": ParagraphStyle("kecil", fontName="Sans", fontSize=9, leading=13, textColor=TINTA2),
    "daftar": ParagraphStyle("daftar", fontName="Sans", fontSize=11, leading=17, textColor=TINTA),
}


def kotak(teks, latar, gaya):
    t = Table([[Paragraph(teks, GAYA[gaya])]], colWidths=[None])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), latar),
        ("BOX", (0, 0), (-1, -1), 0.6, GARIS if latar == KERTAS else latar),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return [t, Spacer(1, 8)]


class KeFlowable(HTMLParser):
    """Mengubah HTML sederhana dari kurikulum menjadi flowable reportlab."""

    def __init__(self):
        super().__init__()
        self.hasil, self.buf, self.blok = [], "", None
        self.daftar = []  # tumpukan: ["ul"] atau ["ol", nomor]
        self.kelas = None

    def _flush(self):
        teks = " ".join(self.buf.split())
        self.buf = ""
        if not teks:
            return
        if self.kelas == "kotak-penting":
            self.hasil += kotak(teks, NAIK_MUDA, "kotak")
        elif self.kelas == "kotak-rumus":
            self.hasil += kotak(teks, KERTAS, "rumus")
        elif self.blok == "h2":
            self.hasil.append(Paragraph(teks, GAYA["h2"]))
        elif self.blok == "li":
            jenis = self.daftar[-1] if self.daftar else ["ul"]
            if jenis[0] == "ol":
                tanda = f"{jenis[1]}."
                jenis[1] += 1
            else:
                tanda = "•"
            self.hasil.append(Paragraph(teks, GAYA["li"], bulletText=tanda))
        else:
            self.hasil.append(Paragraph(teks, GAYA["isi"]))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("p", "h2", "li"):
            self._flush(); self.blok = tag
        elif tag == "div":
            self._flush(); self.kelas = a.get("class")
        elif tag == "ul":
            self._flush(); self.daftar.append(["ul"])
        elif tag == "ol":
            self._flush(); self.daftar.append(["ol", int(a.get("start", 1))])
        elif tag == "strong":
            self.buf += "<b>"
        elif tag == "em":
            self.buf += "<i>"

    def handle_endtag(self, tag):
        if tag in ("p", "h2", "li"):
            self._flush(); self.blok = None
        elif tag == "div":
            self._flush(); self.kelas = None
        elif tag in ("ul", "ol"):
            self._flush()
            if self.daftar:
                self.daftar.pop()
            self.hasil.append(Spacer(1, 4))
        elif tag == "strong":
            self.buf += "</b>"
        elif tag == "em":
            self.buf += "</i>"

    def handle_data(self, data):
        self.buf += data.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def selesai(self):
        self._flush()
        return self.hasil


def gambar_sampul(c, doc):
    lebar, tinggi = A4
    c.saveState()
    c.setFillColor(MALAM)
    c.rect(0, 0, lebar, tinggi, stroke=0, fill=1)
    # bintang
    c.setFillColor(HexColor("#ffffff"))
    for x, y, r in [(60, 760, 1.3), (150, 700, 1), (480, 790, 1.4), (530, 650, 1.1), (90, 600, 1), (420, 720, 0.9)]:
        c.circle(x, y, r, stroke=0, fill=1)
    # bulan sabit
    cx, cy = lebar / 2, 560
    c.setFillColor(HexColor("#262b63"))
    c.circle(cx, cy, 110, stroke=0, fill=1)
    c.setFillColor(BULAN)
    c.circle(cx - 10, cy, 82, stroke=0, fill=1)
    c.setFillColor(HexColor("#262b63"))
    c.circle(cx + 22, cy + 16, 72, stroke=0, fill=1)
    # cakrawala candlestick
    tinggi_lilin = [60, 52, 78, 66, 96, 84, 118, 108, 132, 150, 140, 172, 186, 204]
    warna = ["t", "n", "n", "t", "n", "t", "n", "n", "t", "n", "n", "t", "n", "n"]
    lebar_lilin, jarak = 26, 41
    x0 = (lebar - (len(tinggi_lilin) - 1) * jarak - lebar_lilin) / 2
    for i, (h, w) in enumerate(zip(tinggi_lilin, warna)):
        c.setFillColor(NAIK if w == "n" else HexColor("#c8463d"))
        c.rect(x0 + i * jarak, 0, lebar_lilin, h, stroke=0, fill=1)
    # judul
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Sans-Bold", 30)
    c.drawString(28 * mm, 380, "Belajar Saham Syariah")
    c.drawString(28 * mm, 344, "dari Nol")
    c.setFont("Sans", 12.5)
    c.setFillColor(HexColor("#cfd3f2"))
    c.drawString(28 * mm, 312, "Modul lengkap Candra Analis untuk investor pemula")
    c.setFont("Sans", 10)
    c.drawString(28 * mm, 292, f"Versi {date.today().strftime('%d-%m-%Y')}")
    c.restoreState()


def kaki_halaman(c, doc):
    c.saveState()
    c.setFont("Sans", 8.5)
    c.setFillColor(TINTA2)
    c.drawString(20 * mm, 12 * mm, "Candra Analis · Modul Belajar Saham Syariah")
    c.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Halaman {doc.page}")
    c.setStrokeColor(GARIS)
    c.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
    c.restoreState()


def main():
    modul = baca_data("data/modul.js", "MODUL")
    rujukan = baca_data("data/rujukan.js", "RUJUKAN")
    os.makedirs(os.path.dirname(KELUAR), exist_ok=True)

    doc = BaseDocTemplate(
        KELUAR, pagesize=A4,
        leftMargin=22 * mm, rightMargin=22 * mm, topMargin=22 * mm, bottomMargin=24 * mm,
        title="Belajar Saham Syariah dari Nol", author="Candra Analis",
        subject="Modul belajar saham syariah untuk pemula",
    )
    bingkai = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="isi")
    doc.addPageTemplates([
        PageTemplate(id="sampul", frames=[bingkai], onPage=gambar_sampul),
        PageTemplate(id="biasa", frames=[bingkai], onPage=kaki_halaman),
    ])

    isi = [NextPageTemplate("biasa"), PageBreak()]

    # Pengantar & daftar isi
    isi.append(Paragraph("Cara memakai modul ini", GAYA["h1"]))
    isi.append(Spacer(1, 8))
    isi.append(Paragraph(
        "Modul ini berisi pelajaran yang sama dengan halaman Belajar di website Candra Analis. "
        "Kerjakan berurutan. Dua pelajaran terakhir adalah praktik: siapkan buku catatan untuk "
        "menuliskan jawaban Anda.", GAYA["isi"]))
    isi.append(Spacer(1, 10))
    isi.append(Paragraph("Daftar isi", GAYA["h2"]))
    for i, m in enumerate(modul, 1):
        isi.append(Paragraph(f"<b>{i}.</b>  {m['judul']}  <font color='#4a5266' size='9'>({m['durasi']})</font>", GAYA["daftar"]))
    isi.append(Spacer(1, 14))
    isi += kotak(
        "Candra Analis adalah platform belajar dan penyaji data. Kami bukan penasihat investasi dan "
        "tidak mengajak membeli atau menjual saham tertentu. Setiap keputusan investasi dan risikonya "
        "menjadi tanggung jawab Anda.", NAIK_MUDA, "kotak")

    # Pelajaran
    for i, m in enumerate(modul, 1):
        isi.append(PageBreak())
        isi.append(Paragraph(f"Pelajaran {i} dari {len(modul)} · {m['durasi']}", GAYA["meta"]))
        isi.append(Paragraph(m["judul"], GAYA["h1"]))
        isi.append(Paragraph(m["ringkas"], GAYA["meta"]))
        p = KeFlowable()
        p.feed(m["isi"])
        isi += p.selesai()

    # Rujukan
    isi.append(PageBreak())
    isi.append(Paragraph("Belajar lebih lanjut dari sumber resmi", GAYA["h1"]))
    isi.append(Spacer(1, 6))
    for k in rujukan:
        isi.append(Paragraph(k["kelompok"], GAYA["h2"]))
        for r in k["item"]:
            isi.append(KeepTogether([
                Paragraph(f"<b>{r['judul']}</b>", GAYA["isi"]),
                Paragraph(r["ket"], GAYA["kecil"]),
                Paragraph(f"<link href='{r['url']}' color='#262b63'>{r['url']}</link>", GAYA["kecil"]),
                Spacer(1, 8),
            ]))

    doc.build(isi)
    print("Modul dibuat:", os.path.relpath(KELUAR, AKAR), f"({len(modul)} pelajaran)")


if __name__ == "__main__":
    main()
