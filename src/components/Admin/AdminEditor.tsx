import React, { useState, useRef } from 'react';
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
  type: 'articles' | 'portfolio' | 'statistics';
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

  // Existing categories
  const existingCategories = [
    'Ekonomi',
    'Sosial', 
    'Politik',
    'Kesehatan',
    'Pendidikan',
    'Teknologi',
    'Lingkungan',
    'Infrastruktur',
    'Keuangan',
    'Budaya'
  ];

  // Check if current category is custom (not in existing list)
  React.useEffect(() => {
    if (formData.category && !existingCategories.includes(formData.category)) {
      setIsCustomCategory(true);
    }
  }, [formData.category, existingCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto-assign user_id for unassigned content
      if (!formData.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          formData.user_id = user.id;
          console.log('Auto-assigned user_id:', user.id);
        }
      }
      
      // Include chart data if available
      const dataToSave = {
        ...formData,
        chart_data: chartData
      };
      
      await onSave(dataToSave);
    } finally {
      setLoading(false);
    }
  };

  const handleChartUpdate = (chartInfo: any) => {
    setChartData(chartInfo);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = type === 'portfolio' ? formData.details?.challenge : formData.content || '';
    const selected = text.substring(start, end);
    const newVal = text.substring(0, start) + before + selected + after + text.substring(end);

    if (type === 'portfolio') {
      setFormData({...formData, details: {...formData.details, challenge: newVal}});
    } else {
      setFormData({...formData, content: newVal});
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleInlineImageUpload = async (event: any) => {
    try {
      setInlineUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `inline-${Math.random()}.${fileExt}`;
      const filePath = `inline/${fileName}`;

      const bucketName = type === 'portfolio' ? 'portfolio-images' : 'article-images';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      insertMarkdown(`\n![Image](${publicUrl})\n`, '');
      
    } catch (error: any) {
      showToast('error', 'Gagal mengupload gambar: ' + error.message);
    } finally {
      setInlineUploading(false);
      if (contentFileRef.current) contentFileRef.current.value = '';
    }
  };

  const uploadCoverImage = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const bucketName = type === 'portfolio' ? 'portfolio-images' : 'article-images';

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
      showToast('error', 'Gagal mengupload gambar sampul: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const title = item.id ? `Edit ${type === 'articles' ? 'Artikel' : type === 'portfolio' ? 'Portfolio' : 'Statistik'}` : `Tambah ${type === 'articles' ? 'Artikel' : type === 'portfolio' ? 'Portfolio' : 'Statistik'} Baru`;

  const ToolbarButton = ({ icon: Icon, onClick, title, active, loading }: any) => (
    <button 
      type="button"
      onClick={onClick}
      title={title}
      disabled={loading}
      className={`p-2 rounded-xl transition-all flex items-center justify-center ${active ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin text-primary" /> : <Icon size={18} />}
    </button>
  );

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Ganti spasi dengan -
      .replace(/[^\w-]+/g, '')   // Hapus karakter non-word
      .replace(/--+/g, '-')      // Ganti multiple - dengan satu -
      .replace(/^-+/, '')        // Hapus - di awal
      .replace(/-+$/, '');       // Hapus - di akhir
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">{title}</h1>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Dashboard / Konten / {type}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Judul Konten <span className="text-primary">*</span></label>
                <input 
                  required
                  value={formData.title || ''} 
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const newSlug = (type === 'articles' || type === 'statistics') && (!item.id || !formData.slug) ? slugify(newTitle) : formData.slug;
                    setFormData({...formData, title: newTitle, slug: newSlug});
                  }}
                  placeholder="Masukkan judul konten yang menarik..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-5 px-8 text-base dark:text-white focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-slate-300"
                />
             </div>

             {(type === 'articles' || type === 'statistics') && (
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slug Otomatis <span className="text-primary">*</span></label>
                  <input 
                    required
                    value={formData.slug || ''} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="judul-artikel-ini"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-8 text-sm dark:text-white font-mono"
                  />
               </div>
             )}

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Badan Konten <span className="text-primary">*</span></label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
                  {/* Toolbar */}
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-2">
                    <ToolbarButton icon={Heading1} onClick={() => insertMarkdown('# ', '')} title="Judul Utama" />
                    <ToolbarButton icon={Heading2} onClick={() => insertMarkdown('## ', '')} title="Sub Judul" />
                    <ToolbarButton icon={Heading3} onClick={() => insertMarkdown('### ', '')} title="Poin Penting" />
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <ToolbarButton icon={Bold} onClick={() => insertMarkdown('**', '**')} title="Teks Tebal" />
                    <ToolbarButton icon={Italic} onClick={() => insertMarkdown('_', '_')} title="Teks Miring" />
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <ToolbarButton icon={List} onClick={() => insertMarkdown('- ', '')} title="Daftar Poin" />
                    <ToolbarButton icon={ListOrdered} onClick={() => insertMarkdown('1. ', '')} title="Daftar Nomor" />
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <ToolbarButton icon={LinkIcon} onClick={() => insertMarkdown('[', '](https://)')} title="Sisipkan Link" />
                    
                    {/* Inline Image Upload Trigger */}
                    <div className="relative">
                      <ToolbarButton 
                        icon={Upload} 
                        loading={inlineUploading}
                        onClick={() => contentFileRef.current?.click()} 
                        title="Upload Gambar ke Konten" 
                      />
                      <input 
                        type="file" 
                        ref={contentFileRef} 
                        onChange={handleInlineImageUpload} 
                        className="hidden" 
                        accept="image/*" 
                      />
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <ToolbarButton icon={Youtube} onClick={() => insertMarkdown('\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID"></iframe>\n', '')} title="Embed Youtube" />
                    <div className="flex-1"></div>
                    <button 
                      type="button" 
                      onClick={() => setIsPreview(!isPreview)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all shadow-sm border ${isPreview ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:text-primary active:scale-95'}`}
                    >
                      {isPreview ? <Save size={14} /> : <Eye size={14} />} {isPreview ? 'KEMBALI KE EDITOR' : 'LIHAT PRATINJAU'}
                    </button>
                  </div>

                  {isPreview ? (
                    <div className="w-full min-h-125 bg-white dark:bg-slate-950 py-12 px-14 prose prose-slate dark:prose-invert max-w-none prose-sm md:prose-base overflow-y-auto selection:bg-primary/20">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {type === 'portfolio' ? formData.details?.challenge : formData.content || '*Konten masih kosong...*'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <textarea 
                      ref={textareaRef}
                      required
                      rows={20}
                      placeholder="Mulai menulis cerita Anda di sini..."
                      value={type === 'portfolio' ? formData.details?.challenge : formData.content || ''} 
                      onChange={(e) => {
                        if (type === 'portfolio') {
                          setFormData({...formData, details: {...formData.details, challenge: e.target.value}});
                        } else {
                          setFormData({...formData, content: e.target.value});
                        }
                      }}
                      className="w-full bg-transparent py-10 px-12 text-sm dark:text-white focus:outline-none font-mono leading-relaxed resize-y min-h-100"
                    />
                  )}
                </div>
                {!isPreview && <p className="text-[10px] text-slate-400 font-medium">✨ Gunakan tombol **Upload (Ikon Panah Atas)** untuk langsung memasukkan gambar dari galeri Anda ke dalam tulisan.</p>}
             </div>

             {/* Chart Editor Section - Only for statistics */}
             {type === 'statistics' && (
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data Visualisasi</label>
                   <button
                     type="button"
                     onClick={() => setShowChartEditor(!showChartEditor)}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                   >
                     <BarChart3 size={16} />
                     <span className="text-sm font-medium dark:text-white">
                       {showChartEditor ? 'Sembunyikan' : 'Tampilkan'} Chart
                     </span>
                   </button>
                 </div>
                 
                 {showChartEditor && (
                   <ChartEditor 
                     onChartUpdate={handleChartUpdate}
                     initialData={chartData?.data || []}
                   />
                 )}
               </div>
             )}

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ringkasan Eksekutif</label>
                <textarea 
                  rows={3}
                  placeholder="Ringkasan singkat untuk tampilan kartu di beranda..."
                  value={type === 'portfolio' ? formData.description : formData.summary || ''} 
                  onChange={(e) => setFormData({...formData, [type === 'portfolio' ? 'description' : 'summary']: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 px-8 text-sm dark:text-white resize-none"
                />
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 sticky top-24">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kategori / Topik</label>
                {!isCustomCategory ? (
                  <select
                    value={formData.category || ''}
                    onChange={(e) => {
                      if (e.target.value === 'Lainnya') {
                        setIsCustomCategory(true);
                        setFormData({...formData, category: ''});
                      } else {
                        setFormData({...formData, category: e.target.value});
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm dark:text-white font-bold"
                  >
                    <option value="">Pilih Kategori</option>
                    {existingCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="Lainnya">Lainnya</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Masukkan kategori baru..."
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm dark:text-white font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormData({...formData, category: ''});
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                )}
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Publikasi</label>
                <select 
                  value={formData.is_published ? 'Published' : 'Draft'}
                  onChange={(e) => setFormData({...formData, is_published: e.target.value === 'Published'})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm dark:text-white font-black"
                >
                  <option value="Draft">Simpan Draft</option>
                  <option value="Published">Diterbitkan Publik</option>
                </select>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gambar Sampul Utama</label>
                <div className="aspect-16/10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 overflow-hidden group relative transition-all hover:bg-slate-100 dark:hover:bg-slate-900">
                   {(formData.thumbnail_url || formData.image || formData.image_url) ? (
                     <>
                        <img src={formData.thumbnail_url || formData.image || formData.image_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <input type="file" accept="image/*" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                           <button type="button" className="p-4 bg-white rounded-2xl text-primary font-black text-[10px] uppercase shadow-2xl transition-transform active:scale-90">Ganti Gambar</button>
                        </div>
                     </>
                   ) : (
                     <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <input type="file" accept="image/*" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <ImageIcon size={40} className="text-slate-300 mb-2" />
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{uploading ? 'MEMPROSES...' : 'UPLOAD SAMPUL'}</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:-translate-y-0.5 hover:shadow-2xl transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  DITERBITKAN SEKARANG
                </button>
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  BATALKAN
                </button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditor;
