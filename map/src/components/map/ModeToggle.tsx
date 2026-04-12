'use client';
import { VisualizationMode } from '@/types';

const MODES: { key: VisualizationMode; label: string }[] = [
  { key: 'cartogram', label: 'Cartogram' },
  { key: 'choropleth', label: 'Choropleth' },
  { key: 'bubble', label: 'Bubble' },
];

interface Props {
  active: VisualizationMode;
  onChange: (mode: VisualizationMode) => void;
}

export default function ModeToggle({ active, onChange }: Props) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${
              key === active
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
