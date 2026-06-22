import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { DataTable, type Column, FormField, FormGrid, StatusBadge } from '../../components/ui';

export function StockCountTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run } = useApiAction();
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [counts, setCounts] = useState<Record<string, unknown>[]>([]);
  const [warehouse, setWarehouse] = useState('');
  const [drugId, setDrugId] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [systemQty, setSystemQty] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const [w, c] = await Promise.all([
      callApi<{ success: boolean; warehouses: Record<string, unknown>[] }>('getWarehouses', token),
      callApi<{ success: boolean; counts: Record<string, unknown>[] }>('getStockCounts', token, {})
    ]);
    if (w.success) setWarehouses(w.warehouses || []);
    if (c.success) setCounts(c.counts || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!warehouse || !drugId.trim() || !lotNo.trim()) {
      toast('กรุณาระบุคลัง รหัสยา และ Lot', 'error');
      return;
    }
    const r = await run<{ success: boolean; difference?: number }>('saveStockCount', {
      warehouse,
      drug_id: drugId.trim(),
      lot_no: lotNo.trim(),
      system_qty: systemQty,
      actual_qty: actualQty,
      reason
    });
    if (r?.success) {
      toast(`บันทึกตรวจนับสำเร็จ ผลต่าง: ${r.difference ?? '-'}`, 'success');
      load();
    }
  };

  const approve = async (countId: string) => {
    const r = await run('approveStockCount', { count_id: countId });
    if (r?.success) { toast('อนุมัติตรวจนับสำเร็จ', 'success'); load(); }
  };

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'warehouse', header: 'คลัง' },
    { key: 'drug_name', header: 'ยา', render: (c) => String(c.drug_name || c.drug_id) },
    { key: 'lot_no', header: 'Lot' },
    { key: 'system_qty', header: 'ระบบ' },
    { key: 'actual_qty', header: 'นับจริง' },
    { key: 'difference', header: 'ผลต่าง' },
    { key: 'approve', header: 'สถานะ', render: (c) => <StatusBadge status={String(c.approve)} /> },
    {
      key: '_act',
      header: '',
      render: (c) => c.approve === 'Pending' ? (
        <button type="button" className="btn btn-sm btn-success" onClick={() => approve(String(c.count_id))}>
          <i className="bi bi-check" /> อนุมัติ
        </button>
      ) : null
    }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header">บันทึกตรวจนับ</div>
        <div className="card-body-pad">
          <FormGrid cols={3}>
            <FormField label="คลัง *">
              <select className="form-control" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                <option value="">เลือกคลัง</option>
                {warehouses.map((w) => (
                  <option key={String(w.warehouse_id)} value={String(w.warehouse_id)}>{String(w.warehouse_name)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="รหัสยา *"><input className="form-control" value={drugId} onChange={(e) => setDrugId(e.target.value)} /></FormField>
            <FormField label="Lot *"><input className="form-control" value={lotNo} onChange={(e) => setLotNo(e.target.value)} /></FormField>
            <FormField label="จำนวนระบบ"><input className="form-control" type="number" value={systemQty} onChange={(e) => setSystemQty(e.target.value)} /></FormField>
            <FormField label="จำนวนนับจริง"><input className="form-control" type="number" value={actualQty} onChange={(e) => setActualQty(e.target.value)} /></FormField>
            <FormField label="เหตุผล"><input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} /></FormField>
          </FormGrid>
          <button type="button" className="btn btn-primary" onClick={save}><i className="bi bi-clipboard-check" /> บันทึกตรวจนับ</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">ประวัติตรวจนับ</div>
        <DataTable columns={cols} rows={counts} rowKey={(c) => String(c.count_id)} />
      </div>
    </>
  );
}
