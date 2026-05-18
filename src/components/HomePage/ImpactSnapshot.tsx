import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, Clock } from 'lucide-react';
import { FeaturedProject, Article, Statistic } from '../../types';
import SafeImage from '../Common/SafeImage';
import { useNavigate } from 'react-router-dom';

interface ImpactSnapshotProps {
  projects: FeaturedProject[];
  articles?: Article[];
  statistics?: Statistic[];
}

// Consistent mini thumbnail for embed or image
const MiniThumb: React.FC<{ src?: string; mediaUrl?: string; alt?: string }> = ({ src, mediaUrl, alt }) => {
  const url = mediaUrl || src || '';
  if (!url) return <div className="w-full h-full bg-slate-100 flex items-center justify-center"><BarChart3 size={20} className="text-slate-300" /></div>;

  const flourishId = url.match(/visualisation\/(\d+)/)?.[1];
  const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);
  const isIframe = url.trim().startsWith('<iframe');

  if (!isImage) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none">
          {isIframe ? (
            <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: url }} />
          ) : (
            <iframe src={flourishId ? `https://flo.uri.sh/visualisation/${flourishId}/embed?auto=1` : url} className="w-full h-full border-0" scrolling="no" />
          )}
        </div>
      </div>
    );
  }
  return <SafeImage src={url} alt={alt || ''} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
};

const ImpactSnapshot: React.FC<ImpactSnapshotProps> = ({ articles = [], statistics = [] }) => {
  const navigate = useNavigate();

  // Mix articles and stats, latest first, max 8 items
  const recentArticles = [...articles].slice(0, 4);
  const recentStats = [...statistics].slice(0, 4);

  // Featured = first article or first stat
  const featured = recentArticles[0] || null;
  const featuredMedia = featured ? ((featured as any).media_url || (featured as any).image_url || (featured as any).thumbnail_url) : null;

  // Rest for the grid (2nd–4th articles + first 2 stats)
  const gridItems = [
    ...recentArticles.slice(1, 3).map(a => ({ ...a, _type: 'article' as const })),
    ...recentStats.slice(0, 2).map(s => ({ ...s, _type: 'stat' as const })),
  ].slice(0, 4);

  // Side update items (remaining)
  const sideItems = [
    ...recentArticles.slice(3).map(a => ({ ...a, _type: 'article' as const })),
    ...recentStats.slice(2, 4).map(s => ({ ...s, _type: 'stat' as const })),
  ].slice(0, 3);

  return (
    <>
      {/* Main Editorial Content Grid */}
      <section className="bg-white py-12 border-b border-slate-200" id="experience">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">

            {/* LEFT: Big Featured Article (4 cols) */}
            <div className="lg:col-span-4 lg:pr-8 pb-8 lg:pb-0">
              {featured ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => navigate(`/articles/${(featured as any).slug}`)}
                  className="group cursor-pointer h-full flex flex-col"
                >
                  <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100 mb-4 border border-slate-200">
                    <MiniThumb src={featuredMedia} mediaUrl={featuredMedia} alt={featured.title} />
                    <span className="absolute top-3 left-3 bg-[#c0392b] text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">
                      NEW
                    </span>
                    <span className="absolute top-3 right-3 bg-white text-slate-900 text-[9px] font-bold uppercase px-2 py-0.5 tracking-wide flex items-center gap-1 border border-slate-200">
                      <FileText size={10} /> ARTICLE
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c0392b] mb-1">
                      {(featured as any).category || 'General'} · {Math.ceil(((featured as any).content?.length || 500) / 1000)} MIN READ
                    </span>
                    <h2 className="text-xl font-serif font-bold text-slate-900 leading-snug mb-2 group-hover:text-[#c0392b] transition-colors line-clamp-3">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3 flex-1 font-sans">
                      {(featured as any).summary || (featured as any).intro_text?.replace(/<[^>]+>/g, '') || 'Read full analysis...'}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">
                      {(featured as any).author || 'Admin'}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                  <FileText size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No articles available</p>
                </div>
              )}
            </div>

            {/* MIDDLE: 2x2 grid of recent content (5 cols) */}
            <div className="lg:col-span-5 lg:px-8 py-8 lg:py-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {gridItems.length > 0 ? gridItems.map((item, idx) => {
                  const isArticle = item._type === 'article';
                  const slug = (item as any).slug || (item as any).id;
                  const mediaUrl = (item as any).media_url || (item as any).image_url || (item as any).thumbnail_url;

                  return (
                    <motion.div
                      key={item.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * (idx + 1) }}
                      onClick={() => isArticle ? navigate(`/articles/${slug}`) : navigate(`/data/${slug}`)}
                      className="group cursor-pointer"
                    >
                      <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                        <MiniThumb src={mediaUrl} mediaUrl={mediaUrl} alt={item.title} />
                        <span className={`absolute top-2 left-2 text-white text-[8px] font-black uppercase px-1.5 py-0.5 tracking-widest ${isArticle ? 'bg-[#0d2137]' : 'bg-[#c0392b]'}`}>
                          {isArticle ? 'ARTICLE' : 'DATA'}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#c0392b] block mb-1">
                        {(item as any).category || 'Dataset'} · <Clock size={8} className="inline" /> {Math.ceil(((item as any).content?.length || 400) / 1000)} min
                      </span>
                      <h3 className="text-sm font-bold font-serif text-slate-900 leading-snug group-hover:text-[#c0392b] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </motion.div>
                  );
                }) : (
                  <div className="col-span-2 flex items-center justify-center h-40 text-slate-400">
                    <p className="text-sm">No content found</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Updates sidebar + Tools (3 cols) */}
            <div className="lg:col-span-3 lg:pl-8 pt-8 lg:pt-0 flex flex-col gap-6">
              {/* Updates list */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={12} /> Recent Updates
                </h3>
                <div className="space-y-5">
                  {sideItems.length > 0 ? sideItems.map((item, idx) => {
                    const isArticle = item._type === 'article';
                    const slug = (item as any).slug || (item as any).id;
                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 * idx }}
                        onClick={() => isArticle ? navigate(`/articles/${slug}`) : navigate(`/data/${slug}`)}
                        className="group cursor-pointer border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#c0392b] block mb-1">
                          {isArticle ? 'ARTICLE' : 'DATA'} · {(item as any).category}
                        </span>
                        <h4 className="text-sm font-bold font-serif text-slate-900 leading-snug group-hover:text-[#c0392b] transition-colors line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {(item as any).summary || (item as any).description || 'Read more →'}
                        </p>
                      </motion.div>
                    );
                  }) : (
                    <p className="text-xs text-slate-400">No updates yet.</p>
                  )}
                </div>
              </div>

              {/* Tools & CTA */}
              <div className="bg-[#0d2137] text-white p-5 mt-auto border-t-2 border-[#c0392b]">
                <h4 className="text-sm font-bold font-serif mb-1">Explore Data System</h4>
                <p className="text-xs text-white/75 mb-4">Discover research articles, statistics, and interactive datasets.</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/articles')}
                    className="flex items-center justify-between text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-2 transition-colors border border-white/10"
                  >
                    Browse Articles <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => navigate('/data')}
                    className="flex items-center justify-between text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-2 transition-colors border border-white/10"
                  >
                    Data Explorer <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default ImpactSnapshot;
