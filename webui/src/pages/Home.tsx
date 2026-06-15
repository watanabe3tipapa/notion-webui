import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import QuickPushModal from '../components/QuickPushModal';
import Composer from '../components/Composer';

export default function Home() {
  const [showQuickPush, setShowQuickPush] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Notion WebUI へようこそ</h2>
        <p className="text-gray-500 mb-6">Connect your Notion account to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowQuickPush(true)}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Quick Push
        </button>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className={`px-6 py-3 rounded-lg border transition ${
            showComposer ? 'bg-gray-100 border-gray-400' : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {showComposer ? 'Close Composer' : 'Open Composer'}
        </button>
      </div>

      {showQuickPush && (
        <QuickPushModal onClose={() => setShowQuickPush(false)} />
      )}

      {showComposer && (
        <div className="h-[70vh] border border-gray-200 rounded-xl p-4 bg-white">
          <Composer />
        </div>
      )}

      {!showQuickPush && !showComposer && (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-300 rounded-lg">
          <p className="text-lg mb-2">Push content to Notion</p>
          <p className="text-sm">Use <strong>Quick Push</strong> for fast sending or <strong>Composer</strong> for rich editing</p>
        </div>
      )}
    </div>
  );
}
