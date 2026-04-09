import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '../../types';
import ArticleSidebar from './ArticleSidebar';

interface ArticleListProps {
  articles: Article[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onArticleClick: (article: Article) => void;
}

const stripMarkdown = (text: string) => {
  return text
    .replace(/[#*`_~]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .trim();
};

const ARTICLES_PER_PAGE = 8;

const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  activeFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange, 
  onArticleClick 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchFilter = activeFilter === 'All' || a.category === activeFilter;
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [activeFilter, searchQuery, articles]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleFilterChange = (cat: string) => {
    onFilterChange(cat);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    onSearchChange(query);
    setCurrentPage(1);
  };

  return (
    <section className="pt-32 pb-24 px-6 bg-white dark:bg-[#020617] transition-colors duration-300" id="articles">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter dark:text-white mb-4">
            Insights & <span className="text-primary italic">Analysis</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg md:text-xl leading-relaxed">
            Deep dives into data trends, methodologies, and technical insights from the world of data analytics.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Column */}
          <div className="flex-1 min-h-[600px]">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {paginatedArticles.length > 0 ? (
                  paginatedArticles.map((article, idx) => (
                    <motion.div
                      key={article.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 p-4 md:-mx-4 rounded-xl transition-all cursor-pointer group"
                      onClick={() => onArticleClick(article)}
                    >
                      <div className="w-full md:w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-0 relative">
                        <img 
                          src={article.thumbnail_url} 
                          alt={article.title} 
                          width="256"
                          height="160"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="flex-1 flex flex-col pt-1">
                        <h2 className="text-xl font-bold dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2 md:pr-10">
                          {article.title}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-y-2 mt-3 mb-4">
                           <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                             {article.category}
                           </span>
                           <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-3 border-l border-slate-300 dark:border-slate-700 pl-3">
                             <Calendar size={12} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}
                           </span>
                           <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-3 border-l border-slate-300 dark:border-slate-700 pl-3">
                             <User size={12} className="text-primary" /> {article.author}
                           </span>
                        </div>
                        
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                          {stripMarkdown(article.summary || article.content || '')}
                        </p>

                        <div className="mt-auto">
                          <button 
                            className="inline-flex items-center gap-2 text-xs font-black text-primary hover:gap-3 transition-all group-hover:translate-x-1 uppercase tracking-widest mt-2"
                          >
                            Read Analysis <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">No articles found matching your criteria.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination moved here */}
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
            articles={articles}
            categories={categories}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onArticleClick={onArticleClick}
            onSearch={handleSearch}
            searchValue={searchQuery}
          />
        </div>
      </div>
    </section>
  );
};

export default ArticleList;
