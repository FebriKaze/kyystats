import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Statistic, Article } from '../../types';
import ArticleSidebar from '../Articles/ArticleSidebar';
import { useMeta } from '../../hooks/useMeta';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';

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
  const navigate = useNavigate();

  useMeta({ 
    title: item?.title, 
    description: item?.summary 
  });

  usePageView({
    pageType: 'statistik',
    pageId: item?.id,
    pageTitle: item?.title
  });

  const [isShareMenuOpen, setIsShareMenuOpen] = React.useState(false);

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
    is_published: s.is_published,
    user_id: (s as any).user_id
  }));

  const categories = ['All', ...Array.from(new Set(allStats.map(a => a.category).filter(Boolean)))];

  const shareUrl = window.location.href;
  const shareTitle = item.title;

  const handleShare = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(`${shareTitle}\n\nBaca analisis statistik di:`);
    
    switch (platform) {
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
      case 'whatsapp': url = `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`; break;
      case 'telegram': url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`; break;
      default:
        navigator.clipboard.writeText(shareUrl);
        alert('Link berhasil disalin!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

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
              <button 
                onClick={async () => {
                  const authorId = (item as any).user_id;
                  if (authorId) {
                    navigate(`/author/${authorId}`);
                  } else {
                    const { data } = await supabase.from('profiles').select('id').ilike('full_name', '%kyystats%').limit(1).single();
                    if (data?.id) navigate(`/author/${data.id}`);
                  }
                }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
              >
                <User size={14} className="text-primary" /> BY {item.author || 'ADMIN'}
              </button>
              
              <span className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-6 space-x-2">
                <Calendar size={14} className="text-primary" /> 
                <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
              </span>
              
              <div className="ml-auto relative">
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
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                      >
                        {['whatsapp', 'facebook', 'telegram', 'linkedin'].map((plat) => (
                          <button
                            key={plat}
                            onClick={() => { handleShare(plat); setIsShareMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary rounded-2xl transition-all"
                          >
                            {plat}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 max-w-4xl">
            <article>
              <div className="w-full md:w-1/2 lg:w-3/5 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-12 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <SafeImage 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-auto object-contain" 
                />
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg">
                <div className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300 leading-relaxed mb-12 italic border-l-4 border-primary pl-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
                  {item.summary}
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
                  {item.content}
                </ReactMarkdown>
              </div>
            </article>
          </div>

          <div className="lg:w-80">
            <ArticleSidebar 
              articles={mappedArticles} 
              onArticleClick={(a) => onStatClick(a as any)}
              onFilterChange={onFilterChange}
              onSearch={(q) => onSearchChange(q)}
              searchValue={searchQuery}
              activeFilter="All"
              categories={categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistikDetail;
