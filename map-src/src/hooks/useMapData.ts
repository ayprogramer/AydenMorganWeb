'use client';
import { useState, useEffect } from 'react';
import type { Topology } from 'topojson-specification';

const TOPO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function useMapData() {
  const [topology, setTopology] = useState<Topology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(TOPO_URL);
        if (!res.ok) throw new Error(`Failed to fetch TopoJSON: ${res.status}`);
        const data = (await res.json()) as Topology;
        if (!cancelled) {
          setTopology(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { topology, loading, error };
}
