import React, { useState } from 'react';
import { Search, Filter, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';

interface AdminContentListProps {
  type: 'articles' | 'portfolio' | 'featured' | 'statistics';
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const AdminContentList: React.FC<AdminContentListProps> = ({ type, data, onEdit, onDelete, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const title = type === 'articles' ? 'Manajemen Artikel' : type === 'portfolio' ? 'Manajemen Portfolio' : type === 'statistics' ? 'Manajemen Statistik' : 'Manajemen Featured Content';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400">Beranda - {type === 'articles' ? 'Artikel' : 'Statistik'} - Daftar</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus size={20} /> Tambah {type === 'articles' ? 'Artikel' : type === 'portfolio' ? 'Portfolio' : 'Statistik'} Baru
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-black dark:text-white capitalize">
            {type === 'articles' ? 'Daftar Artikel' : 'Daftar Statistik'} Terpopuler
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
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {(item.thumbnail_url || item.image || item.image_url) ? (
                          <img src={item.thumbnail_url || item.image || item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-400" />
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
                    <span className="text-sm font-bold dark:text-white">0</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors border border-slate-100 dark:border-slate-700"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors border border-slate-100 dark:border-slate-700"
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
