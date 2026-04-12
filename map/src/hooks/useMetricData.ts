'use client';
import { useState, useEffect, useMemo } from 'react';
import type { MetricKey, MetricFile } from '@/types';

import gdpData from '@/data/gdp.json';
import populationData from '@/data/population.json';
import billionairesData from '@/data/billionaires.json';
import millionairesData from '@/data/millionaires.json';
import techCompaniesData from '@/data/tech-companies.json';
import oilReservesData from '@/data/oil-reserves.json';
import militarySpendingData from '@/data/military-spending.json';

const DATA_MAP: Record<MetricKey, MetricFile> = {
  gdp: gdpData as MetricFile,
  population: populationData as MetricFile,
  billionaires: billionairesData as MetricFile,
  millionaires: millionairesData as MetricFile,
  'tech-companies': techCompaniesData as MetricFile,
  'oil-reserves': oilReservesData as MetricFile,
  'military-spending': militarySpendingData as MetricFile,
};

export function useMetricData(metric: MetricKey) {
  const [currentMetric, setCurrentMetric] = useState<MetricKey>(metric);

  useEffect(() => {
    setCurrentMetric(metric);
  }, [metric]);

  const metricFile = DATA_MAP[currentMetric];

  const metricByCountryId = useMemo(() => {
    const map: Record<string, number> = {};
    if (metricFile?.entries) {
      for (const entry of metricFile.entries) {
        map[entry.isoNumeric] = entry.value;
      }
    }
    return map;
  }, [metricFile]);

  const entriesByIsoNumeric = useMemo(() => {
    const map: Record<string, (typeof metricFile.entries)[0]> = {};
    if (metricFile?.entries) {
      for (const entry of metricFile.entries) {
        map[entry.isoNumeric] = entry;
      }
    }
    return map;
  }, [metricFile]);

  const totalValue = useMemo(() => {
    return Object.values(metricByCountryId).reduce((s, v) => s + v, 0);
  }, [metricByCountryId]);

  const sortedEntries = useMemo(() => {
    return [...(metricFile?.entries ?? [])].sort((a, b) => b.value - a.value);
  }, [metricFile]);

  const rankByIsoNumeric = useMemo(() => {
    const map: Record<string, number> = {};
    sortedEntries.forEach((entry, i) => {
      map[entry.isoNumeric] = i + 1;
    });
    return map;
  }, [sortedEntries]);

  return {
    metricFile,
    metricByCountryId,
    entriesByIsoNumeric,
    totalValue,
    sortedEntries,
    rankByIsoNumeric,
  };
}
