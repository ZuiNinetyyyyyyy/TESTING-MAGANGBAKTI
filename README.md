# QuizMaster 🏆

Platform latihan soal pilihan ganda berbasis web. Siap deploy ke **Vercel** langsung dari **GitHub**.

## Fitur
- ✅ Pilihan ganda A/B/C/D (hingga 6 opsi)
- ⏱️ Timer countdown per soal (bisa dikonfigurasi)
- 📊 Skor & hasil akhir dengan visualisasi
- 📋 Halaman pembahasan jawaban
- 📂 Upload soal via file JSON
- 🔀 Opsi acak urutan soal
- ⌨️ Shortcut keyboard (A/B/C/D, ←/→, Enter)

---

## Deploy ke Vercel

### Cara 1 — Import dari GitHub (Direkomendasikan)
1. Push repo ini ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project**
3. Import repo ini
4. Klik **Deploy** — selesai!

### Cara 2 — Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## Format File Soal (JSON)

```json
[
  {
    "id": 1,
    "question": "Pertanyaan kamu di sini?",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "answer": 0,
    "explanation": "Opsional: penjelasan jawaban benar."
  }
]
```

| Field | Wajib | Keterangan |
|---|---|---|
| `question` | ✅ | Teks pertanyaan |
| `options` | ✅ | Array pilihan jawaban (min 2) |
| `answer` | ✅ | Index jawaban benar (0 = A, 1 = B, dst) |
| `id` | ❌ | ID unik soal (opsional) |
| `explanation` | ❌ | Penjelasan jawaban (tampil di halaman pembahasan) |

Lihat contoh di file `sample-questions.json`.

---

## Struktur Project

```
quiz-app/
├── index.html          ← Halaman utama
├── format.html         ← Dokumentasi format JSON
├── style.css           ← Semua styling
├── app.js              ← Logika kuis
├── sample-questions.json  ← Contoh soal
├── vercel.json         ← Konfigurasi Vercel
└── README.md
```

---

## Penggunaan Lokal

Cukup buka `index.html` di browser. Tidak perlu server atau dependency apapun.

```bash
# Atau dengan Python simple server:
python -m http.server 3000
```
