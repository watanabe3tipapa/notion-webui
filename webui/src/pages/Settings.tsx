import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../stores/auth';
import { useAuth } from '../hooks/useAuth';
import { fetchMe } from '../api/client';
import { useToastStore } from '../stores/toast';

export default function Settings() {
  const { isAuthenticated, userId } = useAuthStore();
  const { startOAuth, handleLogout, loading } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const mountedRef = useRef(true);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe()
        .then((data: any) => { if (mountedRef.current) setUserInfo(data); })
        .catch(() => { if (mountedRef.current) addToast({ type: 'error', message: 'ユーザー情報の取得に失敗しました' }); });
    }
  }, [isAuthenticated, addToast]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Notion Connection</h3>

        {!isAuthenticated ? (
          <button
            onClick={startOAuth}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect Notion Account'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500">User ID:</span> <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{userId}</code></p>
              {userInfo?.workspace_id && (
                <p><span className="text-gray-500">Workspace ID:</span> <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{userInfo.workspace_id}</code></p>
              )}
              <p><span className="text-gray-500">Status:</span> <span className="text-green-600 font-medium">Connected</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">About</h3>
        <p className="text-xs text-gray-500">
          Notion WebUI — Local tool for pushing markdown content to Notion via the Notion API.
          <br />
          Version 0.1.0
        </p>
      </div>
    </div>
  );
}
