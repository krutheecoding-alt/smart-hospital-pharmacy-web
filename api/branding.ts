import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const gasUrl = process.env.GAS_API_URL || process.env.VITE_GAS_API_URL;
  if (!gasUrl) {
    return res.status(500).json({ success: false, message: 'GAS_API_URL not configured' });
  }
  try {
    const joiner = gasUrl.includes('?') ? '&' : '?';
    const response = await fetch(gasUrl + joiner + 'action=branding', { redirect: 'follow' });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Branding fetch failed';
    return res.status(500).json({ success: false, message });
  }
}