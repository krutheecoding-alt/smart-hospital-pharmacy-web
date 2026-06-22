import type { ApiResult } from './types';

const API_BASE = '/api/gas';

export async function callApi<T extends ApiResult = ApiResult>(
  action: string,
  token: string,
  data: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, token, data })
  });
  const result = await response.json();
  return result as T;
}

export async function fetchBranding(): Promise<ApiResult> {
  const response = await fetch('/api/branding');
  return response.json();
}

export function logoUrl(gasBase?: string): string {
  const base = gasBase || import.meta.env.VITE_GAS_API_URL || '';
  if (!base) return '';
  const joiner = base.includes('?') ? '&' : '?';
  return base + joiner + 'action=logo';
}