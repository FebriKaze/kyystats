import React, { useState, useRef } from 'react';
import { 
  X, Check, Loader2, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import { supabase } from '../../lib/supabase';
import { showToast } from '../Common/Toast';
import SafeImage from '../Common/SafeImage';

interface AdminEditorProps {
  type: 'articles' | 'portfolio' | 'statistics' | 'featured';
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

const AdminEditor: React.FC<AdminEditorProps> = ({ type, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({...item});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chartData, setChartData] = useState<any>(item.chart_data || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = { ...formData, chart_data: chartData };
      await onSave(dataToSave);
    } catch (err: any) {
      showToast('error', 'Gagal menyimpan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadCoverImage = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files?.[0]) return;
      const file = event.target.files[0];
      const fileName = `cover-${Math.random()}.${file.name.split('.').pop()}`;
      const bucket = type === 'portfolio' || type === 'featured' ? 'portfolio-images' : 'article-images';
      const { data, error } = await supabase.storage.from(bucket).upload(`covers/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(`covers/${fileName}`);
      
      if (type === 'articles') setFormData(prev => ({...prev, thumbnail_url: publicUrl}));
      else if (type === 'portfolio') setFormData(prev => ({...prev, image: publicUrl}));
      else setFormData(prev => ({...prev, image_url: publicUrl}));
      showToast('success', 'Gambar berhasil diunggah!');
    } catch (err: any) { showToast('error', err.message); } finally { setUploading(false); }
  };

  const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

  const mediaId = formData.media_url?.match(/visualisation\/(\d+)/)?.[1] || formData.media_url?.match(/id=(\d+)/)?.[1];
  const isVideoMedia = /\.(mp4|webm|ogg|mov)$/i.test(formData.media_url || '');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200"><ArrowLeft size={24} /></button>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">{item.id ? 'Edit' : 'Tambah'} {type}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Judul Konten *</label>
                <input required value={formData.title || ''} onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    title: newTitle, 
                    slug: (!item.id || !prev.slug) ? slugify(newTitle) : prev.slug
                  }));
                }} placeholder="Masukkan judul..." className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-5 px-8 text-base dark:text-white font-bold focus:border-primary transition-all" />
             </div>

             <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Teks Intro (Di Atas Media)</label>
                  <RichTextEditor 
                     id={`intro-${item.id || 'new'}`}
                     value={formData.intro_text || ''} 
                     onChange={(val) => setFormData(prev => ({...prev, intro_text: val}))}
                     placeholder="Teks pengantar..."
                     minHeight={200}
                  />
              </div>
              
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Badan Konten *</label>
                 <RichTextEditor 
                   id={`content-${item.id || 'new'}`}
                   value={formData.content || ''} 
                   onChange={(val) => setFormData(prev => ({...prev, content: val}))}
                   placeholder="Tulis isi konten kamu di sini..."
                   minHeight={600}
                 />
              </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ringkasan Eksekutif</label>
                <textarea rows={3} value={formData.summary || ''} onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({...prev, summary: val}));
                }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-5 px-8 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 sticky top-24">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Media Interaktif (Embed/Flourish/Video)</label>
                <input type="text" value={formData.media_url || ''} onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({...prev, media_url: val}));
                }} placeholder="Paste link Flourish/Video..." className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold" />
                {formData.media_url && (
                  <div className={`rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 ${mediaId || isVideoMedia || formData.media_url.trim().startsWith('<iframe') || formData.media_url.startsWith('http') ? 'aspect-video' : 'aspect-video flex items-center justify-center'}`}>
                    {(() => {
                      const url = formData.media_url.trim();
                      if (url.startsWith('<iframe')) {
                        return <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: url }} />;
                      }
                      if (mediaId) {
                        return (
                          <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none">
                              <iframe 
                                src={`https://public.flourish.studio/visualisation/${mediaId}/embed?auto=1`} 
                                className="w-full h-full border-0" 
                                scrolling="no" 
                              />
                            </div>
                          </div>
                        );
                      }
                      if (isVideoMedia) {
                        return <video src={formData.media_url} className="w-full h-full object-cover" muted autoPlay loop />;
                      }
                      if (url.startsWith('http')) {
                        return <iframe src={url} className="w-full h-full border-0" loading="lazy" />;
                      }
                      return null;
                    })()}
                  </div>
                )}
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gambar Sampul *</label>
                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center border-slate-200 dark:border-slate-800">
                   {formData.thumbnail_url || formData.image || formData.image_url ? (
                     <>
                        <SafeImage src={formData.thumbnail_url || formData.image || formData.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                           <input type="file" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                           <button type="button" className="p-3 bg-white rounded-xl text-[10px] font-black uppercase">Ganti Gambar</button>
                        </div>
                     </>
                   ) : (
                     <div className="relative w-full h-full flex flex-col items-center justify-center"><input type="file" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer" /><ImageIcon size={30} className="text-slate-300 mb-1" /><p className="text-[9px] font-black text-slate-400 uppercase">{uploading ? 'MEMPROSES...' : 'UPLOAD GAMBAR'}</p></div>
                   )}
                </div>
             </div>

             <div className="pt-8 border-t dark:border-slate-800 flex flex-col gap-3">
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all">{loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} SIMPAN KONTEN</button>
                <button type="button" onClick={onCancel} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">BATAL</button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditor;
