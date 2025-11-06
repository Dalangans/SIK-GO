import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Konfigurasi API Key ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!GEMINI_API_KEY) {
  console.error("❗ GEMINI_API_KEY tidak ditemukan di .env");
  process.exit(1);
}

// --- Validasi input ---
const AiRequest = z.object({
  input: z.string().min(1),
  system: z.string().optional(),
  temperature: z.number().min(0).max(2).optional()
});

// --- Endpoint utama ---
app.post('/api/ai', async (req, res) => {
  const parse = AiRequest.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ ok: false, error: parse.error.issues });
  }

  const { input, system, temperature = 0.7 } = parse.data;

  try {
    // --- Request ke Gemini API ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const body = {
      contents: [
        ...(system ? [{ role: 'system', parts: [{ text: system }] }] : []),
        { role: 'user', parts: [{ text: input }] }
      ],
      generationConfig: { temperature }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Gemini API Error:', data);
      return res.status(response.status).json({ ok: false, error: data });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no text)';
    res.json({ ok: true, text });
  } catch (e: any) {
    console.error('🔥 Server Error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Jalankan server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Gemini AI backend running on port ${PORT}`));
