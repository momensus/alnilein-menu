import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { asc } from 'drizzle-orm';
import { getDb } from '../lib/db';
import { isAuthenticated } from '../lib/auth';
import { bumpMenuVersion } from '../lib/version';
import { categories } from '../../db/schema';

function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: 'Unauthorized' });
}

function cookieHeader(req: VercelRequest): string | undefined {
  return Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
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
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin categories failed', error);
    return res.status(500).json({ error: 'Failed to manage categories' });
  }
}
