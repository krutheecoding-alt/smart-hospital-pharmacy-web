import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { formatDate } from '../../lib/format';
import { DataTable, type Column, FormField, FormGrid, StatusBadge } from '../../components/ui';

export function RecallTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run } = useApiAction();
  const [recalls, setRecalls] = useState<Record<string, unknown>[]>([]);
  const [drugId, setDrugId] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const r = await callApi<{ success: boolean; recalls: Record<string, unknown>[] }>('getRecalls', token, {});
    if (r.success) setRecalls(r.recalls || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!drugId.trim() || !lotNo.trim()) { toast('กรุณาระบุรหัสยาและ Lot', 'error'); return; }
    const r = await run('createRecall', { drug_id: drugId.trim(), lot_no: lotNo.trim(), reason });
    if (r?.success) {
      toast('Recall สำเร็จ', 'success');
      setDrugId(''); setLotNo(''); setReason('');
      load();
    }
  };

  const resolve = async (recallId: string) => {
    const resolution = prompt('การดำเนินการปิด Recall:', 'Resolved');
    if (resolution === null) return;
    const r = await run('resolveRecall', { recall_id: recallId, resolution: resolution || 'Resolved' });
    if (r?.success) { toast('ปิด Recall สำเร็จ', 'success'); load(); }
  };

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'recall_id', header: 'Recall ID' },
    { key: 'drug_id', header: 'รหัสยา' },
    { key: 'lot_no', header: 'Lot' },
    { key: 'reason', header: 'เหตุผล' },
    { key: 'recall_date', header: 'วันที่', render: (r) => formatDate(String(r.recall_date)) },
    { key: 'action', header: 'ดำเนินการ' },
    { key: 'status', header: 'สถานะ', render: (r) => <StatusBadge status={String(r.status)} /> },
    {
      key: '_resolve',
      header: '',
      render: (r) => r.status === 'Active' ? (
        <button type="button" className="btn btn-sm btn-success" onClick={() => resolve(String(r.recall_id))}>
          <i className="bi bi-check" /> ปิด
        </button>
      ) : null
    }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header">สร้าง Recall</div>
        <div className="card-body-pad">
          <FormGrid cols={3}>
            <FormField label="รหัสยา *"><input className="form-control" value={drugId} onChange={(e) => setDrugId(e.target.value)} /></FormField>
            <FormField label="Lot No *"><input className="form-control" value={lotNo} onChange={(e) => setLotNo(e.target.value)} /></FormField>
            <FormField label="เหตุผล"><input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} /></FormField>
          </FormGrid>
          <button type="button" className="btn btn-danger" onClick={create}><i className="bi bi-exclamation-triangle" /> สร้าง Recall</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">รายการ Recall</div>
        <DataTable columns={cols} rows={recalls} rowKey={(r) => String(r.recall_id)} />
      </div>
    </>
  );
}
