import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { formatDate } from '../../lib/format';
import { DataTable, type Column, FormField, FormGrid, StatusBadge } from '../../components/ui';

export function TemperatureTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run } = useApiAction();
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [incidents, setIncidents] = useState<Record<string, unknown>[]>([]);

  const [wh, setWh] = useState('');
  const [temp, setTemp] = useState('');
  const [humidity, setHumidity] = useState('');
  const [incType, setIncType] = useState('Temperature');
  const [incDesc, setIncDesc] = useState('');
  const [incAction, setIncAction] = useState('');

  const load = useCallback(async () => {
    const [w, t, i] = await Promise.all([
      callApi<{ success: boolean; warehouses: Record<string, unknown>[] }>('getWarehouses', token),
      callApi<{ success: boolean; logs: Record<string, unknown>[] }>('getTemperatureLogs', token, { limit: 20 }),
      callApi<{ success: boolean; incidents: Record<string, unknown>[] }>('getIncidents', token, { limit: 30 })
    ]);
    if (w.success) setWarehouses(w.warehouses || []);
    if (t.success) setLogs(t.logs || []);
    if (i.success) setIncidents(i.incidents || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const record = async () => {
    if (!wh || temp === '') { toast('กรุณาเลือกคลังและระบุอุณหภูมิ', 'error'); return; }
    const r = await run<{ success: boolean; status?: string }>('recordTemperature', {
      warehouse: wh,
      temperature: temp,
      humidity
    });
    if (r?.success) {
      toast(`บันทึกอุณหภูมิ - สถานะ: ${r.status}`, r.status === 'HOLD' ? 'error' : 'success');
      load();
    }
  };

  const createIncident = async () => {
    if (!incDesc.trim()) { toast('กรุณาระบุรายละเอียด', 'error'); return; }
    const r = await run('createIncident', { type: incType, description: incDesc, action: incAction });
    if (r?.success) {
      toast('บันทึก Incident สำเร็จ', 'success');
      setIncDesc(''); setIncAction('');
      load();
    }
  };

  const resolve = async (incidentId: string) => {
    const resolution = prompt('การแก้ไข/มาตรการ:', 'Resolved');
    if (resolution === null) return;
    const r = await run('resolveIncident', { incident_id: incidentId, resolution: resolution || 'Resolved' });
    if (r?.success) { toast('ปิด Incident สำเร็จ', 'success'); load(); }
  };

  const logCols: Column<Record<string, unknown>>[] = [
    { key: 'warehouse', header: 'คลัง' },
    { key: 'temperature', header: 'อุณหภูมิ' },
    { key: 'humidity', header: 'ความชื้น' },
    { key: 'record_time', header: 'เวลา', render: (l) => formatDate(String(l.record_time)) },
    { key: 'recorder', header: 'ผู้บันทึก' },
    { key: 'status', header: 'สถานะ', render: (l) => <StatusBadge status={String(l.status)} /> }
  ];

  const incCols: Column<Record<string, unknown>>[] = [
    { key: 'type', header: 'ประเภท' },
    { key: 'description', header: 'รายละเอียด' },
    { key: 'date', header: 'วันที่', render: (i) => formatDate(String(i.date)) },
    { key: 'action', header: 'มาตรการ' },
    { key: 'status', header: 'สถานะ', render: (i) => <StatusBadge status={String(i.status)} /> },
    {
      key: '_resolve',
      header: '',
      render: (i) => i.status === 'Open' ? (
        <button type="button" className="btn btn-sm btn-success" onClick={() => resolve(String(i.incident_id))}>
          <i className="bi bi-check" />
        </button>
      ) : null
    }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header">บันทึกอุณหภูมิ</div>
        <div className="card-body-pad">
          <FormGrid cols={3}>
            <FormField label="คลัง *">
              <select className="form-control" value={wh} onChange={(e) => setWh(e.target.value)}>
                <option value="">เลือกคลัง</option>
                {warehouses.map((w) => (
                  <option key={String(w.warehouse_id)} value={String(w.warehouse_id)}>{String(w.warehouse_name)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="อุณหภูมิ (°C) *"><input className="form-control" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} /></FormField>
            <FormField label="ความชื้น (%)"><input className="form-control" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} /></FormField>
          </FormGrid>
          <button type="button" className="btn btn-primary" onClick={record}><i className="bi bi-thermometer-half" /> บันทึก</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">บันทึก Incident</div>
        <div className="card-body-pad">
          <FormGrid cols={3}>
            <FormField label="ประเภท">
              <select className="form-control" value={incType} onChange={(e) => setIncType(e.target.value)}>
                <option>Temperature</option><option>Quality</option><option>Security</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="รายละเอียด *"><input className="form-control" value={incDesc} onChange={(e) => setIncDesc(e.target.value)} /></FormField>
            <FormField label="มาตรการ"><input className="form-control" value={incAction} onChange={(e) => setIncAction(e.target.value)} /></FormField>
          </FormGrid>
          <button type="button" className="btn btn-warning" onClick={createIncident}>บันทึก Incident</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">ประวัติอุณหภูมิ</div>
          <DataTable columns={logCols} rows={logs} rowKey={(l) => `${l.warehouse}-${l.record_time}`} />
        </div>
        <div className="card">
          <div className="card-header">Incidents</div>
          <DataTable columns={incCols} rows={incidents} rowKey={(i) => String(i.incident_id)} />
        </div>
      </div>
    </>
  );
}
