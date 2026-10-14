import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { isAuthenticated } from '../lib/auth.js';
import { bumpMenuVersion } from '../lib/version.js';
import { categories, items } from '../db/schema.js';

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
      const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
      return res.status(200).json({ categories: rows });
    }
    if (req.method === 'POST') {
      if (req.body?.action === 'move') {
        const id = typeof req.body?.id === 'string' ? req.body.id : '';
        const direction = req.body?.direction;
        if (!id || (direction !== 'up' && direction !== 'down')) {
          return res.status(400).json({ error: 'Invalid move request' });
        }
        const ordered = await db.select().from(categories).orderBy(asc(categories.sortOrder));
        const index = ordered.findIndex((row) => row.id === id);
        if (index < 0) return res.status(404).json({ error: 'Category not found' });
        const neighbor = direction === 'up' ? ordered[index - 1] : ordered[index + 1];
        if (!neighbor) return res.status(200).json({ ok: true });
        const now = Date.now();
        await db.update(categories).set({ sortOrder: neighbor.sortOrder, updatedAt: now }).where(eq(categories.id, id));
        await db.update(categories).set({ sortOrder: ordered[index].sortOrder, updatedAt: now }).where(eq(categories.id, neighbor.id));
        await bumpMenuVersion();
        return res.status(200).json({ ok: true });
      }
      const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
      const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
      if (!title) return res.status(400).json({ error: 'اسم القسم مطلوب' });
      const now = Date.now();
      const row = {
        id: randomUUID(),
        title,
        note,
        sortOrder: Number.isFinite(req.body?.sortOrder) ? Math.trunc(req.body.sortOrder) : 0,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(categories).values(row);
      await bumpMenuVersion();
      return res.status(201).json({ category: row });
    }
    if (req.method === 'PUT') {
      const id = queryId(req);
      if (!id) return res.status(400).json({ error: 'Missing id' });
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
      const id = queryId(req);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const remaining = await db.select({ id: items.id }).from(items).where(eq(items.categoryId, id));
      if (remaining.length > 0) {
        return res.status(409).json({ error: 'احذف أصناف القسم أولاً قبل حذف القسم' });
      }
      await db.delete(categories).where(eq(categories.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin categories failed', error);
    return res.status(500).json({ error: 'Failed to manage categories' });
  }
}
