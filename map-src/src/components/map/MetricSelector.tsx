'use client';
import { MetricKey, METRIC_CONFIGS } from '@/types';

const METRICS: MetricKey[] = [
  'gdp',
  'population',
  'billionaires',
  'millionaires',
  'tech-companies',
  'oil-reserves',
  'military-spending',
];

interface Props {
  active: MetricKey;
  onChange: (metric: MetricKey) => void;
}

export default function MetricSelector({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {METRICS.map((key) => {
        const config = METRIC_CONFIGS[key];
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
          >
            {config.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
