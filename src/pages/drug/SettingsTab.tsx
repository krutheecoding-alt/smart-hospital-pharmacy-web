import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { callApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { useToast } from '../../contexts/ToastContext';
import { useApiAction } from '../../hooks/useApi';
import { FormField, FormGrid } from '../../components/ui';
const PRESET_LABELS: Record<string, string> = {
  teal: 'Teal', blue: 'Blue', purple: 'Purple', green: 'Green', rose: 'Rose', navy: 'Navy'
};

export function SettingsTab() {
  const { token } = useAuth();
  const { branding, refreshBranding } = useBranding();
  const { toast } = useToast();
  const { run, loading: saving } = useApiAction();

  const [form, setForm] = useState({
    hospital_name: '',
    address: '',
    phone: '',
    director: '',
    pharmacist: '',
    alert_expiry_day: '30',
    temperature_min: '15',
    temperature_max: '25'
  });
  const [themePrimary, setThemePrimary] = useState('#0d9488');
  const [themeSecondary, setThemeSecondary] = useState('#0891b2');
  const [themeAccent, setThemeAccent] = useState('#14b8a6');
  const [logoId, setLogoId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [presets, setPresets] = useState<Record<string, { theme_primary: string; theme_secondary: string; theme_accent: string }>>({});
  const [dbMode, setDbMode] = useState('');

  const load = useCallback(async () => {
    const r = await callApi<{ success: boolean; settings: Record<string, string> }>('getSettings', token, {});
    if (r.success && r.settings) {
      const s = r.settings;
      setForm({
        hospital_name: s.hospital_name || '',
        address: s.address || '',
        phone: s.phone || '',
        director: s.director || '',
        pharmacist: s.pharmacist || '',
        alert_expiry_day: s.alert_expiry_day || '30',
        temperature_min: s.temperature_min || '15',
        temperature_max: s.temperature_max || '25'
      });
      if (s.theme_primary) setThemePrimary(s.theme_primary);
      if (s.theme_secondary) setThemeSecondary(s.theme_secondary);
      if (s.theme_accent) setThemeAccent(s.theme_accent);
      setLogoId(s.logo || '');
      setLogoUrl(s.logo_url || '');
      setDbMode(s.database || '');
    }
    if (branding.presets) setPresets(branding.presets);
  }, [token, branding.presets]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const applyTheme = (p: { theme_primary: string; theme_secondary: string; theme_accent: string }) => {
    setThemePrimary(p.theme_primary);
    setThemeSecondary(p.theme_secondary);
    setThemeAccent(p.theme_accent);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const r = await run('saveSettings', {
      ...form,
      theme_primary: themePrimary,
      theme_secondary: themeSecondary,
      theme_accent: themeAccent,
      logo: logoId
    });
    if (r?.success) {
      toast('บันทึกการตั้งค่าสำเร็จ', 'success');
      await refreshBranding();
    }
  };

  const testSupabase = async () => {
    const r = await run('testSupabase', {});
    if (r?.success) toast('เชื่อมต่อ Supabase สำเร็จ', 'success');
  };

  const uploadLogo = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast('ไฟล์ใหญ่เกิน 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = String(ev.target?.result || '');
      const base64 = dataUrl.split(',')[1];
      const r = await run<{ success: boolean; logo?: string; logo_url?: string; message?: string }>('uploadLogo', {
        data: base64,
        mimeType: file.type,
        fileName: file.name
      });
      if (r?.success) {
        toast(r.message || 'อัปโหลดโลโก้สำเร็จ', 'success');
        setLogoId(r.logo || '');
        setLogoUrl(r.logo_url || '');
        await refreshBranding();
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = async () => {
    if (!confirm('ต้องการลบโลโก้โรงพยาบาล?')) return;
    const r = await run('removeLogo', {});
    if (r?.success) {
      toast('ลบโลโก้แล้ว', 'success');
      setLogoId('');
      setLogoUrl('');
      await refreshBranding();
    }
  };

  return (
    <form onSubmit={save}>
      <div className="card">
        <div className="card-header">ข้อมูลโรงพยาบาล</div>
        <div className="card-body-pad">
          <FormGrid cols={2}>
            <FormField label="ชื่อโรงพยาบาล"><input className="form-control" value={form.hospital_name} onChange={(e) => set('hospital_name', e.target.value)} /></FormField>
            <FormField label="โทรศัพท์"><input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></FormField>
            <FormField label="ที่อยู่"><input className="form-control" value={form.address} onChange={(e) => set('address', e.target.value)} /></FormField>
            <FormField label="ผู้อำนวยการ"><input className="form-control" value={form.director} onChange={(e) => set('director', e.target.value)} /></FormField>
            <FormField label="เภสัชกร"><input className="form-control" value={form.pharmacist} onChange={(e) => set('pharmacist', e.target.value)} /></FormField>
            <FormField label="แจ้งเตือนใกล้หมดอายุ (วัน)"><input className="form-control" type="number" value={form.alert_expiry_day} onChange={(e) => set('alert_expiry_day', e.target.value)} /></FormField>
            <FormField label="อุณหภูมิต่ำสุด (°C)"><input className="form-control" type="number" value={form.temperature_min} onChange={(e) => set('temperature_min', e.target.value)} /></FormField>
            <FormField label="อุณหภูมิสูงสุด (°C)"><input className="form-control" type="number" value={form.temperature_max} onChange={(e) => set('temperature_max', e.target.value)} /></FormField>
          </FormGrid>
        </div>
      </div>

      <div className="card">
        <div className="card-header">ธีมสี</div>
        <div className="card-body-pad">
          <FormGrid cols={3}>
            <FormField label="Primary"><input className="form-control" type="color" value={themePrimary} onChange={(e) => setThemePrimary(e.target.value)} /></FormField>
            <FormField label="Secondary"><input className="form-control" type="color" value={themeSecondary} onChange={(e) => setThemeSecondary(e.target.value)} /></FormField>
            <FormField label="Accent"><input className="form-control" type="color" value={themeAccent} onChange={(e) => setThemeAccent(e.target.value)} /></FormField>
          </FormGrid>
          {Object.keys(presets).length > 0 && (
            <div className="theme-preset-row">
              {Object.entries(presets).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  className="theme-preset"
                  title={PRESET_LABELS[key] || key}
                  style={{ background: `linear-gradient(135deg, ${p.theme_primary}, ${p.theme_secondary})` }}
                  onClick={() => applyTheme(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">โลโก้โรงพยาบาล</div>
        <div className="card-body-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ maxHeight: 64, borderRadius: 8 }} />
            ) : (
              <div className="text-muted"><i className="bi bi-hospital" style={{ fontSize: '2rem' }} /></div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <label className="btn btn-sm btn-outline">
                <i className="bi bi-upload" /> อัปโหลด
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              </label>
              {logoId && (
                <button type="button" className="btn btn-sm btn-danger" onClick={removeLogo}>ลบโลโก้</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">ระบบฐานข้อมูล</div>
        <div className="card-body-pad">
          <p>โหมดปัจจุบัน: <strong>{dbMode || 'Google Sheets'}</strong></p>
          <button type="button" className="btn btn-outline btn-sm" onClick={testSupabase}>
            <i className="bi bi-database-check" /> ทดสอบ Supabase
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        <i className="bi bi-save" /> บันทึกการตั้งค่า
      </button>
    </form>
  );
}
