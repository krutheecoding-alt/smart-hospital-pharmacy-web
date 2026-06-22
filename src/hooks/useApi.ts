import { useCallback, useState } from 'react';
import { callApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useApiAction() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const run = useCallback(async <T extends { success: boolean; message?: string }>(
    action: string,
    data: Record<string, unknown> = {},
    opts?: { silent?: boolean }
  ): Promise<T | null> => {
    setLoading(true);
    const r = await callApi<T>(action, token, data);
    setLoading(false);
    if (!r.success && !opts?.silent) toast(r.message || 'เกิดข้อผิดพลาด', 'error');
    return r;
  }, [token, toast]);

  return { run, loading };
}