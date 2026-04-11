import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article } from '../../types';
import ArticleSidebar from './ArticleSidebar';
import { useMeta } from '../../hooks/useMeta';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';

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
        alert('Link berhasil disalin!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
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
                onClick={(e) => {
                  e.preventDefault();
                  const authorId = (article as any).user_id;
                  if (authorId) {
                    navigate(`/author/${authorId}`);
                  } else {
                    alert('Profil penulis belum tertaut sepenuhnya.');
                  }
                }}
                className="flex items-center gap-2.5 hover:text-primary transition-all cursor-pointer pr-6 border-r border-slate-100 dark:border-slate-800 group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 shadow-sm group-hover:border-primary/50 transition-all">
                  <SafeImage 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.author)}&background=8b5cf6&color=fff&bold=true`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400">WRITTEN BY</span>
                  <span className="text-slate-900 dark:text-white group-hover:text-primary transition-colors">{article.author}</span>
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
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                      >
                         {['whatsapp', 'facebook', 'telegram', 'linkedin', 'threads'].map((plat) => (
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
          {/* Main Article Content */}
          <div className="flex-1 max-w-4xl">
            <article>
              {/* Centered, much smaller image with full aspect ratio */}
              <div className="w-full md:w-1/2 lg:w-3/5 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-12 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <SafeImage 
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
    </div>
  );
};

export default ArticleDetail;
