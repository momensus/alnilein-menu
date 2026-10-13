import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sessionCookieHeader, verifyPassword } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin password is not configured' });
  }
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }
  res.setHeader('Set-Cookie', sessionCookieHeader(process.env.ADMIN_PASSWORD as string));
  return res.status(200).json({ ok: true });
}
