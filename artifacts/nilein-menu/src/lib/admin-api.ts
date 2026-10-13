export type AdminCategory = {
  id: string;
  title: string;
  note: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type AdminItem = {
  id: string;
  categoryId: string;
  name: string;
  price: number | null;
  isAvailable: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export const adminCategoriesKey = ['admin-categories'] as const;
export const adminItemsKey = ['admin-items'] as const;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
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

export function login(password: string) {
  return request<{ ok: boolean }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function verifyAuth() {
  return request<{ authenticated: boolean }>('/api/auth/verify');
}

export function getAdminCategories() {
  return request<{ categories: AdminCategory[] }>('/api/admin/categories');
}

export function createCategory(input: { title: string; note?: string }) {
  return request<{ category: AdminCategory }>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCategory(id: string, input: { title?: string; note?: string }) {
  return request<{ ok: boolean }>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: string) {
  return request<{ ok: boolean }>(`/api/admin/categories/${id}`, { method: 'DELETE' });
}

export function getAdminItems(categoryId?: string) {
  const url = categoryId ? `/api/admin/items?categoryId=${encodeURIComponent(categoryId)}` : '/api/admin/items';
  return request<{ items: AdminItem[] }>(url);
}

export function createItem(input: { categoryId: string; name: string; price?: number | null }) {
  return request<{ item: AdminItem }>('/api/admin/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateItem(
  id: string,
  input: { name?: string; price?: number | null; isAvailable?: number },
) {
  return request<{ ok: boolean }>(`/api/admin/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteItem(id: string) {
  return request<{ ok: boolean }>(`/api/admin/items/${id}`, { method: 'DELETE' });
}
