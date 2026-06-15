import { useState, useCallback, useEffect, useRef } from 'react';
import { searchPages } from '../api/client';

interface PagePickerProps {
  onSelect: (pageId: string) => void;
}

export default function PagePicker({ onSelect }: PagePickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPages(q);
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="mt-1 space-y-1">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by title..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      {searching && <p className="text-xs text-gray-400 px-1">Searching...</p>}
      {results.length > 0 && (
        <ul className="border border-gray-200 rounded-md max-h-48 overflow-auto divide-y divide-gray-100">
          {results.map((page: any) => {
            const title = page.properties?.title?.title?.[0]?.plain_text || page.id.slice(0, 12);
            return (
              <li key={page.id}>
                <button
                  onClick={() => onSelect(page.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition truncate"
                >
                  {title}
                  <span className="text-xs text-gray-400 ml-2">{page.id.slice(0, 8)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
