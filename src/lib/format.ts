export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('th-TH');
}

export function formatNumber(num: number | string | undefined): string {
  return Number(num || 0).toLocaleString('th-TH');
}

export function formatCurrency(num: number | string | undefined): string {
  return Number(num || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
}

export function expiryBadgeClass(days: number): string {
  if (days <= 7) return 'badge-expiry-7';
  if (days <= 15) return 'badge-expiry-15';
  if (days <= 30) return 'badge-expiry-30';
  if (days <= 60) return 'badge-expiry-60';
  return 'badge-expiry-90';
}