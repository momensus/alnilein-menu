/**
 * Seed Turso with the static menu data.
 *
 * Usage (from artifacts/nilein-menu):
 *   $env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="..."
 *   npx -y tsx scripts/seed.ts
 */
import { createClient } from '@libsql/client';
import { menuCategories } from '../src/data/menu';

const DDL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  price INTEGER,
  is_available INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category_id);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS phones (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  method_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  ink TEXT NOT NULL,
  number TEXT NOT NULL DEFAULT '',
  holder TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('Missing TURSO_DATABASE_URL');
  const client = createClient({ url, authToken });

  await client.executeMultiple(DDL);
  console.log('tables ready');

  const now = Date.now();
  let categoryCount = 0;
  let itemCount = 0;

  for (const [categoryIndex, category] of menuCategories.entries()) {
    await client.execute({
      sql: `INSERT INTO categories (id, title, note, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET title=excluded.title, note=excluded.note, updated_at=excluded.updated_at`,
      args: [category.id, category.title, category.note, categoryIndex, now, now],
    });
    categoryCount += 1;

    for (const [itemIndex, item] of category.items.entries()) {
      await client.execute({
        sql: `INSERT INTO items (id, category_id, name, price, is_available, sort_order, created_at, updated_at)
              VALUES (?, ?, ?, NULL, 1, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET name=excluded.name, category_id=excluded.category_id, updated_at=excluded.updated_at`,
        args: [item.id, category.id, item.name, itemIndex, now, now],
      });
      itemCount += 1;
    }
  }

  await client.execute({
    sql: `INSERT INTO meta (key, value) VALUES ('menu_version', 1)
          ON CONFLICT(key) DO NOTHING`,
    args: [],
  });

  const paymentSeeds = [
    { id: 'pay-bankak', methodId: 'bankak', name: 'بنكك', color: '#b8312f', ink: '#fff', sort: 0 },
    { id: 'pay-ocash', methodId: 'ocash', name: 'أوكاش', color: '#7a4bb3', ink: '#fff', sort: 1 },
    { id: 'pay-fawry', methodId: 'fawry', name: 'فوري', color: '#f2b705', ink: '#1a1210', sort: 2 },
    { id: 'pay-cashi', methodId: 'cashi', name: 'كاشي', color: '#1f9d8a', ink: '#fff', sort: 3 },
  ];
  for (const p of paymentSeeds) {
    await client.execute({
      sql: `INSERT INTO payments (id, method_id, name, color, ink, number, holder, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, '', '', ?, ?, ?)
            ON CONFLICT(id) DO NOTHING`,
      args: [p.id, p.methodId, p.name, p.color, p.ink, p.sort, now, now],
    });
  }

  console.log(`seeded ${categoryCount} categories, ${itemCount} items`);
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
