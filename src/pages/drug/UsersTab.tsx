import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { DataTable, type Column, Modal, FormField, FormGrid, StatusBadge } from '../../components/ui';

const ROLES = ['Admin', 'Director', 'Pharmacist', 'Warehouse', 'Nurse', 'Auditor'];

export function UsersTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { run, loading: saving } = useApiAction();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    user_id: '',
    username: '',
    fullname: '',
    role: 'Pharmacist',
    department: '',
    email: '',
    phone: '',
    password: '',
    status: 'Active'
  });

  const load = useCallback(async () => {
    const r = await callApi<{ success: boolean; users: Record<string, unknown>[] }>('getUsers', token, {});
    if (r.success) setUsers(r.users || []);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm({ user_id: '', username: '', fullname: '', role: 'Pharmacist', department: '', email: '', phone: '', password: '', status: 'Active' });
    setModalOpen(true);
  };

  const openEdit = (u: Record<string, unknown>) => {
    setForm({
      user_id: String(u.user_id || ''),
      username: String(u.username || ''),
      fullname: String(u.fullname || ''),
      role: String(u.role || 'Pharmacist'),
      department: String(u.department || ''),
      email: String(u.email || ''),
      phone: String(u.phone || ''),
      password: '',
      status: String(u.status || 'Active')
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.username.trim() || !form.fullname.trim()) {
      toast('กรุณาระบุ Username และชื่อ', 'error');
      return;
    }
    const payload: Record<string, string> = { ...form };
    if (!payload.user_id && !payload.password) payload.password = 'changeme';
    if (payload.user_id && !payload.password) {
      const { password: _pw, ...rest } = payload;
      const r = await run('saveUser', rest);
      if (r?.success) {
        toast('บันทึกผู้ใช้สำเร็จ', 'success');
        setModalOpen(false);
        load();
      }
      return;
    }
    const r = await run('saveUser', payload);
    if (r?.success) {
      toast('บันทึกผู้ใช้สำเร็จ', 'success');
      setModalOpen(false);
      load();
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const cols: Column<Record<string, unknown>>[] = [
    { key: 'username', header: 'Username' },
    { key: 'fullname', header: 'ชื่อ-นามสกุล' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'แผนก' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'สถานะ', render: (u) => <StatusBadge status={String(u.status)} /> },
    {
      key: '_edit',
      header: '',
      render: (u) => (
        <button type="button" className="btn btn-sm btn-outline" onClick={() => openEdit(u)}><i className="bi bi-pencil" /></button>
      )
    }
  ];

  return (
    <>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>ผู้ใช้งานระบบ</span>
          <button type="button" className="btn btn-sm btn-success" onClick={openNew}><i className="bi bi-person-plus" /> เพิ่มผู้ใช้</button>
        </div>
        <DataTable columns={cols} rows={users} rowKey={(u) => String(u.user_id)} />
      </div>

      <Modal open={modalOpen} title={form.user_id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'} onClose={() => setModalOpen(false)} footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>ยกเลิก</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>บันทึก</button>
        </>
      }>
        <FormGrid cols={2}>
          <FormField label="Username *"><input className="form-control" value={form.username} onChange={(e) => set('username', e.target.value)} /></FormField>
          <FormField label="ชื่อ-นามสกุล *"><input className="form-control" value={form.fullname} onChange={(e) => set('fullname', e.target.value)} /></FormField>
          <FormField label="Role">
            <select className="form-control" value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="แผนก"><input className="form-control" value={form.department} onChange={(e) => set('department', e.target.value)} /></FormField>
          <FormField label="Email"><input className="form-control" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></FormField>
          <FormField label="โทรศัพท์"><input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></FormField>
          <FormField label="รหัสผ่าน" hint={form.user_id ? 'เว้นว่างหากไม่เปลี่ยน' : 'ค่าเริ่มต้น: changeme'}>
            <input className="form-control" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
          </FormField>
          <FormField label="สถานะ">
            <select className="form-control" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option>Active</option><option>Inactive</option>
            </select>
          </FormField>
        </FormGrid>
      </Modal>
    </>
  );
}
