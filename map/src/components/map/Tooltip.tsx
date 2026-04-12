'use client';
import { useEffect, useRef, useState } from 'react';
import type { MetricKey, CountryMeta } from '@/types';
import { METRIC_CONFIGS } from '@/types';
import { formatMetricValue, formatPercent, formatRank } from '@/lib/format';
import countryMetaData from '@/data/country-meta.json';

const countryMeta = countryMetaData as Record<string, CountryMeta>;

interface Props {
  x: number;
  y: number;
  countryId: string;
  metricData: Record<string, number>;
  metric: MetricKey;
  totalValue: number;
  rank: number;
}

export default function Tooltip({
  x,
  y,
  countryId,
  metricData,
  metric,
  totalValue,
  rank,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x + 16, top: y + 16 });

  const meta = countryMeta[countryId];
  const value = metricData[countryId] ?? 0;
  const config = METRIC_CONFIGS[metric];
  const share = totalValue > 0 ? (value / totalValue) * 100 : 0;

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x + 16;
    let top = y + 16;

    if (left + rect.width > vw - 16) left = x - rect.width - 16;
    if (top + rect.height > vh - 16) top = y - rect.height - 16;

    setPos({ left: Math.max(8, left), top: Math.max(8, top) });
  }, [x, y]);

  if (!meta) return null;

  const flagUrl = `https://flagcdn.com/24x18/${meta.alpha2.toLowerCase()}.png`;

  return (
    <div
      ref={ref}
      className="fixed z-50 pointer-events-none animate-in fade-in duration-150"
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[220px]">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
          <img
            src={flagUrl}
            alt={meta.name}
            className="w-6 h-[18px] rounded-sm object-cover shadow-sm"
            loading="eager"
          />
          <span className="font-semibold text-gray-900 text-sm">
            {meta.name}
          </span>
        </div>
        <div className="px-4 py-3 space-y-2">
          <Row label={config.label} value={formatMetricValue(value, metric)} />
          <Row label="World share" value={formatPercent(share)} />
          <Row label="Global rank" value={formatRank(rank)} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 ml-6">{value}</span>
    </div>
  );
}
