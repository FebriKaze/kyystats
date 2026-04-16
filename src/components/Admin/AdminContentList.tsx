import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';
import { fetchPageViewCount } from '../../services/portfolioService';
import SafeImage from '../Common/SafeImage';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

interface AdminContentListProps {
  type: 'articles' | 'portfolio' | 'featured' | 'statistics';
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onBulkAssign?: () => void;
  showBulkAssign?: boolean;
  onManageAssignments?: () => void;
  showManageAssignments?: boolean;
}

const AdminContentList: React.FC<AdminContentListProps> = ({ type, data, onEdit, onDelete, onCreate, onBulkAssign, showBulkAssign, onManageAssignments, showManageAssignments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [loadingViews, setLoadingViews] = useState(false);
  
  const filteredData = data.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadViews = async () => {
      if (filteredData.length === 0) return;
      setLoadingViews(true);
      try {
        const counts: Record<string, number> = {};
        // Tentukan type untuk query page_views
        const pageType = type === 'articles' ? 'article' : type === 'statistics' ? 'statistik' : 'portfolio';
        
        // Load data view per item
        await Promise.all(filteredData.map(async (item) => {
          const count = await fetchPageViewCount(pageType, item.id);
          counts[item.id] = count;
        }));
        
        setViewCounts(counts);
      } catch (e) {
        console.error('Error fetching pageview counts:', e);
      } finally {
        setLoadingViews(false);
      }
    };

    loadViews();
  }, [type, data.length]); // Reload jika data atau tipe berubah

  const title = type === 'articles' ? 'Manajemen Artikel' : type === 'portfolio' ? 'Manajemen Portfolio' : type === 'statistics' ? 'Manajemen Statistik' : 'Manajemen Project Archive';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400">Beranda - {type === 'articles' ? 'Artikel' : type === 'statistics' ? 'Statistik' : type === 'portfolio' ? 'Portfolio' : 'Archive'} - Daftar</p>
        </div>
        <div className="flex items-center gap-3">
          {showManageAssignments && onManageAssignments && type === 'articles' && (
            <button 
              onClick={onManageAssignments}
              className="flex items-center gap-2 bg-purple-500 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform"
            >
              <Plus size={20} /> Manage Article Assignment
            </button>
          )}
          <button 
            onClick={onCreate}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Plus size={20} /> Tambah {type === 'articles' ? 'Artikel' : type === 'portfolio' ? 'Portfolio' : type === 'statistics' ? 'Statistik' : 'Archive'} Baru
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-black dark:text-white capitalize">
            {type === 'articles' ? 'Daftar Artikel' : type === 'statistics' ? 'Daftar Statistik' : type === 'portfolio' ? 'Daftar Portfolio' : 'Daftar Project Archive'}
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Pencarian" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Penulis</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Diterbitkan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Pageview</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {(() => {
                          const mediaUrl = (item as any).media_url || item.thumbnail_url || item.image || item.image_url;
                          if (!mediaUrl) {
                            if (type === 'statistics' && item.chart_data && item.chart_data.data && item.chart_data.data.length > 0) {
                              return (
                                <div className="w-full h-full p-2 opacity-80 flex items-end justify-center">
                                  <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={item.chart_data.data.slice(0, 3)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                      <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={6}>
                                        {item.chart_data.data.slice(0, 3).map((entry: any, index: number) => (
                                          <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              );
                            }
                            return <ImageIcon size={20} className="text-slate-400" />;
                          }

                          const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
                          const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);

                          if (flourishId || mediaUrl.trim().startsWith('<iframe') || mediaUrl.startsWith('http')) {
                            const isRawIframe = mediaUrl.trim().startsWith('<iframe');
                            if (!isImage) {
                              return (
                                <div className="absolute inset-0 w-full h-full overflow-hidden">
                                  <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none">
                                    {isRawIframe ? (
                                      <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: mediaUrl }} />
                                    ) : (
                                      <iframe src={flourishId ? `https://public.flourish.studio/visualisation/${flourishId}/embed?auto=1` : mediaUrl} className="w-full h-full border-0" scrolling="no" />
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }

                          return <SafeImage src={mediaUrl} alt="" className="w-full h-full object-cover" />;
                        })()}
                      </div>
                      <span className="text-sm font-bold dark:text-white line-clamp-2">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-block whitespace-nowrap px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg">
                      {item.category || (item.tags && item.tags.length > 0 ? item.tags[0] : 'Umum')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item.author || 'Admin'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'BELUM DITERBITKAN'}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold dark:text-white">
                      {loadingViews ? (
                        <span className="animate-pulse text-slate-300">...</span>
                      ) : (
                        viewCounts[item.id] || 0
                      )}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors border border-slate-100 dark:border-slate-800"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors border border-slate-100 dark:border-slate-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="text-xs text-slate-500">Display</span>
             <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs dark:text-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
             </select>
             <span className="text-xs text-slate-500">Showing 1 to {filteredData.length} of {filteredData.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">1</button>
            <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentList;
