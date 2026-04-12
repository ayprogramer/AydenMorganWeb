import * as d3 from 'd3';
import { CONTINENT_COLORS } from '@/types';

export function createIntensityScale(
  values: number[],
): d3.ScaleSequential<string> {
  const max = d3.max(values) ?? 1;
  return d3
    .scaleSequential()
    .domain([0, max])
    .interpolator(d3.interpolateBlues);
}

export function createBubbleScale(
  values: number[],
  maxRadius: number,
) {
  const max = d3.max(values) ?? 1;
  return d3.scaleSqrt().domain([0, max]).range([2, maxRadius]);
}

export function getContinentColor(continent: string): string {
  return CONTINENT_COLORS[continent] ?? '#94A3B8';
}

export function createCartogramScale(
  metricValues: Map<string, number>,
  geoAreas: Map<string, number>,
): Map<string, number> {
  const totalMetric = Array.from(metricValues.values()).reduce(
    (sum, v) => sum + v,
    0,
  );
  const totalArea = Array.from(geoAreas.values()).reduce(
    (sum, v) => sum + v,
    0,
  );

  const scaleMap = new Map<string, number>();

  metricValues.forEach((value, id) => {
    const geoArea = geoAreas.get(id) ?? 1;
    const metricShare = value / totalMetric;
    const geoShare = geoArea / totalArea;
    const scale = geoShare > 0 ? Math.sqrt(metricShare / geoShare) : 0;
    scaleMap.set(id, Math.max(0.15, Math.min(scale, 5)));
  });

  return scaleMap;
}
