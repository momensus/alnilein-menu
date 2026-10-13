import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '../lib/db';
import { isAuthenticated } from '../lib/auth';
import { bumpMenuVersion } from '../lib/version';
import { items } from '../../db/schema';

function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: 'Unauthorized' });
}

function cookieHeader(req: VercelRequest): string | undefined {
  return Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
}

function normalizePrice(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  const n = typeof value === 'string' && value.trim() === '' ? NaN : Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.trunc(n);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(cookieHeader(req))) return unauthorized(res);
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : '';
      const rows = categoryId
        ? await db.select().from(items).where(eq(items.categoryId, categoryId)).orderBy(asc(items.sortOrder))
        : await db.select().from(items).orderBy(asc(items.sortOrder));
      return res.status(200).json({ items: rows });
    }
    if (req.method === 'POST') {
      const categoryId = typeof req.body?.categoryId === 'string' ? req.body.categoryId : '';
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      if (!categoryId) return res.status(400).json({ error: 'القسم مطلوب' });
      if (!name) return res.status(400).json({ error: 'اسم الصنف مطلوب' });
      const price = normalizePrice(req.body?.price);
      if (price === undefined && req.body?.price !== undefined && req.body?.price !== null) {
        return res.status(400).json({ error: 'السعر غير صالح' });
      }
      const now = Date.now();
      const row = {
        id: randomUUID(),
        categoryId,
        name,
        price: price ?? null,
        isAvailable: req.body?.isAvailable === 0 ? 0 : 1,
        sortOrder: Number.isFinite(req.body?.sortOrder) ? Math.trunc(req.body.sortOrder) : 0,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(items).values(row);
      await bumpMenuVersion();
      return res.status(201).json({ item: row });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin items failed', error);
    return res.status(500).json({ error: 'Failed to manage items' });
  }
}
