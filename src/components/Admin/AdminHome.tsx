import React, { useMemo } from 'react';
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
import { TrendingUp, FileText, Briefcase, LineChart as ChartIcon, ExternalLink } from 'lucide-react';

const MOCK_VIEW_DATA = [
  { name: 'Mon', views: 400 },
  { name: 'Tue', views: 300 },
  { name: 'Wed', views: 600 },
  { name: 'Thu', views: 800 },
  { name: 'Fri', views: 500 },
  { name: 'Sat', views: 900 },
  { name: 'Sun', views: 700 },
];

const MOCK_TRENDS = [
  { keyword: 'jaksa', time: '16 menit lalu' },
  { keyword: 'airasia', time: '28 menit lalu' },
  { keyword: 'cctv semarang', time: '26 menit lalu' },
  { keyword: 'haji', time: '58 menit lalu' },
  { keyword: 'china', time: '58 menit lalu' },
  { keyword: 'cek status bansos online', time: '1 jam lalu' },
];

interface AdminHomeProps {
  stats: {
    articles: number;
    portfolio: number;
    featured: number;
  };
}

const AdminHome: React.FC<AdminHomeProps> = ({ stats }) => {
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
                  <p className="text-xs font-bold opacity-60">Persentase artikel terbit</p>
                  <p className="text-xl font-black mt-1">100%</p>
                 </div>
                 <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                  <ExternalLink size={20} />
                 </button>
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
                  <p className="text-xs font-bold opacity-60">Persentase statistik terbit</p>
                  <p className="text-xl font-black mt-1">100%</p>
                 </div>
                 <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                  <ExternalLink size={20} />
                 </button>
              </div>
            </div>
          </div>

          {/* Pageview Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800">
              <div className="mb-8">
                <h3 className="text-lg font-black dark:text-white">Total Pageview Artikel</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Minggu Ini</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_VIEW_DATA}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800">
              <div className="mb-8">
                <h3 className="text-lg font-black dark:text-white">Total Pageview Statistik</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Minggu Ini</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_VIEW_DATA}>
                    <defs>
                      <linearGradient id="colorViewsStat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorViewsStat)" />
                  </AreaChart>
                </ResponsiveContainer>
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
              {MOCK_TRENDS.map((trend, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-all">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{trend.keyword}</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">{trend.time}</span>
                </div>
              ))}
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
    </div>
  );
};

export default AdminHome;
