import { sql } from 'drizzle-orm';
import { getDb } from './db.js';
import { meta } from '../../db/schema.js';

export const MENU_VERSION_KEY = 'menu_version';

/** Bump the menu version so connected SSE clients re-fetch. */
export async function bumpMenuVersion(): Promise<number> {
  const db = getDb();
  await db
    .insert(meta)
    .values({ key: MENU_VERSION_KEY, value: 1 })
    .onConflictDoUpdate({
      target: meta.key,
      set: { value: sql`${meta.value} + 1` },
    });
  const rows = await db.select().from(meta).where(sql`${meta.key} = ${MENU_VERSION_KEY}`);
  return rows[0]?.value ?? 1;
}

export async function getMenuVersion(): Promise<number> {
  const db = getDb();
  const rows = await db.select().from(meta).where(sql`${meta.key} = ${MENU_VERSION_KEY}`);
  return rows[0]?.value ?? 0;
}
