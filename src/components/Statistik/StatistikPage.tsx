import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { Statistic } from '../../types';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';

interface StatistikPageProps {
  statistik: Statistic[];
  onStatClick: (item: Statistic) => void;
}

// Smart chart thumbnail
const DataThumb: React.FC<{ item: Statistic }> = ({ item }) => {
  const mediaUrl = (item as any).media_url || item.image_url || '';
  const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
  const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);
  const isIframe = mediaUrl.trim().startsWith('<iframe');

  if (mediaUrl && !isImage) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none">
          {isIframe
            ? <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: mediaUrl }} />
            : <iframe src={flourishId ? `https://flo.uri.sh/visualisation/${flourishId}/embed?auto=1` : mediaUrl} className="w-full h-full border-0" scrolling="no" />
          }
        </div>
      </div>
    );
  }

  if (isImage && mediaUrl) {
    return <SafeImage src={mediaUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />;
  }

  // Fallback: mini bar chart from chart_data
  if (item.chart_data?.data?.length) {
    return (
      <div className="w-full h-full flex items-end p-4 bg-slate-50">
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={item.chart_data.data.slice(0, 5)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={10}>
              {item.chart_data.data.slice(0, 5).map((entry: any, i: number) => (
                <Cell key={i} fill={entry.color || '#c0392b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <BarChart3 size={28} className="text-slate-300" />
    </div>
  );
};

const PER_PAGE = 12;

const StatistikPage: React.FC<StatistikPageProps> = ({ statistik, onStatClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  usePageView({ pageType: 'statistik-list', pageTitle: 'Data Explorer' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    const searchParam = params.get('search');
    if (filterParam) setActiveFilter(filterParam);
    if (searchParam) {
      setSearchQuery(searchParam);
      setLocalSearch(searchParam);
    }
  }, [window.location.search]);

  const categories = useMemo(() =>
    ['All', ...Array.from(new Set(statistik.map(s => s.category).filter(Boolean)))],
    [statistik]
  );

  const filtered = useMemo(() => {
    return statistik.filter(s => {
      const matchCat = activeFilter === 'All' || s.category === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || (s.summary || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [statistik, activeFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setCurrentPage(1);
  };

  const handleCat = (cat: string) => {
    setActiveFilter(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-6 font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-1">
                Data Explorers
              </h1>
              <p className="text-sm text-slate-500 max-w-xl font-sans">
                A curated collection of interactive data visualizations organized by topic — from health and economics to the environment.
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center border border-slate-300 w-full md:w-72">
              <input
                type="text"
                placeholder="Search a topic..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-white text-slate-900 focus:outline-none placeholder-slate-400 font-sans"
              />
              {localSearch && (
                <button type="button" onClick={() => { setLocalSearch(''); setSearchQuery(''); }} className="px-2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="px-3 py-2.5 bg-[#0d2137] text-white hover:bg-[#1a3a5c] transition-colors">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide font-sans">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCat(cat)}
                className={`shrink-0 text-xs font-semibold px-4 py-1.5 border transition-colors whitespace-nowrap ${
                  activeFilter === cat || (cat === 'All' && activeFilter === '')
                    ? 'bg-[#0d2137] text-white border-[#0d2137]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
        {filtered.length === 0 ? (
          <div className="py-32 text-center text-slate-400">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No datasets match your search.</p>
            <button onClick={() => { setActiveFilter('All'); setSearchQuery(''); setLocalSearch(''); }} className="mt-3 text-sm text-[#0d2137] underline font-bold font-sans">Reset filters</button>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold font-sans">
              {filtered.length} datasets available · Page {currentPage}/{totalPages || 1}
            </p>

            {/* Card grid — OWID Data Explorer style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((item, idx) => (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  onClick={() => onStatClick(item)}
                  className="group cursor-pointer flex flex-col border border-slate-200 hover:border-[#0d2137] transition-colors p-3 bg-white"
                >
                  {/* Chart thumbnail */}
                  <div className="relative w-full aspect-4/3 overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                    <DataThumb item={item} />
                    {/* OWID-style corner badge */}
                    <div className="absolute top-2 right-2 bg-[#0d2137] text-white text-[8px] font-black uppercase px-1.5 py-0.5 tracking-wider font-sans">
                      DATA
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 font-sans">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c0392b] block mb-1 font-sans">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold font-serif text-slate-900 leading-snug group-hover:text-[#c0392b] transition-colors line-clamp-2 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                      {item.summary || item.content?.replace(/<[^>]+>/g, '').slice(0, 100) || 'Explore this dataset →'}
                    </p>
                  </div>

                  <button className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#0d2137] group-hover:underline transition-all font-sans">
                    <ExternalLink size={11} /> Explore dataset
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1 font-sans">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-2 border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-9 h-9 text-sm font-bold border transition-colors ${
                      currentPage === i + 1
                        ? 'bg-[#0d2137] text-white border-[#0d2137]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-2 border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatistikPage;
