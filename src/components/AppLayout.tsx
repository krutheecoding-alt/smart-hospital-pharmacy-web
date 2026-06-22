import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { QuickMenu } from './QuickMenu';
import { ChangePasswordModal } from './ChangePasswordModal';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  drug: 'ทะเบียนยา',
  purchase: 'จัดซื้อ',
  receive: 'รับเข้า',
  issue: 'จ่ายยา',
  return: 'คืนยา',
  destroy: 'ทำลายยา',
  report: 'รายงาน'
};

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const segment = window.location.pathname.split('/')[1] || 'dashboard';
  const title = PAGE_TITLES[segment] || 'Smart Hospital Pharmacy';

  useEffect(() => {
    if (user?.must_change_password) setShowPw(true);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <Sidebar open={sidebarOpen} onLogout={handleLogout} />
      <div className="main-content">
        <Topbar
          title={title}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onLogout={handleLogout}
        />
        <QuickMenu />
        <Outlet />
      </div>
      {showPw && <ChangePasswordModal onClose={() => setShowPw(false)} />}
    </>
  );
}
