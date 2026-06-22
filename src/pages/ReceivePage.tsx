import { useEffect, useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

export function ReceivePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      const r = await callApi<{ success: boolean; receipts: Record<string, unknown>[] }>('getGoodsReceipts', token);
      setLoading(false);
      if (r.success) setReceipts(r.receipts || []);
    })();
  }, [token]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <div className="card">
        <div className="card-header">รับเข้า (Goods Receipt)</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>GRN No</th><th>Vendor</th><th>วันที่รับ</th><th>ผู้รับ</th><th>Invoice</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={String(r.grn_id)}>
                  <td>{String(r.grn_no)}</td>
                  <td>{String(r.vendor)}</td>
                  <td>{formatDate(String(r.receive_date))}</td>
                  <td>{String(r.receiver)}</td>
                  <td>{String(r.invoice)}</td>
                  <td>{String(r.status)}</td>
                </tr>
              ))}
              {!receipts.length && <tr><td colSpan={6} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}