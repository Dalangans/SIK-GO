import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- init provider (OpenAI contoh) ---
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- schema request (validasi input dari FE) ---
const AiRequest = z.object({
  task: z.enum(['summarize','classify','chat','extract']).default('chat'),
  input: z.string().min(1),
  system: z.string().optional(),
  temperature: z.number().min(0).max(2).optional()
});

// --- endpoint non-stream ---
app.post('/api/ai', async (req, res) => {
  const parse = AiRequest.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });

  const { input, system, temperature=0.7 } = parse.data;

  try {
    const resp = await client.responses.create({
      model: process.env.OPENAI_MODEL!,
      temperature,
      input: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: input }
      ]
    });

    // keluarkan teks pertama
    const text = resp.output_text ?? '';
    res.json({ ok: true, text });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ ok:false, error: e.message ?? 'AI error' });
  }
});

// --- endpoint streaming (SSE) ---
app.get('/api/ai/stream', async (req, res) => {
  const input = (req.query.q as string) || '';
  if (!input) return res.status(400).end('query ?q= kosong');

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  });

  try {
    const stream = await client.responses.stream({
      model: process.env.OPENAI_MODEL!,
      input: [{ role: 'user', content: input }]
    });

    stream.on('text', (chunk: string) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    stream.on('end', () => res.end());
    stream.on('error', (err: any) => {
      console.error(err);
      res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
      res.end();
    });
  } catch (e:any) {
    console.error(e);
    res.end();
  }
});

app.listen(process.env.PORT, () =>
  console.log(`AI backend running on :${process.env.PORT}`)
);
