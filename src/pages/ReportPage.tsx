import { useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const REPORT_TYPES = [
  { id: 'stock', label: 'รายงานสต็อก' },
  { id: 'near_expiry', label: 'ใกล้หมดอายุ' },
  { id: 'expired', label: 'หมดอายุ' },
  { id: 'movement', label: 'การเคลื่อนไหว' },
  { id: 'audit', label: 'Audit Trail' },
  { id: 'low_stock', label: 'สต็อกต่ำ' }
];

export function ReportPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState('stock');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const generate = async () => {
    setLoading(true);
    const r = await callApi('generateReport', token, { reportType: type });
    setLoading(false);
    if (r.success) {
      setResult(r as Record<string, unknown>);
      toast('สร้างรายงานสำเร็จ', 'success');
    } else {
      toast(r.message || 'สร้างรายงานไม่สำเร็จ', 'error');
    }
  };

  return (
    <div className="card">
      <div className="card-header">รายงาน PDF</div>
      <div className="card-body-pad">
        <div className="form-group">
          <label className="form-label">ประเภทรายงาน</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            {REPORT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'กำลังสร้าง...' : 'สร้างรายงาน'}
        </button>
        {result?.pdfUrl != null && (
          <p style={{ marginTop: 16 }}>
            <a href={String(result.pdfUrl)} target="_blank" rel="noreferrer" className="btn btn-success btn-sm">
              <i className="bi bi-file-earmark-pdf" /> เปิด PDF
            </a>
          </p>
        )}
        {result && !result.pdfUrl && (
          <pre style={{ marginTop: 16, fontSize: '0.8rem', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}