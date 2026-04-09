import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { Article } from '../../types';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  const wordCount = article?.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  if (!article) return null;

  return (
    <div className="pt-24 pb-24 min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      {/* Immersive Hero Header */}
      <div className="relative w-full h-[400px] md:h-[550px] overflow-hidden mb-16">
        <div className="absolute inset-0 z-10 bg-linear-to-b from-transparent via-slate-900/40 to-slate-950" />
        <img 
          src={article.thumbnail_url} 
          alt={article.title} 
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-50"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12">
          <div className="max-w-5xl mx-auto px-6 w-full">
            <button 
              onClick={onBack}
              className="group w-fit flex items-center gap-2 text-white/80 font-bold text-sm mb-12 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} /> Back to Articles
            </button>
            
            <div className="flex flex-col gap-6">
              <span className="px-3 py-1 w-fit rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                {article.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.1] max-w-4xl">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-bold text-white/60 uppercase tracking-widest">
                <span className="flex items-center gap-2"><User size={16} className="text-primary" /> {article.author}</span>
                <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {readingTime} MIN READ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <article>
          {/* Small but Full image - Reduced size further per user request */}
          <div className="w-full md:w-1/2 mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-50 dark:border-slate-800 mb-12">
            <img 
              src={article.thumbnail_url} 
              alt="Article Overview" 
              className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-900" 
            />
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-12 italic border-l-4 border-primary pl-6 py-1">
              {article.summary?.replace(/\\n/g, '\n')}
            </div>
            
            <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed text-lg md:text-xl">
              {article.content?.replace(/\\n/g, '\n').split('\n').filter(p => p.trim()).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
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
    </div>
  );
};

export default ArticleDetail;
