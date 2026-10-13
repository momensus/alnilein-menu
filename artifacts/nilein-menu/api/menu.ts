import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc } from 'drizzle-orm';
import { getDb } from './lib/db.js';
import { categories, items } from './db/schema.js';
import { getMenuVersion } from './lib/version.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = getDb();
    const [allCategories, allItems, version] = await Promise.all([
      db.select().from(categories).orderBy(asc(categories.sortOrder)),
      db.select().from(items).orderBy(asc(items.sortOrder)),
      getMenuVersion(),
    ]);
    const byCategory = new Map<string, typeof allItems>();
    for (const item of allItems) {
      if (item.isAvailable !== 1) continue;
      const list = byCategory.get(item.categoryId) ?? [];
      list.push(item);
      byCategory.set(item.categoryId, list);
    }
    return res.status(200).json({
      version,
      categories: allCategories.map((category) => ({
        id: category.id,
        title: category.title,
        note: category.note,
        items: (byCategory.get(category.id) ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
        })),
      })),
    });
  } catch (error) {
    console.error('GET /api/menu failed', error);
    return res.status(500).json({ error: 'Failed to load menu' });
  }
}
