import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Property {
  id: string;
  key: string;
  type: 'text' | 'date' | 'select' | 'status' | 'number';
  value: string;
}

interface PropertyEditorProps {
  properties: Property[];
  onChange: (properties: Property[]) => void;
}

const PROPERTY_TYPES = ['text', 'date', 'select', 'status', 'number'] as const;
let propCounter = 0;

export default function PropertyEditor({ properties, onChange }: PropertyEditorProps) {
  const addProperty = () => {
    onChange([...properties, { id: `prop-${++propCounter}`, key: '', type: 'text', value: '' }]);
  };

  const removeProperty = (id: string) => {
    onChange(properties.filter((p) => p.id !== id));
  };

  const updateProperty = (id: string, field: keyof Property, value: string) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Properties
        </label>
        <button
          onClick={addProperty}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <PlusIcon className="w-3 h-3" /> Add
        </button>
      </div>
      {properties.map((prop) => (
        <div key={prop.id} className="flex items-center gap-2">
          <input
            type="text"
            value={prop.key}
            onChange={(e) => updateProperty(prop.id, 'key', e.target.value)}
            placeholder="Property name"
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={prop.type}
            onChange={(e) => updateProperty(prop.id, 'type', e.target.value as Property['type'])}
            className="px-2 py-1.5 border border-gray-300 rounded text-xs"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type={prop.type === 'date' ? 'date' : 'text'}
            value={prop.value}
            onChange={(e) => updateProperty(prop.id, 'value', e.target.value)}
            placeholder="Value"
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => removeProperty(prop.id)}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
