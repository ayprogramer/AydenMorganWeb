'use client';
import { useState, useEffect, useRef } from 'react';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import type { GeoProjection } from 'd3';
import { buildCartogramFeatures, buildGeoFeatures } from '@/lib/cartogram';
import type { VisualizationMode } from '@/types';

interface UseCartogramProps {
  topology: Topology | null;
  metricData: Record<string, number>;
  mode: VisualizationMode;
  projection: GeoProjection;
}

export function useCartogram({
  topology,
  metricData,
  mode,
  projection,
}: UseCartogramProps) {
  const [features, setFeatures] = useState<FeatureCollection | null>(null);
  const [geoFeatures, setGeoFeatures] = useState<FeatureCollection | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (!topology) return;
    setGeoFeatures(buildGeoFeatures(topology));
  }, [topology]);

  useEffect(() => {
    if (!topology) return;

    const key = `${mode}:${JSON.stringify(metricData)}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    setIsComputing(true);

    // Use setTimeout to yield to the browser so clicks/UI stay responsive
    const id = setTimeout(() => {
      try {
        if (mode === 'cartogram') {
          const result = buildCartogramFeatures({
            topology,
            metricByCountryId: metricData,
            projection,
            iterations: 4,
          });
          setFeatures(result);
        } else {
          const geo = buildGeoFeatures(topology);
          setFeatures({
            ...geo,
            features: geo.features.map((f) => ({
              ...f,
              properties: {
                ...f.properties,
                value: metricData[String(f.id)] ?? 0,
              },
            })),
          });
        }
      } finally {
        setIsComputing(false);
      }
    }, 20);

    return () => clearTimeout(id);
  }, [topology, metricData, mode, projection]);

  return { features, geoFeatures, isComputing };
}
