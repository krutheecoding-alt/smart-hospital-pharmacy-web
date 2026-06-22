import type { MenuItem } from './types';

const GROUP_LABELS: Record<string, string> = {
  main: 'หลัก',
  stock: 'คลังและจัดการยา',
  report: 'รายงาน',
  system: 'ระบบ'
};

function normalizePage(page: string): string {
  if (page === 'index' || page === '') return 'dashboard';
  return page;
}

export function menuToPath(item: MenuItem): string {
  const base = '/' + normalizePage(item.page);
  if (item.tab) return base + '?tab=' + encodeURIComponent(item.tab);
  return base;
}

export function isMenuActive(item: MenuItem, pathname: string, search: string): boolean {
  const page = normalizePage(item.page);
  const currentPage = normalizePage(pathname.replace(/^\//, '').split('?')[0] || 'dashboard');
  if (page !== currentPage) return false;
  const tabMatch = search.match(/[?&]tab=([^&]+)/);
  const urlTab = tabMatch ? decodeURIComponent(tabMatch[1]) : null;
  if (item.tab) {
    if (urlTab) return item.tab === urlTab;
    const defaults: Record<string, string> = { drug: 'tabDrugs', issue: 'tabRequest' };
    return item.tab === (defaults[item.page] || '');
  }
  return !urlTab;
}

export { GROUP_LABELS };