/**
 * Dougenik-Chrisman-Niemeyer (DCN) contiguous cartogram algorithm.
 *
 * Each iteration:
 *  1. Compute each polygon's centroid, area, and radius in screen space.
 *  2. Compare actual area to desired area (proportional to metric share).
 *  3. Every vertex is displaced by a force field emanating from every polygon's
 *     centroid — polygons that need to grow push outward, polygons that need to
 *     shrink pull inward. This produces a continuous deformation where countries
 *     push their neighbors aside instead of overlapping.
 */
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry, Position } from 'geojson';

/* ── geometry helpers (screen-space) ────────────────────────────────── */

function ringArea(ring: Position[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(a / 2);
}

function ringCentroid(ring: Position[]): [number, number] {
  let cx = 0,
    cy = 0,
    a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    cx += (ring[j][0] + ring[i][0]) * cross;
    cy += (ring[j][1] + ring[i][1]) * cross;
    a += cross;
  }
  a /= 2;
  if (Math.abs(a) < 1e-10) {
    let sx = 0,
      sy = 0;
    for (const p of ring) {
      sx += p[0];
      sy += p[1];
    }
    return [sx / ring.length, sy / ring.length];
  }
  const f = 1 / (6 * a);
  return [cx * f, cy * f];
}

function featureStats(geom: Geometry): { area: number; centroid: [number, number] } {
  if (geom.type === 'Polygon') {
    return { area: ringArea(geom.coordinates[0]), centroid: ringCentroid(geom.coordinates[0]) };
  }
  if (geom.type === 'MultiPolygon') {
    let totalA = 0,
      wx = 0,
      wy = 0;
    for (const poly of geom.coordinates) {
      const a = ringArea(poly[0]);
      const c = ringCentroid(poly[0]);
      wx += c[0] * a;
      wy += c[1] * a;
      totalA += a;
    }
    return totalA > 0
      ? { area: totalA, centroid: [wx / totalA, wy / totalA] }
      : { area: 0, centroid: [0, 0] };
  }
  return { area: 0, centroid: [0, 0] };
}

/* ── projection helpers ─────────────────────────────────────────────── */

function projectRing(ring: Position[], proj: d3.GeoProjection): Position[] {
  return ring.map((pt) => {
    const p = proj([pt[0], pt[1]]);
    return p ? ([p[0], p[1]] as Position) : ([0, 0] as Position);
  });
}

function projectGeometry(geom: Geometry, proj: d3.GeoProjection): Geometry {
  if (geom.type === 'Polygon') {
    return { ...geom, coordinates: geom.coordinates.map((r) => projectRing(r, proj)) };
  }
  if (geom.type === 'MultiPolygon') {
    return {
      ...geom,
      coordinates: geom.coordinates.map((poly) => poly.map((r) => projectRing(r, proj))),
    };
  }
  return geom;
}

/* ── DCN iteration ──────────────────────────────────────────────────── */

interface PolyInfo {
  centroid: [number, number];
  area: number;
  radius: number;
  mass: number;
}

function displaceGeometry(geom: Geometry, infos: PolyInfo[]): void {
  function displaceRing(ring: Position[]) {
    for (const pt of ring) {
      let dx = 0,
        dy = 0;
      for (const info of infos) {
        if (info.area < 0.01) continue;
        const vx = pt[0] - info.centroid[0];
        const vy = pt[1] - info.centroid[1];
        const dist = Math.sqrt(vx * vx + vy * vy);
        if (dist < 0.01) continue;

        const force =
          dist > info.radius
            ? (info.mass * info.radius) / dist
            : info.mass * (dist / info.radius);

        dx += (force * vx) / dist;
        dy += (force * vy) / dist;
      }
      pt[0] += dx;
      pt[1] += dy;
    }
  }

  if (geom.type === 'Polygon') {
    geom.coordinates.forEach(displaceRing);
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates.forEach((poly) => poly.forEach(displaceRing));
  }
}

/* ── public API ─────────────────────────────────────────────────────── */

export interface CartogramInput {
  topology: Topology;
  metricByCountryId: Record<string, number>;
  projection: d3.GeoProjection;
  iterations?: number;
}

/**
 * Returns a FeatureCollection whose coordinates are already in *screen space*.
 * Render with `d3.geoPath().projection(null)`.
 */
export function buildCartogramFeatures(input: CartogramInput): FeatureCollection {
  const { topology, metricByCountryId, projection, iterations = 6 } = input;

  const countries = feature(topology, topology.objects.countries) as FeatureCollection;
  const filtered = countries.features.filter((f) => String(f.id) !== '010');

  const totalMetric = Object.values(metricByCountryId).reduce((s, v) => s + v, 0);

  // Deep-clone and project to screen space
  const projected: Feature[] = filtered.map((f) => ({
    type: 'Feature' as const,
    id: f.id,
    geometry: projectGeometry(JSON.parse(JSON.stringify(f.geometry)), projection),
    properties: {
      ...f.properties,
      value: metricByCountryId[String(f.id)] ?? 0,
    },
  }));

  // Measure total screen-space area once
  let totalArea = 0;
  for (const f of projected) totalArea += featureStats(f.geometry).area;

  // Run DCN iterations
  for (let iter = 0; iter < iterations; iter++) {
    const infos: PolyInfo[] = projected.map((f) => {
      const { area, centroid } = featureStats(f.geometry);
      const value = (f.properties?.value as number) ?? 0;
      const desiredArea = totalMetric > 0 ? (value / totalMetric) * totalArea : area;
      const radius = Math.max(Math.sqrt(area / Math.PI), 0.1);
      const desiredRadius = Math.sqrt(Math.max(desiredArea, 0) / Math.PI);
      return { centroid, area, radius, mass: desiredRadius - radius };
    });

    for (const f of projected) displaceGeometry(f.geometry, infos);
  }

  // Attach share metadata
  for (const f of projected) {
    const v = (f.properties?.value as number) ?? 0;
    f.properties = { ...f.properties, metricShare: totalMetric > 0 ? v / totalMetric : 0 };
  }

  return { type: 'FeatureCollection', features: projected };
}

/** Returns un-projected GeoJSON (geographic coords) for choropleth / bubble. */
export function buildGeoFeatures(topology: Topology): FeatureCollection {
  const countries = feature(topology, topology.objects.countries) as FeatureCollection;
  return {
    type: 'FeatureCollection',
    features: countries.features
      .filter((f) => String(f.id) !== '010')
      .map((f) => ({
        ...f,
        properties: { ...f.properties, value: 0, metricShare: 0 },
      })),
  };
}
