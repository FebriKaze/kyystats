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
      showToast('error', 'Failed to save: ' + err.message);
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
      showToast('success', 'Image uploaded successfully!');
    } catch (err: any) { showToast('error', err.message); } finally { setUploading(false); }
  };

  const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

  const mediaId = formData.media_url?.match(/visualisation\/(\d+)/)?.[1] || formData.media_url?.match(/id=(\d+)/)?.[1];
  const isVideoMedia = /\.(mp4|webm|ogg|mov)$/i.test(formData.media_url || '');

  return (
    <div className="space-y-8 pb-20 font-sans text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6 font-sans">
        <div className="flex items-center gap-4 font-sans">
          <button type="button" onClick={onCancel} className="p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"><ArrowLeft size={20} /></button>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 uppercase">{item.id ? 'Edit' : 'Add'} {type}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        <div className="lg:col-span-2 space-y-6 font-sans">
          <div className="bg-white p-8 rounded-none border border-slate-200 shadow-sm space-y-8 font-sans">
             <div className="space-y-2 font-sans">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Content Title *</label>
                <input required value={formData.title || ''} onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    title: newTitle, 
                    slug: (!item.id || !prev.slug) ? slugify(newTitle) : prev.slug
                  }));
                }} placeholder="Enter title..." className="w-full bg-slate-50 border border-slate-200 rounded-none py-3.5 px-4 text-base text-slate-900 font-bold focus:outline-none focus:border-[#0d2137] transition-colors" />
             </div>

             <div className="space-y-2 font-sans">
                  <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Intro Text (Above Media)</label>
                  <RichTextEditor 
                     id={`intro-${item.id || 'new'}`}
                     value={formData.intro_text || ''} 
                     onChange={(val) => setFormData(prev => ({...prev, intro_text: val}))}
                     placeholder="Intro text..."
                     minHeight={200}
                  />
              </div>
              
              <div className="space-y-2 font-sans">
                 <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Content Body *</label>
                 <RichTextEditor 
                   id={`content-${item.id || 'new'}`}
                   value={formData.content || ''} 
                   onChange={(val) => setFormData(prev => ({...prev, content: val}))}
                   placeholder="Write your content here..."
                   minHeight={600}
                 />
              </div>

             <div className="space-y-2 font-sans">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Executive Summary</label>
                <textarea rows={3} value={formData.summary || ''} onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({...prev, summary: val}));
                }} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-[#0d2137] transition-colors" />
             </div>
          </div>
        </div>

        <div className="space-y-8 font-sans">
          <div className="bg-white p-8 rounded-none border border-slate-200 shadow-sm space-y-8 sticky top-24 font-sans">
             <div className="space-y-2 font-sans">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Interactive Media (Embed/Flourish/Video)</label>
                <input type="text" value={formData.media_url || ''} onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({...prev, media_url: val}));
                }} placeholder="Paste Flourish embed URL or video link..." className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d2137]" />
                {formData.media_url && (
                  <div className={`rounded-none overflow-hidden relative border border-slate-200 bg-slate-50 ${mediaId || isVideoMedia || formData.media_url.trim().startsWith('<iframe') || formData.media_url.startsWith('http') ? 'aspect-video' : 'aspect-video flex items-center justify-center'}`}>
                    {(() => {
                      const url = formData.media_url.trim();
                      if (url.startsWith('<iframe')) {
                        return <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: url }} />;
                      }
                      if (mediaId) {
                        return (
                          <div className="absolute inset-0 w-full h-full overflow-hidden bg-white font-sans">
                            <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none font-sans">
                              <iframe 
                                src={`https://flo.uri.sh/visualisation/${mediaId}/embed?auto=1`} 
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

             <div className="space-y-2 font-sans">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Cover Image *</label>
                <div className="relative aspect-video rounded-none overflow-hidden border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center font-sans">
                   {formData.thumbnail_url || formData.image || formData.image_url ? (
                     <>
                        <SafeImage src={formData.thumbnail_url || formData.image || formData.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center font-sans">
                           <input type="file" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer font-sans" />
                           <button type="button" className="px-4 py-2 bg-white rounded-none text-xs font-bold uppercase text-slate-900 border border-slate-200 shadow-sm">Change Image</button>
                        </div>
                     </>
                   ) : (
                     <div className="relative w-full h-full flex flex-col items-center justify-center font-sans">
                       <input type="file" onChange={uploadCoverImage} className="absolute inset-0 opacity-0 cursor-pointer font-sans" />
                       <ImageIcon size={32} className="text-slate-400 mb-2" />
                       <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{uploading ? 'PROCESSING...' : 'UPLOAD IMAGE'}</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="pt-6 border-t border-slate-200 flex flex-col gap-3 font-sans">
                <button type="submit" disabled={loading} className="w-full bg-[#0d2137] text-white py-3.5 rounded-none font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors border border-[#0d2137]">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} SAVE CONTENT
                </button>
                <button type="button" onClick={onCancel} className="w-full bg-slate-100 text-slate-700 py-3 rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors border border-slate-200">
                  CANCEL
                </button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditor;
