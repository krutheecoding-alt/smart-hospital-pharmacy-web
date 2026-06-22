import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { DataTable, type Column, Modal, FormField, FormGrid, StatusBadge } from '../../components/ui';

export function WarehouseTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run, loading: saving } = useApiAction();
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [locations, setLocations] = useState<Record<string, unknown>[]>([]);

  const [whModal, setWhModal] = useState(false);
  const [whForm, setWhForm] = useState({ warehouse_id: '', warehouse_name: '', type: 'Main', status: 'Active', temperature: '15-25°C', humidity: '45-65%' });

  const [locModal, setLocModal] = useState(false);
  const [locForm, setLocForm] = useState({ location_id: '', warehouse_id: '', shelf: '', bin: '', zone: '' });

  const load = useCallback(async () => {
    const [w, l] = await Promise.all([
      callApi<{ success: boolean; warehouses: Record<string, unknown>[] }>('getWarehouses', token),
      callApi<{ success: boolean; locations: Record<string, unknown>[] }>('getLocations', token, {})
    ]);
    if (w.success) setWarehouses(w.warehouses || []);
    if (l.success) setLocations(l.locations || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openWh = (w?: Record<string, unknown>) => {
    if (w) {
      setWhForm({
        warehouse_id: String(w.warehouse_id),
        warehouse_name: String(w.warehouse_name),
        type: String(w.type || 'Main'),
        status: String(w.status || 'Active'),
        temperature: String(w.temperature || ''),
        humidity: String(w.humidity || '')
      });
    } else {
      setWhForm({ warehouse_id: '', warehouse_name: '', type: 'Main', status: 'Active', temperature: '15-25°C', humidity: '45-65%' });
    }
    setWhModal(true);
  };

  const saveWh = async () => {
    if (!whForm.warehouse_name.trim()) { toast('กรุณาระบุชื่อคลัง', 'error'); return; }
    const r = await run('saveWarehouse', { ...whForm });
    if (r?.success) { toast('บันทึกคลังสำเร็จ', 'success'); setWhModal(false); load(); }
  };

  const releaseHold = async (warehouseId: string) => {
    if (!confirm(`ยืนยันปล่อย HOLD คลัง ${warehouseId}?`)) return;
    const r = await run('releaseWarehouseHold', { warehouse_id: warehouseId });
    if (r?.success) { toast('ปล่อย HOLD สำเร็จ', 'success'); load(); }
  };

  const openLoc = (loc?: Record<string, unknown>) => {
    if (loc) {
      setLocForm({
        location_id: String(loc.location_id),
        warehouse_id: String(loc.warehouse_id),
        shelf: String(loc.shelf || ''),
        bin: String(loc.bin || ''),
        zone: String(loc.zone || '')
      });
    } else {
      setLocForm({ location_id: '', warehouse_id: warehouses[0] ? String(warehouses[0].warehouse_id) : '', shelf: '', bin: '', zone: '' });
    }
    setLocModal(true);
  };

  const saveLoc = async () => {
    if (!locForm.warehouse_id) { toast('กรุณาเลือกคลัง', 'error'); return; }
    const r = await run('saveLocation', { ...locForm });
    if (r?.success) { toast('บันทึกตำแหน่งสำเร็จ', 'success'); setLocModal(false); load(); }
  };

  const whCols: Column<Record<string, unknown>>[] = [
    { key: 'warehouse_id', header: 'รหัส' },
    { key: 'warehouse_name', header: 'ชื่อ' },
    { key: 'type', header: 'ประเภท' },
    { key: 'temperature', header: 'อุณหภูมิ' },
    { key: 'status', header: 'สถานะ', render: (w) => <StatusBadge status={String(w.status)} /> },
    {
      key: '_act',
      header: '',
      render: (w) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => openWh(w)}><i className="bi bi-pencil" /></button>
          {w.status === 'HOLD' && (
            <button type="button" className="btn btn-sm btn-warning" onClick={() => releaseHold(String(w.warehouse_id))}>
              <i className="bi bi-unlock" /> HOLD
            </button>
          )}
        </div>
      )
    }
  ];

  const locCols: Column<Record<string, unknown>>[] = [
    { key: 'location_id', header: 'รหัส' },
    { key: 'warehouse_id', header: 'คลัง' },
    { key: 'shelf', header: 'ชั้น' },
    { key: 'bin', header: 'Bin' },
    { key: 'zone', header: 'Zone' },
    {
      key: '_edit',
      header: '',
      render: (l) => (
        <button type="button" className="btn btn-sm btn-outline" onClick={() => openLoc(l)}><i className="bi bi-pencil" /></button>
      )
    }
  ];

  return (
    <>
      <div className="grid-2">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>คลังยา</span>
            <button type="button" className="btn btn-sm btn-success" onClick={() => openWh()}><i className="bi bi-plus" /> เพิ่มคลัง</button>
          </div>
          <DataTable columns={whCols} rows={warehouses} rowKey={(w) => String(w.warehouse_id)} />
        </div>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>ตำแหน่งเก็บ</span>
            <button type="button" className="btn btn-sm btn-success" onClick={() => openLoc()}><i className="bi bi-plus" /> เพิ่มตำแหน่ง</button>
          </div>
          <DataTable columns={locCols} rows={locations} rowKey={(l) => String(l.location_id)} />
        </div>
      </div>

      <Modal open={whModal} title="คลังยา" onClose={() => setWhModal(false)} footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => setWhModal(false)}>ยกเลิก</button>
          <button type="button" className="btn btn-primary" onClick={saveWh} disabled={saving}>บันทึก</button>
        </>
      }>
        <FormGrid cols={2}>
          <FormField label="ชื่อคลัง *"><input className="form-control" value={whForm.warehouse_name} onChange={(e) => setWhForm({ ...whForm, warehouse_name: e.target.value })} /></FormField>
          <FormField label="ประเภท">
            <select className="form-control" value={whForm.type} onChange={(e) => setWhForm({ ...whForm, type: e.target.value })}>
              <option>Main</option><option>Cold</option><option>Controlled</option><option>OPD</option>
            </select>
          </FormField>
          <FormField label="สถานะ">
            <select className="form-control" value={whForm.status} onChange={(e) => setWhForm({ ...whForm, status: e.target.value })}>
              <option>Active</option><option>HOLD</option><option>Inactive</option>
            </select>
          </FormField>
          <FormField label="อุณหภูมิ"><input className="form-control" value={whForm.temperature} onChange={(e) => setWhForm({ ...whForm, temperature: e.target.value })} /></FormField>
          <FormField label="ความชื้น"><input className="form-control" value={whForm.humidity} onChange={(e) => setWhForm({ ...whForm, humidity: e.target.value })} /></FormField>
        </FormGrid>
        <input type="hidden" value={whForm.warehouse_id} />
      </Modal>

      <Modal open={locModal} title="ตำแหน่งเก็บ" onClose={() => setLocModal(false)} footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => setLocModal(false)}>ยกเลิก</button>
          <button type="button" className="btn btn-primary" onClick={saveLoc} disabled={saving}>บันทึก</button>
        </>
      }>
        <FormGrid cols={2}>
          <FormField label="คลัง *">
            <select className="form-control" value={locForm.warehouse_id} onChange={(e) => setLocForm({ ...locForm, warehouse_id: e.target.value })}>
              <option value="">เลือกคลัง</option>
              {warehouses.map((w) => (
                <option key={String(w.warehouse_id)} value={String(w.warehouse_id)}>{String(w.warehouse_name)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="ชั้น"><input className="form-control" value={locForm.shelf} onChange={(e) => setLocForm({ ...locForm, shelf: e.target.value })} /></FormField>
          <FormField label="Bin"><input className="form-control" value={locForm.bin} onChange={(e) => setLocForm({ ...locForm, bin: e.target.value })} /></FormField>
          <FormField label="Zone"><input className="form-control" value={locForm.zone} onChange={(e) => setLocForm({ ...locForm, zone: e.target.value })} /></FormField>
        </FormGrid>
      </Modal>
    </>
  );
}
