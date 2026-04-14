import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Statistic, Article } from '../../types';
import ArticleSidebar from '../Articles/ArticleSidebar';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';

interface StatistikPageProps {
  statistik: Statistic[];
  onStatClick: (item: Statistic) => void;
}

const stripMarkdown = (text: string) => {
  return text
    .replace(/[#*`_~]/g, '') // Remove simple markdown chars
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // Remove links but keep text
    .trim();
};

const STATISTIK_PER_PAGE = 8;

const StatistikPage: React.FC<StatistikPageProps> = ({ statistik, onStatClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  usePageView({
    pageType: 'statistik-list',
    pageTitle: 'Daftar Statistik Utama'
  });

  // Map Statistic to Article format purely for UI compatibility with ArticleSidebar
  const mappedToArticleFormat: Article[] = useMemo(() => {
    return statistik.map(s => ({
      id: s.id,
      created_at: s.created_at,
      title: s.title,
      slug: s.id,
      summary: stripMarkdown(s.summary || s.content).substring(0, 150) + '...',
      content: s.content,
      category: s.category || 'Statistik',
      thumbnail_url: s.image_url,
      author: s.author || 'Admin',
      is_published: s.is_published,
      views: (s as any).views,
      chart_data: s.chart_data
    } as any));
  }, [statistik]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(statistik.map(a => a.category).filter(Boolean)))];
  }, [statistik]);

  const filteredStats = useMemo(() => {
    return statistik.filter(a => {
      const matchFilter = activeFilter === 'All' || a.category === activeFilter;
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [activeFilter, searchQuery, statistik]);

  const totalPages = Math.ceil(filteredStats.length / STATISTIK_PER_PAGE);
  const paginatedStats = useMemo(() => {
    const startIndex = (currentPage - 1) * STATISTIK_PER_PAGE;
    return filteredStats.slice(startIndex, startIndex + STATISTIK_PER_PAGE);
  }, [filteredStats, currentPage]);

  const handleArticleClick = (item: Article) => {
    const found = statistik.find(s => s.id === item.id);
    if (found) onStatClick(found);
  };

  const handleFilterChange = (cat: string) => {
    setActiveFilter(cat);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-6 bg-white dark:bg-[#020617] transition-colors duration-300" id="statistik">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter dark:text-white mb-4">
            Data <span className="text-primary italic">Statistik</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg md:text-xl leading-relaxed">
            Daftar rincian data statistik terbaru yang diolah secara mendalam untuk kebutuhan analisis Anda.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Column */}
          <div className="flex-1 min-h-[600px]">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {paginatedStats.length > 0 ? (
                  paginatedStats.map((item, idx) => {
                    const flourishId = (item as any).media_url?.match(/visualisation\/(\d+)/)?.[1];
                    
                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => onStatClick(item)}
                        className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 p-4 -mx-4 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="w-full md:w-64 h-40 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex flex-col p-0 relative justify-end shadow-inner">
                          {flourishId ? (
                             <div className="absolute inset-0 w-full h-full overflow-hidden">
                               <div className="absolute top-0 left-0 w-[1000px] h-[625px] origin-top-left scale-[0.256] pointer-events-none">
                                 <iframe 
                                   src={`https://public.flourish.studio/visualisation/${flourishId}/embed?auto=1`} 
                                   className="w-full h-full border-0" 
                                   scrolling="no" 
                                 />
                               </div>
                             </div>
                          ) : item.image_url ? (
                            <SafeImage 
                              src={item.image_url} 
                              alt={item.title} 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : item.chart_data && item.chart_data.data && item.chart_data.data.length > 0 ? (
                            <>
                              <div className="w-full h-32 mt-auto opacity-70 group-hover:opacity-100 transition-opacity p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={item.chart_data.data.slice(0, 5)} margin={{ top: 15, right: 0, left: -25, bottom: -15 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={16}>
                                      <LabelList dataKey="value" position="top" fill="#64748b" fontSize={9} />
                                      {item.chart_data.data.slice(0, 5).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="absolute inset-0 bg-linear-to-t from-white/10 dark:from-slate-900/10 to-transparent pointer-events-none" />
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                              <BarChart3 size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col pt-1">
                          <h2 className="text-xl font-bold dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2 md:pr-10">
                            {item.title}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-y-2 mt-3 mb-4">
                             <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                               <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                               {item.category}
                             </span>
                             <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-3 border-l border-slate-300 dark:border-slate-700 pl-3">
                               <Calendar size={12} className="text-primary" /> {new Date(item.created_at).toLocaleDateString('id-ID')}
                             </span>
                              <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const authorId = (item as any).user_id;
                                 if (authorId) window.location.href = `/author/${authorId}`;
                               }}
                               className="flex items-center gap-1.5 text-xs text-slate-500 font-bold ml-3 border-l border-slate-300 dark:border-slate-700 pl-3 hover:text-primary transition-colors cursor-pointer"
                             >
                               <User size={12} className="text-primary" /> {item.author}
                             </button>
                          </div>
                          
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                            {stripMarkdown(item.summary || item.content || '')}
                          </p>
  
                          <div className="mt-auto">
                            <button 
                              className="inline-flex items-center gap-2 text-xs font-black text-primary hover:gap-3 transition-all group-hover:translate-x-1 uppercase tracking-widest mt-2"
                            >
                              Lihat Detail <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Tidak ada data statistik yang ditemukan.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center lg:justify-start gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={`p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all ${
                    currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50'
                  }`}
                >
                  <ChevronLeft size={18} className="dark:text-white" />
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                        currentPage === i + 1
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-primary/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={`p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all ${
                    currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50'
                  }`}
                >
                  <ChevronRight size={18} className="dark:text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <ArticleSidebar 
            articles={mappedToArticleFormat}
            categories={categories}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onArticleClick={handleArticleClick}
            onSearch={handleSearch}
            searchValue={searchQuery}
          />
        </div>
      </div>
    </section>
  );
};

export default StatistikPage;
