import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Clock, 
  Eye, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SafeImage from '../Common/SafeImage';

interface AdminHomeProps {
  stats: {
    articles: number;
    statistics: number;
    portfolios: number;
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
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-none border border-slate-200 shadow-xl font-sans">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c0392b] animate-pulse"></div>
          <p className="text-lg font-bold text-slate-900 tracking-tight">
            {payload[0].value} <span className="text-[10px] text-slate-500 font-normal">Views</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AdminHome: React.FC<AdminHomeProps> = ({ stats, popularArticles, items, profile, rawViews = [], currentUserId }) => {
  const [popularFilter, setPopularFilter] = useState<'All' | 'Articles' | 'Statistics'>('All');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredPopular = useMemo(() => {
    let combined = [];
    if (items) {
      const artsWithBadge = items.articles.map(a => ({ ...a, type: 'Articles' }));
      const statsWithBadge = items.statistics.map(s => ({ ...s, type: 'Statistics' }));
      combined = [...artsWithBadge, ...statsWithBadge];
    } else {
      combined = popularArticles.map(a => ({ ...a, type: 'Articles' }));
    }

    return combined
      .filter(item => {
        if (popularFilter === 'All') return true;
        return item.type === popularFilter;
      })
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [popularFilter, popularArticles, items]);

  const chartData = useMemo(() => {
    if (!rawViews || !items) return [];

    const userContentIds = new Set<string>();
    
    if (popularFilter === 'All' || popularFilter === 'Articles') {
        items?.articles?.forEach(a => {
            if (a.id) userContentIds.add(String(a.id));
            if (a.slug) userContentIds.add(String(a.slug));
            const numericId = String(a.id).split('-').length === 1 ? a.id : null;
            if (numericId) userContentIds.add(String(numericId));
        });
    }
    
    if (popularFilter === 'All' || popularFilter === 'Statistics') {
        items?.statistics?.forEach(s => {
            if (s.id) userContentIds.add(String(s.id));
            if (s.slug) userContentIds.add(String(s.slug));
        });
    }

    const myFilteredViews = rawViews.filter(v => userContentIds.has(String(v.page_id)));

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
        name: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        views: dailyCount,
        fullDate: dateStr
      };
    });
  }, [startDate, endDate, rawViews, items, popularFilter]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-full overflow-x-hidden font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-xs font-normal mt-1">Analytics and performance tracking for your published content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="p-6 bg-white rounded-none border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#0d2137] transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Articles</p>
              <h3 className="text-3xl font-serif font-bold text-slate-900 group-hover:text-[#c0392b] transition-colors">{stats.articles}</h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-none text-[#0d2137] border border-slate-200"><FileText size={20} /></div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-none border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#0d2137] transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Statistics</p>
              <h3 className="text-3xl font-serif font-bold text-slate-900 group-hover:text-[#c0392b] transition-colors">{stats.statistics}</h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-none text-[#0d2137] border border-slate-200"><BarChart3 size={20} /></div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-none border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#0d2137] transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Portfolio</p>
              <h3 className="text-3xl font-serif font-bold text-slate-900 group-hover:text-[#c0392b] transition-colors">{stats.portfolios}</h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-none text-[#0d2137] border border-slate-200"><ArrowUpRight size={20} /></div>
          </div>
        </div>
        
        <div className="p-6 bg-[#0d2137] rounded-none border border-[#0d2137] shadow-sm flex items-center justify-between text-white font-sans">
           <div>
              <p className="text-xs uppercase tracking-widest text-slate-300 font-bold">Account Status</p>
              <h3 className="text-base font-bold uppercase tracking-wider mt-1 truncate text-[#c0392b]">
                {profile?.role === 'owner' ? 'OWNER ACCOUNT' : 'CONTRIBUTOR'}
              </h3>
           </div>
           <Clock className="text-slate-400 hidden sm:block" size={28} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 font-sans">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-none border border-slate-200 shadow-sm font-sans">
          <div className="flex flex-col space-y-4 mb-8 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#c0392b]" /> Performance Overview ({popularFilter})
              </h4>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-none w-fit">
               <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-slate-500" />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase outline-none text-slate-800 cursor-pointer"
                  />
               </div>
               <span className="text-slate-300">/</span>
               <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase outline-none text-slate-800 cursor-pointer"
                  />
               </div>
            </div>
          </div>

          <div className="h-75 md:h-87.5 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d2137" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0d2137" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 600, fill: '#64748B'}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#0d2137" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-none border border-slate-200 shadow-sm flex flex-col font-sans">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Most Popular</h4>
            <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200">
               {(['All', 'Articles', 'Statistics'] as const).map(filter => (
                 <button 
                  key={filter}
                  onClick={() => setPopularFilter(filter)}
                  className={`px-3 py-1 text-xs font-bold transition-colors ${popularFilter === filter ? 'bg-[#0d2137] text-white' : 'text-slate-600 hover:text-slate-900'}`}
                 >
                   {filter}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-6 flex-1 font-sans">
            {filteredPopular.length > 0 ? filteredPopular.map((item, idx) => (
              <div 
                key={item.id} 
                className="group cursor-pointer pb-4 border-b border-slate-100 last:border-b-0"
                onClick={() => {
                  if (item.type === 'Articles') {
                    window.open(`/articles/${item.slug}`, '_blank');
                  } else if (item.type === 'Statistics') {
                    window.open(`/data/${item.slug || item.id}`, '_blank');
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 overflow-hidden shrink-0 border border-slate-200 shadow-xs relative flex items-center justify-center bg-slate-50">
                    {(() => {
                      const mediaUrl = (item as any).media_url || item.thumbnail_url || item.image_url;
                      if (!mediaUrl) return <ImageIcon size={20} className="text-slate-400" />;

                      const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
                      const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);

                      if (flourishId || mediaUrl.trim().startsWith('<iframe') || mediaUrl.startsWith('http')) {
                        const isRawIframe = mediaUrl.trim().startsWith('<iframe');
                        if (!isImage) {
                          return (
                            <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
                              <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none">
                                {isRawIframe ? (
                                  <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: mediaUrl }} />
                                ) : (
                                  <iframe src={flourishId ? `https://flo.uri.sh/visualisation/${flourishId}/embed?auto=1` : mediaUrl} className="w-full h-full border-0" scrolling="no" />
                                )}
                              </div>
                            </div>
                          );
                        }
                      }

                      return <SafeImage src={mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />;
                    })()}
                    <div className="absolute top-0 right-0 p-1 bg-[#c0392b] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <ArrowUpRight size={12} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-[#c0392b]">
                         {item.type}
                       </span>
                       <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                         <Eye size={12} /> {item.views || 0}
                       </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#c0392b] transition-colors">
                      {item.title}
                    </h5>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center flex flex-col items-center gap-3 border border-slate-200 bg-slate-50">
                 <Filter className="text-slate-400" size={24} />
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No content available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
