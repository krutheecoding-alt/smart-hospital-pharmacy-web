import { useEffect, useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatNumber } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

export function ReturnPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      const r = await callApi<{ success: boolean; returns: Record<string, unknown>[] }>('getReturns', token);
      setLoading(false);
      if (r.success) setRows(r.returns || []);
    })();
  }, [token]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <div className="card">
        <div className="card-header">คืนยา</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Return ID</th><th>แผนก</th><th>รหัสยา</th><th>Lot</th><th>จำนวน</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.return_id)}>
                  <td>{String(r.return_id)}</td>
                  <td>{String(r.department)}</td>
                  <td>{String(r.drug_id)}</td>
                  <td>{String(r.lot_no)}</td>
                  <td>{formatNumber(r.qty as number)}</td>
                  <td>{String(r.status)}</td>
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