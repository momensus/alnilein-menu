import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const cookieHeader = Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
  return res.status(200).json({ authenticated: isAuthenticated(cookieHeader) });
}
