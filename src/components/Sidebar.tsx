import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { logoUrl } from '../lib/api';
import { GROUP_LABELS, isMenuActive, menuToPath } from '../lib/routes';

interface SidebarProps {
  open: boolean;
  onLogout: () => void;
}

export function Sidebar({ open, onLogout }: SidebarProps) {
  const { menu } = useAuth();
  const { branding } = useBranding();
  const location = useLocation();
  const groups = ['main', 'stock', 'report', 'system'] as const;

  return (
    <nav className={`sidebar ${open ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        {branding.has_logo && branding.logo_url ? (
          <img src={logoUrl()} alt="Logo" className="brand-logo" />
        ) : (
          <i className="bi bi-hospital brand-icon" />
        )}
        <span className="brand-name">{branding.hospital_name}</span>
      </div>
      <ul className="sidebar-menu">
        {groups.map((g) => {
          const items = menu.filter((m) => (m.group || 'main') === g);
          if (!items.length) return null;
          return (
            <li key={g} className="menu-group">
              <div className="menu-group-label">{GROUP_LABELS[g]}</div>
              <ul className="menu-group-items">
                {items.map((item) => (
                  <li key={item.id} className="menu-item">
                    <Link
                      to={menuToPath(item)}
                      className={isMenuActive(item, location.pathname, location.search) ? 'active' : ''}
                    >
                      <span className={`menu-icon-wrap menu-icon-${item.tone || 'teal'}`}>
                        <i className={`bi ${item.icon}`} />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-footer">
        <button type="button" className="btn-logout" onClick={onLogout}>
          <i className="bi bi-box-arrow-left" /> ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}