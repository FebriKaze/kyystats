import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Link as LinkIcon, 
  MessageCircle, Linkedin 
} from 'lucide-react';
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

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast('success', 'Link berhasil disalin!');
  };

  const socialShares = [
    { icon: <Facebook size={18} />, color: 'hover:bg-[#1877F2]', link: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { icon: <Twitter size={18} />, color: 'hover:bg-[#1DA1F2]', link: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}` },
    { icon: <MessageCircle size={18} />, color: 'hover:bg-[#25D366]', link: `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}` },
    { icon: <Linkedin size={18} />, color: 'hover:bg-[#0077B5]', link: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
  ];

  // Logic: media_url first (Embed), fallback to thumbnail_url (Sampul)
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
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <ProfileAvatar src={(article as any).profiles?.avatar_url} alt={article.author || 'Admin'} className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-lg" />
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Penulis Konten</span>
                    <h4 className="text-sm md:text-base font-black dark:text-white mt-0.5">{article.author || 'Tim KyyStats'}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 hidden sm:block">BAGIKAN:</span>
                  {socialShares.map((social, i) => (
                    <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-white transition-all ${social.color} shadow-sm`}>
                      {social.icon}
                    </a>
                  ))}
                  <button onClick={handleCopyLink} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm">
                    <LinkIcon size={18} />
                  </button>
                </div>
              </div>
            </header>

            <div className="relative w-full rounded-3xl md:rounded-4xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 shadow-2xl border border-slate-100 dark:border-slate-800">
              {flourishId ? (
                <div className="relative w-full min-h-[500px] md:min-h-[650px]">
                  <iframe src={`https://public.flourish.studio/visualisation/${flourishId}/embed?auto=1`} className="w-full h-full border-0 absolute inset-0 rounded-3xl" scrolling="no" />
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
