import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Statistic, Article } from '../../types';
import ArticleSidebar from '../Articles/ArticleSidebar';
import { useMeta } from '../../hooks/useMeta';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';
import { showToast } from '../Common/Toast';

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
  const [isChartDropdownOpen, setIsChartDropdownOpen] = React.useState(false);

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
        showToast('success', 'Link berhasil disalin!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyEmbedCode = () => {
    if (!item.chart_data) return;
    const embedCode = `<iframe src="${window.location.origin}/embed/chart/${btoa(JSON.stringify({ title: item.chart_data.title, data: item.chart_data.data }))}" width="800" height="400" frameborder="0"></iframe>`;
    
    // Fallback for non-https local dev
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode).then(() => {
        showToast('success', 'Embed tag <iframe> berhasil disalin!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('error', 'Gagal menyalin, pastikan menggunakan HTTPS.');
      });
    } else {
      showToast('error', 'Gagal menyalin, akses clipboard membutuhkan HTTPS.');
    }
  };

  const downloadCSV = () => {
    if (!item.chart_data || !item.chart_data.data) return;
    const csvContent = [
      'Label,Value',
      ...item.chart_data.data.map((d: any) => `"${d.label}",${d.value}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/\\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadChartImage = () => {
    showToast('info', 'Fitur download gambar akan segera diimplementasikan.');
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
          <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <p className="text-lg font-black dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
            </p>
          </div>
        </div>
      );
    }
    return null;
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
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.2] max-w-4xl mt-4">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 py-4 border-b border-slate-100 dark:border-slate-800">
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
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  <User size={16} className="text-slate-500" />
                </div>
                {item.author || 'ADMIN'}
              </button>
              
              <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Calendar size={14} /> 
                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Section - Prominent like GoodStats */}
        {item.chart_data && item.chart_data.data && item.chart_data.data.length > 0 && (
          <div className="mb-12 max-w-4xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {item.chart_data.title || 'Data Statistik'}
            </h3>
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={item.chart_data.data} margin={{ top: 20, right: 0, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis 
                    dataKey="label" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748B' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                     {item.chart_data.data.map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill="#EBDCA8" />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500 font-medium pb-4">Sumber: {(item.chart_data as any)?.sourceText || item.author || 'Data Internal'}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <button 
                  onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                  className="px-6 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                >
                  Unduh 
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <AnimatePresence>
                  {isChartDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsChartDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-40"
                      >
                        <button onClick={() => { downloadCSV(); setIsChartDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg mb-1">
                          Data CSV
                        </button>
                        <button onClick={() => { downloadChartImage(); setIsChartDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                          Gambar (PNG)
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={copyEmbedCode}
                className="px-6 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                Embed Chart
              </button>
              
              <button onClick={() => window.open('https://saweria.co/kyystats', '_blank')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors ml-auto flex items-center gap-2">
                Dukungan
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl flex flex-col gap-8">
            
            {/* Markdown Text Content */}
            <article className="flex-1 mt-6">
              <div className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300 leading-relaxed mb-8 mt-2 italic border-l-4 border-primary pl-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
                {item.summary}
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-8 prose-p:text-[17px] prose-p:mb-6">

                
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

          <div className="lg:w-80 space-y-8">
            {/* Share Sidebar above Search */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 block">Bagikan Ke Publik</span>
              <div className="flex items-center gap-3">
                {['facebook', 'whatsapp', 'twitter', 'linkedin'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => handleShare(plat)}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-transparent border-2 border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-slate-50 hover:border-blue-500 hover:scale-105 transition-all outline-none"
                  >
                    {plat === 'facebook' && <span className="font-bold text-xl">f</span>}
                    {plat === 'whatsapp' && <span className="font-bold text-xl text-green-500">w</span>}
                    {plat === 'twitter' && <span className="font-bold text-xl text-sky-500">X</span>}
                    {plat === 'linkedin' && <span className="font-bold text-xl">in</span>}
                  </button>
                ))}
              </div>
            </div>

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
