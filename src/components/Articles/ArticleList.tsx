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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="wait">
                {paginatedArticles.length > 0 ? (
                  paginatedArticles.map((article, idx) => (
                    <motion.div
                      key={article.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-slate-50 dark:bg-slate-900/50 rounded-4xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                    >
                      <div 
                        className="relative h-44 overflow-hidden cursor-pointer"
                        onClick={() => onArticleClick(article)}
                      >
                        <img 
                          src={article.thumbnail_url} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded text-[8px] font-black uppercase tracking-wider text-primary shadow-sm border border-slate-100 dark:border-slate-800">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-3 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Calendar size={10} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><User size={10} className="text-primary" /> {article.author}</span>
                        </div>
                        
                        <h3 
                          className="text-lg font-black tracking-tight mb-3 dark:text-white group-hover:text-primary transition-colors leading-tight cursor-pointer line-clamp-2"
                          onClick={() => onArticleClick(article)}
                        >
                          {article.title}
                        </h3>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-2">
                          {article.summary}
                        </p>

                        <div className="mt-auto">
                          <button 
                            onClick={() => onArticleClick(article)}
                            className="inline-flex items-center gap-2 text-sm font-black text-primary hover:gap-3 transition-all group-hover:translate-x-1"
                          >
                            READ ANALYSIS <ArrowRight size={16} />
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
