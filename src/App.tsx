import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Navbar from './components/HomePage/Navbar';
import Hero from './components/HomePage/Hero';
import Footer from './components/HomePage/Footer';
import ContactModal from './components/HomePage/ContactModal';
import CaseStudyModal from './components/HomePage/CaseStudyModal';
import Login from './components/Admin/Login';
import ResetPassword from './components/Admin/ResetPassword';
import { SpeedInsights } from "@vercel/speed-insights/react";
import AuthorPage from './components/Author/AuthorPage';
import { ToastContainer } from './components/Common/Toast';
import { Project, FeaturedProject, Article, Statistic } from './types';
import { fetchPortfolios, fetchFeaturedProjects, fetchArticles, fetchStatistics } from './services/portfolioService';
import { supabase } from './lib/supabase';

// Lazy load components
const ArticleList = lazy(() => import('./components/Articles/ArticleList'));
const ArticleDetail = lazy(() => import('./components/Articles/ArticleDetail'));
const StatistikPage = lazy(() => import('./components/Statistik/StatistikPage'));
const StatistikDetail = lazy(() => import('./components/Statistik/StatistikDetail'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const Portfolio = lazy(() => import('./components/HomePage/Portfolio'));
const ProjectArchive = lazy(() => import('./components/HomePage/ProjectArchive'));
const ImpactSnapshot = lazy(() => import('./components/HomePage/ImpactSnapshot'));

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [articleFilter, setArticleFilter] = useState('All');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });
    
    // Auth Listener for everything (Login, Recovery, Confirmation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);

      // Handle Password Recovery Event
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/admin/reset');
      }

      // Handle Email Confirmation (SIGNED_IN but might be from link)
      if (event === 'SIGNED_IN' && location.pathname.includes('error_description')) {
         console.error('Auth error from link');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setUserProfile(data);
  };

  const fetchOwnerProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'owner').maybeSingle();
    setOwnerProfile(data);
  };

  const loadData = async () => {
    const [p, f, a, s] = await Promise.all([
      fetchPortfolios(),
      fetchFeaturedProjects(),
      fetchArticles(),
      fetchStatistics()
    ]);
    setProjects(p);
    setFeaturedProjects(f);
    setArticles(a);
    setStatistics(s);
    
    // Fetch owner once
    await fetchOwnerProfile();
  };

  // Filter logic for Public Pages
  const isOwner = userProfile?.role?.toLowerCase() === 'owner';
  const currentUid = session?.user?.id;
  const ownerId = ownerProfile?.id;

  // Final filtered data for public view
  const filteredProjects = useMemo(() => {
    if (session) {
      if (isOwner) return projects;
      return projects.filter(p => (p as any).user_id === currentUid);
    }
    return projects.filter(p => (p as any).user_id === ownerId);
  }, [projects, session, isOwner, currentUid, ownerId]);

  const filteredFeatured = useMemo(() => {
    if (session) {
      if (isOwner) return featuredProjects;
      return featuredProjects.filter(f => f.user_id === currentUid);
    }
    return featuredProjects.filter(f => f.user_id === ownerId);
  }, [featuredProjects, session, isOwner, currentUid, ownerId]);

  const filteredArticles = useMemo(() => {
    if (session) {
      if (isOwner) return articles;
      return articles.filter(a => a.user_id === currentUid);
    }
    return articles.filter(a => a.user_id === ownerId);
  }, [articles, session, isOwner, currentUid, ownerId]);

  const filteredStats = useMemo(() => {
    if (session) {
      if (isOwner) return statistics;
      return statistics.filter(s => s.user_id === currentUid);
    }
    return statistics.filter(s => s.user_id === ownerId);
  }, [statistics, session, isOwner, currentUid, ownerId]);

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      {!isAdminPage && (
        <Navbar 
          onContactClick={() => setIsContactOpen(true)} 
          onNavigate={(page) => navigate(page === 'home' ? '/' : `/${page}`)}
          currentPage={location.pathname === '/' ? 'home' : location.pathname.substring(1)}
          session={session}
          userProfile={userProfile}
        />
      )}
      
      <main>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <ImpactSnapshot projects={filteredFeatured} />
                <Portfolio 
                  projects={filteredProjects} 
                  onProjectClick={(p) => setSelectedProject(p)} 
                  onBackToHome={() => navigate('/')}
                />
                <ProjectArchive 
                  projects={filteredProjects}
                  onProjectClick={(p) => setSelectedProject(p)}
                />
              </>
            } />

            <Route path="/articles" element={
              <ArticleList 
                articles={filteredArticles}
                onArticleClick={(article) => navigate(`/articles/${article.slug}`)}
                activeFilter={articleFilter}
                onFilterChange={setArticleFilter}
                searchQuery={articleSearchQuery}
                onSearchChange={setArticleSearchQuery}
              />
            } />

            <Route path="/portfolio" element={
              <div className="pt-20">
                <ImpactSnapshot projects={filteredFeatured} />
                <Portfolio 
                  projects={filteredProjects} 
                  onProjectClick={(p) => setSelectedProject(p)} 
                  onBackToHome={() => navigate('/')}
                />
                <ProjectArchive 
                  projects={filteredProjects}
                  onProjectClick={(p) => setSelectedProject(p)}
                />
              </div>
            } />

            <Route path="/articles/:slug" element={
              <ArticleDetailWrapper articles={filteredArticles} onBack={() => navigate('/articles')} onArticleClick={(article) => navigate(`/articles/${article.slug}`)} />
            } />

            <Route path="/author/:id" element={<AuthorPage />} />

            <Route path="/statistik" element={
              <StatistikPage 
                statistik={filteredStats} 
                onStatClick={(item) => navigate(`/statistik/${item.slug || item.id}`)}
              />
            } />

            <Route path="/statistik/:slug" element={
              <StatistikDetailWrapper statistics={filteredStats} />
            } />

            <Route path="/admin" element={
              session ? (
                <AdminDashboard />
              ) : (
                <Login onLoginSuccess={(s) => setSession(s)} />
              )
            } />

            {/* RESET PASSWORD ROUTE */}
            <Route path="/admin/reset" element={<ResetPassword />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPage && <Footer />}
      <SpeedInsights />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <CaseStudyModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
      <ToastContainer />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsContactOpen(true)}
        className={`fixed bottom-8 right-8 z-40 bg-primary text-white pl-6 pr-5 py-4 rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 group transition-all ${
          isAdminPage ? 'hidden' : location.pathname === '/' ? 'flex md:flex' : 'hidden md:flex'
        }`}
      >
        <span className="text-sm font-bold tracking-tight">Let's Collaborate</span>
        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
}

