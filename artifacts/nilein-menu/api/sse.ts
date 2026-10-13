import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMenuVersion } from './lib/version.js';

export const config = {
  maxDuration: 300,
};

/**
 * Server-sent events stream for live menu updates.
 * Polls the shared menu_version in Turso (works across serverless
 * instances) and pushes an event whenever the admin changes the menu.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  const send = (event: string, data: string) => {
    if (closed) return false;
    try {
      res.write(`event: ${event}\ndata: ${data}\n\n`);
      return true;
    } catch {
      closed = true;
      return false;
    }
  };

  try {
    let lastVersion = await getMenuVersion();
    send('version', JSON.stringify({ version: lastVersion }));

    const timer = setInterval(async () => {
      if (closed) {
        clearInterval(timer);
        return;
      }
      try {
        const current = await getMenuVersion();
        if (current !== lastVersion) {
          lastVersion = current;
          if (!send('menu-updated', JSON.stringify({ version: current }))) {
            clearInterval(timer);
          }
        } else {
          if (!send('ping', JSON.stringify({ version: current }))) {
            clearInterval(timer);
          }
        }
      } catch {
        clearInterval(timer);
        if (!closed) {
          try {
            res.end();
          } catch {
            /* already closed */
          }
        }
      }
    }, 2000);

    req.on('close', () => {
      clearInterval(timer);
    });
  } catch (error) {
    console.error('SSE failed', error);
    if (!closed) {
      try {
        res.end();
      } catch {
        /* already closed */
      }
    }
  }
}
