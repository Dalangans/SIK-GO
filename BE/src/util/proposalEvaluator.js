const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Lazy load API key when module is imported
let genAI = null;

function getGenAI() {
  if (!genAI) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in .env');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

function getModel() {
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  return GEMINI_MODEL;
}

/**
 * Extract text from PDF file
 */
async function extractTextFromFile(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    // For text-based files, just read directly
    if (mimeType.startsWith('text/')) {
      return fileBuffer.toString('utf-8');
    }
    
    // For other files (PDF, Word, etc.), try to use Gemini's file API
    return fileBuffer.toString('utf-8', 0, Math.min(100000, fileBuffer.length));
  } catch (error) {
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeTypes[ext] || 'text/plain';
}

/**
 * Generate summary of document
 */
async function generateSummary(filePath, fileName) {
  try {
    const text = await extractTextFromFile(filePath);
    
    if (!text || text.length < 10) {
      throw new Error('Document is empty or too short');
    }
    
    const maxLength = 3000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
    
    const prompt = `Tugas: Buat ringkasan singkat dari dokumen berikut.

Dokumen:
${truncatedText}

Ringkasan (maksimal 5 kalimat):`;

    const model = getGenAI().getGenerativeModel({ model: getModel() });
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const summary = result.response.text();
    
    return {
      success: true,
      summary: summary.trim(),
      filename: fileName,
      textLength: text.length,
      words: text.split(/\s+/).length,
    };
  } catch (error) {
    throw new Error(`Summary generation failed: ${error.message}`);
  }
}

/**
 * Evaluate proposal according to FTUI standards
 */
async function evaluateProposal(filePath, fileName) {
  try {
    const text = await extractTextFromFile(filePath);
    
    if (!text || text.length < 50) {
      throw new Error('Proposal is too short or unreadable');
    }
    
    const maxLength = 8000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '\n\n[... dokumen dipotong ...]' 
      : text;
    
    const evaluationPrompt = `Anda adalah evaluator proposal kegiatan mahasiswa di lingkungan Fakultas Teknik Universitas Indonesia. 
Tugas Anda adalah mengevaluasi proposal berdasarkan parameter standar proposal FTUI.

Berikut parameter evaluasi yang wajib Anda gunakan:
1. Struktur Proposal (0–5)
2. Latar Belakang (0–5)
3. Visi & Misi (0–5)
4. Tujuan Kegiatan (0–5)
5. Nama dan Tema Kegiatan (0–5)
6. Informasi Teknis - WAKTU (0–5)
   - Cek apakah waktu pelaksanaan JELAS (tanggal, hari, jam mulai dan selesai)
   - PENTING: Kegiatan TIDAK BOLEH melewati pukul 21.00 WIB, KECUALI hari MINGGU (libur)
   - Jika kegiatan melewati pukul 21.00 di hari Senin-Sabtu, beri score RENDAH dan catat di IMPROVEMENT
   - Cek apakah durasi kegiatan realistis
7. Informasi Teknis - TEMPAT (0–5)
   - Cek apakah lokasi/tempat pelaksanaan JELAS dan SPESIFIK (nama gedung, ruangan, alamat lengkap)
   - Jika hanya menyebutkan "Kampus UI" atau "FTUI" tanpa detail ruangan, beri score RENDAH
   - Cek apakah tempat sesuai dengan jenis dan skala kegiatan
   - Cek apakah ada backup lokasi jika terjadi kendala
8. Informasi Teknis - SASARAN (0–5)
   - Cek apakah target peserta/audiens JELAS (jumlah, kriteria)
   - Cek apakah sasaran realistis dan terukur
9. Parameter Keberhasilan (0–5)
10. Bentuk Kegiatan (0–5)
11. Susunan Acara (0–5)
12. Susunan Kepanitiaan (0–5)
13. Rancangan Anggaran (0–5)
14. Penutup (0–5)
15. Lampiran (0–5)

KHUSUS UNTUK PARAMETER WAKTU DAN TEMPAT:
- Waktu: Jika ada kegiatan yang melewati pukul 21.00 di hari Senin-Sabtu, wajib diberi catatan peringatan dan score maksimal 2
- Tempat: Jika lokasi tidak spesifik (contoh: hanya "FTUI" tanpa nama ruangan), score maksimal 3

Untuk setiap parameter:
- Berikan SCORE 0–5
- Berikan REASON (alasan singkat dan jelas, untuk waktu dan tempat harus sangat detail)
- Berikan IMPROVEMENT (saran perbaikan konkret)

Setelah semua skor, berikan:
- Strengths: 5 poin kekuatan proposal
- Weaknesses: 5 poin kelemahan proposal (prioritaskan masalah waktu dan tempat jika ada)
- Final Recommendation: "TERIMA", "REVISI", atau "TOLAK"
  * Jika waktu melewati 21.00 di hari kerja (Senin-Sabtu), otomatis "REVISI"
  * Jika tempat tidak jelas/spesifik, otomatis "REVISI"

SANGAT PENTING: 
- Jawab HANYA dalam format JSON valid
- JANGAN tambahkan markdown, backtick, atau teks apapun di luar JSON
- Mulai langsung dengan {

Format JSON:
{
  "scores": [
    {
      "parameter": "Struktur Proposal",
      "score": 0,
      "reason": "...",
      "improvement": "..."
    }
  ],
  "strengths": ["...", "...", "...", "...", "..."],
  "weaknesses": ["...", "...", "...", "...", "..."],
  "total_score": 0,
  "recommendation": "TERIMA"
}

Berikut isi proposal yang harus Anda evaluasi:
"""
${truncatedText}
"""`;

    const model = getGenAI().getGenerativeModel({ model: getModel() });
    const result = await model.generateContent({
      contents: [{ parts: [{ text: evaluationPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });

    let responseText = result.response.text();
    
    // Clean response
    responseText = responseText.trim();
    responseText = responseText.replace(/```json\n?/g, '');
    responseText = responseText.replace(/```\n?/g, '');
    responseText = responseText.trim();

    // Parse JSON
    const evaluation = JSON.parse(responseText);

    // Validate structure
    if (!evaluation.scores || !Array.isArray(evaluation.scores)) {
      throw new Error('Invalid evaluation structure from AI');
    }

    // Calculate total score if missing
    if (!evaluation.total_score) {
      evaluation.total_score = evaluation.scores.reduce(
        (sum, item) => sum + (item.score || 0),
        0
      );
    }

    return {
      success: true,
      evaluation,
      filename: fileName,
      textLength: text.length,
    };
  } catch (error) {
    throw new Error(`Proposal evaluation failed: ${error.message}`);
  }
}

module.exports = {
  generateSummary,
  evaluateProposal,
  extractTextFromFile,
};
