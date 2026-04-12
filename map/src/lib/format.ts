export function formatNumber(value: number, prefix = ''): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${prefix}${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${prefix}${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${prefix}${(value / 1e3).toFixed(1)}K`;
  return `${prefix}${value.toFixed(0)}`;
}

export function formatMetricValue(
  value: number,
  metricKey: string,
): string {
  switch (metricKey) {
    case 'gdp':
      return formatNumber(value * 1e9, '$');
    case 'population':
      return formatNumber(value);
    case 'billionaires':
    case 'millionaires':
      return formatNumber(value);
    case 'tech-companies':
      return formatNumber(value * 1e9, '$');
    case 'oil-reserves':
      return `${value.toFixed(1)}B bbl`;
    case 'military-spending':
      return formatNumber(value * 1e6, '$');
    default:
      return formatNumber(value);
  }
}

export function formatPercent(value: number): string {
  if (value >= 10) return `${value.toFixed(1)}%`;
  if (value >= 1) return `${value.toFixed(2)}%`;
  if (value >= 0.01) return `${value.toFixed(2)}%`;
  return '<0.01%';
}

export function formatRank(rank: number): string {
  const s = String(rank);
  const last = s.slice(-1);
  const lastTwo = s.slice(-2);
  if (lastTwo === '11' || lastTwo === '12' || lastTwo === '13') return `#${rank}th`;
  if (last === '1') return `#${rank}st`;
  if (last === '2') return `#${rank}nd`;
  if (last === '3') return `#${rank}rd`;
  return `#${rank}th`;
}
