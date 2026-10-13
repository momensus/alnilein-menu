import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '../../db/schema.js';

let client: Client | null = null;
let database: LibSQLDatabase<typeof schema> | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  if (database) return database;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error('Missing TURSO_DATABASE_URL environment variable');
  }
  client = createClient({ url, authToken });
  database = drizzle(client, { schema });
  return database;
}
