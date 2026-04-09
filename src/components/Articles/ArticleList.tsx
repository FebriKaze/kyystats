import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '../../types';

interface ArticleListProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const ARTICLES_PER_PAGE = 6;

const ArticleList: React.FC<ArticleListProps> = ({ articles, onArticleClick }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => activeFilter === 'All' || a.category === activeFilter);
  }, [activeFilter, articles]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleFilterChange = (cat: string) => {
    setActiveFilter(cat);
    setCurrentPage(1);
  };

  return (
    <section className="py-24 px-6 bg-white dark:bg-[#020617] transition-colors duration-300" id="articles">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white">Insights & Analysis</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg">Deep dives into data trends, methodologies, and technical insights.</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Filter Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
                  activeFilter === cat 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            {paginatedArticles.map((article, idx) => (
              <motion.div
                key={article.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-slate-50 dark:bg-slate-900/50 rounded-4xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                <div 
                  className="relative h-56 overflow-hidden cursor-pointer"
                  onClick={() => onArticleClick(article)}
                >
                  <img 
                    src={article.thumbnail_url} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(article.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><User size={12} /> {article.author}</span>
                  </div>
                  
                  <h3 
                    className="text-xl font-black tracking-tight mb-4 dark:text-white group-hover:text-primary transition-colors leading-tight cursor-pointer"
                    onClick={() => onArticleClick(article)}
                  >
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="mt-auto">
                    <button 
                      onClick={() => onArticleClick(article)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all group-hover:translate-x-1"
                    >
                      Read More <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-all ${
                currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ChevronLeft size={18} className="dark:text-white" />
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${
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
              className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-all ${
                currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ChevronRight size={18} className="dark:text-white" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticleList;
