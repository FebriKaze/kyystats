import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { Article } from '../../types';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  // Simple reading time estimator (average 200 wpm)
  const wordCount = article?.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  if (!article) return null;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="group w-fit flex items-center gap-2 text-primary font-bold text-sm mb-8 hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={20} /> Back to Articles
        </button>

        <article>
          <div className="flex flex-col gap-6 mb-12">
            <span className="px-4 py-1.5 w-fit rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white leading-[1.1]">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><User size={16} className="text-primary" /> {article.author}</span>
              <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {readingTime} MIN READ</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center gap-2 hover:text-primary transition-colors ml-auto"
              >
                <Share2 size={16} /> SHARE
              </button>
            </div>
          </div>

          <div className="relative h-[300px] md:h-[500px] rounded-4xl overflow-hidden mb-16 shadow-2xl border border-slate-100 dark:border-slate-800">
            <img 
              src={article.thumbnail_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-lg md:text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-12 italic border-l-4 border-primary pl-6">
              {article.summary}
            </div>
            
            <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              {article.content?.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;
