import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BarChart3, TrendingUp, Eye, ArrowUpRight, Calendar, Filter, ChevronDown, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SafeImage from '../Common/SafeImage';

interface AdminHomeProps {
  stats: {
    articles: number;
    statistics: number;
  };
  popularArticles: any[];
  items?: { articles: any[], statistics: any[] };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-sm font-black dark:text-white uppercase italic">
            {payload[0].value.toLocaleString()} <span className="text-slate-400 not-italic">Views</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AdminHome: React.FC<AdminHomeProps> = ({ stats, popularArticles, items }) => {
  const [popularFilter, setPopularFilter] = useState<'Semua' | 'Artikel' | 'Statistik'>('Semua');
  
  // Custom Date Range State
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredPopular = useMemo(() => {
    let combined = [];
    if (items) {
      const artsWithBadge = items.articles.map(a => ({ ...a, type: 'Artikel' }));
      const statsWithBadge = items.statistics.map(s => ({ ...s, type: 'Statistik' }));
      combined = [...artsWithBadge, ...statsWithBadge];
    } else {
      combined = popularArticles;
    }

    return combined
      .filter(item => {
        if (popularFilter === 'Semua') return true;
        return item.type === popularFilter || (popularFilter === 'Artikel' && !item.type);
      })
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [popularFilter, popularArticles, items]);

  const chartData = useMemo(() => {
    // Generate dates between start and end
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const limit = Math.min(diffDays, 31); // Max 31 days display for safety
    
    return Array.from({ length: limit }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        name: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        views: Math.floor((stats.articles + stats.statistics) * (5 + Math.random() * 20))
      };
    });
  }, [startDate, endDate, stats]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter dark:text-white uppercase italic">Dashboard <span className="text-primary">Overview</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 italic">Analisis performa konten publikasi anda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Artikel</p>
              <h3 className="text-2xl md:text-3xl font-black dark:text-white group-hover:text-primary transition-colors">{stats.articles}</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500"><FileText size={18} /></div>
          </div>
        </div>

        <div className="p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Statistik</p>
              <h3 className="text-2xl md:text-3xl font-black dark:text-white group-hover:text-primary transition-colors">{stats.statistics}</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-500"><BarChart3 size={18} /></div>
          </div>
        </div>
        
        <div className="p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-1 sm:col-span-2 flex items-center justify-between bg-linear-to-r from-primary to-blue-600">
           <div className="text-white">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Status Akun</p>
              <h3 className="text-lg md:text-xl font-black uppercase italic tracking-widest">Premium Contributor</h3>
           </div>
           <Clock className="text-white/20 hidden sm:block" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest dark:text-white italic flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> Performa Konten
              </h4>
            </div>
            
            {/* Custom Date Range Controls */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
               <div className="flex items-center gap-2">
                 <Calendar size={14} className="text-primary" />
                 <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase outline-none"
                 />
               </div>
               <span className="text-slate-300">/</span>
               <div className="flex items-center gap-2">
                 <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase outline-none"
                 />
               </div>
            </div>
          </div>

          <div className="h-[250px] md:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 900, fill: '#64748B'}} dy={15} minTickGap={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8b5cf6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorViews)"
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular List */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest dark:text-white italic">Terpopuler</h4>
            <div className="flex gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
               {['Semua', 'Artikel', 'Statistik'].map((f) => (
                 <button 
                  key={f}
                  onClick={() => setPopularFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${popularFilter === f ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
                 >
                   {f === 'Semua' ? 'All' : f}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 flex-1">
            {filteredPopular.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="flex items-center gap-3 md:gap-4 group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm relative">
                  <SafeImage src={item.thumbnail_url || item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h5 className="text-[10px] font-black dark:text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h5>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[8px] font-black text-primary uppercase tracking-widest">
                       <Eye size={10} strokeWidth={3} /> {item.views?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
