import React, { useState } from 'react';
import { Search, TrendingUp, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import { Article } from '../../types';
import SafeImage from '../Common/SafeImage';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

interface ArticleSidebarProps {
  articles: Article[];
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  onArticleClick: (article: Article) => void;
  onSearch: (query: string) => void;
  searchValue: string;
}

const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  articles,
  categories,
  activeFilter,
  onFilterChange,
  onArticleClick,
  onSearch,
  searchValue
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular');

  const popularArticles = [...articles]
    .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);
    
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const displayArticles = activeTab === 'popular' ? popularArticles : latestArticles;

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-8">
      {/* Search Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
        </div>
      </div>

      {/* Topics / Categories */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-black tracking-tight mb-6 dark:text-white flex items-center gap-2">
          Topics
        </h3>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                activeFilter === cat
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/50'
              }`}
            >
              {cat}
              <ChevronRight size={14} className={activeFilter === cat ? 'text-white' : 'text-slate-400'} />
            </button>
          ))}
        </div>
      </div>

      {/* Popular / Latest Tabs */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'popular'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <TrendingUp size={14} /> Popular
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'latest'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <Clock size={14} /> Latest
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="flex gap-4 group cursor-pointer"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                {article.thumbnail_url ? (
                  <SafeImage
                    src={article.thumbnail_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (article as any).chart_data && (article as any).chart_data.data ? (
                  <div className="w-full h-full p-2 opacity-80 flex items-end justify-center group-hover:scale-110 transition-transform duration-500">
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={(article as any).chart_data.data.slice(0, 3)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={8}>
                          {(article as any).chart_data.data.slice(0, 3).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <BarChart3 className="text-slate-300 dark:text-slate-700" size={24} />
                )}
              </div>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {article.category}
                </span>
                <h4 className="text-sm font-bold leading-snug dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ArticleSidebar;
