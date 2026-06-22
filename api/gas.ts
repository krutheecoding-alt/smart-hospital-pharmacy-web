import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const gasUrl = process.env.GAS_API_URL || process.env.VITE_GAS_API_URL;
  if (!gasUrl) {
    return res.status(500).json({ success: false, message: 'GAS_API_URL not configured on Vercel' });
  }

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text.substring(0, 500) };
    }
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy error';
    return res.status(500).json({ success: false, message });
  }
}