import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Clock, 
  Eye, 
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SafeImage from '../Common/SafeImage';

interface AdminHomeProps {
  stats: {
    articles: number;
    statistics: number;
  };
  popularArticles: any[];
  items?: {
    articles: any[];
    statistics: any[];
  };
  profile?: any;
  rawViews?: any[];
  currentUserId?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <p className="text-lg font-black dark:text-white uppercase tracking-tighter">
            {payload[0].value} <span className="text-[10px] text-primary/70">Views</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AdminHome: React.FC<AdminHomeProps> = ({ stats, popularArticles, items, profile, rawViews = [], currentUserId }) => {
  const [popularFilter, setPopularFilter] = useState<'Semua' | 'Artikel' | 'Statistik'>('Semua');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Combined and filtered popular content
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
        return item.type === popularFilter;
      })
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [popularFilter, popularArticles, items]);

  // POWERFUL REAL-TIME ANALYTICS LOGIC (SYNTAX FIXED)
  const chartData = useMemo(() => {
    if (!rawViews || !items) return [];

    const userContentIds = new Set<string>();
    
    // 1. Identify relevant IDs/Slugs based on filter
    if (popularFilter === 'Semua' || popularFilter === 'Artikel') {
        items?.articles?.forEach(a => {
            if (a.id) userContentIds.add(String(a.id));
            if (a.slug) userContentIds.add(String(a.slug));
            // Tambahkan numeric fallback jika ID artikel tertulis sebagai angka integer di page_views
            const numericId = String(a.id).split('-').length === 1 ? a.id : null;
            if (numericId) userContentIds.add(String(numericId));
        });
    }
    
    if (popularFilter === 'Semua' || popularFilter === 'Statistik') {
        items?.statistics?.forEach(s => {
            if (s.id) userContentIds.add(String(s.id));
            if (s.slug) userContentIds.add(String(s.slug));
        });
    }

    // 2. Filter views matching the content IDs (Pastikan tipe data sama-sama string)
    const myFilteredViews = rawViews.filter(v => userContentIds.has(String(v.page_id)));

    // 3. Generate daily time-series data
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const limit = Math.min(diffDays, 31); 
    
    return Array.from({ length: limit }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const dailyCount = myFilteredViews.filter(v => {
        const timestamp = v.viewed_at || v.created_at;
        return timestamp && typeof timestamp === 'string' && timestamp.split('T')[0] === dateStr;
      }).length;

      return {
        name: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        views: dailyCount,
        fullDate: dateStr
      };
    });
  }, [startDate, endDate, rawViews, items, popularFilter]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter dark:text-white uppercase italic">Dashboard <span className="text-primary">Overview</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 italic">Analisis performa konten publikasi anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Artikel</p>
              <h3 className="text-2xl md:text-3xl font-black dark:text-white group-hover:text-primary transition-colors">{stats.articles}</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500"><FileText size={18} /></div>
          </div>
        </div>

        <div className="p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Statistik</p>
              <h3 className="text-2xl md:text-3xl font-black dark:text-white group-hover:text-primary transition-colors">{stats.statistics}</h3>
            </div>
            <div className="p-2.5 md:p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-500"><BarChart3 size={18} /></div>
          </div>
        </div>
        
        <div className="p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-1 sm:col-span-2 flex items-center justify-between bg-linear-to-r from-primary to-blue-600 font-black">
           <div className="text-white">
              <p className="text-[9px] uppercase tracking-widest opacity-70">Status Akun</p>
              <h3 className="text-lg md:text-xl uppercase italic tracking-widest">
                {profile?.role === 'owner' ? 'OWNER ACCOUNT' : 'CONTRIBUTOR'}
              </h3>
           </div>
           <Clock className="text-white/20 hidden sm:block" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest dark:text-white italic flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> Performa {popularFilter} Anda
              </h4>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
               <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-slate-400" />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase outline-none dark:text-white"
                  />
               </div>
               <span className="text-slate-300">/</span>
               <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase outline-none dark:text-white"
                  />
               </div>
            </div>
          </div>

          <div className="h-[300px] md:h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fontWeight: 900, fill: '#64748B'}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white">Terpopuler</h4>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
               {(['Semua', 'Artikel', 'Statistik'] as const).map(filter => (
                 <button 
                  key={filter}
                  onClick={() => setPopularFilter(filter)}
                  className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${popularFilter === filter ? 'bg-white dark:bg-slate-900 text-primary shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-400'}`}
                 >
                   {filter}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPopular.length > 0 ? filteredPopular.map((item, idx) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm relative">
                    <SafeImage 
                      src={item.thumbnail_url || item.image_url} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-0 right-0 p-1 bg-primary text-white scale-0 group-hover:scale-100 transition-transform rounded-bl-lg">
                       <ArrowUpRight size={10} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                       <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md ${item.type === 'Artikel' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/10'}`}>
                         {item.type}
                       </span>
                       <span className="text-[9px] font-black text-primary flex items-center gap-1">
                         <Eye size={10} /> {item.views || 0}
                       </span>
                    </div>
                    <h5 className="text-[10px] md:text-xs font-black text-slate-800 dark:text-slate-200 truncate uppercase mt-0.5 tracking-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h5>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Filter className="text-slate-300" size={20} />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada konten</p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-10 py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">
             Lihat Semua Konten
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
