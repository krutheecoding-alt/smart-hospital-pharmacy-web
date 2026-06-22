import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { callApi } from '../lib/api';
import type { MenuItem, User } from '../lib/types';

const TOKEN_KEY = 'hps_token';
const USER_KEY = 'hps_user';

interface AuthContextValue {
  token: string;
  user: User | null;
  menu: MenuItem[];
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMenu: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUserState] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const refreshMenu = useCallback(async () => {
    if (!token) return;
    const r = await callApi<{ success: boolean; menu: MenuItem[] }>('getMenu', token);
    if (r.success && r.menu) setMenu(r.menu);
  }, [token]);

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const r = await callApi<{ success: boolean; user?: User; message?: string }>('validateSession', token);
      if (r.success && r.user) {
        setUserState(r.user as User);
        localStorage.setItem(USER_KEY, JSON.stringify(r.user));
        await refreshMenu();
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken('');
        setUserState(null);
      }
      setLoading(false);
    })();
  }, [token, refreshMenu]);

  const login = async (username: string, password: string) => {
    const r = await callApi<{ success: boolean; token?: string; user?: User; message?: string }>(
      'login',
      '',
      { username, password }
    );
    if (r.success && r.token && r.user) {
      setToken(r.token);
      localStorage.setItem(TOKEN_KEY, r.token);
      setUser(r.user as User);
      const menuR = await callApi<{ success: boolean; menu: MenuItem[] }>('getMenu', r.token);
      if (menuR.success) setMenu(menuR.menu);
      return { success: true };
    }
    return { success: false, message: r.message || 'เข้าสู่ระบบไม่สำเร็จ' };
  };

  const logout = async () => {
    if (token) await callApi('logout', token);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUserState(null);
    setMenu([]);
  };

  return (
    <AuthContext.Provider value={{ token, user, menu, loading, login, logout, refreshMenu, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
