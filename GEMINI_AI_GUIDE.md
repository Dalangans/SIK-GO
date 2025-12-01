# 🤖 Gemini AI Integration Guide

## Overview

SIK-GO mengintegrasikan Google Gemini AI untuk memberikan pengalaman yang lebih smart dalam:
1. **Proposal Review** - Analisis otomatis proposal menggunakan AI
2. **Booking Recommendations** - Rekomendasi ruangan dan tips penggunaan

---

## 🔑 Setup Gemini API Key

### Step 1: Buka Google AI Studio
- Kunjungi: https://ai.google.dev/
- Klik tombol "Get API Key" atau "Get Started"

### Step 2: Create atau Select Project
- Jika belum ada project, create project baru
- Jika sudah ada, select project yang ingin digunakan

### Step 3: Generate API Key
- Klik "Create API Key"
- Copy API key yang ter-generate

### Step 4: Setup di Backend
```env
GEMINI_API_KEY=your_generated_api_key_here
```

---

## 📝 Proposal AI Review

### Fitur
Gemini AI menganalisis proposal dengan memberikan:
- **Score (0-100)** - Rating kualitas proposal
- **Strengths** - Kekuatan proposal (list 3-5 poin)
- **Weaknesses** - Kelemahan proposal (list 3-5 poin)
- **Suggestions** - Saran perbaikan (list 3-5 poin)
- **Summary** - Ringkasan 2-3 baris

