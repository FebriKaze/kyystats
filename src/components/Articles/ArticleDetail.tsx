import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, Link as LinkIcon, Heart, Download as DownloadIcon, Info, MessageCircle, DollarSign, X as CloseIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article } from '../../types';
import ArticleSidebar from './ArticleSidebar';
import { useMeta } from '../../hooks/useMeta';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';
import { showToast } from '../Common/Toast';
import ProfileAvatar from '../Common/ProfileAvatar';

interface ArticleDetailProps {
  article: Article;
  articles: Article[];
  onBack: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, articles, onBack }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  useMeta({ title: article.title, description: article.summary });
  usePageView({ pageType: 'articles', pageId: article.id || article.slug, pageTitle: article.title });

  const heroUrl = (article as any).media_url || article.thumbnail_url;
  const flourishId = heroUrl?.match(/visualisation\/(\d+)/)?.[1];
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(heroUrl || '');

  // Get unique categories for sidebar
  const categories = ['All', ...new Set(articles.map(a => a.category))];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-20">
        <button onClick={onBack} className="group mb-8 md:mb-12 flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-all font-black text-[10px] md:text-xs tracking-[0.2em] uppercase">
          <div className="p-2 md:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all"><ArrowLeft size={16} /></div> KEMBALI KE ARSIP
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <header className="space-y-6 md:space-y-8">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className="px-4 md:px-6 py-2 md:py-2.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl text-[10px] md:text-xs font-black tracking-widest uppercase">{article.category}</span>
                <div className="h-6 md:h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <time className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest"><Calendar size={14} /> {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tightest leading-[1.1] dark:text-white">{article.title}</h1>
              
              <div className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 md:gap-4">
                  <ProfileAvatar src={(article as any).profiles?.avatar_url} alt={article.author || 'Admin'} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-[10px] md:text-xs font-black dark:text-white uppercase tracking-widest">DITULIS OLEH</p>
                    <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">{article.author || 'Tim KyyStats'}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="relative w-full rounded-3xl md:rounded-4xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 shadow-2xl border border-slate-100 dark:border-slate-800">
              {flourishId ? (
                <div className="relative w-full min-h-[500px] md:min-h-[650px]">
                  <iframe src={`https://public.flourish.studio/visualisation/${flourishId}/embed?auto=1`} className="w-full h-full border-0 absolute inset-0" scrolling="no" />
                </div>
              ) : isVideo ? (
                <video src={heroUrl} className="w-full h-auto block" autoPlay muted loop playsInline />
              ) : (
                <SafeImage src={heroUrl} alt={article.title} className="w-full h-full object-cover aspect-video" />
              )}
            </div>

            <article className="prose prose-slate dark:prose-invert prose-sm md:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-3xl prose-pre:bg-slate-900 prose-pre:rounded-2xl selection:bg-primary/20">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            </article>
          </div>

          <aside className="lg:col-span-4">
            <ArticleSidebar 
              articles={articles}
              categories={categories}
              activeFilter="All"
              onFilterChange={() => {}}
              onArticleClick={(a) => navigate(`/articles/${a.slug}`)}
              onSearch={(q) => setSearchTerm(q)}
              searchValue={searchTerm}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
