import React from 'react';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Statistic, Article } from '../../types';
import ArticleSidebar from '../Articles/ArticleSidebar';
import { useMeta } from '../../hooks/useMeta';
import { usePageView } from '../../hooks/usePageView';

interface StatistikDetailProps {
  item: Statistic;
  allStats: Statistic[];
  onBack: () => void;
  onStatClick: (item: Statistic) => void;
  onFilterChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const StatistikDetail: React.FC<StatistikDetailProps> = ({ 
  item, 
  allStats, 
  onBack, 
  onStatClick,
  onFilterChange,
  onSearchChange,
  searchQuery
}) => {
  useMeta({ 
    title: item?.title, 
    description: item?.summary 
  });

  usePageView({
    pageType: 'statistik',
    pageId: item?.id,
    pageTitle: item?.title
  });

  if (!item) return null;

  // Map to Article for sidebar compatibility
  const mappedArticles: Article[] = allStats.map(s => ({
    id: s.id,
    created_at: s.created_at,
    title: s.title,
    slug: s.id,
    summary: s.summary,
    content: s.content,
    category: s.category || 'Statistik',
    thumbnail_url: s.image_url,
    author: s.author || 'Admin',
    is_published: s.is_published
  }));

  const categories = ['All', ...Array.from(new Set(allStats.map(a => a.category).filter(Boolean)))];

  return (
    <div className="pt-20 md:pt-24 pb-16 md:pb-24 min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-12">
          <button 
            onClick={onBack}
            className="group w-fit flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm mb-8 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} /> Kembali ke Statistik
          </button>
          
          <div className="flex flex-col gap-6">
            <span className="px-3 py-1 w-fit rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {item.category}
            </span>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] max-w-5xl">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-y border-slate-100 dark:border-slate-800 py-6">
              <span className="flex items-center gap-2"><User size={14} className="text-primary" /> BY {item.author || 'ADMIN'}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
              <div className="ml-auto">
                <button className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 max-w-4xl">
            <article>
              <div className="w-full md:w-1/2 lg:w-3/5 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-12 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-auto object-contain" 
                />
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg">
                {/* Lead Text Style Requested by User */}
                <div className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300 leading-relaxed mb-12 italic border-l-4 border-primary pl-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
                  {item.summary}
                </div>
                
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.content?.replace(/\\n/g, '\n')}
                </ReactMarkdown>
              </div>
            </article>

            <div className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={onBack}
                className="group flex items-center gap-3 text-primary font-black text-lg hover:translate-x-[-8px] transition-transform"
              >
                <ArrowLeft size={24} /> Eksplorasi Data Lainnya
              </button>
            </div>
          </div>

          <aside className="w-full lg:w-80">
            <ArticleSidebar 
              articles={mappedArticles}
              categories={categories}
              activeFilter={item.category}
              onFilterChange={onFilterChange}
              onArticleClick={(art) => {
                const found = allStats.find(s => s.id === art.id);
                if (found) onStatClick(found);
              }}
              onSearch={onSearchChange}
              searchValue={searchQuery}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StatistikDetail;
