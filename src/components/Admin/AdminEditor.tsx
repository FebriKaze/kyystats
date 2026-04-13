import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, X, Eye, Image as ImageIcon, Check, Loader2, ArrowLeft, 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, 
  Type, Heading1, Heading2, Heading3, 
  Instagram, Twitter, Youtube, Facebook,
  FileImage, Upload, BarChart3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../../lib/supabase';
import { showToast } from '../Common/Toast';
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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);

  const existingCategories = [
    'Ekonomi', 'Sosial', 'Politik', 'Kesehatan', 'Pendidikan',
    'Teknologi', 'Lingkungan', 'Infrastruktur', 'Keuangan', 'Budaya'
  ];

  useEffect(() => {
    if (formData.category && !existingCategories.includes(formData.category)) {
      setIsCustomCategory(true);
    }
  }, [formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) formData.user_id = user.id;
      }
      
      const cleanedData = { ...formData };
      delete cleanedData.image;
      delete cleanedData.image_url;

      if (type === 'articles') {
        delete cleanedData.chart_data;
        delete cleanedData.impact_val;
        delete cleanedData.impact_desc;
        delete cleanedData.tags;
      }
      
      const dataToSave = {
        ...cleanedData,
        ...(type === 'statistics' ? { chart_data: chartData } : {})
      };
      
      await onSave(dataToSave);
    } finally {
      setLoading(false);
    }
  };

  const handleChartUpdate = (chartInfo: any) => setChartData(chartInfo);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = type === 'portfolio' ? formData.details?.challenge : formData.content || '';
    const newVal = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end);
    if (type === 'portfolio') setFormData({...formData, details: {...formData.details, challenge: newVal}});
    else setFormData({...formData, content: newVal});
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleInlineImageUpload = async (event: any) => {
    try {
      setInlineUploading(true);
      if (!event.target.files?.[0]) return;
      const file = event.target.files[0];
      const fileName = `inline-${Math.random()}.${file.name.split('.').pop()}`;
      const bucket = type === 'portfolio' || type === 'featured' ? 'portfolio-images' : 'article-images';
      const { error } = await supabase.storage.from(bucket).upload(`inline/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(`inline/${fileName}`);
      insertMarkdown(`\n![Image](${publicUrl})\n`, '');
    } catch (err: any) { showToast('error', err.message); } finally { setInlineUploading(false); }
  };

  const uploadCoverImage = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files?.[0]) return;
      const file = event.target.files[0];
      const fileName = `cover-${Math.random()}.${file.name.split('.').pop()}`;
      const bucket = type === 'portfolio' || type === 'featured' ? 'portfolio-images' : 'article-images';
      const { error } = await supabase.storage.from(bucket).upload(`covers/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(`covers/${fileName}`);
      if (type === 'articles') setFormData({...formData, thumbnail_url: publicUrl});
      else if (type === 'portfolio') setFormData({...formData, image: publicUrl});
      else setFormData({...formData, image_url: publicUrl});
    } catch (err: any) { showToast('error', err.message); } finally { setUploading(false); }
  };

  const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

  const flourishId = formData.thumbnail_url?.match(/visualisation\/(\d+)/)?.[1];
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(formData.thumbnail_url || '');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">{item.id ? 'Edit' : 'Tambah'} {type}</h1>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Dashboard / Konten / {type}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Judul Konten *</label>
                <input required value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value, slug: (!item.id || !formData.slug) ? slugify(e.target.value) : formData.slug})} placeholder="Masukkan judul..." className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 rounded-2xl py-5 px-8 text-base dark:text-white font-bold" />
             </div>
             
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slug Otomatis *</label>
                <input required value={formData.slug || ''} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-4 px-8 text-sm dark:text-white font-mono" />
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Badan Konten *</label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => insertMarkdown('# ', '')} className="p-2"><Heading1 size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('## ', '')} className="p-2"><Heading2 size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('### ', '')} className="p-2"><Heading3 size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2"><Bold size={18} /></button>
                    <button type="button" onClick={() => insertMarkdown('_', '_')} className="p-2"><Italic size={18} /></button>
                    <button type="button" onClick={() => contentFileRef.current?.click()} className="p-2"><Upload size={18} /></button>
                    <input type="file" ref={contentFileRef} onChange={handleInlineImageUpload} className="hidden" accept="image/*" />
                    <div className="flex-1"></div>
                    <button type="button" onClick={() => setIsPreview(!isPreview)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest ${isPreview ? 'bg-primary text-white' : 'bg-white border'}`}>{isPreview ? 'EDITOR' : 'PRATINJAU'}</button>
                  </div>
                  {isPreview ? (
                    <div className="w-full min-h-100 bg-white dark:bg-slate-950 py-12 px-14 prose prose-slate dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content || '*Kosong*'}</ReactMarkdown></div>
                  ) : (
                    <textarea ref={textareaRef} required rows={20} value={formData.content || ''} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full bg-transparent py-10 px-12 text-sm dark:text-white focus:outline-none font-mono min-h-100" />
                  )}
                </div>
             </div>

             {type === 'statistics' && (
               <div className="space-y-6">
                 <button type="button" onClick={() => setShowChartEditor(!showChartEditor)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><BarChart3 size={16} /> <span className="text-sm font-medium">{showChartEditor ? 'Sembunyikan' : 'Tampilkan'} Chart</span></button>
                 {showChartEditor && <ChartEditor onChartUpdate={handleChartUpdate} initialData={chartData?.data || []} initialLayout={chartData?.chartLayout || 'auto'} initialType={chartData?.chartType || 'bar'} />}
               </div>
             )}

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ringkasan Eksekutif</label>
                <textarea rows={3} value={formData.summary || ''} onChange={(e) => setFormData({...formData, summary: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-5 px-8 text-sm dark:text-white" />
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 sticky top-24">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kategori</label>
                <select value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold">
                  <option value="">Pilih Kategori</option>
                  {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</label>
                <select value={formData.is_published ? 'Published' : 'Draft'} onChange={(e) => setFormData({...formData, is_published: e.target.value === 'Published'})} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-black">
                  <option value="Draft">Draft</option>
                  <option value="Published">Diterbitkan</option>
                </select>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between"><label className="text-[10px] font-black uppercase text-slate-400">Sampul Utama</label><span className="text-[8px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">BISA PASTE LINK FLOURISH</span></div>
                <input type="text" value={formData.thumbnail_url || ''} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})} placeholder="Paste link Flourish/Video/Image..." className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold" />
                <div className={`rounded-3xl border-2 border-dashed bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative shadow-inner ${flourishId ? 'min-h-[450px]' : 'aspect-16/10'}`}>
                   {formData.thumbnail_url ? (
                     <>
                        {flourishId ? (
                          <iframe src={`https://public.flourish.studio/visualisation/${flourishId}/embed?auto=1`} className="w-full h-full border-0 absolute inset-0" scrolling="no" />
                        ) : isVideo ? (
                          <video src={formData.thumbnail_url} className="w-full h-full object-cover" muted autoPlay loop />
                        ) : (
                          <img src={formData.thumbnail_url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                           <input type="file" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                           <button type="button" className="p-4 bg-white rounded-2xl text-[10px] font-black uppercase">Ganti Gambar</button>
                        </div>
                     </>
                   ) : (
                     <div className="relative w-full h-full flex flex-col items-center justify-center"><input type="file" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer" /><ImageIcon size={40} className="text-slate-300 mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase text-center">{uploading ? 'MEMPROSES...' : 'UPLOAD ATAU PASTE LINK'}</p></div>
                   )}
                </div>
             </div>

             <div className="pt-8 border-t flex flex-col gap-3">
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3">{loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} DITERBITKAN SEKARANG</button>
                <button type="button" onClick={onCancel} className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase">BATALKAN</button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditor;
