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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-20">
        <button onClick={onBack} className="mb-8 flex items-center gap-1.5 text-slate-500 text-sm hover:text-[#0d2137] transition-colors">
          <ArrowLeft size={16} /> Back to Articles
        </button>

        <div className="flex flex-col gap-4 mb-10 border-b-2 border-slate-900 dark:border-white pb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#c0392b]">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-snug max-w-4xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                  <ProfileAvatar 
                    src={(article as any).profiles?.avatar_url} 
                    className="w-7 h-7 rounded-full" 
                    iconSize={14}
                  />
                  <span>{article.author || 'Admin'}</span>
              </div>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              
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

            <div className="relative w-full overflow-hidden bg-slate-50 border border-slate-200 min-h-[400px] md:min-h-[600px]">
              {(() => {
                const mediaUrl = article.media_url || article.image_url || '';
                if (!mediaUrl) return <SafeImage src={heroUrl} alt={article.title} className="w-full h-full object-cover aspect-video" />;

                // 1. Raw Iframe
                if (mediaUrl.trim().startsWith('<iframe')) {
                  return (
                    <div 
                      className="w-full [&>iframe]:w-full [&>iframe]:h-[600px] [&>iframe]:border-0 [&>iframe]:block" 
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
                    <div className="relative w-full" style={{ height: '600px' }}>
                      <iframe 
                        src={`https://flo.uri.sh/visualisation/${flourishId}/embed?auto=1`} 
                        className="absolute inset-0 w-full h-full border-0" 
                        scrolling="no"
                        allowFullScreen
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

                // 5. Default Iframe for other URLs
                if (mediaUrl.startsWith('http')) {
                  return (
                    <div className="relative w-full" style={{ height: '600px' }}>
                      <iframe 
                        src={mediaUrl} 
                        className="absolute inset-0 w-full h-full border-0"
                        loading="lazy"
                        allow="web-share; clipboard-write"
                        allowFullScreen
                      />
                    </div>
                  );
                }

                return <SafeImage src={heroUrl} alt={article.title} className="w-full h-full object-cover aspect-video" />;
              })()}
            </div>

            <article 
              className="prose prose-slate prose-sm md:prose-base max-w-none prose-headings:font-bold prose-headings:font-serif prose-a:text-[#0d2137] prose-img:rounded-none prose-pre:bg-slate-900 selection:bg-[#0d2137]/10 mt-10"
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