### Flow Penggunaan

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Create Proposal                                 │
│    - Isi title, category, description, content          │
│    - Status: DRAFT                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. User Submit Proposal                                 │
│    - Status: SUBMITTED                                  │
│    - Ready untuk di-review                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. System Generate AI Review                            │
│    - POST /api/proposals/:id/ai-review                  │
│    - Gemini analyze content                             │
│    - Status: REVIEWING                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. AI Review Complete                                   │
│    - Score, strengths, weaknesses, suggestions          │
│    - Result disimpan di database                        │
│    - Ready untuk manual review dari admin               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Admin Manual Review                                  │
│    - POST /api/proposals/:id/manual-review              │
│    - Add comments & final status                        │
│    - Status: APPROVED atau REJECTED                     │
└─────────────────────────────────────────────────────────┘
```

### Contoh API Call

```javascript
// Generate AI Review
const response = await fetch('/api/proposals/:id/ai-review', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(result.data.aiReview);
// Output:
// {
//   score: 78,
//   strengths: ["Clear objectives", "Well researched", "Good timeline"],
//   weaknesses: ["Limited budget analysis", "Missing implementation details"],
//   suggestions: ["Add financial breakdown", "Include risk assessment", "Detail implementation phases"],
//   summary: "Solid proposal with good foundation. Needs financial detail and risk planning."
// }
```

### Implementasi di Frontend

```jsx
// ProposalList.jsx
const handleAIReview = async (id) => {
  setLoading(true);
  try {
    const response = await proposalAPI.generateAIReview(id);
    const aiReview = response.data.aiReview;
    
    // Tampilkan score
    alert(`AI Score: ${aiReview.score}/100`);
    
    // Tampilkan detail review
    console.log('Strengths:', aiReview.strengths);
    console.log('Weaknesses:', aiReview.weaknesses);
    console.log('Suggestions:', aiReview.suggestions);
    
    loadProposals(); // Refresh list
  } catch (err) {
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## 🏢 Booking AI Recommendations

### Fitur
Gemini AI memberikan rekomendasi untuk booking ruangan berdasarkan:
- Nama dan fasilitas ruangan
- Tanggal, waktu, dan durasi
- Jumlah peserta
- Tujuan penggunaan (Meeting, Lecture, Seminar, dll)

### Response Format

```json
{
  "available": true,
  "recommendation": "Ruangan ini cocok untuk meeting dengan kapasitas 20 orang. Dilengkapi dengan projector dan whiteboard.",
  "tips": [
    "Datang 10 menit lebih awal untuk setup",
    "Pastikan peserta membawa laptop untuk presentasi",
    "Ruangan memiliki AC yang powerful, cocok untuk 2-3 jam"
  ],
  "alternative": "Jika ingin ruangan yang lebih besar, coba Aula Utama dengan kapasitas 50 orang"
}
```

### Implementasi di Frontend

```jsx
// BookingForm.jsx
const handleGetRecommendations = async () => {
  try {
    const recommendations = await bookingAPI.getAIRecommendations({
      roomId: formData.roomId,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      personCount: formData.participantCount
    });
    
    // Tampilkan hasil rekomendasi
    console.log(recommendations.data);
    // Bisa ditampilkan di UI sebagai tips
  } catch (err) {
    console.error('Error:', err);
  }
};
```

---

## 🔄 Gemini Service Functions

### File: `src/util/geminiService.js`

#### 1. generateProposalReview()
```javascript
const review = await generateProposalReview(
  proposalContent,  // String - isi proposal
  category          // String - 'academic', 'research', 'event', 'other'
);
// Returns: { score, strengths, weaknesses, suggestions, summary }
```

#### 2. generateBookingRecommendations()
```javascript
const recommendations = await generateBookingRecommendations(
  roomName,        // String - nama ruangan
  bookingDetails   // Object - {date, time, duration, personCount, purpose}
);
// Returns: { available, recommendation, tips, alternative }
```

#### 3. chatWithAI()
```javascript
const answer = await chatWithAI(question);
// Returns: String - jawaban AI
```

---

## ⚙️ Advanced Configuration

### Custom Prompt Tuning

Edit prompt di `geminiService.js` untuk hasil yang lebih sesuai:

```javascript
// Untuk Proposal Review
const prompt = `
Anda adalah seorang reviewer profesional untuk proposal. 
[Custom instructions di sini]
`;

// Untuk Booking Recommendations
const prompt = `
Anda adalah asisten booking ruangan yang expert.
[Custom instructions di sini]
`;
```

### Model Selection

Saat ini menggunakan `gemini-1.5-flash` untuk performa cepat. 
Bisa diubah ke model lain:

```javascript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro'  // Model yang lebih advanced
});
```

---

## 🚀 Performance Tips

1. **Caching Results**
   - AI review results sudah disimpan di database
   - Tidak perlu generate review berkali-kali

2. **Batch Processing**
   - Untuk multiple proposals, generate review satu per satu
   - Hindari concurrent requests untuk menghindari rate limiting

3. **Error Handling**
   - Wrap semua Gemini calls dengan try-catch
   - Provide fallback response jika AI fail

```javascript
try {
  const review = await generateProposalReview(content, category);
  return review;
} catch (error) {
  console.error('AI Error:', error);
  // Return fallback review
  return {
    score: 0,
    strengths: [],
    weaknesses: ["Unable to generate AI review"],
    suggestions: [],
    summary: "AI service temporarily unavailable"
  };
}
```

---

## ⚠️ Rate Limiting & Quotas

Google Gemini API memiliki rate limits:
- **Free tier**: Hingga 60 requests per minute
- **Paid tier**: Sesuai dengan pricing plan

Untuk handle rate limiting:

```javascript
// Add delay antara requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Batch processing dengan delay
for (const proposal of proposals) {
  await generateReview(proposal);
  await delay(1000); // 1 detik delay
}
```

---

## 🧪 Testing AI Integration

### Manual Testing dengan cURL

```bash
# Generate AI Review
curl -X POST http://localhost:3000/api/proposals/proposal_id/ai-review \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json"

# Get AI Recommendations
curl -X POST http://localhost:3000/api/bookings/recommendations \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room_id",
    "startDate": "2025-01-15",
    "startTime": "09:00",
    "endTime": "11:00",
    "purpose": "Meeting",
    "personCount": 10
  }'
```

### Unit Testing

```javascript
// test/geminiService.test.js
const { generateProposalReview } = require('../src/util/geminiService');

describe('Gemini AI Service', () => {
  test('generateProposalReview returns valid structure', async () => {
    const review = await generateProposalReview(
      'Sample proposal content...',
      'academic'
    );
    
    expect(review).toHaveProperty('score');
    expect(review).toHaveProperty('strengths');
    expect(review).toHaveProperty('weaknesses');
    expect(review.score).toBeGreaterThanOrEqual(0);
    expect(review.score).toBeLessThanOrEqual(100);
  });
});
```

---

## 📊 Monitoring AI Calls

Track semua AI calls untuk monitoring:

```javascript
// Add logging ke geminiService.js
const generateProposalReview = async (proposalContent, category) => {
  const startTime = Date.now();
  
  try {
    // ... AI call logic
    const duration = Date.now() - startTime;
    console.log(`AI Review generated in ${duration}ms for ${category}`);
    return review;
  } catch (error) {
    console.error(`AI Error after ${Date.now() - startTime}ms:`, error);
    throw error;
  }
};
```

---

## 🔐 Security Best Practices

1. **Never expose API Key**
   - Keep GEMINI_API_KEY di `.env` file
   - Never commit `.env` ke git
   - Add `.env` ke `.gitignore`

2. **Validate Input**
   - Sanitize user input sebelum dikirim ke Gemini
   - Check content length dan format

3. **Rate Limiting**
   - Implement rate limiting di backend
   - Prevent abuse dari single user

```javascript
// Example: Limit AI reviews per user per hour
const userAIUsage = {};

const canGenerateAIReview = (userId) => {
  const now = Date.now();
  if (!userAIUsage[userId]) {
    userAIUsage[userId] = [];
  }
  
  // Remove old entries (older than 1 hour)
  userAIUsage[userId] = userAIUsage[userId]
    .filter(time => now - time < 3600000);
  
  // Check limit (max 10 per hour)
  if (userAIUsage[userId].length >= 10) {
    return false;
  }
  
  userAIUsage[userId].push(now);
  return true;
};
```

---

## 📚 Additional Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Google Generative AI Node.js SDK](https://github.com/google/generative-ai-js)
- [API Pricing](https://ai.google.dev/pricing)

---

**Last Updated: December 2024**
