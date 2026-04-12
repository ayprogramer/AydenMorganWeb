'use client';
import type { MetricKey, MetricFile, CountryMeta } from '@/types';
import { METRIC_CONFIGS } from '@/types';
import { formatMetricValue, formatPercent } from '@/lib/format';
import countryMetaData from '@/data/country-meta.json';

const countryMeta = countryMetaData as Record<string, CountryMeta>;

interface Props {
  metric: MetricKey;
  metricFile: MetricFile | null;
  totalValue: number;
  sortedEntries: MetricFile['entries'];
}

export default function StatsBar({
  metric,
  totalValue,
  sortedEntries,
}: Props) {
  const config = METRIC_CONFIGS[metric];

  const topEntry = sortedEntries[0];
  const topMeta = topEntry ? countryMeta[topEntry.isoNumeric] : null;
  const topShare = topEntry && totalValue > 0
    ? (topEntry.value / totalValue) * 100
    : 0;

  const bottom50Count = Math.ceil(sortedEntries.length / 2);
  const bottom50 = sortedEntries.slice(-bottom50Count);
  const bottom50Total = bottom50.reduce((s, e) => s + e.value, 0);
  const bottom50Share = totalValue > 0 ? (bottom50Total / totalValue) * 100 : 0;

  let mostDistorted = sortedEntries[0];
  let highestRatio = 0;
  for (const entry of sortedEntries) {
    const share = totalValue > 0 ? entry.value / totalValue : 0;
    if (share > highestRatio) {
      highestRatio = share;
      mostDistorted = entry;
    }
  }
  const distortedMeta = mostDistorted
    ? countryMeta[mostDistorted.isoNumeric]
    : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label={`World Total ${config.shortLabel}`}
        value={formatMetricValue(totalValue, metric)}
        sublabel={config.unit}
      />
      <StatCard
        label="Top Country"
        value={topMeta?.name ?? '—'}
        sublabel={
          topEntry
            ? `${formatMetricValue(topEntry.value, metric)} (${formatPercent(topShare)})`
            : ''
        }
        flagAlpha2={topMeta?.alpha2}
      />
      <StatCard
        label="Bottom 50% Combined"
        value={formatMetricValue(bottom50Total, metric)}
        sublabel={`${bottom50Count} countries (${formatPercent(bottom50Share)})`}
      />
      <StatCard
        label="Largest Share"
        value={distortedMeta?.name ?? '—'}
        sublabel={`${formatPercent(highestRatio * 100)} of world total`}
        flagAlpha2={distortedMeta?.alpha2}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  flagAlpha2,
}: {
  label: string;
  value: string;
  sublabel: string;
  flagAlpha2?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="flex items-center gap-2">
        {flagAlpha2 && (
          <img
            src={`https://flagcdn.com/20x15/${flagAlpha2.toLowerCase()}.png`}
            alt=""
            className="w-5 h-[15px] rounded-sm object-cover"
          />
        )}
        <div className="text-lg font-semibold text-gray-900 truncate">
          {value}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1 truncate">{sublabel}</div>
    </div>
  );
}
