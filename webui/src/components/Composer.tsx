import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePush } from '../hooks/usePush';
import { useToastStore } from '../stores/toast';
import PropertyEditor from './PropertyEditor';
import PagePicker from './PagePicker';

interface ComposerProps {
  initialMarkdown?: string;
}

export default function Composer({ initialMarkdown = '' }: ComposerProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [targetPageId, setTargetPageId] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const { push, sending } = usePush();
  const addToast = useToastStore((s) => s.addToast);

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
    });
    if (result) {
      setMarkdown('');
      setTitle('');
    }
  }, [markdown, mode, title, targetPageId, push, addToast]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'create' | 'update')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="create">Create</option>
          <option value="update">Update</option>
        </select>
        <button
          onClick={handlePush}
          disabled={sending}
          className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-40 transition"
        >
          {sending ? 'Sending...' : 'Push'}
        </button>
      </div>

      {mode === 'update' && (
        <div className="mb-4">
          <button
            onClick={() => setShowPagePicker(!showPagePicker)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showPagePicker ? 'Close page search' : targetPageId ? 'Change target page' : 'Select target page'}
          </button>
          {showPagePicker && (
            <PagePicker onSelect={(id) => { setTargetPageId(id); setShowPagePicker(false); }} />
          )}
          {targetPageId && !showPagePicker && (
            <p className="mt-1 text-xs text-gray-500">Target: {targetPageId}</p>
          )}
        </div>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-500 uppercase">Markdown</label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showPreview ? 'Hide preview' : 'Show preview'}
            </button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write markdown here..."
          />
        </div>

        {showPreview && (
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-gray-500 uppercase mb-2">Preview</label>
            <div className="flex-1 overflow-auto px-4 py-3 border border-gray-200 rounded-lg bg-white prose prose-sm max-w-none">
              <ReactMarkdown>{markdown || '*No content*'}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <PropertyEditor properties={[]} onChange={() => {}} />
      </div>
    </div>
  );
}
