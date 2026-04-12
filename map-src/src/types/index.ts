export type MetricKey =
  | 'gdp'
  | 'population'
  | 'billionaires'
  | 'millionaires'
  | 'tech-companies'
  | 'oil-reserves'
  | 'military-spending';

export type VisualizationMode = 'cartogram' | 'choropleth' | 'bubble';

export type ColorMode = 'continent' | 'intensity';

export interface MetricEntry {
  iso3: string;
  isoNumeric: string;
  value: number;
  label: string;
  year: number;
  source: string;
}

export interface MetricFile {
  metric: MetricKey;
  unit: string;
  description: string;
  entries: MetricEntry[];
}

export interface CountryMeta {
  alpha2: string;
  alpha3: string;
  name: string;
  continent: string;
}

export interface MetricConfig {
  key: MetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
  formatPrefix: string;
  perCapitaLabel?: string;
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  gdp: {
    key: 'gdp',
    label: 'GDP (Nominal)',
    shortLabel: 'GDP',
    unit: 'USD',
    description: 'Gross Domestic Product at current prices',
    formatPrefix: '$',
    perCapitaLabel: 'GDP per capita',
  },
  population: {
    key: 'population',
    label: 'Population',
    shortLabel: 'Population',
    unit: 'persons',
    description: 'Total population',
    formatPrefix: '',
  },
  billionaires: {
    key: 'billionaires',
    label: 'Billionaires',
    shortLabel: 'Billionaires',
    unit: 'count',
    description: 'Number of billionaires by country of citizenship',
    formatPrefix: '',
  },
  millionaires: {
    key: 'millionaires',
    label: 'Millionaires',
    shortLabel: 'Millionaires',
    unit: 'count',
    description: 'High-net-worth individuals (net worth > $1M USD)',
    formatPrefix: '',
  },
  'tech-companies': {
    key: 'tech-companies',
    label: 'Tech Market Cap',
    shortLabel: 'Tech Cos.',
    unit: 'USD billions',
    description: 'Total market cap of top tech companies by HQ country',
    formatPrefix: '$',
  },
  'oil-reserves': {
    key: 'oil-reserves',
    label: 'Oil Reserves',
    shortLabel: 'Oil',
    unit: 'billion barrels',
    description: 'Proven oil reserves',
    formatPrefix: '',
  },
  'military-spending': {
    key: 'military-spending',
    label: 'Military Spending',
    shortLabel: 'Military',
    unit: 'USD millions',
    description: 'Annual military expenditure',
    formatPrefix: '$',
  },
};

export const CONTINENT_COLORS: Record<string, string> = {
  'North America': '#378ADD',
  'South America': '#1D9E75',
  Europe: '#7F77DD',
  Africa: '#EF9F27',
  Asia: '#D85A30',
  Oceania: '#D4537E',
  Antarctica: '#94A3B8',
};
