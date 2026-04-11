import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Briefcase, Calendar, FileText, BarChart3, Globe, Instagram, Twitter, Linkedin, Facebook, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Article, Statistic } from '../../types';
import SafeImage from '../Common/SafeImage';
import { fetchArticles, fetchStatistics } from '../../services/portfolioService';

const AuthorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthorData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: profileData, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (pError) throw pError;
        if (profileData) setProfile(profileData);

        const [allArt, allStat] = await Promise.all([
          fetchArticles(),
          fetchStatistics()
        ]);

        setArticles(allArt.filter((a: any) => a.user_id === id));
        setStats(allStat.filter((s: any) => s.user_id === id));
      } catch (err) {
        console.error('Error loading author:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAuthorData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#020617] p-6 text-center">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Profil Tidak Ditemukan</h1>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Beranda</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pt-28 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 font-black text-[10px] mb-12 hover:text-primary transition-all uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT SIDEBAR: PROFILE CARD (AL-FAJRI STYLE) */}
          <div className="lg:w-1/3 xl:w-1/4">
             <div className="sticky top-32 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative">
                   {/* Top Header Section */}
                   <div className="h-24 bg-primary/10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-10 flex flex-wrap gap-2 p-2">
                        {[...Array(20)].map((_, i) => <div key={i} className="w-1 h-1 bg-primary rounded-full" />)}
                      </div>
                   </div>

                   <div className="px-8 pb-10 -mt-12 relative z-10 text-center flex flex-col items-center">
                      <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl mb-6 bg-slate-100 group">
                        <SafeImage 
                          src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=8b5cf6&color=fff&size=500&bold=true`} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
                        {profile.full_name}
                      </h1>
                      <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full inline-block">
                        {profile.job || 'Jurnalis Data'}
                      </p>

                      <div className="w-full mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-center gap-6">
                         <div className="text-center">
                            <p className="text-lg font-black dark:text-white">{articles.length + stats.length}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Konten</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-800/50 p-8 space-y-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">Tentang :</h4>
                         <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                           "{profile.bio || 'Kontributor setia KyyStats yang berfokus pada analisis data ekonomi dan sosial di Indonesia.'}"
                         </p>
                         <div className="pt-4 space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bergabung sejak :</p>
                            <p className="text-xs font-black dark:text-white uppercase tracking-tighter">
                               {new Date(profile.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ikuti :</p>
                         <div className="flex gap-3">
                            <button className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm"><Instagram size={14} /></button>
                            <button className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm"><Twitter size={14} /></button>
                            <button className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm"><Linkedin size={14} /></button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT CONTENT: ARTICLE LIST */}
          <div className="lg:w-2/3 xl:w-3/4 space-y-10">
             <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-6 mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
                  Konten : <span className="bg-primary text-white text-xs py-1 px-4 rounded-full not-italic tracking-widest font-black uppercase">Semua</span>
                </h2>
             </div>

             <div className="grid grid-cols-1 gap-8">
                {/* Combined list of articles and statistics */}
                {[...articles.map(a => ({...a, type: 'ARTIKEL'})), ...stats.map(s => ({...s, type: 'STATISTIK'}))].map((item: any, idx) => (
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.id}
                    onClick={() => navigate(item.type === 'ARTIKEL' ? `/articles/${item.slug}` : `/statistik/${item.id}`)}
                    className="flex flex-col md:flex-row gap-8 group cursor-pointer border-b border-slate-100 dark:border-slate-800 pb-10 last:border-0"
                   >
                     <div className="w-full md:w-56 lg:w-72 aspect-video md:aspect-4/3 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 shrink-0 shadow-lg shadow-slate-200 dark:shadow-none">
                        <SafeImage src={item.thumbnail_url || item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     </div>
                     <div className="flex-1 space-y-4 py-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.type}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{item.category}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors uppercase italic">
                           {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed italic">
                           {item.summary || 'Baca analisis data selengkapnya mengenai topik ini di portal KyyStats.'}
                        </p>
                        <div className="pt-4 flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <div className="flex items-center gap-2"><Calendar size={12} className="text-primary" /> {new Date(item.created_at).toLocaleDateString()}</div>
                           <div className="flex items-center gap-2"><Eye size={12} className="text-primary" /> {item.views || 0} VIEWS</div>
                        </div>
                     </div>
                   </motion.div>
                ))}
                
                {articles.length === 0 && stats.length === 0 && (
                  <div className="py-32 text-center">
                    <div className="text-slate-300 dark:text-slate-700 mb-6">
                      <FileText size={64} className="mx-auto" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Belum ada konten yang diterbitkan oleh penulis ini.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
