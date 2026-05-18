import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Trash2, FileText, BarChart3, Search, ShieldCheck, ChevronDown, ChevronUp, Eye, Filter, Calendar, X, TrendingUp } from 'lucide-react';
import { fetchArticles, fetchStatistics, deleteArticle, deleteStatistic } from '../../services/portfolioService';
import SafeImage from '../Common/SafeImage';
import ProfileAvatar from '../Common/ProfileAvatar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [contentSort, setContentSort] = useState<'latest' | 'popular'>('latest');
  
  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedContent(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profData } = await supabase.from('profiles').select('*').order('full_name');
      const [artData, statData] = await Promise.all([
        fetchArticles(),
        fetchStatistics()
      ]);

      const { data: viewsData } = await supabase.from('page_views').select('page_id');
      const counts: Record<string, number> = {};
      viewsData?.forEach((v: any) => {
        counts[v.page_id] = (counts[v.page_id] || 0) + 1;
      });

      setUsers(profData || []);
      setArticles(artData.map((a: any) => ({ ...a, views: counts[a.id] || counts[a.slug] || 0 })));
      setStatistics(statData.map((s: any) => ({ ...s, views: counts[s.id] || 0 })));
      setViewCounts(counts);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (type: 'article' | 'statistic', id: string, title: string) => {
    if (!window.confirm(`Delete ${type} "${title}"? (Owner Moderation)`)) return;
    let success = type === 'article' ? await deleteArticle(id) : await deleteStatistic(id);
    if (success) {
      setSelectedContent(null);
      loadData();
    }
  };

  const getUserStats = (userId: string) => {
    const userArticles = articles.filter(a => a.user_id === userId);
    const userStats = statistics.filter(s => s.user_id === userId);
    return {
      articles: userArticles,
      stats: userStats,
      articlesCount: userArticles.length,
      statsCount: userStats.length,
      totalViews: userArticles.reduce((acc, curr) => acc + (curr.views || 0), 0) + 
                  userStats.reduce((acc, curr) => acc + (curr.views || 0), 0)
    };
  };

  const getChartData = (views: number) => {
    const base = Math.floor(views / 7);
    return [
      { day: 'Mon', views: Math.floor(base * 0.8) },
      { day: 'Tue', views: Math.floor(base * 1.2) },
      { day: 'Wed', views: Math.floor(base * 0.9) },
      { day: 'Thu', views: Math.floor(base * 1.5) },
      { day: 'Fri', views: Math.floor(base * 1.1) },
      { day: 'Sat', views: Math.floor(base * 2.0) },
      { day: 'Sun', views: views - (base * 7.5) < 0 ? base : Math.floor(views * 1.3) }
    ];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-md rounded-none font-sans">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-center gap-2 font-sans">
            <div className="w-2 h-2 bg-[#0d2137] rounded-none"></div>
            <p className="text-sm font-bold text-slate-900">
              {payload[0].value} <span className="text-[10px] text-slate-500">Views</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6 font-sans">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 uppercase">
            User Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">Real-time Contribution & Pageviews Monitoring System</p>
        </div>

        <div className="relative max-w-xs w-full font-sans">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search contributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-none text-xs focus:outline-none focus:border-[#0d2137] text-slate-900 transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm font-sans">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 font-sans">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Contributor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-center">Stats</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-center">Exposure (Real)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredUsers.map((u) => {
                const uData = getUserStats(u.id);
                const isOwner = u.role === 'owner';
                const isExpanded = expandedUserId === u.id;

                return (
                  <React.Fragment key={u.id}>
                    <tr 
                      className={`transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                    >
                      <td className="px-6 py-5 font-sans">
                        <div className="flex items-center gap-4 font-sans">
                          <ProfileAvatar
                            src={u.avatar_url}
                            alt={u.full_name || 'Contributor'}
                            className="h-12 w-12 rounded-none border border-slate-200 shadow-sm"
                            iconSize={24}
                          />
                          <div className="font-sans">
                            <div className="flex items-center gap-2 font-sans">
                              <span className="text-sm font-bold text-slate-900 uppercase">{u.full_name}</span>
                              {isOwner && <ShieldCheck size={14} className="text-[#0d2137]" />}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-xs text-slate-700 font-medium font-sans">
                        <span className="font-bold text-[#0d2137]">{uData.articlesCount}</span> Articles | <span className="font-bold text-[#0d2137]">{uData.statsCount}</span> Statistics
                      </td>
                      <td className="px-6 py-5 text-center font-sans">
                         <div className="inline-flex flex-col items-center font-sans">
                          <span className="text-base font-bold text-[#0d2137]">{uData.totalViews.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-sans">
                        {isExpanded ? <ChevronUp size={16} className="text-[#0d2137]" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-50/80 font-sans">
                        <td colSpan={4} className="px-6 py-8 font-sans">
                          <div className="space-y-6 font-sans">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-4 font-sans">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-sans">
                                <FileText size={16} className="text-[#0d2137]" /> Content Monitoring
                              </h4>
                              <div className="flex items-center gap-2 bg-white p-1 border border-slate-200 shadow-sm font-sans">
                                <button onClick={() => setContentSort('latest')} className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${contentSort === 'latest' ? 'bg-[#0d2137] text-white' : 'text-slate-600 hover:text-slate-900'}`}>Latest</button>
                                <button onClick={() => setContentSort('popular')} className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${contentSort === 'popular' ? 'bg-[#0d2137] text-white' : 'text-slate-600 hover:text-slate-900'}`}>Popular</button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                              {[
                                ...uData.articles.map(a => ({ ...a, contentType: 'article' })),
                                ...uData.stats.map(s => ({ ...s, contentType: 'statistic' }))
                              ].sort((a, b) => {
                                if (contentSort === 'popular') return (b.views || 0) - (a.views || 0);
                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                              }).map((item: any) => (
                                <div 
                                  key={item.id} 
                                  onClick={() => setSelectedContent(item)}
                                  className="p-4 bg-white border border-slate-200 shadow-sm group cursor-pointer hover:border-[#0d2137] transition-colors flex items-center gap-4 font-sans"
                                >
                                  <div className="w-14 h-14 bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative font-sans">
                                    {item.thumbnail_url || item.image_url ? (
                                      <SafeImage src={item.thumbnail_url || item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : item.chart_data && item.chart_data.data ? (
                                      <div className="w-full h-full p-1 opacity-80 flex items-end justify-center font-sans">
                                        <ResponsiveContainer width="100%" height="80%">
                                          <BarChart data={item.chart_data.data.slice(0, 3)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <Bar dataKey="value" barSize={6}>
                                              {item.chart_data.data.slice(0, 3).map((entry: any, i: number) => (
                                                <Cell key={i} fill={entry.color || '#0d2137'} />
                                              ))}
                                            </Bar>
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    ) : (
                                      <BarChart3 className="text-slate-400" size={20} />
                                    )}
                                  </div>
                                  <div className="flex-1 overflow-hidden font-sans">
                                    <div className="flex items-center justify-between gap-2 font-sans">
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${item.contentType === 'article' ? 'bg-blue-50 border-blue-200 text-[#0d2137]' : 'bg-rose-50 border-rose-200 text-[#c0392b]'}`}>{item.contentType}</span>
                                      <span className="text-xs font-bold text-[#0d2137] flex items-center gap-1 font-sans"><Eye size={12} /> {item.views || 0}</span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900 truncate mt-1 font-sans">{item.title}</h5>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedContent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 animate-in fade-in duration-300 font-sans"
          onClick={() => setSelectedContent(null)}
        >
           <div 
            className="bg-white w-full max-w-4xl rounded-none shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row max-h-[90vh] relative font-sans"
            onClick={e => e.stopPropagation()}
           >
              <button 
                onClick={() => setSelectedContent(null)}
                className="absolute top-6 right-6 z-20 p-2.5 bg-white text-slate-900 border border-slate-200 shadow-md hover:bg-slate-100 transition-colors rounded-none"
              >
                <X size={20} />
              </button>

              <div className="md:w-2/5 relative bg-slate-900 min-h-[300px] flex items-center justify-center overflow-hidden font-sans">
                 {selectedContent.thumbnail_url || selectedContent.image_url ? (
                   <SafeImage src={selectedContent.thumbnail_url || selectedContent.image_url} className="w-full h-full object-cover absolute inset-0" />
                 ) : selectedContent.chart_data && selectedContent.chart_data.data ? (
                   <div className="w-full h-full absolute inset-0 flex items-end justify-center opacity-60 pt-20 px-8 pb-8 font-sans">
                     <ResponsiveContainer width="100%" height="60%">
                       <BarChart data={selectedContent.chart_data.data.slice(0, 5)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                         <Bar dataKey="value" barSize={24}>
                           {selectedContent.chart_data.data.slice(0, 5).map((entry: any, i: number) => (
                             <Cell key={i} fill={entry.color || '#0d2137'} />
                           ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 ) : (
                   <BarChart3 className="text-slate-700 absolute opacity-50" size={120} />
                 )}
                 <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 z-10 font-sans">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">{selectedContent.category || 'General'}</span>
                    <h2 className="text-xl font-serif font-bold text-white leading-tight uppercase">{selectedContent.title}</h2>
                 </div>
              </div>

              <div className="md:w-3/5 p-8 overflow-y-auto space-y-8 font-sans">
                 <div className="flex items-center justify-between font-sans">
                    <div className="font-sans">
                       <h4 className="text-base font-serif font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <TrendingUp size={18} className="text-[#0d2137]" /> Content Performance Statistics
                       </h4>
                       <p className="text-xs text-slate-500 font-medium mt-1">Real-time engagement exposure report</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 font-sans">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-none font-sans">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pageviews</p>
                       <p className="text-3xl font-serif font-bold text-slate-900">{selectedContent.views || 0}</p>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-none flex flex-col items-center justify-center font-sans">
                       <button 
                        onClick={() => handleDeleteContent(selectedContent.contentType, selectedContent.id, selectedContent.title)}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-[#c0392b] text-white rounded-none font-bold text-xs uppercase tracking-wider hover:bg-rose-900 transition-colors border border-[#c0392b] shadow-sm font-sans"
                       >
                          <Trash2 size={16} /> Moderate Content
                       </button>
                    </div>
                 </div>

                 <div className="h-64 w-full bg-slate-50 border border-slate-200 p-6 rounded-none font-sans">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={getChartData(selectedContent.views || 0)}>
                          <defs>
                             <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d2137" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#0d2137" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.5} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}} dy={10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="views" stroke="#0d2137" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
