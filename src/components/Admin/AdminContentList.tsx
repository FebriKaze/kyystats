import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';
import { fetchPageViewCount } from '../../services/portfolioService';
import SafeImage from '../Common/SafeImage';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';

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

const AdminContentList: React.FC<AdminContentListProps> = ({ type, data, onEdit, onDelete, onCreate, onManageAssignments, showManageAssignments }) => {
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
        const pageType = type === 'articles' ? 'article' : type === 'statistics' ? 'statistik' : 'portfolio';
        
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
  }, [type, data.length]);

  const title = type === 'articles' ? 'Articles Management' : type === 'portfolio' ? 'Portfolio Management' : type === 'statistics' ? 'Statistics Management' : 'Project Archive Management';
  const typeLabel = type === 'articles' ? 'Articles' : type === 'statistics' ? 'Statistics' : type === 'portfolio' ? 'Portfolio' : 'Archive';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 font-sans">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-slate-500 text-xs mt-1">Home / {typeLabel} / List</p>
        </div>
        <div className="flex items-center gap-3 font-sans">
          {showManageAssignments && onManageAssignments && type === 'articles' && (
            <button 
              onClick={onManageAssignments}
              className="flex items-center gap-2 bg-[#0d2137] text-white px-5 py-2.5 rounded-none font-bold text-xs hover:bg-slate-800 transition-colors border border-[#0d2137]"
            >
              <Plus size={16} /> Manage Article Assignment
            </button>
          )}
          <button 
            onClick={onCreate}
            className="flex items-center gap-2 bg-[#c0392b] text-white px-6 py-2.5 rounded-none font-bold text-xs hover:bg-rose-900 transition-colors border border-[#c0392b]"
          >
            <Plus size={16} /> Add New {typeLabel}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden font-sans">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
          <h3 className="text-base font-serif font-bold text-slate-900 capitalize">
            {typeLabel} List
          </h3>
          
          <div className="flex items-center gap-4 font-sans">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-none py-2.5 pl-10 pr-4 text-xs w-full md:w-64 focus:outline-none focus:border-[#0d2137] text-slate-900 transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-bold text-slate-700 hover:border-[#0d2137] transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Title</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Topic</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Author</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Published</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Pageview</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 font-sans">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative font-sans">
                        {(() => {
                          const mediaUrl = (item as any).media_url || item.thumbnail_url || item.image || item.image_url;
                          if (!mediaUrl) {
                            if (type === 'statistics' && item.chart_data && item.chart_data.data && item.chart_data.data.length > 0) {
                              return (
                                <div className="w-full h-full p-2 opacity-80 flex items-end justify-center font-sans">
                                  <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={item.chart_data.data.slice(0, 3)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                      <Bar dataKey="value" barSize={6}>
                                        {item.chart_data.data.slice(0, 3).map((entry: any, index: number) => (
                                          <Cell key={`cell-${index}`} fill={entry.color || '#0d2137'} />
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
                                <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
                                  <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none font-sans">
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

                          return <SafeImage src={mediaUrl} alt="" className="w-full h-full object-cover" />;
                        })()}
                      </div>
                      <span className="text-xs font-bold text-slate-900 line-clamp-2">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-sans">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-[#0d2137] border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                      {item.category || (item.tags && item.tags.length > 0 ? item.tags[0] : 'General')}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-sans">
                    <span className="text-xs text-slate-700 font-medium">{item.author || 'Admin'}</span>
                  </td>
                  <td className="px-6 py-5 font-sans">
                    <p className="text-xs text-slate-700 font-medium font-sans">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5 font-sans">
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'NOT PUBLISHED'}
                    </p>
                  </td>
                  <td className="px-6 py-5 font-sans">
                    <span className="text-xs font-bold text-slate-900">
                      {loadingViews ? (
                        <span className="animate-pulse text-slate-300">...</span>
                      ) : (
                        viewCounts[item.id] || 0
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-sans">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 bg-slate-50 text-slate-500 hover:text-[#0d2137] hover:bg-slate-100 transition-colors border border-slate-200 rounded-none"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 bg-slate-50 text-slate-500 hover:text-[#c0392b] hover:bg-rose-50 transition-colors border border-slate-200 rounded-none"
                        title="Delete"
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

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3 font-sans">
             <span className="text-xs text-slate-500">Display</span>
             <select className="bg-white border border-slate-200 rounded-none px-2 py-1 text-xs text-slate-800 outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
             </select>
             <span className="text-xs text-slate-500">Showing 1 to {filteredData.length} of {filteredData.length} records</span>
          </div>
          <div className="flex items-center gap-1 font-sans">
            <button className="p-2 border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 rounded-none"><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 bg-[#0d2137] text-white text-xs font-bold border border-[#0d2137] rounded-none">1</button>
            <button className="p-2 border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 rounded-none"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentList;
