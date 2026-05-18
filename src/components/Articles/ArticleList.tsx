import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Search, ChevronLeft, ChevronRight, Tag, X } from 'lucide-react';
import { Article } from '../../types';
import SafeImage from '../Common/SafeImage';

interface ArticleListProps {
  articles: Article[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onArticleClick: (article: Article) => void;
}

const stripHtml = (text: string) =>
  text?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || '';

const readTime = (content: string) =>
  Math.max(1, Math.ceil(stripHtml(content).split(' ').length / 200));

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Smart thumbnail: supports iframes, flourish, images
const ArticleThumb: React.FC<{ article: Article; className?: string }> = ({ article, className = '' }) => {
  const mediaUrl = (article as any).media_url || article.image_url || (article as any).thumbnail_url || '';
  if (!mediaUrl) return <div className={`bg-slate-100 flex items-center justify-center ${className}`}><Tag size={20} className="text-slate-300" /></div>;

  const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
  const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);
  const isIframe = mediaUrl.trim().startsWith('<iframe');

  if (!isImage) {
    return (
      <div className={`absolute inset-0 w-full h-full overflow-hidden bg-white ${className}`}>
        <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none">
          {isIframe
            ? <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: mediaUrl }} />
            : <iframe src={flourishId ? `https://flo.uri.sh/visualisation/${flourishId}/embed?auto=1` : mediaUrl} className="w-full h-full border-0" scrolling="no" />
          }
        </div>
      </div>
    );
  }

  return <SafeImage src={mediaUrl} alt={article.title} className={`absolute inset-0 w-full h-full object-cover ${className}`} />;
};

const ARTICLES_PER_PAGE = 10;

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onArticleClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    const searchParam = params.get('search');
    if (filterParam) onFilterChange(filterParam);
    if (searchParam) {
      onSearchChange(searchParam);
      setLocalSearch(searchParam);
    }
  }, [window.location.search]);

  const categories = useMemo(() =>
    ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))],
    [articles]
  );

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchCat = activeFilter === 'All' || a.category === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || a.title.toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q) ||
        stripHtml(a.content || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [articles, activeFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filtered.slice(start, start + ARTICLES_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    setCurrentPage(1);
  };

  const handleCatClick = (cat: string) => {
    onFilterChange(cat);
    setCurrentPage(1);
  };

  // Featured = first article
  const featured = paginated[0];
  const rest = paginated.slice(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Page header — editorial style */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-1">
                Latest Articles & Analysis
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} articles available
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-0 border border-slate-300 w-full md:w-72">
              <input
                type="text"
                placeholder="Search articles..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-white text-slate-900 focus:outline-none placeholder-slate-400 font-sans"
              />
              {localSearch && (
                <button type="button" onClick={() => { setLocalSearch(''); onSearchChange(''); }} className="px-2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="px-3 py-2.5 bg-[#0d2137] text-white hover:bg-[#1a3a5c] transition-colors">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Category filter bar */}
          <div className="flex items-center gap-1 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCatClick(cat)}
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="py-32 text-center text-slate-400">
            <p className="text-lg font-medium">No articles match your search.</p>
            <button onClick={() => { onFilterChange('All'); onSearchChange(''); setLocalSearch(''); }} className="mt-4 text-sm text-[#0d2137] underline font-bold">Reset filters</button>
          </div>
        ) : (
          <>
            {/* Featured Article — Full width banner */}
            {featured && currentPage === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => onArticleClick(featured)}
                className="cursor-pointer group mb-10 pb-10 border-b-2 border-slate-900"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                  <div className="lg:col-span-3 relative aspect-16/7 overflow-hidden bg-slate-100 border border-slate-200">
                    <ArticleThumb article={featured} className="group-hover:scale-[1.02] transition-transform duration-700" />
                    <span className="absolute top-4 left-4 bg-[#c0392b] text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">
                      Featured
                    </span>
                  </div>
                  <div className="lg:col-span-2 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c0392b] mb-2">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-snug group-hover:text-[#c0392b] transition-colors mb-3">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 font-sans">
                      {featured.summary || stripHtml(featured.content || '').slice(0, 180)}...
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-sans">
                      <span className="flex items-center gap-1"><User size={11} /> {featured.author || 'Admin'}</span>
                      <span>·</span>
                      <span>{formatDate(featured.created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {readTime(featured.content)} min read</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Feed items */}
            <div className="divide-y divide-slate-200">
              {(currentPage === 1 ? rest : paginated).map((article, idx) => (
                <motion.div
                  key={article.id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  onClick={() => onArticleClick(article)}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-6 py-6 cursor-pointer group hover:bg-slate-50 -mx-2 px-2 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="sm:col-span-1 relative aspect-4/3 overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <ArticleThumb article={article} className="group-hover:scale-[1.03] transition-transform duration-500" />
                  </div>

                  {/* Content */}
                  <div className="sm:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5 font-sans">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#c0392b]">{article.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Clock size={9} /> {readTime(article.content)} min read</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-snug group-hover:text-[#c0392b] transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3 hidden sm:block font-sans">
                      {article.summary || stripHtml(article.content || '').slice(0, 150)}...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
                      <User size={10} /> <span>{article.author || 'Admin'}</span>
                      <span>·</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
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
                {[...Array(totalPages)].map((_, i) => (
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

export default ArticleList;
