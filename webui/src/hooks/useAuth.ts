import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const { isAuthenticated, userId, setAuth, logout } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const startOAuth = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/auth/start');
      if (!resp.ok) throw new Error('Failed to start OAuth');
      const { url } = await resp.json();
      const width = 600;
      const height = 700;
      const left = screen.width / 2 - width / 2;
      const top = screen.height / 2 - height / 2;
      const popup = window.open(
        url,
        'Notion OAuth',
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );

      const checkInterval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(checkInterval);
          if (!mountedRef.current) return;
          try {
            const refreshResp = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'same-origin',
            });
            if (refreshResp.ok) {
              const data = await refreshResp.json();
              setAuth(data.accessToken, data.userId);
              addToast({ type: 'success', message: 'Notion と接続しました' });
            }
          } catch {
            addToast({ type: 'error', message: '認証に失敗しました' });
          }
          setLoading(false);
        }
      }, 500);
    } catch {
      if (mountedRef.current) setLoading(false);
      addToast({ type: 'error', message: 'OAuth 開始に失敗しました' });
    }
  }, [setAuth, addToast]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch { /* ignore */ }
    logout();
    addToast({ type: 'info', message: 'ログアウトしました' });
  }, [logout, addToast]);

  return { isAuthenticated, userId, loading, startOAuth, handleLogout };
}
