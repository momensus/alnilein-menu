import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type PublicMenuItem = {
  id: string;
  name: string;
  price: number | null;
};

export type PublicMenuCategory = {
  id: string;
  title: string;
  note: string;
  items: PublicMenuItem[];
};

export type PublicMenu = {
  version: number;
  categories: PublicMenuCategory[];
};

export const menuQueryKey = ['menu'] as const;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body?.error === 'string') message = body.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function fetchMenu(): Promise<PublicMenu> {
  return fetchJson<PublicMenu>('/api/menu');
}

export type SitePhone = { id: string; number: string };
export type SitePayment = {
  id: string;
  methodId: string;
  name: string;
  color: string;
  ink: string;
  number: string;
  holder: string;
};
export type SiteInfo = { version: number; phones: SitePhone[]; payments: SitePayment[] };

export const siteQueryKey = ['site'] as const;

export function fetchSite(): Promise<SiteInfo> {
  return fetchJson<SiteInfo>('/api/site');
}

/** Format an SDG price integer with dot grouping (100000 -> 100.000), or a dash when unset. */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '—';
  return new Intl.NumberFormat('de-DE').format(price);
}

/**
 * Subscribe to live menu updates. When the admin changes anything,
 * the server pushes an event and we invalidate the menu query so
 * every open tab re-renders with fresh prices — no refresh needed.
 */
export function useMenuLiveUpdates(enabled = true) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return;
    const source = new EventSource('/api/sse');
    const onUpdate = () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKey });
    };
    source.addEventListener('menu-updated', onUpdate);
    return () => {
      source.removeEventListener('menu-updated', onUpdate);
      source.close();
    };
  }, [enabled, queryClient]);
}
