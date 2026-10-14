import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { isAuthenticated } from '../lib/auth.js';
import { bumpMenuVersion } from '../lib/version.js';
import { phones } from '../db/schema.js';

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
      const rows = await db.select().from(phones).orderBy(asc(phones.sortOrder));
      return res.status(200).json({ phones: rows });
    }
    if (req.method === 'POST') {
      const number = typeof req.body?.number === 'string' ? req.body.number.trim() : '';
      if (!number) return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
      const now = Date.now();
      const row = { id: randomUUID(), number, sortOrder: 0, createdAt: now, updatedAt: now };
      await db.insert(phones).values(row);
      await bumpMenuVersion();
      return res.status(201).json({ phone: row });
    }
    if (req.method === 'PUT') {
      const id = queryId(req);
      const number = typeof req.body?.number === 'string' ? req.body.number.trim() : '';
      if (!id || !number) return res.status(400).json({ error: 'الرقم مطلوب' });
      await db.update(phones).set({ number, updatedAt: Date.now() }).where(eq(phones.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const id = queryId(req);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await db.delete(phones).where(eq(phones.id, id));
      await bumpMenuVersion();
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin phones failed', error);
    return res.status(500).json({ error: 'Failed to manage phones' });
  }
}
