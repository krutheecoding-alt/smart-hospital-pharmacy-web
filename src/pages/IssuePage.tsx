import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/format';
import { LoadingOverlay } from '../components/LoadingOverlay';

export function IssuePage() {
  const { token } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'tabRequest';
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await callApi<{ success: boolean; requests: Record<string, unknown>[] }>('getIssueRequests', token);
      setLoading(false);
      if (r.success) setRequests(r.requests || []);
    })();
  }, [token, tab]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <ul className="nav-tabs">
        <li><button type="button" className={tab === 'tabRequest' ? 'active' : ''} onClick={() => setParams({ tab: 'tabRequest' })}>ขอเบิกยา</button></li>
        <li><button type="button" className={tab === 'tabDispense' ? 'active' : ''} onClick={() => setParams({ tab: 'tabDispense' })}>จ่ายยา</button></li>
      </ul>
      <div className="card">
        <div className="card-header">{tab === 'tabDispense' ? 'จ่ายยา' : 'คำขอเบิกยา'}</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Request ID</th><th>แผนก</th><th>วันที่</th><th>ผู้ขอ</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
              {requests
                .filter((r) => tab === 'tabDispense' ? r.status !== 'Pending' : true)
                .map((r) => (
                  <tr key={String(r.request_id)}>
                    <td>{String(r.request_id)}</td>
                    <td>{String(r.department)}</td>
                    <td>{formatDate(String(r.request_date))}</td>
                    <td>{String(r.requester)}</td>
                    <td><span className="badge badge-secondary">{String(r.status)}</span></td>
                  </tr>
                ))}
              {!requests.length && <tr><td colSpan={5} className="text-center text-muted">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}