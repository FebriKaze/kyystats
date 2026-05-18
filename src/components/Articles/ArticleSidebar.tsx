import React, { useState } from 'react';
import { TrendingUp, Clock, ChevronRight, BarChart3 } from 'lucide-react';
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
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('latest');

  const popularArticles = [...articles]
    .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
    
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const displayArticles = activeTab === 'popular' ? popularArticles : latestArticles;

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
      {/* Topics */}
      <div className="border border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Topics</h3>
        </div>
        <div className="flex flex-col p-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                activeFilter === cat
                  ? 'bg-[#0d2137] text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {cat}
              <ChevronRight size={12} className={activeFilter === cat ? 'text-white/60' : 'text-slate-400'} />
            </button>
          ))}
        </div>
      </div>

      {/* Popular / Latest Tabs */}
      <div className="border border-slate-200 dark:border-slate-800">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('latest')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'latest'
                ? 'bg-[#0d2137] text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Clock size={12} /> Latest
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'popular'
                ? 'bg-[#0d2137] text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp size={12} /> Popular
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="flex gap-3 p-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              {/* Thumb */}
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                {(() => {
                  const mediaUrl = (article as any).media_url || article.thumbnail_url || (article as any).image_url;
                  if (!mediaUrl) {
                    if ((article as any).chart_data?.data) {
                      return (
                        <div className="w-full h-full p-1 flex items-end justify-center">
                          <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={(article as any).chart_data.data.slice(0, 3)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <Bar dataKey="value" radius={[1, 1, 0, 0]} barSize={6}>
                                {(article as any).chart_data.data.slice(0, 3).map((entry: any, i: number) => (
                                  <Cell key={i} fill={entry.color || '#3b82f6'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    }
                    return <BarChart3 className="text-slate-300 dark:text-slate-700 absolute inset-0 m-auto" size={20} />;
                  }

                  const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
                  const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);
                  const isIframe = mediaUrl.trim().startsWith('<iframe');

                  if (!isImage) {
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
                  return <SafeImage src={mediaUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
                })()}
              </div>

              <div className="flex flex-col justify-center gap-0.5 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#c0392b] truncate">
                  {article.category}
                </span>
                <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-white group-hover:text-[#0d2137] dark:group-hover:text-blue-300 transition-colors line-clamp-2">
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
