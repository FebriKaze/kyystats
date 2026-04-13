import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, Link as LinkIcon } from 'lucide-react';
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
import { Heart, Download as DownloadIcon, Info, MessageCircle, DollarSign, X as CloseIcon } from 'lucide-react';

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
  
  useMeta({ 
    title: article?.title, 
    description: article?.summary 
  });

  usePageView({
    pageType: 'article',
    pageId: article?.id,
    pageTitle: article?.title
  });

  const [isShareMenuOpen, setIsShareMenuOpen] = React.useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = React.useState(false);

  if (!article) return null;

  const wordCount = article?.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  const handleShare = (platform: string) => {
    let url = '';
    const shareText = `${shareTitle}\n\nBaca artikel selengkapnya di: ${shareUrl}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    switch (platform) {
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
      case 'whatsapp': url = `https://wa.me/?text=${encodedText}`; break;
      case 'telegram': url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`; break;
      case 'threads': url = `https://www.threads.net/intent/post?text=${encodedText}`; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`; break;
      default:
        navigator.clipboard.writeText(shareUrl);
        showToast('success', 'Link berhasil disalin!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  const downloadArticleImage = () => {
    if (!article.thumbnail_url) return;
    const downloadLink = document.createElement('a');
    downloadLink.download = `${article.title.replace(/\s+/g, '_')}.png`;
    downloadLink.href = article.thumbnail_url;
    downloadLink.click();
    showToast('success', 'Gambar sampul berhasil diunduh!');
  };

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
              <div 
                onClick={async (e) => {
                  e.preventDefault();
                  const authorId = (article as any).user_id;
                  
                  if (authorId) {
                    navigate(`/author/${authorId}`);
                  } else {
                    // Fallback: Cari ID owner berdasarkan profil KYYSTATS
                    const { data } = await supabase.from('profiles').select('id').ilike('full_name', '%kyystats%').limit(1).single();
                    if (data?.id) {
                      navigate(`/author/${data.id}`);
                    } else {
                      showToast('info', 'Profil penulis sedang diperbarui.');
                    }
                  }
                }}
                className="flex items-center gap-2 hover:text-primary transition-all cursor-pointer pr-6 border-r border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <ProfileAvatar 
                    src={(article as any).profiles?.avatar_url} 
                    className="w-8 h-8 rounded-full border-2 border-primary/20" 
                    iconSize={16}
                  />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400">WRITTEN BY</span>
                    <span className="text-slate-900 dark:text-white group-hover:text-primary transition-colors">{article.author}</span>
                  </div>
                </div>
              </div>

              <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(article.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-6"><Clock size={14} className="text-primary" /> {readingTime} MIN READ</span>
              
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
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-4xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 overflow-hidden"
                      >
                         <div className="grid grid-cols-4 gap-2">
                           {[
                             { id: 'whatsapp', icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.877 9.888-9.877 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.446-4.435 9.875-9.889 9.875m8.415-18.303A11.826 11.826 0 0012.055 0C5.41 0 .01 5.403.007 12.05a11.842 11.842 0 001.576 6.001L0 24l6.109-1.604a11.815 11.815 0 005.94 1.586h.005c6.644 0 12.045-5.404 12.048-12.05a11.8 11.8 0 00-3.526-8.528z" fill="currentColor"/>, color: 'text-green-500' },
                             { id: 'facebook', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>, color: 'text-blue-600' },
                             { id: 'twitter', icon: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" fill="currentColor"/>, color: 'text-slate-900 dark:text-white' },
                             { id: 'linkedin', icon: <path d="M20.447 20.452h-3.554V14.85c0-1.334-.027-3.05-1.858-3.858-1.861 0-2.147 1.453-2.147 2.257v6.695h-3.558V8.975h3.413v1.566h.049c.475-.9 1.636-1.85 3.367-1.85 3.601 0 4.267 2.37 4.267 5.455v6.306zM5.337 7.433c-1.144 0-2.066-.926-2.066-2.065 0-1.142.922-2.067 2.066-2.067 1.141 0 2.065.925 2.065 2.067 0 1.139-.924 2.065-2.065 2.065zM7.119 20.452H3.555V8.975h3.564v11.477z" fill="currentColor"/>, color: 'text-blue-700' },
                             { id: 'copy', icon: <LinkIcon size={20} />, color: 'text-slate-500' }
                           ].map((plat) => (
                             <button
                               key={plat.id}
                               onClick={() => { handleShare(plat.id); setIsShareMenuOpen(false); }}
                               className={`w-full aspect-square flex items-center justify-center rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 ${plat.color} transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700`}
                               title={plat.id === 'copy' ? 'Salin Link' : plat.id}
                             >
                               {plat.id === 'copy' ? (
                                 plat.icon
                               ) : (
                                 <svg viewBox="0 0 24 24" className="w-5 h-5">{plat.icon}</svg>
                               )}
                             </button>
                           ))}
                         </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Article Content */}
          <div className="flex-1 max-w-4xl">
            <article>
              {/* Centered, much smaller image with full aspect ratio */}
              <div className="w-full md:w-1/2 lg:w-3/5 mx-auto mb-12">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                  <SafeImage 
                    src={article.thumbnail_url} 
                    alt={article.title} 
                    className="w-full h-auto object-contain" 
                  />
                </div>
                
                {/* Image Actions Like Statistik */}
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={downloadArticleImage}
                    className="px-6 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <DownloadIcon size={16} /> Unduh Sampul
                  </button>
                  
                  <button 
                    onClick={() => setIsDonationModalOpen(true)}
                    className="px-6 py-2.5 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-100 dark:border-rose-500/20 rounded-xl text-sm font-black text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Heart size={16} fill="currentColor" /> Support
                  </button>
                </div>
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
                        <SafeImage {...props} className="w-full h-auto rounded-3xl" />
                      </span>
                    ),
                    h2: ({node, ...props}) => <h2 {...props} className="text-2xl md:text-3xl font-black mt-16 mb-8 text-slate-900 dark:text-white" />,
                    p: ({node, ...props}) => <p {...props} className="mb-6 last:mb-0" />
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>

              {/* Tags Section */}
              <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Tag size={14} /> Filed under:</span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-800">
                      {article.category}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <ArticleSidebar 
              articles={articles} 
              onArticleClick={onArticleClick}
              onFilterChange={onFilterChange}
              onSearch={onSearchChange}
              searchValue={searchQuery}
              activeFilter="All"
              categories={['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))]}
            />
          </div>
        </div>
      </div>

      {/* Donation Modal Like Statistik */}
      <AnimatePresence>
        {isDonationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDonationModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white dark:border-slate-800"
            >
              <div className="p-8 pb-0 flex justify-end">
                <button onClick={() => setIsDonationModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <CloseIcon size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="px-10 pb-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-6 text-rose-500 animate-bounce">
                  <Heart size={40} fill="currentColor" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Dukung <span className="text-primary italic">KyyStats</span></h3>
                <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed text-sm font-medium">Bantu kami untuk terus menyajikan data statistik berkualitas yang independen dan mudah dipahami.</p>
                
                <div className="grid grid-cols-1 w-full gap-4 mt-8">
                  <button 
                    onClick={() => window.open('https://saweria.co/kyystats', '_blank')}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <DollarSign size={18} /> Donasi via Saweria
                  </button>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 w-full">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dukungan Anda Berarti</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">Setiap dukungan akan digunakan untuk biaya server dan riset data.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArticleDetail;
