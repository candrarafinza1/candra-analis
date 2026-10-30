// Asisten AI Candra Analis — fungsi serverless Vercel (tim Arif, diperiksa Hana & Tegar).
// GET  /api/tanya  → { aktif: true|false }
// POST /api/tanya  { pertanyaan, riwayat: [{peran:"pengguna"|"asisten", teks}] } → { jawaban }
//
// Kunci API dibaca dari Environment Variable GEMINI_API_KEY (tidak pernah disimpan di repo).
// Model bisa diganti lewat GEMINI_MODEL tanpa mengubah kode.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAKS_PERTANYAAN = 600;     // karakter
const MAKS_RIWAYAT = 6;          // pesan sebelumnya yang ikut dikirim
const BATAS_PER_MENIT = 6;       // per alamat IP, perlindungan kuota gratis

const PETUNJUK = `Anda adalah Asisten Candra Analis, pendamping belajar saham syariah untuk investor pemula di Indonesia.

Tugas Anda:
- Menjelaskan istilah pasar modal dan saham syariah dengan bahasa Indonesia yang sederhana, contoh sehari-hari, dan hitungan bila perlu.
- Membantu pengguna membaca dan menghitung angka laporan keuangan (pendapatan, laba bersih, ROE, DER, PER, PBV, dividend yield) dari angka yang mereka berikan.
- Menjelaskan cara kerja Daftar Efek Syariah OJK, indeks syariah (ISSI, JII, JII70), dan transaksi syariah (SOTS).
- Mengajak pengguna menganalisis sendiri: ajukan pertanyaan balik, beri langkah pemeriksaan, arahkan ke halaman Belajar, Peringkat, dan Radar Risiko di Candra Analis.

Larangan tegas (Candra Analis bukan penasihat investasi berizin OJK):
- Jangan pernah menyuruh atau menyarankan membeli, menjual, atau menahan saham tertentu, termasuk secara halus ("cocok dibeli", "layak dikoleksi", "saatnya keluar").
- Jangan memberi target harga, prediksi harga, atau jumlah lot/uang yang harus dibeli.
- Jangan menyebut saham tertentu "pasti naik", "aman", atau "dijamin".
- Jangan mengarang angka keuangan emiten. Jika tidak tahu angka terbarunya, katakan terus terang dan sarankan cek laporan keuangan di situs BEI.
- Tolak dengan sopan permintaan di luar topik investasi, keuangan pribadi, dan pasar modal.

Bila pengguna meminta rekomendasi, jelaskan bahwa Anda tidak bisa memberi rekomendasi, lalu bantu dengan daftar hal yang perlu ia periksa sendiri.
Bila pengguna menyebut ingin memakai uang pinjaman, dana darurat, atau tampak dalam tekanan keuangan, ingatkan risikonya dengan lembut.
Jawab ringkas: paling banyak sekitar 200 kata, gunakan poin bila membantu. Akhiri jawaban yang menyangkut keputusan investasi dengan pengingat singkat bahwa keputusan ada di tangan pengguna.`;

const MAKS_TOTAL_RIWAYAT = 6000; // karakter riwayat seluruhnya (Tegar, 30 Okt)

// Tegar (30 Okt): hanya halaman Candra Analis sendiri yang boleh mengirim pertanyaan.
// Peramban selalu mengirim Origin pada POST; bila ada dan host-nya beda, tolak.
function asalLain(req) {
  const asal = req.headers.origin;
  if (!asal) return false;
  try { return new URL(asal).host !== String(req.headers.host || ""); } catch { return true; }
}

const jejak = new Map(); // ip → [waktu permintaan]

function terlaluSering(ip) {
  const kini = Date.now();
  const daftar = (jejak.get(ip) || []).filter((t) => kini - t < 60_000);
  daftar.push(kini);
  jejak.set(ip, daftar);
  if (jejak.size > 5000) jejak.clear();
  return daftar.length > BATAS_PER_MENIT;
}

function kirim(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

async function bacaBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let teks = "";
  for await (const potong of req) {
    teks += potong;
    if (teks.length > 20_000) throw new Error("terlalu besar");
  }
  return JSON.parse(teks || "{}");
}

export default async function handler(req, res) {
  const kunci = process.env.GEMINI_API_KEY;

  if (req.method === "GET") return kirim(res, 200, { aktif: Boolean(kunci) });
  if (req.method !== "POST") return kirim(res, 405, { galat: "Metode tidak didukung." });
  if (!kunci) return kirim(res, 503, { galat: "Asisten belum aktif." });

  if (asalLain(req)) return kirim(res, 403, { galat: "Permintaan dari situs lain tidak dilayani." });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (terlaluSering(ip)) {
    return kirim(res, 429, { galat: "Terlalu banyak pertanyaan dalam satu menit. Coba lagi sebentar lagi." });
  }

  let body;
  try { body = await bacaBody(req); } catch { return kirim(res, 400, { galat: "Format permintaan tidak valid." }); }

  const pertanyaan = String(body.pertanyaan || "").trim();
  if (!pertanyaan) return kirim(res, 400, { galat: "Tulis pertanyaan Anda dulu." });
  if (pertanyaan.length > MAKS_PERTANYAAN) {
    return kirim(res, 400, { galat: `Pertanyaan terlalu panjang. Maksimal ${MAKS_PERTANYAAN} karakter.` });
  }

  const riwayat = (Array.isArray(body.riwayat) ? body.riwayat : [])
    .slice(-MAKS_RIWAYAT)
    .filter((p) => p && typeof p.teks === "string" && p.teks.trim())
    .map((p) => ({
      role: p.peran === "asisten" ? "model" : "user",
      parts: [{ text: p.teks.slice(0, 2000) }],
    }));
  // Buang pesan paling lama bila total riwayat terlalu panjang (hemat kuota gratis)
  while (riwayat.reduce((n, p) => n + p.parts[0].text.length, 0) > MAKS_TOTAL_RIWAYAT) riwayat.shift();

  const payload = {
    systemInstruction: { parts: [{ text: PETUNJUK }] },
    contents: [...riwayat, { role: "user", parts: [{ text: pertanyaan }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
  };

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": kunci },
        body: JSON.stringify(payload),
      }
    );
    const data = await r.json().catch(() => ({}));

    if (r.status === 429) {
      return kirim(res, 429, { galat: "Kuota harian asisten sedang penuh. Silakan coba lagi nanti." });
    }
    if (!r.ok) {
      console.error("Gemini galat", r.status, JSON.stringify(data).slice(0, 500));
      return kirim(res, 502, { galat: "Asisten sedang tidak bisa menjawab. Coba lagi beberapa saat lagi." });
    }

    const jawaban = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!jawaban) {
      return kirim(res, 502, { galat: "Asisten tidak menghasilkan jawaban. Coba ubah pertanyaan Anda." });
    }
    return kirim(res, 200, { jawaban });
  } catch (e) {
    console.error("Gemini tidak terjangkau", e);
    return kirim(res, 502, { galat: "Asisten sedang tidak bisa dihubungi. Coba lagi beberapa saat lagi." });
  }
}
