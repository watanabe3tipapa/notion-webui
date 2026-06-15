import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth';
import { usePush, useDatabases } from '../hooks/usePush';
import { useToastStore } from '../stores/toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PagePicker from './PagePicker';

interface QuickPushModalProps {
  initialMarkdown?: string;
  onClose?: () => void;
}

export default function QuickPushModal({ initialMarkdown = '', onClose }: QuickPushModalProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [targetPageId, setTargetPageId] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [blockCount, setBlockCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleTouchedRef = useRef(false);
  const mountedRef = useRef(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { push, sending } = usePush();
  const addToast = useToastStore((s) => s.addToast);
  const { databases, fetchDatabases } = useDatabases();

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDatabases();
    }
  }, [isAuthenticated, fetchDatabases]);

  useEffect(() => {
    const lines = markdown.split('\n').filter(Boolean).length;
    setBlockCount(Math.max(1, lines));

    if (!titleTouchedRef.current) {
      const firstLine = markdown.split('\n').find(Boolean) || '';
      setTitle(firstLine.replace(/^#+\s*/, '').slice(0, 100));
    }
  }, [markdown]);

  const handlePush = useCallback(async () => {
    if (!markdown.trim()) {
      addToast({ type: 'error', message: 'マークダウンを入力してください' });
      return;
    }
    const result = await push({
      mode,
      title: title || undefined,
      markdown,
      pageId: mode === 'update' ? targetPageId : undefined,
      databaseId: mode === 'create' ? databaseId || undefined : undefined,
    });
    if (result) {
      setMarkdown('');
      setTitle('');
      onClose?.();
    }
  }, [markdown, mode, title, targetPageId, databaseId, push, addToast, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePush();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Push to Notion</h2>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { titleTouchedRef.current = true; setTitle(e.target.value); }}
                placeholder="Auto-extracted from markdown"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'create' | 'update')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="create">Create new page</option>
                <option value="update">Update existing page</option>
              </select>
            </div>
          </div>

          {mode === 'create' && databases.length > 0 && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Database (optional)
              </label>
              <select
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Workspace root</option>
                {databases.map((db: any) => (
                  <option key={db.id} value={db.id}>
                    {db.title?.[0]?.plain_text || db.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'update' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Target Page
                </label>
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showPicker ? 'Close' : 'Search pages'}
                </button>
              </div>
              {showPicker && (
                <PagePicker
                  onSelect={(id) => {
                    setTargetPageId(id);
                    setShowPicker(false);
                  }}
                />
              )}
              {targetPageId && !showPicker && (
                <p className="mt-1 text-xs text-gray-500 truncate">
                  Selected: {targetPageId.slice(0, 36)}...
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Markdown
              </label>
              <span className="text-xs text-gray-400">~{blockCount} blocks</span>
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your markdown content here..."
              rows={14}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-400">Cmd+Enter to send</span>
          <button
            onClick={handlePush}
            disabled={sending || !isAuthenticated || !markdown.trim()}
            className="px-6 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {sending ? 'Sending...' : mode === 'create' ? 'Create Page' : 'Update Page'}
          </button>
        </div>
      </div>
    </div>
  );
}
