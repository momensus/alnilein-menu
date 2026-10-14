import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '../_lib/db.js';
import { isAuthenticated } from '../_lib/auth.js';
import { bumpMenuVersion } from '../_lib/version.js';
import { payments } from '../db/schema.js';

function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: 'Unauthorized' });
}

function cookieHeader(req: VercelRequest): string | undefined {
  return Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
}

function queryId(req: VercelRequest): string {
  const id = req.query.id;
  return typeof id === 'string' ? id : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(cookieHeader(req))) return unauthorized(res);
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const rows = await db.select().from(payments).orderBy(asc(payments.sortOrder));
      return res.status(200).json({ payments: rows });
    }
    if (req.method === 'PUT') {
      const id = queryId(req);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const patch: { number?: string; holder?: string; updatedAt: number } = { updatedAt: Date.now() };
      if (typeof req.body?.number === 'string') patch.number = req.body.number.trim();
      if (typeof req.body?.holder === 'string') patch.holder = req.body.holder.trim();
      await db.update(payments).set(patch).where(eq(payments.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin payments failed', error);
    return res.status(500).json({ error: 'Failed to manage payments' });
  }
}
