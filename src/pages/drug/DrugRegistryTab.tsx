import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { formatNumber } from '../../lib/format';
import { DataTable, type Column, Modal, FormField, FormGrid, StatusBadge } from '../../components/ui';

const emptyDrug = (): Record<string, string> => ({
  drug_id: '',
  generic_name: '',
  trade_name: '',
  strength: '',
  dosage_form: '',
  abc_class: 'C',
  ved_class: 'D',
  controlled_type: '',
  min_stock: '0',
  max_stock: '0',
  safety_stock: '0',
  lead_time: '7',
  storage_condition: '',
  barcode: '',
  gtin: '',
  active: 'true'
});

function isActive(d: Record<string, unknown>): boolean {
  const v = d.active;
  return v === true || v === 'TRUE' || v === 'true' || v === '';
}

export function DrugRegistryTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run, loading: saving } = useApiAction();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [drugs, setDrugs] = useState<Record<string, unknown>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyDrug());

  const load = useCallback(async () => {
    setLoading(true);
    const r = await callApi<{ success: boolean; drugs: Record<string, unknown>[] }>('getDrugs', token, { search, activeOnly: false });
    setLoading(false);
    if (r.success) setDrugs(r.drugs || []);
  }, [token, search]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(emptyDrug()); setModalOpen(true); };
  const openEdit = (d: Record<string, unknown>) => {
    setForm({
      drug_id: String(d.drug_id || ''),
      generic_name: String(d.generic_name || ''),
      trade_name: String(d.trade_name || ''),
      strength: String(d.strength || ''),
      dosage_form: String(d.dosage_form || ''),
      abc_class: String(d.abc_class || 'C'),
      ved_class: String(d.ved_class || 'D'),
      controlled_type: String(d.controlled_type || ''),
      min_stock: String(d.min_stock ?? 0),
      max_stock: String(d.max_stock ?? 0),
      safety_stock: String(d.safety_stock ?? 0),
      lead_time: String(d.lead_time ?? 7),
      storage_condition: String(d.storage_condition || ''),
      barcode: String(d.barcode || ''),
      gtin: String(d.gtin || ''),
      active: isActive(d) ? 'true' : 'false'
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.generic_name.trim()) {
      toast('กรุณาระบุชื่อสามัญ', 'error');
      return;
    }
    const r = await run<{ success: boolean }>('saveDrug', {
      ...form,
      active: form.active === 'true'
    });
    if (r?.success) {
      toast('บันทึกสำเร็จ', 'success');
      setModalOpen(false);
      load();
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'drug_id', header: 'รหัส' },
    { key: 'generic_name', header: 'ชื่อสามัญ' },
    { key: 'trade_name', header: 'ชื่อการค้า' },
    { key: 'strength', header: 'ความแรง' },
    { key: 'dosage_form', header: 'รูปแบบ' },
    { key: 'abc_class', header: 'ABC', render: (d) => <span className="badge badge-info">{String(d.abc_class || 'C')}</span> },
    { key: 'ved_class', header: 'VED', render: (d) => <span className="badge badge-muted">{String(d.ved_class || 'D')}</span> },
    { key: 'controlled_type', header: 'ควบคุม', render: (d) => String(d.controlled_type || '-') },
    {
      key: 'min_stock',
      header: 'Min/Max',
      render: (d) => `${formatNumber(d.min_stock as number)}/${formatNumber(d.max_stock as number)}`
    },
    {
      key: '_edit',
      header: '',
      width: '48px',
      render: (d) => (
        <button type="button" className="btn btn-sm btn-outline" onClick={() => openEdit(d)}>
          <i className="bi bi-pencil" />
        </button>
      )
    }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" style={{ width: 200 }} placeholder="ค้นหายา..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
            <button type="button" className="btn btn-sm btn-primary" onClick={load} disabled={loading}><i className="bi bi-search" /></button>
          </div>
          <button type="button" className="btn btn-sm btn-success" onClick={openNew}><i className="bi bi-plus" /> เพิ่มยา</button>
        </div>
        <DataTable columns={cols} rows={drugs} rowKey={(d) => String(d.drug_id)} />
      </div>

      <Modal
        open={modalOpen}
        title={form.drug_id ? 'แก้ไขข้อมูลยา' : 'เพิ่มยา'}
        onClose={() => setModalOpen(false)}
        wide
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>ยกเลิก</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>บันทึก</button>
          </>
        }
      >
        <FormGrid cols={3}>
          <FormField label="รหัสยา"><input className="form-control" value={form.drug_id} onChange={(e) => set('drug_id', e.target.value)} placeholder="เว้นว่าง = สร้างใหม่" /></FormField>
          <FormField label="ชื่อสามัญ *"><input className="form-control" value={form.generic_name} onChange={(e) => set('generic_name', e.target.value)} required /></FormField>
          <FormField label="ชื่อการค้า"><input className="form-control" value={form.trade_name} onChange={(e) => set('trade_name', e.target.value)} /></FormField>
          <FormField label="ความแรง"><input className="form-control" value={form.strength} onChange={(e) => set('strength', e.target.value)} /></FormField>
          <FormField label="รูปแบบ"><input className="form-control" value={form.dosage_form} onChange={(e) => set('dosage_form', e.target.value)} /></FormField>
          <FormField label="ABC">
            <select className="form-control" value={form.abc_class} onChange={(e) => set('abc_class', e.target.value)}>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </FormField>
          <FormField label="VED">
            <select className="form-control" value={form.ved_class} onChange={(e) => set('ved_class', e.target.value)}>
              <option value="V">V</option><option value="E">E</option><option value="D">D</option>
            </select>
          </FormField>
          <FormField label="ยาควบคุม"><input className="form-control" value={form.controlled_type} onChange={(e) => set('controlled_type', e.target.value)} placeholder="N/A, P, S" /></FormField>
          <FormField label="Min Stock"><input className="form-control" type="number" value={form.min_stock} onChange={(e) => set('min_stock', e.target.value)} /></FormField>
          <FormField label="Max Stock"><input className="form-control" type="number" value={form.max_stock} onChange={(e) => set('max_stock', e.target.value)} /></FormField>
          <FormField label="Safety Stock"><input className="form-control" type="number" value={form.safety_stock} onChange={(e) => set('safety_stock', e.target.value)} /></FormField>
          <FormField label="Lead Time (วัน)"><input className="form-control" type="number" value={form.lead_time} onChange={(e) => set('lead_time', e.target.value)} /></FormField>
          <FormField label="สถานะ">
            <select className="form-control" value={form.active} onChange={(e) => set('active', e.target.value)}>
              <option value="true">ใช้งาน</option><option value="false">ไม่ใช้งาน</option>
            </select>
          </FormField>
          <FormField label="Barcode"><input className="form-control" value={form.barcode} onChange={(e) => set('barcode', e.target.value)} /></FormField>
          <FormField label="GTIN"><input className="form-control" value={form.gtin} onChange={(e) => set('gtin', e.target.value)} /></FormField>
          <FormField label="เงื่อนไขเก็บ"><input className="form-control" value={form.storage_condition} onChange={(e) => set('storage_condition', e.target.value)} /></FormField>
        </FormGrid>
        {form.drug_id && <p className="text-muted"><StatusBadge status={form.active === 'true' ? 'Active' : 'Inactive'} /></p>}
      </Modal>
    </>
  );
}
