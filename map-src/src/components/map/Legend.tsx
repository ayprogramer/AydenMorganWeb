'use client';
import { useMemo } from 'react';
import type { MetricKey, VisualizationMode } from '@/types';
import { METRIC_CONFIGS, CONTINENT_COLORS } from '@/types';
import { formatMetricValue } from '@/lib/format';

interface Props {
  metric: MetricKey;
  mode: VisualizationMode;
  maxValue: number;
  colorMode: 'continent' | 'intensity';
}

export default function Legend({ metric, mode, maxValue, colorMode }: Props) {
  const config = METRIC_CONFIGS[metric];

  const continentEntries = useMemo(
    () => Object.entries(CONTINENT_COLORS).filter(([k]) => k !== 'Antarctica'),
    [],
  );

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 max-w-[240px]">
      <div className="text-xs font-semibold text-gray-900 mb-1">
        {config.label}
      </div>
      <div className="text-[11px] text-gray-500 mb-3">
        {config.description} &middot; {config.unit}
      </div>

      {mode === 'cartogram' && colorMode === 'continent' && (
        <div className="space-y-1.5">
          {continentEntries.map(([name, color]) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] text-gray-600">{name}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
            Area = share of {config.shortLabel.toLowerCase()}
          </div>
        </div>
      )}

      {(mode === 'choropleth' || colorMode === 'intensity') && (
        <div>
          <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-50 via-blue-300 to-blue-700" />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">0</span>
            <span className="text-[10px] text-gray-400">
              {formatMetricValue(maxValue, metric)}
            </span>
          </div>
        </div>
      )}

      {mode === 'bubble' && (
        <div className="flex items-end gap-3 justify-center pt-1">
          {[0.2, 0.5, 1].map((frac) => {
            const r = Math.round(frac * 20);
            return (
              <div key={frac} className="flex flex-col items-center gap-1">
                <div
                  className="rounded-full border-2 border-blue-400/60 bg-blue-400/20"
                  style={{ width: r * 2, height: r * 2 }}
                />
                <span className="text-[9px] text-gray-400">
                  {formatMetricValue(maxValue * frac, metric)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
