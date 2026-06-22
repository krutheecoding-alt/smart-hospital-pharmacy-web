import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { useTheme } from '../contexts/ThemeContext';
import { logoUrl } from '../lib/api';

export function LoginPage() {
  const { login, token } = useAuth();
  const { branding } = useBranding();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const r = await login(username, password);
    setLoading(false);
    if (r.success) navigate('/dashboard');
    else setError(r.message || 'เข้าสู่ระบบไม่สำเร็จ');
  };

  return (
    <div className="app-shell login-page">
      <div className="app-mesh" />
      <button
        type="button"
        className="btn-icon"
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 10 }}
        onClick={toggleTheme}
      >
        <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'}`} />
      </button>
      <div className="login-card">
        <div className="login-icon">
          {branding.has_logo ? (
            <img src={logoUrl()} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          ) : (
            <i className="bi bi-hospital" />
          )}
        </div>
        <h4 style={{ textAlign: 'center', margin: '0 0 8px' }}>{branding.hospital_name}</h4>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: 24 }}>ระบบคลังยาโรงพยาบาล</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้</label>
            <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <div className="alert-danger">{error}</div>}
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>ผู้ใช้ใหม่ต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก</p>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
