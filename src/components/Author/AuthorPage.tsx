import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Calendar, Twitter, Instagram, Linkedin, Image as ImageIcon, BarChart3, Eye } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'All' | 'Articles' | 'Data' | 'Portfolio'>('All');

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
    ...articles.map(a => ({...a, type: 'Articles'})), 
    ...stats.map(s => ({...s, type: 'Data'})),
    ...projects.map(p => ({...p, type: 'Portfolio', thumbnail_url: p.image}))
  ].filter(item => {
    if (activeTab === 'All') return true;
    return item.type === activeTab;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalViews = combinedContent.reduce((acc, curr) => acc + (curr.views || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-8 h-8 border-2 border-[#0d2137] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 text-center">
      <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">Profil Tidak Ditemukan</h1>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#0d2137] text-white text-sm font-bold">Beranda</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 text-sm mb-8 hover:text-[#0d2137] dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: Profile Card */}
          <div className="lg:w-72 xl:w-64 shrink-0">
             <div className="sticky top-28">
                {/* Header navy strip */}
                <div className="bg-[#0d2137] h-20 flex items-end px-6 pb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Author Profile</span>
                </div>
                <div className="border border-t-0 border-slate-200 dark:border-slate-800 p-6">
                   <div className="-mt-10 mb-4">
                     <ProfileAvatar
                       src={profile.avatar_url}
                       alt={profile.full_name || 'Profil'}
                       className="h-20 w-20 border-4 border-white dark:border-slate-950 shadow-md"
                       iconSize={36}
                     />
                   </div>
                   <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{profile.full_name}</h1>
                   <p className="text-[10px] font-black text-[#c0392b] mt-1 uppercase tracking-widest">{profile.job || 'Contributor'}</p>

                   <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                      <div className="border border-slate-200 py-3 px-3 text-center">
                         <span className="text-xl font-bold text-[#0d2137] block">{articles.length + stats.length + projects.length}</span>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Content</span>
                      </div>
                      <div className="border border-slate-200 py-3 px-3 text-center">
                         <span className="text-xl font-bold text-[#0d2137] block">{totalViews.toLocaleString()}</span>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Views</span>
                      </div>
                   </div>
                </div>

                <div className="border border-t-0 border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900 space-y-5">
                   <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">About</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {profile.bio || 'Membangun insight berharga melalui visualisasi data dan analisis mendalam.'}
                      </p>
                   </div>

                   <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Follow</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.instagram_url && (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#0d2137] hover:border-slate-400 transition-colors">
                            <Instagram size={15} />
                          </a>
                        )}
                        {profile.twitter_url && (
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#0d2137] hover:border-slate-400 transition-colors">
                            <Twitter size={15} />
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#0d2137] hover:border-slate-400 transition-colors">
                            <Linkedin size={15} />
                          </a>
                        )}
                        {!profile.instagram_url && !profile.twitter_url && !profile.linkedin_url && (
                          <p className="text-[9px] text-slate-400">No social media linked</p>
                        )}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT: Content filter + list */}
          <div className="flex-1 space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-white pb-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900">Content</h2>
                
                {/* Filter tabs */}
                <div className="flex items-center gap-1">
                  {(['All', 'Articles', 'Data', 'Portfolio'] as const).map((tab) => (
                    <button
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`text-xs font-bold px-3 py-1.5 border transition-colors ${
                       activeTab === tab
                         ? 'bg-[#0d2137] text-white border-[#0d2137]'
                         : 'text-slate-600 border-slate-200 hover:border-slate-400'
                     }`}
                    >
                      {tab}
                    </button>
                  ))}
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
                        if (item.type === 'Articles') navigate(`/articles/${item.slug}`);
                        else if (item.type === 'Data') navigate(`/data/${item.slug || item.id}`);
                        else if (item.type === 'Portfolio') navigate(`/portfolio/${item.slug || item.id}`);
                    }}
                    className="flex flex-col md:flex-row gap-8 lg:gap-12 group cursor-pointer border-b border-slate-200 pb-12 last:border-0"
                   >
                     <div className="w-full md:w-64 lg:w-80 aspect-video md:aspect-4/3 rounded-none overflow-hidden border border-slate-200 shrink-0 shadow-sm group-hover:border-[#0d2137] transition-all relative flex items-center justify-center bg-slate-50">
                        {(() => {
                          const mediaUrl = item.media_url || item.thumbnail_url || item.image_url;
                          if (!mediaUrl) return <ImageIcon size={24} className="text-slate-300 dark:text-slate-700" />;

                          const flourishId = mediaUrl.match(/visualisation\/(\d+)/)?.[1] || mediaUrl.match(/id=(\d+)/)?.[1];
                          const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(mediaUrl);

                          if (flourishId || mediaUrl.trim().startsWith('<iframe') || mediaUrl.startsWith('http')) {
                            const isRawIframe = mediaUrl.trim().startsWith('<iframe');
                            if (!isImage) {
                              return (
                                <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
                                  <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left scale-[0.5] pointer-events-none">
                                    {isRawIframe ? (
                                      <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: mediaUrl }} />
                                    ) : (
                                      <iframe src={flourishId ? `https://flo.uri.sh/visualisation/${flourishId}/embed?auto=1` : mediaUrl} className="w-full h-full border-0" scrolling="no" />
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }

                          return <SafeImage src={mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />;
                        })()}
                     </div>
                     <div className="flex-1 space-y-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                           <span className={`px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest ${item.type === 'Articles' ? 'bg-[#0d2137] text-white' : item.type === 'Data' ? 'bg-[#c0392b] text-white' : 'bg-slate-700 text-white'}`}>{item.type}</span>
                           <span className="text-[10px] font-black text-[#c0392b] uppercase tracking-widest">{item.category}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight leading-tight group-hover:text-[#c0392b] transition-colors">
                           {item.title}
                        </h3>
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                           <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                           <div className="flex items-center gap-1.5"><Eye size={14} className="text-slate-400" /> {(item.views || 0).toLocaleString()} views</div>
                        </div>
                     </div>
                   </motion.div>
                ))}
                
                {combinedContent.length === 0 && (
                  <div className="py-32 text-center text-slate-500">
                    <p className="text-sm font-bold">No {activeTab === 'All' ? 'content' : activeTab.toLowerCase()} found for this author.</p>
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
