import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, FileText, Briefcase, LineChart as ChartIcon, ExternalLink, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { fetchWeeklyPageViews, fetchPageViewCount } from '../../services/portfolioService';

interface AdminHomeProps {
  stats: {
    articles: number;
    portfolio: number;
    featured: number;
  };
  popularArticles?: any[];
}

const AdminHome: React.FC<AdminHomeProps> = ({ stats, popularArticles = [] }) => {
  const [trends, setTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [articleViewData, setArticleViewData] = useState<{ name: string; views: number }[]>([]);
  const [statViewData, setStatViewData] = useState<{ name: string; views: number }[]>([]);
  const [itemViews, setItemViews] = useState<Record<string, number>>({});
  const [loadingViews, setLoadingViews] = useState(true);

  // Fetch real pageview data from Supabase
  useEffect(() => {
    const loadPageViews = async () => {
      try {
        const [articleData, statData] = await Promise.all([
          fetchWeeklyPageViews('article'),
          fetchWeeklyPageViews('statistik')
        ]);
        setArticleViewData(articleData);
        setStatViewData(statData);

        // Fetch individual view counts for table
        const viewCounts: Record<string, number> = {};
        for (const item of popularArticles) {
          const type = item.thumbnail_url ? 'article' : 'statistik';
          const count = await fetchPageViewCount(type, item.id);
          viewCounts[item.id] = count;
        }
        setItemViews(viewCounts);
      } catch (e) {
        console.warn('Failed to load pageview data:', e);
      } finally {
        setLoadingViews(false);
      }
    };
    loadPageViews();
  }, [popularArticles]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const rssUrl = encodeURIComponent('https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();
        if (data.status === 'ok') {
           const formatted = data.items.slice(0, 6).map((item: any) => ({
             keyword: item.title,
             time: 'Hari Ini',
             link: item.link
           }));
           setTrends(formatted);
        } else {
           throw new Error('Gagal fetch');
        }
      } catch (e) {
        setTrends([
           { keyword: 'indonesia vs jepang', time: '1 jam lalu', link: '#' },
           { keyword: 'harga emas hari ini', time: '2 jam lalu', link: '#' },
           { keyword: 'gempa terkini', time: '3 jam lalu', link: '#' },
           { keyword: 'berita politik', time: '4 jam lalu', link: '#' },
           { keyword: 'cuaca besok', time: '5 jam lalu', link: '#' }
        ]);
      } finally {
        setLoadingTrends(false);
      }
    };
    fetchTrends();
  }, []);

  // Calculate total weekly views
  const totalArticleViews = articleViewData.reduce((sum, d) => sum + d.views, 0);
  const totalStatViews = statViewData.reduce((sum, d) => sum + d.views, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white">Beranda</h1>
          <p className="text-slate-500 dark:text-slate-400">Halaman Ikhtisar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                <FileText size={120} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">Total Artikel</p>
              <h2 className="text-6xl font-black mt-2">{stats.articles}</h2>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                 <div>
                  <p className="text-xs font-bold opacity-60">Total view minggu ini</p>
                  <p className="text-xl font-black mt-1">{totalArticleViews}</p>
                 </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                <ChartIcon size={120} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">Total Featured Project</p>
              <h2 className="text-6xl font-black mt-2">{stats.featured}</h2>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                 <div>
                  <p className="text-xs font-bold opacity-60">Total view statistik minggu ini</p>
                  <p className="text-xl font-black mt-1">{totalStatViews}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Pageview Charts — Now with REAL data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800">
              <div className="mb-8">
                <h3 className="text-lg font-black dark:text-white">Total Pageview Artikel</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Minggu Ini</p>
              </div>
              <div className="h-48 w-full">
                {loadingViews ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">Memuat data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={articleViewData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800">
              <div className="mb-8">
                <h3 className="text-lg font-black dark:text-white">Total Pageview Statistik</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Minggu Ini</p>
              </div>
              <div className="h-48 w-full">
                {loadingViews ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">Memuat data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statViewData}>
                      <defs>
                        <linearGradient id="colorViewsStat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorViewsStat)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Trends */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black dark:text-white">Google Trend</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Untuk data lebih detail bisa cek di <span className="text-primary font-bold">Sedang Trending</span></p>
              </div>
              <TrendingUp className="text-primary" />
            </div>
            
            <div className="space-y-6">
              {loadingTrends ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 animate-pulse">Mengambil data realtime...</p>
                </div>
              ) : (
                trends.map((trend, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-all" onClick={() => window.open(trend.link, '_blank')}>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors line-clamp-1">{trend.keyword}</span>
                    <span className="text-[10px] whitespace-nowrap ml-2 font-medium text-slate-400 uppercase">{trend.time}</span>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => window.open('https://trends.google.com/trends/trendingsearches/realtime?geo=ID', '_blank')}
              className="w-full mt-12 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
            >
              LIHAT SEMUA TRENDING
            </button>
          </div>
        </div>
      </div>

      {/* Full Width Table for Popular Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black dark:text-white capitalize">
              Konten Terpopuler
            </h3>
            <p className="text-xs text-slate-500 mt-1">Berdasarkan total pageview</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Pencarian" 
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-primary transition-all">
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/20">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Judul</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Topik</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Diterbitkan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {popularArticles.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {(item.thumbnail_url || item.image || item.image_url) ? (
                          <img src={item.thumbnail_url || item.image || item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-slate-400" />
                        )}
                      </div>
                      <span className="text-sm font-bold dark:text-white line-clamp-2">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-block whitespace-nowrap px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg">
                      {item.category || item.tags?.[0] || 'Umum'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold dark:text-white">{itemViews[item.id] ?? '—'}</span>
                  </td>
                </tr>
              ))}
              {popularArticles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-6 text-center text-slate-400 text-sm">
                    Belum ada data konten.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
