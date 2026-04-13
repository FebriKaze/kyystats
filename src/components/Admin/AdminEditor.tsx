import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, X, Eye, Image as ImageIcon, Check, Loader2, ArrowLeft, 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, 
  Type, Heading1, Heading2, Heading3, 
  Instagram, Twitter, Youtube, Facebook,
  FileImage, Upload, BarChart3, Play
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../../lib/supabase';
import { showToast } from '../Common/Toast';
import SafeImage from '../Common/SafeImage';
import ChartEditor from './ChartEditor';

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
  const [inlineUploading, setInlineUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [chartData, setChartData] = useState<any>(item.chart_data || null);
  const [showChartEditor, setShowChartEditor] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);

  const existingCategories = [
    'Ekonomi', 'Sosial', 'Politik', 'Kesehatan', 'Pendidikan',
    'Teknologi', 'Lingkungan', 'Infrastruktur', 'Keuangan', 'Budaya'
  ];

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

  const handleChartUpdate = (chartInfo: any) => setChartData(chartInfo);

  const insertMarkdown = (field: string, before: string, after: string = '') => {
    const text = (formData as any)[field] || '';
    const newVal = before + text + after;
    setFormData({ ...formData, [field]: newVal });
  };

  const handleInlineImageUpload = async (event: any) => {
    try {
      setInlineUploading(true);
      if (!event.target.files?.[0]) return;
      const file = event.target.files[0];
      const fileName = `inline-${Math.random()}.${file.name.split('.').pop()}`;
      const bucket = type === 'portfolio' || type === 'featured' ? 'portfolio-images' : 'article-images';
      await supabase.storage.from(bucket).upload(`inline/${fileName}`, file);
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(`inline/${fileName}`);
      insertMarkdown('content', `\n![Image](${publicUrl})\n`, '');
    } catch (err: any) { showToast('error', err.message); } finally { setInlineUploading(false); }
  };

  const uploadCoverImage = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files?.[0]) return;
      const file = event.target.files[0];
      const fileName = `cover-${Math.random()}.${file.name.split('.').pop()}`;
      const bucket = type === 'portfolio' || type === 'featured' ? 'portfolio-images' : 'article-images';
      const { data, error } = await supabase.storage.from(bucket).upload(`covers/${fileName}`, file);
      if (error) {
        console.error('Storage Upload Error:', error);
        throw error;
      }
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(`covers/${fileName}`);
      console.log('Upload Success - Public URL:', publicUrl);
      if (type === 'articles') setFormData(prev => ({...prev, thumbnail_url: publicUrl}));
      else if (type === 'portfolio') setFormData(prev => ({...prev, image: publicUrl}));
      else setFormData(prev => ({...prev, image_url: publicUrl}));
      showToast('success', 'Gambar berhasil diunggah!');
    } catch (err: any) { showToast('error', err.message); } finally { setUploading(false); }
  };

  const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

  const mediaId = formData.media_url?.match(/visualisation\/(\d+)/)?.[1];
  const isVideoMedia = /\.(mp4|webm|ogg|mov)$/i.test(formData.media_url || '');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">{item.id ? 'Edit' : 'Tambah'} {type}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400">Judul Konten *</label>
                <input required value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value, slug: (!item.id || !formData.slug) ? slugify(e.target.value) : formData.slug})} placeholder="Masukkan judul..." className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-5 px-8 text-base dark:text-white font-bold focus:border-primary transition-all" />
             </div>

             <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Teks Intro (Di Atas Media)</label>
                     <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm">
                         <button type="button" onClick={() => insertMarkdown('intro_text', '# ')} className="p-1.5 hover:bg-primary/10 rounded-lg transition-all text-slate-400 hover:text-primary"><Heading2 size={16} /></button>
                         <button type="button" onClick={() => insertMarkdown('intro_text', '**', '**')} className="p-1.5 hover:bg-primary/10 rounded-lg transition-all text-slate-400 hover:text-primary"><Bold size={16} /></button>
                         <button type="button" onClick={() => insertMarkdown('intro_text', '_', '_')} className="p-1.5 hover:bg-primary/10 rounded-lg transition-all text-slate-400 hover:text-primary"><Italic size={16} /></button>
                     </div>
                 </div>
                 <textarea 
                     value={formData.intro_text || ''} 
                     onChange={(e) => setFormData({...formData, intro_text: e.target.value})}
                     placeholder="Tambahkan teks pengantar di sini (heading, bold, italic)..."
                     rows={3}
                     className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                 />
             </div>
             
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400">Badan Konten *</label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => insertMarkdown('content', '# ', '')} className="p-2 text-slate-400 hover:text-primary transition-all"><Heading1 size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('content', '## ', '')} className="p-2 text-slate-400 hover:text-primary transition-all"><Heading2 size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('content', '**', '**')} className="p-2 text-slate-400 hover:text-primary transition-all"><Bold size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('content', '_', '_')} className="p-2 text-slate-400 hover:text-primary transition-all"><Italic size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('content', '\n- ', '')} className="p-2 text-slate-400 hover:text-primary transition-all"><List size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('content', '\n1. ', '')} className="p-2 text-slate-400 hover:text-primary transition-all"><ListOrdered size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('content', '[', '](url)')} className="p-2 text-slate-400 hover:text-primary transition-all"><LinkIcon size={18} /></button>
                    <button type="button" onClick={() => contentFileRef.current?.click()} className="p-2 text-slate-400 hover:text-primary transition-all"><Upload size={18} /></button>
                    <input type="file" ref={contentFileRef} onChange={handleInlineImageUpload} className="hidden" accept="image/*" />
                    <div className="flex-1"></div>
                    <button type="button" onClick={() => setIsPreview(!isPreview)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all ${isPreview ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-900 border text-slate-500'}`}>{isPreview ? 'EDITOR' : 'PRATINJAU'}</button>
                  </div>
                  {isPreview ? (
                    <div className="w-full min-h-100 bg-white dark:bg-slate-950 py-12 px-14 prose dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content || '*Kosong*'}</ReactMarkdown></div>
                  ) : (
                    <textarea ref={textareaRef} required rows={15} value={formData.content || ''} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full bg-transparent py-10 px-12 text-sm dark:text-white focus:outline-none font-mono min-h-100" />
                  )}
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400">Ringkasan Eksekutif</label>
                <textarea rows={3} value={formData.summary || ''} onChange={(e) => setFormData({...formData, summary: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-5 px-8 text-sm dark:text-white" />
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 sticky top-24">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400">Media Interaktif (Embed/Flourish/Video)</label>
                <input type="text" value={formData.media_url || ''} onChange={(e) => setFormData({...formData, media_url: e.target.value})} placeholder="Paste link Flourish/Video..." className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold" />
                {formData.media_url && (
                  <div className={`rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 ${mediaId ? 'min-h-[300px]' : 'aspect-video'}`}>
                    {mediaId ? (
                      <iframe src={`https://public.flourish.studio/visualisation/${mediaId}/embed?auto=1`} className="w-full h-full border-0 absolute inset-0" scrolling="no" />
                    ) : isVideoMedia ? (
                      <video src={formData.media_url} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : null}
                  </div>
                )}
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400">Gambar Sampul (Thumbnail List Article) *</label>
                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                   {formData.thumbnail_url ? (
                     <>
                        <SafeImage src={formData.thumbnail_url} className="w-full h-full object-cover" />
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

             <div className="pt-8 border-t flex flex-col gap-3">
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3">{loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} SIMPAN KONTEN</button>
                <button type="button" onClick={onCancel} className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase">BATAL</button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditor;
