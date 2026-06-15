import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSyncLogs, deleteSyncLogs } from '../api/client';
import { useToastStore } from '../stores/toast';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function SyncDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const loadLogs = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const data = await fetchSyncLogs(100, 0);
      if (!mountedRef.current) return;
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      addToast({ type: 'error', message: '同期ログの取得に失敗しました' });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleClear = useCallback(async () => {
    try {
      await deleteSyncLogs();
      setLogs([]);
      setTotal(0);
      addToast({ type: 'info', message: 'ログを削除しました' });
    } catch {
      addToast({ type: 'error', message: 'ログ削除に失敗しました' });
    }
  }, [addToast]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sync Logs</h2>
          <p className="text-sm text-gray-500">{total} entries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50"
          >
            <TrashIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-300 rounded-lg">
          No sync logs yet. Push some content to Notion!
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Time</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Action</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Page ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{log.created_at}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 font-mono">
                    {log.page_id ? log.page_id.slice(0, 12) + '...' : '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{log.message || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
