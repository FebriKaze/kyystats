import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Briefcase, Calendar, FileText, BarChart3, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Article, Statistic } from '../../types';
import SafeImage from '../Common/SafeImage';
import ProfileAvatar from '../Common/ProfileAvatar';
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
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Fetch their content
        const [allArt, allStat] = await Promise.all([
          fetchArticles(),
          fetchStatistics()
        ]);

        // Filter contents by user_id
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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 text-center">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Profil Tidak Ditemukan</h1>
      <button onClick={() => navigate('/')} className="text-primary font-bold hover:underline">Kembali ke Beranda</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 font-bold text-xs mb-10 hover:text-primary transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              
              <div className="flex flex-col items-center text-center">
                <ProfileAvatar
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Penulis'}
                  className="mb-6 h-32 w-32 rounded-full border-4 border-slate-50 shadow-xl dark:border-slate-800"
                  iconSize={52}
                />
                
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">
                  {profile.full_name}
                </h1>
                <p className="text-sm font-bold text-primary mb-6 uppercase tracking-widest">
                  {profile.job || 'Contributor'}
                </p>

                <div className="w-full space-y-4 text-left border-t border-slate-100 dark:border-slate-800 pt-8">
                  {profile.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "{profile.bio}"
                    </p>
                  )}
                  
                  <div className="space-y-3 pt-4">
                    {profile.city && (
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <MapPin size={14} className="text-primary" /> {profile.city}
                      </div>
                    )}
                    {profile.work_field && (
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Briefcase size={14} className="text-primary" /> {profile.work_field}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <Mail size={14} className="text-primary" /> {profile.email || 'Private'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{articles.length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Artikel</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stats.length}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Statistik</div>
              </div>
            </div>
          </div>

          {/* Content Lists */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <FileText size={18} className="text-primary" /> Artikel Terbaru
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.length > 0 ? articles.map((art) => (
                  <motion.div 
                    key={art.id}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/articles/${art.slug}`)}
                    className="bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <SafeImage src={art.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">{art.category}</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter line-clamp-2 mt-2 group-hover:text-primary transition-colors">
                        {art.title}
                      </h3>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-2 py-10 text-center text-slate-400 font-bold text-sm bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    Belum ada artikel yang diterbitkan.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <BarChart3 size={18} className="text-primary" /> Analisis Statistik
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.length > 0 ? stats.map((s) => (
                  <motion.div 
                    key={s.id}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/statistik/${s.id}`)}
                    className="bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer group"
                  >
                    <div className="aspect-video overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <SafeImage src={s.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">{s.category}</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter line-clamp-2 mt-2 group-hover:text-primary transition-colors">
                        {s.title}
                      </h3>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-2 py-10 text-center text-slate-400 font-bold text-sm bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    Belum ada statistik yang diunggah.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
