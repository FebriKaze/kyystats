import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  
  useMeta({ title: article.title, description: article.summary });
  usePageView({ pageType: 'articles', pageId: article.id || article.slug, pageTitle: article.title });

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  const handleShare = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(`${shareTitle}\n\nBaca artikel selengkapnya di:`);
    
    switch (platform) {
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
      case 'whatsapp': url = `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`; break;
      default:
        navigator.clipboard.writeText(shareUrl);
        showToast('success', 'Link berhasil disalin!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  const heroUrl = (article as any).media_url || article.thumbnail_url;
  const flourishId = heroUrl?.match(/visualisation\/(\d+)/)?.[1];
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(heroUrl || '');

  const categories = ['All', ...new Set(articles.map(a => a.category))];

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-20">
        <button onClick={onBack} className="group mb-8 flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-primary transition-colors">
          <ArrowLeft size={18} /> Kembali ke Arsip
        </button>

        <div className="flex flex-col gap-6 mb-12">
            <span className="px-3 py-1 w-fit rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.2] max-w-4xl mt-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-y border-slate-100 dark:border-slate-800 py-6">
              <div 
                className="flex items-center gap-2 pr-6 border-r border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <ProfileAvatar 
                    src={(article as any).profiles?.avatar_url} 
                    className="w-8 h-8 rounded-full border-2 border-primary/20" 
                    iconSize={16}
                  />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400">WRITTEN BY</span>
                    <span className="text-slate-900 dark:text-white transition-colors">{article.author || 'ADMIN'}</span>
                  </div>
                </div>
              </div>

              <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}</span>
              
              <div className="ml-auto flex items-center gap-4 relative border-l border-slate-100 dark:border-slate-800 pl-6">
                <button 
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary transition-colors flex items-center gap-2 px-5 border border-transparent hover:border-primary/20 shadow-sm"
                >
                  <Share2 size={16} />
                  <span className="hidden md:inline font-black tracking-widest text-[10px]">BAGIKAN</span>
                </button>

                <AnimatePresence>
                  {isShareMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsShareMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 overflow-hidden"
                      >
                         <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => { handleShare('whatsapp'); setIsShareMenuOpen(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[#25D366] transition-all flex items-center justify-center border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <MessageCircle size={20} />
                            </button>
                            <button onClick={() => { handleShare('facebook'); setIsShareMenuOpen(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[#1877F2] transition-all flex items-center justify-center border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <Facebook size={20} />
                            </button>
                            <button onClick={() => { handleShare('twitter'); setIsShareMenuOpen(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-900 dark:text-white transition-all flex items-center justify-center border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <Twitter size={20} />
                            </button>
                            <button onClick={() => { handleShare('linkedin'); setIsShareMenuOpen(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[#0077B5] transition-all flex items-center justify-center border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <Linkedin size={20} />
                            </button>
                            <button onClick={() => { handleShare('copy'); setIsShareMenuOpen(false); }} className="col-span-4 mt-2 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-2">
                                <LinkIcon size={14} /> SALIN LINK ARTIKEL
                            </button>
                         </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {article.intro_text && (
              <div 
                className="prose prose-slate dark:prose-invert max-w-none pt-2 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8"
                dangerouslySetInnerHTML={{ __html: article.intro_text }}
              />
            )}

            <div className="relative w-full rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 shadow-2xl border border-slate-100 dark:border-slate-800 min-h-[550px] md:min-h-[700px]">
              {(() => {
                const mediaUrl = article.media_url || article.image_url || '';
                if (!mediaUrl) return <SafeImage src={heroUrl} alt={article.title} className="w-full h-full object-cover aspect-video" />;

                // 1. Raw Iframe
                if (mediaUrl.trim().startsWith('<iframe')) {
                  return (
                    <div 
                      className="w-full h-full absolute inset-0 flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full" 
                      dangerouslySetInnerHTML={{ __html: mediaUrl }} 
                    />
                  );
                }

                const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
                const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl);
                const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);

                // 2. Flourish
                if (flourishId) {
                  return (
                    <div className="relative w-full h-full min-h-[500px] md:min-h-[650px]">
                      <iframe 
                        src={`https://public.flourish.studio/visualisation/${flourishId}/embed?auto=1`} 
                        className="w-full h-full border-0 absolute inset-0" 
                        scrolling="no" 
                      />
                    </div>
                  );
                } 
                // 3. Video
                if (isVideo) {
                  return <video src={mediaUrl} className="w-full h-auto block" autoPlay muted loop playsInline controls />;
                }
                
                // 4. If it's an Image (But not an iframe string)
                if (isImage) {
                  return <SafeImage src={mediaUrl} alt={article.title} className="w-full h-full object-cover aspect-video" />;
                }

                // 5. Default Iframe for other URLs (Our World In Data, etc)
                if (mediaUrl.startsWith('http')) {
                  return (
                    <iframe 
                      src={mediaUrl} 
                      className="w-full h-full border-0 absolute inset-0" 
                      loading="lazy"
                      allow="web-share; clipboard-write"
                    />
                  );
                }

                return <SafeImage src={heroUrl} alt={article.title} className="w-full h-full object-cover aspect-video" />;
              })()}
            </div>

            <article 
              className="prose prose-slate dark:prose-invert prose-sm md:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-3xl prose-pre:bg-slate-900 prose-pre:rounded-2xl selection:bg-primary/20 mt-12"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          <aside className="lg:col-span-4">
            <ArticleSidebar 
              articles={articles}
              categories={categories}
              activeFilter="All"
              onFilterChange={onFilterChange}
              onArticleClick={onArticleClick}
              onSearch={onSearchChange}
              searchValue={searchQuery}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
