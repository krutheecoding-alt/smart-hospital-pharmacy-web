import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface TopbarProps {
  title: string;
  onToggleSidebar: () => void;
  onLogout: () => void;
  notifyCount?: number;
}

export function Topbar({ title, onToggleSidebar, onLogout, notifyCount = 0 }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const initials = (user?.fullname || user?.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" className="btn-icon sidebar-toggle-btn" onClick={onToggleSidebar}>
          <i className="bi bi-list fs-4" />
        </button>
        <h5>{title}</h5>
      </div>
      <div className="topbar-actions">
        <button type="button" className="btn-icon tablet-logout-btn" title="ออกจากระบบ" onClick={onLogout} style={{ display: 'none' }}>
          <i className="bi bi-box-arrow-left" />
        </button>
        <button type="button" className="btn-icon" title="การแจ้งเตือน">
          <i className="bi bi-bell" />
          {notifyCount > 0 && (
            <span style={{
              position: 'absolute', marginTop: -8, marginLeft: 8,
              background: '#ef4444', color: '#fff', fontSize: '0.65rem',
              borderRadius: 999, padding: '2px 6px'
            }}>{notifyCount}</span>
          )}
        </button>
        <button type="button" className="btn-icon" onClick={toggleTheme} title="สลับธีม">
          <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'}`} />
        </button>
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.fullname}</div>
            <small className="text-muted">{user?.role}</small>
          </div>
        </div>
      </div>
    </div>
  );
}