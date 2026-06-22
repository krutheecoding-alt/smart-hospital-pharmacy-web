import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { formatDate } from '../../lib/format';
import { DataTable, type Column, FormField, FormGrid } from '../../components/ui';

export function UnitDoseTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run } = useApiAction();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [drugId, setDrugId] = useState('');
  const [parentLot, setParentLot] = useState('');
  const [newLot, setNewLot] = useState('');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');

  const load = useCallback(async () => {
    const r = await callApi<{ success: boolean; unitDoses: Record<string, unknown>[] }>('getUnitDoses', token, {});
    if (r.success) setRows(r.unitDoses || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!drugId.trim() || !parentLot.trim() || !qty) {
      toast('กรุณาระบุรหัสยา Parent Lot และจำนวน', 'error');
      return;
    }
    const r = await run<{ success: boolean; new_lot?: string }>('createUnitDose', {
      drug_id: drugId.trim(),
      parent_lot: parentLot.trim(),
      new_lot: newLot,
      qty,
      expiry
    });
    if (r?.success) {
      toast(`Unit Dose สำเร็จ Lot: ${r.new_lot || '-'}`, 'success');
      load();
    }
  };

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'drug_id', header: 'รหัสยา' },
    { key: 'parent_lot', header: 'Parent Lot' },
    { key: 'new_lot', header: 'New Lot' },
    { key: 'qty', header: 'จำนวน' },
    { key: 'expiry', header: 'หมดอายุ', render: (r) => formatDate(String(r.expiry)) },
    { key: 'operator', header: 'ผู้ดำเนินการ' }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header">แบ่งยา Unit Dose</div>
        <div className="card-body-pad">
          <FormGrid cols={3}>
            <FormField label="รหัสยา *"><input className="form-control" value={drugId} onChange={(e) => setDrugId(e.target.value)} /></FormField>
            <FormField label="Parent Lot *"><input className="form-control" value={parentLot} onChange={(e) => setParentLot(e.target.value)} /></FormField>
            <FormField label="New Lot"><input className="form-control" value={newLot} onChange={(e) => setNewLot(e.target.value)} placeholder="เว้นว่าง = สร้างอัตโนมัติ" /></FormField>
            <FormField label="จำนวน *"><input className="form-control" type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></FormField>
            <FormField label="หมดอายุ"><input className="form-control" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></FormField>
          </FormGrid>
          <button type="button" className="btn btn-primary" onClick={create}><i className="bi bi-scissors" /> แบ่งยา</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">ประวัติ Unit Dose</div>
        <DataTable columns={cols} rows={rows} rowKey={(r) => `${r.drug_id}-${r.new_lot}-${r.parent_lot}`} />
      </div>
    </>
  );
}
