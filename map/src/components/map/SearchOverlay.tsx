'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { CountryMeta } from '@/types';
import countryMetaData from '@/data/country-meta.json';

const countryMeta = countryMetaData as Record<string, CountryMeta>;
const allCountries = Object.entries(countryMeta).map(([id, meta]) => ({
  id,
  ...meta,
}));

interface Props {
  onSelect: (countryId: string | null) => void;
  selectedId: string | null;
}

export default function SearchOverlay({ onSelect, selectedId }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allCountries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.alpha2.toLowerCase() === q ||
          c.alpha3.toLowerCase() === q,
      )
      .slice(0, 8);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="absolute top-4 right-4 z-20 w-64">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search country..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-8 py-2.5 text-sm bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent placeholder:text-gray-400"
        />
        {(query || selectedId) && (
          <button
            onClick={() => {
              setQuery('');
              onSelect(null);
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c.id);
                setQuery(c.name);
                setOpen(false);
              }}
              className={`
                w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5
                hover:bg-gray-50 transition-colors
                ${c.id === selectedId ? 'bg-blue-50' : ''}
              `}
            >
              <img
                src={`https://flagcdn.com/16x12/${c.alpha2.toLowerCase()}.png`}
                alt=""
                className="w-4 h-3 rounded-sm object-cover"
              />
              <span className="text-gray-900">{c.name}</span>
              <span className="text-gray-400 text-xs ml-auto">
                {c.continent}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
