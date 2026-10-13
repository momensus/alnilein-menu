import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb } from '../../lib/db.js';
import { isAuthenticated } from '../../lib/auth.js';
import { bumpMenuVersion } from '../../lib/version.js';
import { items } from '../../../db/schema.js';

function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: 'Unauthorized' });
}

function cookieHeader(req: VercelRequest): string | undefined {
  return Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(cookieHeader(req))) return unauthorized(res);
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    const db = getDb();
    if (req.method === 'PUT') {
      const patch: {
        name?: string;
        price?: number | null;
        isAvailable?: number;
        sortOrder?: number;
        updatedAt: number;
      } = { updatedAt: Date.now() };
      if (typeof req.body?.name === 'string' && req.body.name.trim()) patch.name = req.body.name.trim();
      if (req.body?.price === null) {
        patch.price = null;
      } else if (req.body?.price !== undefined) {
        const n = Number(req.body.price);
        if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: 'السعر غير صالح' });
        patch.price = Math.trunc(n);
      }
      if (req.body?.isAvailable === 0 || req.body?.isAvailable === 1) patch.isAvailable = req.body.isAvailable;
      if (Number.isFinite(req.body?.sortOrder)) patch.sortOrder = Math.trunc(req.body.sortOrder);
      await db.update(items).set(patch).where(eq(items.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await db.delete(items).where(eq(items.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin item failed', error);
    return res.status(500).json({ error: 'Failed to manage item' });
  }
}
