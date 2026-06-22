import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatDate, formatNumber } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

const TABS = [
  { id: 'tabDrugs', label: 'ข้อมูลยา' },
  { id: 'tabLots', label: 'Lot Stock' },
  { id: 'tabWarehouse', label: 'คลังยา' },
  { id: 'tabRecall', label: 'Recall' },
  { id: 'tabStockCount', label: 'ตรวจนับ' },
  { id: 'tabTemp', label: 'อุณหภูมิ' },
  { id: 'tabUsers', label: 'ผู้ใช้งาน' },
  { id: 'tabSettings', label: 'ตั้งค่า' }
];

export function DrugsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'tabDrugs';
  const [loading, setLoading] = useState(false);
  const [drugs, setDrugs] = useState<Record<string, unknown>[]>([]);
  const [lots, setLots] = useState<Record<string, unknown>[]>([]);
  const [warehouses, setWarehouses] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');

  const loadDrugs = async () => {
    setLoading(true);
    const r = await callApi<{ success: boolean; drugs: Record<string, unknown>[]; message?: string }>('getDrugs', token, { search });
    setLoading(false);
    if (r.success) setDrugs(r.drugs || []);
    else toast(r.message || '', 'error');
  };

  const loadLots = async () => {
    setLoading(true);
    const r = await callApi<{ success: boolean; lots: Record<string, unknown>[] }>('getLotStock', token, {});
    setLoading(false);
    if (r.success) setLots(r.lots || []);
  };

  const loadWarehouses = async () => {
    setLoading(true);
    const r = await callApi<{ success: boolean; warehouses: Record<string, unknown>[] }>('getWarehouses', token);
    setLoading(false);
    if (r.success) setWarehouses(r.warehouses || []);
  };

  useEffect(() => {
    if (tab === 'tabDrugs') loadDrugs();
    else if (tab === 'tabLots') loadLots();
    else if (tab === 'tabWarehouse') loadWarehouses();
  }, [tab, token]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <ul className="nav-tabs">
        {TABS.map((t) => (
          <li key={t.id}>
            <button type="button" className={tab === t.id ? 'active' : ''} onClick={() => setParams({ tab: t.id })}>
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'tabDrugs' && (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control" style={{ width: 200 }} placeholder="ค้นหายา..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" className="btn btn-sm btn-primary" onClick={loadDrugs}><i className="bi bi-search" /></button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>รหัส</th><th>ชื่อสามัญ</th><th>ชื่อการค้า</th><th>ความแรง</th><th>ABC</th><th>VED</th><th>Min/Max</th></tr>
              </thead>
              <tbody>
                {drugs.map((d) => (
                  <tr key={String(d.drug_id)}>
                    <td>{String(d.drug_id)}</td>
                    <td>{String(d.generic_name)}</td>
                    <td>{String(d.trade_name)}</td>
                    <td>{String(d.strength)}</td>
                    <td>{String(d.abc_class)}</td>
                    <td>{String(d.ved_class)}</td>
                    <td>{formatNumber(d.min_stock as number)}/{formatNumber(d.max_stock as number)}</td>
                  </tr>
                ))}
                {!drugs.length && <tr><td colSpan={7} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tabLots' && (
        <div className="card">
          <div className="card-header">Lot Stock</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>รหัสยา</th><th>Lot</th><th>หมดอายุ</th><th>คลัง</th><th>คงเหลือ</th><th>Available</th></tr>
              </thead>
              <tbody>
                {lots.map((l) => (
                  <tr key={String(l.lot_id)}>
                    <td>{String(l.drug_id)}</td>
                    <td>{String(l.lot_no)}</td>
                    <td>{formatDate(String(l.expiry_date))}</td>
                    <td>{String(l.warehouse)}</td>
                    <td>{formatNumber(l.qty as number)}</td>
                    <td>{formatNumber(l.available as number)}</td>
                  </tr>
                ))}
                {!lots.length && <tr><td colSpan={6} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tabWarehouse' && (
        <div className="card">
          <div className="card-header">คลังยา</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>รหัส</th><th>ชื่อ</th><th>ประเภท</th><th>อุณหภูมิ</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={String(w.warehouse_id)}>
                    <td>{String(w.warehouse_id)}</td>
                    <td>{String(w.warehouse_name)}</td>
                    <td>{String(w.type)}</td>
                    <td>{String(w.temperature)}</td>
                    <td>{String(w.status)}</td>
                  </tr>
                ))}
                {!warehouses.length && <tr><td colSpan={5} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!['tabDrugs', 'tabLots', 'tabWarehouse'].includes(tab) && (
        <div className="card">
          <div className="card-body-pad text-center text-muted">
            แท็บ {TABS.find((t) => t.id === tab)?.label} — ใช้งานผ่าน API ได้แล้ว กำลังขยาย UI ในเวอร์ชันถัดไป
            <br /><small>หรือใช้งานแท็บนี้ผ่าน Apps Script เวอร์ชันเดิมได้เต็มรูปแบบ</small>
          </div>
        </div>
      )}
    </>
  );
}