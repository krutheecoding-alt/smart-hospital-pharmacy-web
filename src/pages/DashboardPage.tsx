import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate, expiryBadgeClass } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#27ae60'];

export function DashboardPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await callApi('getDashboard', token);
    setLoading(false);
    if (!r.success) { toast(r.message || 'โหลดไม่สำเร็จ', 'error'); return; }
    setData(r as Record<string, unknown>);
  };

  useEffect(() => { load(); }, [token]);

  const summary = (data?.summary || {}) as Record<string, number>;
  const abc = (data?.abcAnalysis || {}) as Record<string, number>;
  const ved = (data?.vedAnalysis || {}) as Record<string, number>;

  const abcData = [
    { name: 'Class A', value: abc.A || 0 },
    { name: 'Class B', value: abc.B || 0 },
    { name: 'Class C', value: abc.C || 0 }
  ];
  const vedData = [
    { name: 'Vital', value: ved.V || 0 },
    { name: 'Essential', value: ved.E || 0 },
    { name: 'Desirable', value: ved.D || 0 }
  ];

  return (
    <>
      <LoadingOverlay show={loading && !data} />
      <div className="grid-stats">
        <div className="stat-card bg-primary-stat">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap"><i className="bi bi-cash-stack" /></div>
            <div>
              <div className="stat-label">มูลค่าสต็อก</div>
              <div className="stat-value">{formatCurrency(summary.totalValue)} ฿</div>
            </div>
          </div>
        </div>
        <div className="stat-card bg-warning-stat">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap"><i className="bi bi-clock-history" /></div>
            <div>
              <div className="stat-label">ใกล้หมดอายุ</div>
              <div className="stat-value">{summary.nearExpiry ?? '-'}</div>
            </div>
          </div>
        </div>
        <div className="stat-card bg-danger-stat">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap"><i className="bi bi-x-circle" /></div>
            <div>
              <div className="stat-label">หมดอายุ</div>
              <div className="stat-value">{summary.expired ?? '-'}</div>
            </div>
          </div>
        </div>
        <div className="stat-card bg-success-stat">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap"><i className="bi bi-exclamation-triangle" /></div>
            <div>
              <div className="stat-label">Stock Out Risk</div>
              <div className="stat-value">{summary.stockOutRisk ?? '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-header">ABC Analysis</div>
          <div className="card-body-pad" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={abcData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {abcData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">VED Analysis</div>
          <div className="card-body-pad" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {vedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Turnover Rate</div>
          <div className="card-body-pad" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>{String(data?.turnoverRate ?? '-')}</div>
            <p className="text-muted">อัตราหมุนเวียนสต็อก (ต่อปี)</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          รายการใกล้หมดอายุ
          <button type="button" className="btn btn-sm btn-outline" onClick={load}><i className="bi bi-arrow-clockwise" /></button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ชื่อยา</th><th>Lot</th><th>หมดอายุ</th><th>เหลือ(วัน)</th><th>คงเหลือ</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
              {((data?.nearExpiryList || []) as Record<string, unknown>[]).map((item, i) => (
                <tr key={i}>
                  <td>{String(item.drug_name)}</td>
                  <td>{String(item.lot_no)}</td>
                  <td>{formatDate(String(item.expiry_date))}</td>
                  <td>{String(item.days_left)}</td>
                  <td>{String(item.available)}</td>
                  <td><span className={`badge ${expiryBadgeClass(Number(item.days_left))}`}>{String(item.days_left)} วัน</span></td>
                </tr>
              ))}
              {!((data?.nearExpiryList as unknown[]) || []).length && (
                <tr><td colSpan={6} className="text-center text-muted">ไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}