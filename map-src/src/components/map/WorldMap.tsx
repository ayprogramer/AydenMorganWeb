'use client';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import type { Topology } from 'topojson-specification';
import type { Feature } from 'geojson';
import { interpolate as flubberInterpolate } from 'flubber';
import { useCartogram } from '@/hooks/useCartogram';
import { createProjection, createPathGenerator } from '@/lib/projection';
import {
  createIntensityScale,
  createBubbleScale,
  getContinentColor,
} from '@/lib/scales';
import type { MetricKey, VisualizationMode, CountryMeta } from '@/types';
import countryMetaData from '@/data/country-meta.json';

const countryMeta = countryMetaData as Record<string, CountryMeta>;

const WIDTH = 960;
const HEIGHT = 500;

interface Props {
  topology: Topology;
  metric: MetricKey;
  metricData: Record<string, number>;
  mode: VisualizationMode;
  colorMode: 'continent' | 'intensity';
  highlightId: string | null;
  onHover: (info: { x: number; y: number; countryId: string } | null) => void;
}

export default function WorldMap({
  topology,
  metric,
  metricData,
  mode,
  colorMode,
  highlightId,
  onHover,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevPathsRef = useRef<Map<string, string>>(new Map());
  const initRef = useRef(false);

  const projection = useMemo(() => createProjection(WIDTH, HEIGHT), []);

  // Cartogram features are already in screen space → render with null projection
  const cartogramPathGen = useMemo(() => d3.geoPath().projection(null), []);
  // Choropleth / bubble features are in geographic coords → need projection
  const geoPathGen = useMemo(() => createPathGenerator(projection), [projection]);

  const { features, geoFeatures, isComputing } = useCartogram({
    topology,
    metricData,
    mode,
    projection,
  });

  const metricValues = useMemo(() => Object.values(metricData), [metricData]);
  const intensityScale = useMemo(
    () => createIntensityScale(metricValues),
    [metricValues],
  );
  const bubbleScale = useMemo(
    () => createBubbleScale(metricValues, 40),
    [metricValues],
  );

  const getCountryColor = useCallback(
    (countryId: string) => {
      if (colorMode === 'intensity' || mode === 'choropleth') {
        const val = metricData[countryId] ?? 0;
        return val > 0 ? intensityScale(val) : '#f1f5f9';
      }
      const meta = countryMeta[countryId];
      return meta ? getContinentColor(meta.continent) : '#e2e8f0';
    },
    [colorMode, mode, metricData, intensityScale],
  );

  // The path generator to use depends on the current mode
  const activePathGen = mode === 'cartogram' ? cartogramPathGen : geoPathGen;

  /* ── initialise SVG once ───────────────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (initRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'map-group');

    // Sphere outline (geographic backdrop — hidden in cartogram mode)
    g.append('path')
      .attr('class', 'sphere')
      .attr('d', geoPathGen({ type: 'Sphere' }) ?? '')
      .attr('fill', '#ffffff')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 0.5);

    // Graticule
    g.append('path')
      .attr('class', 'graticule')
      .attr('d', geoPathGen(d3.geoGraticule10()) ?? '')
      .attr('fill', 'none')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 0.3);

    // Zoom / pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
    svg.call(zoom);

    initRef.current = true;
  }, [geoPathGen]);

  /* ── render / update on data change ────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || !features || !initRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.map-group');
    if (g.empty()) return;

    // Show/hide geographic backdrop depending on mode
    const showGeo = mode !== 'cartogram';
    g.select('.sphere').attr('opacity', showGeo ? 1 : 0);
    g.select('.graticule').attr('opacity', showGeo ? 1 : 0);

    // Remove bubbles when switching away from bubble mode
    if (mode !== 'bubble') g.selectAll('circle.bubble').remove();

    if (mode === 'bubble') {
      renderBubbleMode(g);
    } else {
      renderPathMode(g);
    }
  }, [features, geoFeatures, mode, colorMode, metric, highlightId, metricData]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── cartogram & choropleth renderer ───────────────────────────────── */
  function renderPathMode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ) {
    if (!features) return;

    const sel = g
      .selectAll<SVGPathElement, Feature>('path.country')
      .data(features.features, (d) => String(d.id));

    sel.exit().transition().duration(600).attr('opacity', 0).remove();

    const enter = sel
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', (d) => activePathGen(d) ?? '')
      .attr('fill', (d) => getCountryColor(String(d.id)))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.4)
      .attr('opacity', 0)
      .style('cursor', 'pointer');

    attachMouseHandlers(enter);

    enter.merge(sel).each(function (d) {
      const el = d3.select(this);
      const id = String(d.id);
      const nextPath = activePathGen(d) ?? '';
      const prevPath = prevPathsRef.current.get(id);
      const isHl = highlightId === id;

      if (prevPath && nextPath && prevPath !== nextPath) {
        try {
          const interp = flubberInterpolate(prevPath, nextPath, {
            maxSegmentLength: 10,
          });
          el.transition()
            .duration(1200)
            .ease(d3.easeCubicInOut)
            .attrTween('d', () => interp)
            .attr('fill', getCountryColor(id))
            .attr('opacity', 1)
            .attr('stroke', isHl ? '#1d4ed8' : '#fff')
            .attr('stroke-width', isHl ? 2 : 0.4);
        } catch {
          el.transition()
            .duration(1200)
            .ease(d3.easeCubicInOut)
            .attr('d', nextPath)
            .attr('fill', getCountryColor(id))
            .attr('opacity', 1);
        }
      } else {
        el.transition()
          .duration(prevPath ? 400 : 1200)
          .ease(d3.easeCubicInOut)
          .attr('d', nextPath)
          .attr('fill', getCountryColor(id))
          .attr('opacity', 1)
          .attr('stroke', isHl ? '#1d4ed8' : '#fff')
          .attr('stroke-width', isHl ? 2 : 0.4);
      }

      prevPathsRef.current.set(id, nextPath);
    });
  }

  /* ── bubble renderer ───────────────────────────────────────────────── */
  function renderBubbleMode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ) {
    const baseFeatures = geoFeatures ?? features;
    if (!baseFeatures) return;

    // Country outlines (geographic)
    const cSel = g
      .selectAll<SVGPathElement, Feature>('path.country')
      .data(baseFeatures.features, (d) => String(d.id));

    cSel.exit().transition().duration(600).attr('opacity', 0).remove();

    const cEnter = cSel
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', (d) => geoPathGen(d) ?? '')
      .attr('fill', '#f1f5f9')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 0.5)
      .attr('opacity', 1)
      .style('cursor', 'pointer');

    attachMouseHandlers(cEnter);

    cEnter.merge(cSel).each(function (d) {
      const nextPath = geoPathGen(d) ?? '';
      d3.select(this)
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr('d', nextPath)
        .attr('fill', '#f1f5f9')
        .attr('stroke', '#e2e8f0')
        .attr('opacity', 1);
      prevPathsRef.current.set(String(d.id), nextPath);
    });

    // Bubbles
    const bubbleData = baseFeatures.features
      .map((f) => ({
        id: String(f.id),
        centroid: geoPathGen.centroid(f),
        value: metricData[String(f.id)] ?? 0,
      }))
      .filter((d) => d.value > 0 && !isNaN(d.centroid[0]));

    const bSel = g
      .selectAll<SVGCircleElement, (typeof bubbleData)[0]>('circle.bubble')
      .data(bubbleData, (d) => d.id);

    bSel.exit().transition().duration(400).attr('r', 0).remove();

    bSel
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d) => d.centroid[0])
      .attr('cy', (d) => d.centroid[1])
      .attr('r', 0)
      .attr('fill', 'rgba(59,130,246,0.35)')
      .attr('stroke', 'rgba(59,130,246,0.6)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d) {
        onHover({ x: event.clientX, y: event.clientY, countryId: d.id });
      })
      .on('mousemove', function (event: MouseEvent, d) {
        onHover({ x: event.clientX, y: event.clientY, countryId: d.id });
      })
      .on('mouseleave', () => onHover(null))
      .merge(bSel)
      .transition()
      .duration(800)
      .ease(d3.easeCubicInOut)
      .attr('cx', (d) => d.centroid[0])
      .attr('cy', (d) => d.centroid[1])
      .attr('r', (d) => bubbleScale(d.value));
  }

  /* ── mouse interaction ─────────────────────────────────────────────── */
  function attachMouseHandlers(
    sel: d3.Selection<SVGPathElement, Feature, SVGGElement, unknown>,
  ) {
    sel
      .on('mouseenter', function (event: MouseEvent, d: Feature) {
        d3.select(this).attr('stroke', '#374151').attr('stroke-width', 1.5);
        onHover({ x: event.clientX, y: event.clientY, countryId: String(d.id) });
      })
      .on('mousemove', function (event: MouseEvent, d: Feature) {
        onHover({ x: event.clientX, y: event.clientY, countryId: String(d.id) });
      })
      .on('mouseleave', function () {
        const id = String((d3.select(this).datum() as Feature).id);
        const hl = highlightId === id;
        d3.select(this)
          .attr('stroke', hl ? '#1d4ed8' : mode === 'bubble' ? '#e2e8f0' : '#fff')
          .attr('stroke-width', hl ? 2 : mode === 'bubble' ? 0.5 : 0.4);
        onHover(null);
      });
  }

  /* ── render ────────────────────────────────────────────────────────── */
  return (
    <div className="relative w-full">
      {isComputing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Computing cartogram...
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto rounded-xl"
        style={{ background: '#ffffff' }}
      />
    </div>
  );
}
