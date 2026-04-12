'use client';
import { useState } from 'react';
import { useMapData } from '@/hooks/useMapData';
import { useMetricData } from '@/hooks/useMetricData';
import WorldMap from '@/components/map/WorldMap';
import MetricSelector from '@/components/map/MetricSelector';
import ModeToggle from '@/components/map/ModeToggle';
import Tooltip from '@/components/map/Tooltip';
import Legend from '@/components/map/Legend';
import StatsBar from '@/components/map/StatsBar';
import SearchOverlay from '@/components/map/SearchOverlay';
import type { MetricKey, VisualizationMode } from '@/types';

export default function MapPage() {
  const [metric, setMetric] = useState<MetricKey>('gdp');
  const [mode, setMode] = useState<VisualizationMode>('cartogram');
  const [colorMode] = useState<'continent' | 'intensity'>('continent');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    countryId: string;
  } | null>(null);

  const { topology, loading, error } = useMapData();
  const {
    metricFile,
    metricByCountryId,
    totalValue,
    sortedEntries,
    rankByIsoNumeric,
  } = useMetricData(metric);

  const maxValue = sortedEntries.length > 0 ? sortedEntries[0].value : 0;

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load map
          </div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-sm font-medium text-gray-400">
          aydenmorgan.com/
          <span className="text-gray-900">map</span>
        </h1>
        <ModeToggle active={mode} onChange={setMode} />
      </header>

      <div className="px-4 pt-4">
        <MetricSelector active={metric} onChange={setMetric} />
      </div>

      <div className="relative px-4 mt-3 max-w-[1400px] mx-auto">
        {loading || !topology ? (
          <div className="w-full aspect-[960/500] bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              <span className="text-sm">Loading world map...</span>
            </div>
          </div>
        ) : (
          <WorldMap
            topology={topology}
            metric={metric}
            metricData={metricByCountryId}
            mode={mode}
            colorMode={colorMode}
            highlightId={highlightId}
            onHover={setTooltip}
          />
        )}

        <Legend
          metric={metric}
          mode={mode}
          maxValue={maxValue}
          colorMode={colorMode}
        />
        <SearchOverlay onSelect={setHighlightId} selectedId={highlightId} />
      </div>

      {tooltip && (
        <Tooltip
          x={tooltip.x}
          y={tooltip.y}
          countryId={tooltip.countryId}
          metricData={metricByCountryId}
          metric={metric}
          totalValue={totalValue}
          rank={rankByIsoNumeric[tooltip.countryId] ?? 0}
        />
      )}

      <div className="px-4 mt-3 pb-8 max-w-[1400px] mx-auto">
        <StatsBar
          metric={metric}
          metricFile={metricFile}
          totalValue={totalValue}
          sortedEntries={sortedEntries}
        />
      </div>
    </main>
  );
}
