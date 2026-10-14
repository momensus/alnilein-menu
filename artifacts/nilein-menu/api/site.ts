import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc } from 'drizzle-orm';
import { getDb } from './lib/db.js';
import { payments, phones } from './db/schema.js';
import { getMenuVersion } from './lib/version.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = getDb();
    const [phoneRows, paymentRows, version] = await Promise.all([
      db.select().from(phones).orderBy(asc(phones.sortOrder)),
      db.select().from(payments).orderBy(asc(payments.sortOrder)),
      getMenuVersion(),
    ]);
    return res.status(200).json({
      version,
      phones: phoneRows.map((row) => ({ id: row.id, number: row.number })),
      payments: paymentRows.map((row) => ({
        id: row.id,
        methodId: row.methodId,
        name: row.name,
        color: row.color,
        ink: row.ink,
        number: row.number,
        holder: row.holder,
      })),
    });
  } catch (error) {
    console.error('GET /api/site failed', error);
    return res.status(500).json({ error: 'Failed to load site info' });
  }
}
