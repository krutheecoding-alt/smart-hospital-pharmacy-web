import { useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { token, setUser, user } = useAuth();
  const { toast } = useToast();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!current || !newPw || !confirm) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (newPw !== confirm) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setLoading(true);
    const r = await callApi('changePassword', token, { currentPassword: current, newPassword: newPw });
    setLoading(false);
    if (r.success) {
      toast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
      if (user) setUser({ ...user, must_change_password: false });
      onClose();
    } else {
      setError(r.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h5 style={{ marginTop: 0 }}><i className="bi bi-shield-lock" /> เปลี่ยนรหัสผ่าน (จำเป็น)</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งาน (อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข)
        </p>
        <div className="form-group">
          <label className="form-label">รหัสผ่านปัจจุบัน</label>
          <input type="password" className="form-control" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">รหัสผ่านใหม่</label>
          <input type="password" className="form-control" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
          <input type="password" className="form-control" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <div className="alert-danger">{error}</div>}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
        </button>
      </div>
    </div>
  );
}