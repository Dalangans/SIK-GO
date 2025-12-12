const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Lazy load API key when module is imported
let genAI = null;

// Cache for evaluation results
const evaluationCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

function generateContentHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

function getCachedResult(contentHash) {
  if (!evaluationCache.has(contentHash)) {
    return null;
  }
  const cached = evaluationCache.get(contentHash);
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    evaluationCache.delete(contentHash);
    return null;
  }
  console.log('Cache hit for evaluation:', contentHash);
  return cached.result;
}

function setCachedResult(contentHash, result) {
  evaluationCache.set(contentHash, {
    result,
    timestamp: Date.now()
  });
  console.log('Cached evaluation result:', contentHash);
}

async function callGeminiWithRetry(requestFn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const isRateLimit = error.message.includes('429') || 
                         error.message.includes('rate limit') || 
                         error.message.includes('quota');
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isRateLimit && !isLastAttempt) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Rate limit detected. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Generate mock/fallback evaluation when API fails
 * Useful for development without API quota
 */
function generateMockEvaluation() {
  const mockScores = [
    { parameter: "Struktur Proposal", score: 4, reason: "Struktur jelas dan terorganisir" },
    { parameter: "Latar Belakang", score: 4, reason: "Latar belakang cukup detail" },
    { parameter: "Visi & Misi", score: 3, reason: "Visi misi sudah ada namun perlu lebih spesifik" },
    { parameter: "Tujuan Kegiatan", score: 4, reason: "Tujuan terukur dan jelas" },
    { parameter: "Nama dan Tema Kegiatan", score: 4, reason: "Nama dan tema menarik" },
    { parameter: "Informasi Teknis - WAKTU", score: 4, reason: "Waktu sesuai dengan ketentuan" },
    { parameter: "Informasi Teknis - TEMPAT", score: 3, reason: "Tempat sudah disebutkan namun perlu lebih spesifik" },
    { parameter: "Informasi Teknis - SASARAN", score: 4, reason: "Sasaran peserta jelas" },
    { parameter: "Parameter Keberhasilan", score: 3, reason: "Parameter keberhasilan cukup namun perlu metrik yang lebih terukur" },
    { parameter: "Bentuk Kegiatan", score: 4, reason: "Bentuk kegiatan sesuai dan menarik" },
    { parameter: "Susunan Acara", score: 4, reason: "Susunan acara runtut dan terstruktur" },
    { parameter: "Susunan Kepanitiaan", score: 4, reason: "Kepanitiaan terstruktur dengan jelas" },
    { parameter: "Rancangan Anggaran", score: 3, reason: "Anggaran sudah ada namun perlu detail breakdown" },
    { parameter: "Penutup", score: 3, reason: "Penutup singkat dan efektif" },
    { parameter: "Lampiran", score: 3, reason: "Lampiran lengkap" }
  ];

  const totalScore = mockScores.reduce((sum, item) => sum + item.score, 0);
  
  return {
    scores: mockScores,
    strengths: [
      "Struktur dan organisasi proposal baik",
      "Tujuan kegiatan jelas dan terukur",
      "Jadwal dan tempat sudah ditetapkan",
      "Susunan kepanitiaan lengkap",
      "Rancangan anggaran sudah ada"
    ],
    weaknesses: [
      "Perlu detail lebih spesifik untuk lokasi",
      "Parameter keberhasilan perlu metrik yang lebih terukur",
      "Breakdown anggaran perlu lebih detail",
      "Analisis risiko belum ada",
      "Timeline persiapan perlu diperjelas"
    ],
    recommendation: "TERIMA",
    total_score: totalScore,
    notes: "[DEMO MODE] Evaluasi ini dihasilkan tanpa menggunakan Gemini API (quota habis). Gunakan untuk demo/testing saja. Untuk evaluasi produksi, gunakan API key dengan billing aktif.",
    isDemoMode: true
  };
}

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
    
    // Check cache first
    const contentHash = generateContentHash(text);
    const cachedResult = getCachedResult(contentHash);
    if (cachedResult) {
      console.log('Using cached evaluation result for:', fileName);
      return cachedResult;
    }
    
    const maxLength = 5000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '\n\n[... dokumen dipotong ...]' 
      : text;
    
    const evaluationPrompt = `Anda adalah evaluator proposal kegiatan mahasiswa di lingkungan Fakultas Teknik Universitas Indonesia. 
Tugas Anda adalah mengevaluasi proposal berdasarkan 15 parameter standar FTUI.

PENTING: Berikan HANYA JSON response tanpa teks lain. Mulai langsung dengan { dan akhiri dengan }.

15 PARAMETER EVALUASI (score 0-5 untuk setiap):
1. Struktur Proposal
2. Latar Belakang
3. Visi & Misi
4. Tujuan Kegiatan
5. Nama dan Tema Kegiatan
6. Informasi Teknis - WAKTU (PENTING: Tidak boleh > 21.00 WIB hari Senin-Sabtu)
7. Informasi Teknis - TEMPAT (PENTING: Harus SPESIFIK dengan nama ruangan)
8. Informasi Teknis - SASARAN
9. Parameter Keberhasilan
10. Bentuk Kegiatan
11. Susunan Acara
12. Susunan Kepanitiaan
13. Rancangan Anggaran
14. Penutup
15. Lampiran

WAJIB RETURN JSON dengan struktur EXACT ini:
{
  "scores": [
    {"parameter": "Struktur Proposal", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Latar Belakang", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Visi & Misi", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Tujuan Kegiatan", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Nama dan Tema Kegiatan", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Informasi Teknis - WAKTU", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Informasi Teknis - TEMPAT", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Informasi Teknis - SASARAN", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Parameter Keberhasilan", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Bentuk Kegiatan", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Susunan Acara", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Susunan Kepanitiaan", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Rancangan Anggaran", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Penutup", "score": 0, "reason": "alasan singkat"},
    {"parameter": "Lampiran", "score": 0, "reason": "alasan singkat"}
  ],
  "strengths": ["kekuatan1", "kekuatan2", "kekuatan3", "kekuatan4", "kekuatan5"],
  "weaknesses": ["kelemahan1", "kelemahan2", "kelemahan3", "kelemahan4", "kelemahan5"],
  "recommendation": "TERIMA",
  "total_score": 0,
  "notes": "catatan singkat"
}

INSTRUKSI:
- HANYA JSON, TIDAK ADA TEKS LAIN
- Setiap score object WAJIB punya: parameter, score, reason
- Score hanya integer 0-5
- Reason max 1 baris (singkat dan padat)
- strings harus dalam double quotes
- Jika waktu > 21.00 hari kerja: score maksimal 2 dan recommendation REVISI
- Jika tempat tidak spesifik: score maksimal 3 dan recommendation REVISI
- Jangan ada trailing commas

Proposal:
"""
${truncatedText}
"""`;

    const model = getGenAI().getGenerativeModel({ model: getModel() });
    
    let apiResult;
    let usedMockEvaluation = false;
    
    try {
      apiResult = await callGeminiWithRetry(async () => {
        return await model.generateContent({
          contents: [{ parts: [{ text: evaluationPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 3000,
          },
        });
      });
    } catch (apiError) {
      console.error('Gemini API Error during evaluation:', apiError.message);
      
      // Check if it's a quota/rate limit error
      const isQuotaError = apiError.message.includes('429') || 
                          apiError.message.includes('quota') || 
                          apiError.message.includes('rate limit');
      
      console.log('isQuotaError detected:', isQuotaError);
      
      if (isQuotaError) {
        console.warn('API quota exceeded. Using mock evaluation for demo purposes.');
        // Use mock evaluation as fallback
        const mockResult = generateMockEvaluation();
        
        const mockEvaluationResult = {
          success: true,
          evaluation: mockResult,
          filename: fileName,
          textLength: text.length,
          isDemoMode: true,
          message: 'This is a demo evaluation. Please use a valid API key with active billing for production.'
        };
        
        console.log('Returning mock evaluation result');
        setCachedResult(contentHash, mockEvaluationResult);
        return mockEvaluationResult;
      }
      
      // For other errors, throw normally
      if (apiError.message.includes('401') || apiError.message.includes('invalid')) {
        throw new Error('API key invalid. Please check server configuration.');
      }
      if (apiError.message.includes('503') || apiError.message.includes('service')) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
      throw new Error(`Gemini API error: ${apiError.message}`);
    }

    let responseText = apiResult.response.text().trim();
    
    // Remove markdown code blocks
    responseText = responseText.replace(/^```json\s*/i, '');
    responseText = responseText.replace(/^```\s*/i, '');
    responseText = responseText.replace(/```\s*$/, '');
    responseText = responseText.trim();
    
    // Extract JSON - find first { and last }
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('No valid JSON found in AI response');
    }
    
    responseText = responseText.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues
    responseText = responseText
      .replace(/,\s*}/g, '}')           // Remove trailing commas before }
      .replace(/,\s*]/g, ']')           // Remove trailing commas before ]
      .replace(/:\s*'/g, ':"')          // Single quote strings to double quote
      .replace(/'\s*,/g, '",')
      .replace(/'\s*}/g, '"}')
      .replace(/'\s*]/g, '"]');

    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON Parse Error:', jsonError.message);
      console.error('Attempted to parse:', responseText.substring(0, 400));
      
      // Try more aggressive cleanup
      responseText = responseText
        .replace(/([^"\\])'([^"])/g, '$1"$2')  // Fix single quotes in values
        .replace(/:\s*"?([^",}]*)"?(?=[,}])/g, (m, val) => {
          // Ensure all values are quoted
          if (!val.match(/^(\d+|true|false|null)$/)) {
            return ': "' + val.trim() + '"';
          }
          return ': ' + val;
        });
      
      try {
        evaluation = JSON.parse(responseText);
      } catch (e2) {
        console.error('Second JSON parse failed:', e2.message);
        throw new Error(`Invalid JSON from AI after cleanup: ${jsonError.message}`);
      }
    }

    // Validate and normalize structure
    if (!evaluation.scores || !Array.isArray(evaluation.scores)) {
      throw new Error('Invalid scores structure');
    }

    // Ensure all required fields exist
    evaluation.strengths = evaluation.strengths || [];
    evaluation.weaknesses = evaluation.weaknesses || [];
    evaluation.recommendation = evaluation.recommendation || 'REVISI';
    evaluation.notes = evaluation.notes || '';

    // Calculate total score
    evaluation.total_score = evaluation.scores.reduce((sum, item) => {
      return sum + (parseInt(item.score) || 0);
    }, 0);

    const evaluationResult = {
      success: true,
      evaluation,
      filename: fileName,
      textLength: text.length,
    };

    // Cache the evaluation result
    setCachedResult(contentHash, evaluationResult);

    return evaluationResult;
  } catch (error) {
    throw new Error(`Proposal evaluation failed: ${error.message}`);
  }
}

module.exports = {
  generateSummary,
  evaluateProposal,
  extractTextFromFile,
};
