import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { pushToNotion, searchPages, listDatabases } from '../api/client';

interface PushOptions {
  mode: 'create' | 'update';
  title?: string;
  markdown: string;
  pageId?: string;
  databaseId?: string;
}

export function usePush() {
  const [sending, setSending] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const push = useCallback(
    async (options: PushOptions) => {
      if (!isAuthenticated) {
        addToast({ type: 'error', message: '認証が必要です' });
        return null;
      }
      if (!options.markdown.trim()) {
        addToast({ type: 'error', message: 'マークダウンが空です' });
        return null;
      }

      setSending(true);
      try {
        const result = await pushToNotion(options);
        addToast({
          type: 'success',
          message: options.mode === 'create'
            ? `ページを作成しました (${result.pageId.slice(0, 8)}...)`
            : 'ページを更新しました',
        });
        return result;
      } catch (e: any) {
        const msg = e?.response?.data?.error || e.message || 'Push に失敗しました';
        addToast({ type: 'error', message: msg });
        return null;
      } finally {
        setSending(false);
      }
    },
    [isAuthenticated, addToast]
  );

  return { push, sending };
}

export function usePageSearch() {
  const search = useCallback(async (q: string) => {
    if (!q.trim()) return [];
    try {
      const { results } = await searchPages(q);
      return results;
    } catch {
      return [];
    }
  }, []);

  return { search };
}

export function useDatabases() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDatabases = useCallback(async () => {
    setLoading(true);
    try {
      const { results } = await listDatabases();
      setDatabases(results);
    } catch {
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { databases, loading, fetchDatabases };
}
