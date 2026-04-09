import React, { useState } from 'react';
import { Save, X, Eye, Image as ImageIcon, Check, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminEditorProps {
  type: 'articles' | 'portfolio' | 'featured';
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

const AdminEditor: React.FC<AdminEditorProps> = ({ type, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({...item});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      let bucketName = 'project-images'; // Default for 'featured'
      if (type === 'articles') bucketName = 'article-images';
      else if (type === 'portfolio') bucketName = 'portfolio-images';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (type === 'articles') setFormData({...formData, thumbnail_url: publicUrl});
      else if (type === 'portfolio') setFormData({...formData, image: publicUrl});
      else setFormData({...formData, image_url: publicUrl});
      
    } catch (error: any) {
      alert('Gagal mengunggah gambar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const title = item.id ? `Edit ${type.slice(0, -1)}` : `Tambah ${type.slice(0, -1)} Baru`;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400">Manajemen {type.slice(0, -1)} - Beranda - {type === 'articles' ? 'Artikel' : 'Statistik'} - Baru</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Judul <span className="text-red-500">*</span></label>
                <input 
                  required
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Masukkan judul Konten"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
             </div>

             {type === 'articles' && (
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Slug <span className="text-red-500">*</span></label>
                  <input 
                    required
                    value={formData.slug || ''} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="slug-artikel-anda"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-6 text-sm dark:text-white"
                  />
               </div>
             )}

             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Konten <span className="text-red-500">*</span></label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                  <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markdown Editor</span>
                    <div className="flex-1"></div>
                    <button type="button" className="text-slate-400 hover:text-primary"><Eye size={18} /></button>
                  </div>
                  <textarea 
                    required
                    rows={15}
                    placeholder="Tuliskan konten anda di sini menggunakan format Markdown..."
                    value={type === 'portfolio' ? formData.details?.challenge : formData.content || ''} 
                    onChange={(e) => {
                      if (type === 'portfolio') {
                        setFormData({...formData, details: {...formData.details, challenge: e.target.value}});
                      } else {
                        setFormData({...formData, content: e.target.value});
                      }
                    }}
                    className="w-full bg-transparent py-6 px-8 text-sm dark:text-white focus:outline-none font-mono leading-relaxed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Tips: Gunakan format Gambar Markdown `![deskripsi](url-gambar)` untuk menyematkan gambar di mana saja di dalam artikel.</p>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Ringkasan / Deskripsi Singkat</label>
                <textarea 
                  rows={3}
                  placeholder="Tuliskan deskripsi singkat..."
                  value={formData.summary || formData.description || ''} 
                  onChange={(e) => setFormData({...formData, [type === 'articles' ? 'summary' : 'description']: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm dark:text-white resize-none"
                />
             </div>

             {type === 'portfolio' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Solution</label>
                    <textarea value={formData.details?.solution || ''} onChange={(e) => setFormData({...formData, details: {...formData.details, solution: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-6 text-sm dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Result</label>
                    <textarea value={formData.details?.result || ''} onChange={(e) => setFormData({...formData, details: {...formData.details, result: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-6 text-sm dark:text-white" />
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Topik <span className="text-red-500">*</span></label>
                <input 
                  value={formData.category || (formData.tags?.[0] || '')} 
                  onChange={(e) => setFormData({...formData, category: e.target.value, tags: [e.target.value]})}
                  placeholder="Pilih Topik"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-6 text-sm dark:text-white"
                />
             </div>

             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status <span className="text-red-500">*</span></label>
                <select 
                  value={formData.is_published ? 'Published' : 'Draft'}
                  onChange={(e) => setFormData({...formData, is_published: e.target.value === 'Published'})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-6 text-sm dark:text-white font-bold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Diterbitkan</option>
                </select>
             </div>

             <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Gambar Sampul <span className="text-red-500">*</span></label>
                <div className="aspect-video rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 overflow-hidden group relative transition-all hover:bg-slate-100 dark:hover:bg-slate-900">
                   {(formData.thumbnail_url || formData.image || formData.image_url) ? (
                     <>
                        <img src={formData.thumbnail_url || formData.image || formData.image_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" className="p-3 bg-white rounded-2xl text-primary font-black text-[10px] uppercase shadow-xl transition-transform active:scale-95">Ganti Gambar</button>
                        </div>
                     </>
                   ) : (
                     <>
                        <ImageIcon size={32} className="text-slate-300" />
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Input Image URL</p>
                     </>
                   )}
                </div>
                <input 
                  value={formData.thumbnail_url || formData.image || formData.image_url || ''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === 'articles') setFormData({...formData, thumbnail_url: val});
                    else if (type === 'portfolio') setFormData({...formData, image: val});
                    else setFormData({...formData, image_url: val});
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-6 text-[10px] font-mono dark:text-white"
                />
             </div>

             <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  KIRIM KONTEN
                </button>
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-500 py-4 rounded-2xl font-black text-sm transition-all"
                >
                  RESET ULANG
                </button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditor;
