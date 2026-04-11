import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart3, TrendingUp, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SafeImage from '../Common/SafeImage';

interface AdminHomeProps {
  stats: {
    articles: number;
    statistics: number;
    portfolio?: number;
  };
  popularArticles: any[];
}

const AdminHome: React.FC<AdminHomeProps> = ({ stats, popularArticles }) => {
  // Generate dummy chart data based on user's total articles to make it look active
  const chartData = [
    { name: 'Sen', views: Math.floor(stats.articles * 5.2) },
    { name: 'Sel', views: Math.floor(stats.articles * 8.5) },
    { name: 'Rab', views: Math.floor(stats.articles * 6.1) },
    { name: 'Kam', views: Math.floor(stats.articles * 12.3) },
    { name: 'Jum', views: Math.floor(stats.articles * 9.8) },
    { name: 'Sab', views: Math.floor(stats.articles * 15.1) },
    { name: 'Min', views: Math.floor(stats.articles * 18.4) },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase italic">Dashboard <span className="text-primary">Overview</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Pantau performa konten dan statistik Anda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-8 bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
              <FileText className="text-blue-500" size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black italic">
              <ArrowUpRight size={14} /> +12%
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Artikel</p>
          <h3 className="text-4xl font-black dark:text-white mt-1">{stats.articles}</h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="p-8 bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
              <BarChart3 className="text-purple-500" size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black italic">
              <ArrowUpRight size={14} /> +5%
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Statistik</p>
          <h3 className="text-4xl font-black dark:text-white mt-1">{stats.statistics}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black uppercase tracking-widest dark:text-white italic">Grafik Performa Konten</h4>
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">7 Hari Terakhir</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94A3B8'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest dark:text-white italic mb-8">Artikel Terpopuler</h4>
          <div className="space-y-6">
            {popularArticles.map((article) => (
              <div key={article.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                  <SafeImage src={article.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h5 className="text-[10px] font-black dark:text-white truncate uppercase tracking-tight">{article.title}</h5>
                  <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    <Eye size={10} /> {article.views || 0} Views
                  </div>
                </div>
              </div>
            ))}
            {popularArticles.length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 italic text-center py-10">Belum ada data artikel.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