// WRAPPER HELPERS
function ArticleDetailWrapper({ articles, onBack, onArticleClick }: any) {
  const { slug } = useParams();
  const decodedSlug = decodeURIComponent(slug || '');
  const article = articles.find((a: any) => a.slug === decodedSlug || a.slug === slug);
  const navigate = useNavigate();
  if (!article) return (
    <div className="pt-32 flex justify-center items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading artikel...</p>
      </div>
    </div>
  );
  return (
    <ArticleDetail 
      article={article} 
      articles={articles}
      onBack={onBack}
      onArticleClick={onArticleClick}
      onFilterChange={() => {}}
      onSearchChange={() => {}}
      searchQuery=""
    />
  );
}

function StatistikDetailWrapper({ statistics }: any) {
  const { slug } = useParams();
  const decodedSlug = decodeURIComponent(slug || '');
  const statistic = statistics.find((s: any) => s.slug === decodedSlug || s.id === decodedSlug);
  const navigate = useNavigate();
  if (!statistic) return (
    <div className="pt-32 flex justify-center items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading statistik...</p>
      </div>
    </div>
  );
  return (
    <StatistikDetail 
      item={statistic} 
      allStats={statistics}
      onBack={() => navigate('/statistik')} 
      onStatClick={(s) => navigate(`/statistik/${s.slug || s.id}`)}
      onFilterChange={() => {}}
      onSearchChange={() => {}}
      searchQuery=""
    />
  );
}

export default App;
