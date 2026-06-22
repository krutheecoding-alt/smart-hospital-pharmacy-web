import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatNumber } from '../../lib/format';
import { DataTable, type Column } from '../../components/ui';

export function AbcVedTab() {
  const { token } = useAuth();
  const [drugs, setDrugs] = useState<Record<string, unknown>[]>([]);

  const load = useCallback(async () => {
    const r = await callApi<{ success: boolean; drugs: Record<string, unknown>[] }>('getDrugsABC', token, {});
    if (r.success) {
      const sorted = [...(r.drugs || [])].sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
      setDrugs(sorted);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'drug_id', header: 'รหัส' },
    { key: 'generic_name', header: 'ชื่อสามัญ' },
    { key: 'abc_class', header: 'ABC', render: (d) => <span className="badge badge-info">{String(d.abc_class)}</span> },
    { key: 'ved_class', header: 'VED', render: (d) => <span className="badge badge-muted">{String(d.ved_class)}</span> },
    { key: 'stock', header: 'สต็อก', render: (d) => formatNumber(d.stock as number) },
    { key: 'value', header: 'มูลค่า', render: (d) => formatCurrency(d.value as number) }
  ];

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>ABC / VED Analysis</span>
        <button type="button" className="btn btn-sm btn-outline" onClick={load}><i className="bi bi-arrow-clockwise" /></button>
      </div>
      <DataTable columns={cols} rows={drugs} rowKey={(d) => String(d.drug_id)} />
    </div>
  );
}
