import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Briefcase, Calendar, FileText, BarChart3, Globe, Instagram, Twitter, Linkedin, Facebook, Eye, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Article, Statistic } from '../../types';
import SafeImage from '../Common/SafeImage';
import ProfileAvatar from '../Common/ProfileAvatar';
import { fetchArticles, fetchStatistics, fetchPortfolios } from '../../services/portfolioService';

const AuthorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Statistic[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [activeTab, setActiveTab] = useState<'Semua' | 'Artikel' | 'Statistik' | 'Portfolio'>('Semua');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadAuthorData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Ambil data profil (Pastikan RLS di Supabase mengizinkan pencarian publik pada tabel profiles)
        const { data: profileData, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (pError) {
           console.error('Profile fetch error:', pError);
           throw pError;
        }
        setProfile(profileData);

        // Fetch articles & stats filter by author id
        const [allArt, allStat, allPort] = await Promise.all([
          fetchArticles(),
          fetchStatistics(),
          fetchPortfolios()
        ]);

        const userArts = allArt.filter((a: any) => a.user_id === id);
        const userStats = allStat.filter((s: any) => s.user_id === id);
        const userPorts = allPort.filter((p: any) => p.user_id === id);

        // Get Views Count
        const { data: viewsData } = await supabase.from('page_views').select('page_id');
        const counts: Record<string, number> = {};
        viewsData?.forEach((v: any) => {
          counts[v.page_id] = (counts[v.page_id] || 0) + 1;
        });
        setViewCounts(counts);

        setArticles(userArts.map(a => ({...a, views: counts[a.slug] || counts[a.id] || 0})));
        setStats(userStats.map(s => ({...s, views: counts[s.id] || 0})));
        setProjects(userPorts);
      } catch (err) {
        console.error('Error loading author:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAuthorData();
  }, [id]);

  const combinedContent = [
    ...articles.map(a => ({...a, type: 'Artikel'})), 
    ...stats.map(s => ({...s, type: 'Statistik'})),
    ...projects.map(p => ({...p, type: 'Portfolio', thumbnail_url: p.image}))
  ].filter(item => {
    if (activeTab === 'Semua') return true;
    return item.type === activeTab;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalViews = combinedContent.reduce((acc, curr) => acc + (curr.views || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#020617] p-6 text-center">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Profil Tidak Ditemukan</h1>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Beranda</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pt-32 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 font-black text-[10px] mb-12 hover:text-primary transition-all uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* LEFT SIDEBAR: PROFILE CARD */}
          <div className="lg:w-1/3 xl:w-1/4">
             <div className="sticky top-32">
                <div className="bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                   <div className="h-28 bg-primary/10" />
                   <div className="px-8 pb-10 -mt-14 flex flex-col items-center text-center">
                      <ProfileAvatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Profil'}
                        className="mb-6 h-28 w-28 rounded-3xl border-4 border-white shadow-2xl dark:border-slate-900"
                        iconSize={48}
                      />
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{profile.full_name}</h1>
                      <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full">{profile.job || 'Contributor'}</p>

                      <div className="w-full mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                         <div className="bg-primary/5 rounded-2xl py-4 px-4 text-center">
                            <span className="text-xl font-black text-primary block">{articles.length + stats.length + projects.length}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Konten</span>
                         </div>
                         <div className="bg-primary/5 rounded-2xl py-4 px-4 text-center">
                            <span className="text-xl font-black text-primary block">{totalViews.toLocaleString()}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Views</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-800/50 p-8 space-y-8">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Tentang :</h4>
                         <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                           "{profile.bio || 'Membangun insight berharga melalui visualisasi data dan analisis mendalam.'}"
                         </p>
                      </div>

                      <div className="pt-8 border-t border-slate-200 dark:border-slate-700 space-y-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ikuti :</p>
                          <div className="flex flex-wrap justify-center gap-3">
                            {profile.instagram_url && (
                              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm">
                                <Instagram size={16} />
                              </a>
                            )}
                            {profile.twitter_url && (
                              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm">
                                <Twitter size={16} />
                              </a>
                            )}
                            {profile.linkedin_url && (
                              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm">
                                <Linkedin size={16} />
                              </a>
                            )}
                            {!profile.instagram_url && !profile.twitter_url && !profile.linkedin_url && (
                              <p className="text-[8px] font-black text-slate-300 italic">Sosial media belum ditautkan</p>
                            )}
                          </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT CONTENT: FILTER & LIST */}
          <div className="lg:w-2/3 xl:w-3/4 space-y-12">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-slate-900 dark:border-white pb-8 uppercase italic font-black">
                <h2 className="text-4xl text-slate-900 dark:text-white tracking-tighter">Konten:</h2>
                
                <div className="relative min-w-[200px]">
                   <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:border-primary transition-all not-italic"
                   >
                     {activeTab} <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                   </button>

                   <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden not-italic"
                      >
                         {['Semua', 'Artikel', 'Statistik', 'Portfolio'].map((tab) => (
                           <button 
                            key={tab}
                            onClick={() => { setActiveTab(tab as any); setIsFilterOpen(false); }}
                            className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-500'}`}
                           >
                             {tab}
                           </button>
                         ))}
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-12">
                {combinedContent.map((item: any, idx) => (
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={item.id}
                    onClick={() => {
                        if (item.type === 'Artikel') navigate(`/articles/${item.slug}`);
                        else if (item.type === 'Statistik') navigate(`/statistik/${item.id}`);
                        // Portfolio logic could trigger modal or navigate if we had a dedicated page
                    }}
                    className="flex flex-col md:flex-row gap-8 lg:gap-12 group cursor-pointer border-b border-slate-100 dark:border-slate-800 pb-12 last:border-0"
                   >
                     <div className="w-full md:w-64 lg:w-80 aspect-video md:aspect-4/3 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 shrink-0 shadow-lg group-hover:shadow-primary/10 transition-all">
                        <SafeImage src={item.thumbnail_url || item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     </div>
                     <div className="flex-1 space-y-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.type === 'Artikel' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>{item.type}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors uppercase italic">
                           {item.title}
                        </h3>
                        <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(item.created_at).toLocaleDateString()}</div>
                           <div className="flex items-center gap-2"><Eye size={14} className="text-primary" /> {(item.views || 0).toLocaleString()} VIEWS</div>
                        </div>
                     </div>
                   </motion.div>
                ))}
                
                {combinedContent.length === 0 && (
                  <div className="py-32 text-center">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Belum ada {activeTab === 'Semua' ? 'konten' : activeTab} untuk penulis ini.</p>
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
