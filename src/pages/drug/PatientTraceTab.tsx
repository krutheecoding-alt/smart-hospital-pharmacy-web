import { useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/format';
import { DataTable, type Column, FormField, FormGrid } from '../../components/ui';

export function PatientTraceTab() {
  const { token } = useAuth();
  const [hn, setHn] = useState('');
  const [drugId, setDrugId] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    const r = await callApi<{ success: boolean; traces: Record<string, unknown>[] }>('getPatientTraces', token, {
      patient_hn: hn.trim(),
      drug_id: drugId.trim()
    });
    setLoading(false);
    if (r.success) setRows(r.traces || []);
  };

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'patient_hn', header: 'HN' },
    { key: 'patient_name', header: 'ชื่อผู้ป่วย' },
    { key: 'drug_id', header: 'รหัสยา' },
    { key: 'lot_no', header: 'Lot' },
    { key: 'dispense_date', header: 'วันที่จ่าย', render: (t) => formatDate(String(t.dispense_date)) },
    { key: 'department', header: 'แผนก' }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header">ค้นหา Patient Trace</div>
        <div className="card-body-pad">
          <FormGrid cols={2}>
            <FormField label="HN ผู้ป่วย"><input className="form-control" value={hn} onChange={(e) => setHn(e.target.value)} placeholder="เว้นว่าง = ทั้งหมด" /></FormField>
            <FormField label="รหัสยา"><input className="form-control" value={drugId} onChange={(e) => setDrugId(e.target.value)} placeholder="เว้นว่าง = ทั้งหมด" /></FormField>
          </FormGrid>
          <button type="button" className="btn btn-primary" onClick={search} disabled={loading}>
            <i className="bi bi-search" /> ค้นหา
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">ผลการค้นหา</div>
        <DataTable columns={cols} rows={rows} rowKey={(t) => `${t.patient_hn}-${t.drug_id}-${t.lot_no}-${t.dispense_date}`} />
      </div>
    </>
  );
}
