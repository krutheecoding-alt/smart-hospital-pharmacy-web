import { useEffect, useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

export function PurchasePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      const r = await callApi<{ success: boolean; orders: Record<string, unknown>[] }>('getPurchaseOrders', token);
      setLoading(false);
      if (r.success) setOrders(r.orders || []);
    })();
  }, [token]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <div className="card">
        <div className="card-header">ใบสั่งซื้อ (Purchase Order)</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>PO No</th><th>Vendor</th><th>วันที่</th><th>ยอดรวม</th><th>สถานะ</th><th>อนุมัติโดย</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={String(o.po_id)}>
                  <td>{String(o.po_no)}</td>
                  <td>{String(o.vendor_id)}</td>
                  <td>{formatDate(String(o.po_date))}</td>
                  <td>{formatCurrency(o.total as number)}</td>
                  <td><span className="badge badge-secondary">{String(o.status)}</span></td>
                  <td>{String(o.approved_by || '-')}</td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={6} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}