import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article } from '../../types';
import ArticleSidebar from './ArticleSidebar';
import { useMeta } from '../../hooks/useMeta';
import { usePageView } from '../../hooks/usePageView';

interface ArticleDetailProps {
  article: Article;
  articles: Article[];
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  onFilterChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ 
  article, 
  articles, 
  onBack, 
  onArticleClick,
  onFilterChange,
  onSearchChange,
  searchQuery
}) => {
  useMeta({ 
    title: article?.title, 
    description: article?.summary 
  });

  usePageView({
    pageType: 'article',
    pageId: article?.id,
    pageTitle: article?.title
  });

  const wordCount = article?.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  if (!article) return null;

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  return (
    <div className="pt-20 md:pt-24 pb-16 md:pb-24 min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-12">
          <button 
            onClick={onBack}
            className="group w-fit flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm mb-8 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} /> Back to Analysis
          </button>
          
          <div className="flex flex-col gap-6">
            <span className="px-3 py-1 w-fit rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] max-w-5xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-y border-slate-100 dark:border-slate-800 py-6">
              <span className="flex items-center gap-2"><User size={14} className="text-primary" /> BY {article.author}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><Clock size={14} className="text-primary" /> {readingTime} MIN READ</span>
              
              <div className="ml-auto flex items-center gap-4">
                <button className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Article Content */}
          <div className="flex-1 max-w-4xl">
            <article>
              {/* Centered, much smaller image with full aspect ratio */}
              <div className="w-full md:w-1/2 lg:w-3/5 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-12 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <img 
                  src={article.thumbnail_url} 
                  alt={article.title} 
                  className="w-full h-auto object-contain" 
                />
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-img:rounded-3xl prose-img:shadow-xl prose-img:border prose-img:border-slate-100 dark:prose-img:border-slate-800">
                <div className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300 leading-relaxed mb-12 italic border-l-4 border-primary pl-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
                  {article.summary}
                </div>
                
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({node, ...props}) => (
                      <span className="block my-12">
                        <img {...props} className="w-full h-auto rounded-3xl" />
                        {props.title && <span className="block text-center text-sm text-slate-400 mt-4 font-medium">{props.title}</span>}
                      </span>
                    ),
                    h2: ({node, ...props}) => <h2 {...props} className="text-3xl font-black mt-16 mb-8 text-slate-900 dark:text-white" />,
                    p: ({node, ...props}) => <p {...props} className="mb-6 last:mb-0" />
                  }}
                >
                  {article.content?.replace(/\\n/g, '\n')}
                </ReactMarkdown>
              </div>

              {/* Tags/Footer */}
              <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">
                  <Tag size={12} className="text-primary" /> Filed Under:
                </span>
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  {article.category}
                </span>
              </div>
            </article>

            <div className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={onBack}
                className="group flex items-center gap-3 text-primary font-black text-lg hover:translate-x-[-8px] transition-transform"
              >
                <ArrowLeft size={24} /> Explore More Analysis
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <ArticleSidebar 
            articles={articles}
            categories={categories}
            activeFilter={article.category} 
            onFilterChange={onFilterChange}
            onArticleClick={onArticleClick}
            onSearch={onSearchChange}
            searchValue={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
