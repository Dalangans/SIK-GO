const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate AI Review untuk proposal
 * @param {string} proposalContent - Isi proposal yang akan direview
 * @param {string} category - Kategori proposal (optional)
 * @returns {Promise<object>} - Hasil review dari AI
 */
const generateProposalReview = async (proposalContent, category = 'general') => {
  try {
    const prompt = `
Anda adalah seorang reviewer profesional untuk proposal. Analisis proposal berikut dengan detail:

**Kategori:** ${category}

**Konten Proposal:**
${proposalContent}

Berikan review dengan format JSON berikut:
{
  "score": <1-100>,
  "strengths": [<list 3-5 kekuatan utama>],
  "weaknesses": [<list 3-5 kelemahan utama>],
  "suggestions": [<list 3-5 saran perbaikan>],
  "summary": "<ringkasan singkat 2-3 baris>"
}

Berikan response HANYA dalam format JSON tanpa teks tambahan.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const review = JSON.parse(jsonMatch[0]);
    return review;
  } catch (error) {
    console.error('Error in generateProposalReview:', error);
    throw new Error(`Gemini AI Error: ${error.message}`);
  }
};

/**
 * Generate AI suggestions untuk room booking
 * @param {string} roomName - Nama ruangan
 * @param {object} bookingDetails - Detail booking
 * @returns {Promise<object>} - Saran dari AI
 */
const generateBookingRecommendations = async (roomName, bookingDetails) => {
  try {
    const prompt = `
Anda adalah asisten booking ruangan. Berdasarkan informasi berikut, berikan rekomendasi:

**Nama Ruangan:** ${roomName}
**Tanggal:** ${bookingDetails.date}
**Waktu:** ${bookingDetails.time}
**Durasi:** ${bookingDetails.duration} jam
**Jumlah Orang:** ${bookingDetails.personCount}
**Tujuan:** ${bookingDetails.purpose}

Berikan response dalam format JSON:
{
  "available": <true/false>,
  "recommendation": "<rekomendasi penggunaan>",
  "tips": [<list tips penggunaan>],
  "alternative": "<saran ruangan alternatif jika ada>"
}

Berikan response HANYA dalam format JSON tanpa teks tambahan.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;
  } catch (error) {
    console.error('Error in generateBookingRecommendations:', error);
    throw new Error(`Gemini AI Error: ${error.message}`);
  }
};

/**
 * Chat dengan AI untuk pertanyaan umum
 * @param {string} question - Pertanyaan
 * @returns {Promise<string>} - Jawaban dari AI
 */
const chatWithAI = async (question) => {
  try {
    const result = await model.generateContent(question);
    return result.response.text();
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    throw new Error(`Gemini AI Error: ${error.message}`);
  }
};

module.exports = {
  generateProposalReview,
  generateBookingRecommendations,
  chatWithAI
};
