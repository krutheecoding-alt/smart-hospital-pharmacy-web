import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GROUP_LABELS, isMenuActive, menuToPath } from '../lib/routes';

export function QuickMenu() {
  const { menu } = useAuth();
  const location = useLocation();
  const groups = ['main', 'stock', 'report', 'system'] as const;

  return (
    <div className="tablet-quick-nav">
      <h6 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="bi bi-grid" style={{ color: 'var(--accent)' }} /> เมนู
      </h6>
      {groups.map((g) => {
        const items = menu.filter((m) => (m.group || 'main') === g);
        if (!items.length) return null;
        return (
          <div key={g} style={{ marginBottom: 12 }}>
            <div className="tablet-qm-group-label">{GROUP_LABELS[g]}</div>
            <div className="quick-menu-grid">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={menuToPath(item)}
                  className={`quick-menu-card ${isMenuActive(item, location.pathname, location.search) ? 'active' : ''}`}
                >
                  <span className={`menu-icon-wrap menu-icon-${item.tone || 'teal'}`}>
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}