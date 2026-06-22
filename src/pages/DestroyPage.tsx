import { useEffect, useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatNumber } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

export function DestroyPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      const r = await callApi<{ success: boolean; destructions: Record<string, unknown>[] }>('getDestructions', token);
      setLoading(false);
      if (r.success) setRows(r.destructions || []);
    })();
  }, [token]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <div className="card">
        <div className="card-header">ทำลายยา</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Destroy ID</th><th>รหัสยา</th><th>Lot</th><th>จำนวน</th><th>เหตุผล</th><th>วันที่</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.destroy_id)}>
                  <td>{String(r.destroy_id)}</td>
                  <td>{String(r.drug_id)}</td>
                  <td>{String(r.lot_no)}</td>
                  <td>{formatNumber(r.qty as number)}</td>
                  <td>{String(r.reason)}</td>
                  <td>{formatDate(String(r.destroy_date))}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}