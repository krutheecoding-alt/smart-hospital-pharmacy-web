import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, formatNumber } from '../../lib/format';
import { DataTable, type Column } from '../../components/ui';

function buildQr(l: Record<string, unknown>): string {
  return [l.drug_id, l.lot_no, l.expiry_date, l.available].filter((x) => x != null && x !== '').join('|');
}

export function LotStockTab() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lots, setLots] = useState<Record<string, unknown>[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await callApi<{ success: boolean; lots: Record<string, unknown>[] }>('getLotStock', token, {});
    setLoading(false);
    if (r.success) setLots(r.lots || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'drug_id', header: 'รหัสยา' },
    { key: 'lot_no', header: 'Lot' },
    { key: 'expiry_date', header: 'หมดอายุ', render: (l) => formatDate(String(l.expiry_date)) },
    { key: 'warehouse', header: 'คลัง' },
    { key: 'qty', header: 'คงเหลือ', render: (l) => formatNumber(l.qty as number) },
    { key: 'available', header: 'Available', render: (l) => formatNumber(l.available as number) },
    { key: 'unit_cost', header: 'ต้นทุน', render: (l) => formatCurrency(l.unit_cost as number) },
    { key: 'qr', header: 'QR', render: (l) => <code className="code-sm">{buildQr(l)}</code> },
    {
      key: 'barcode',
      header: 'Barcode',
      render: (l) => (
        <code className="code-sm">
          {String(l.lot_barcode || `HPSL${String(l.lot_id).replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`)}
        </code>
      )
    }
  ];

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Lot Stock</span>
        <button type="button" className="btn btn-sm btn-outline" onClick={load} disabled={loading}><i className="bi bi-arrow-clockwise" /></button>
      </div>
      <DataTable columns={cols} rows={lots} rowKey={(l) => String(l.lot_id)} />
    </div>
  );
}
