import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb } from '../../lib/db.js';
import { isAuthenticated } from '../../lib/auth.js';
import { bumpMenuVersion } from '../../lib/version.js';
import { categories, items } from '../../../db/schema.js';

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
      const patch: { title?: string; note?: string; sortOrder?: number; updatedAt: number } = {
        updatedAt: Date.now(),
      };
      if (typeof req.body?.title === 'string' && req.body.title.trim()) patch.title = req.body.title.trim();
      if (typeof req.body?.note === 'string') patch.note = req.body.note.trim();
      if (Number.isFinite(req.body?.sortOrder)) patch.sortOrder = Math.trunc(req.body.sortOrder);
      await db.update(categories).set(patch).where(eq(categories.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const remaining = await db.select({ id: items.id }).from(items).where(eq(items.categoryId, id));
      if (remaining.length > 0) {
        return res.status(409).json({ error: 'احذف أصناف القسم أولاً قبل حذف القسم' });
      }
      await db.delete(categories).where(eq(categories.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin category item failed', error);
    return res.status(500).json({ error: 'Failed to manage category' });
  }
}
