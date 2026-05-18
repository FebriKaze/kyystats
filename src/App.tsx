import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from './components/HomePage/Navbar';
import Hero from './components/HomePage/Hero';
import Footer from './components/HomePage/Footer';
import Login from './components/Admin/Login';
import ResetPassword from './components/Admin/ResetPassword';
import { SpeedInsights } from "@vercel/speed-insights/react";
import AuthorPage from './components/Author/AuthorPage';
import { ToastContainer } from './components/Common/Toast';
import { Project, FeaturedProject, Article, Statistic } from './types';
import { fetchPortfolios, fetchFeaturedProjects, fetchArticles, fetchStatistics } from './services/portfolioService';
import { supabase } from './lib/supabase';

// Lazy load components
const AboutPage = lazy(() => import('./components/About/AboutPage'));
const ArticleList = lazy(() => import('./components/Articles/ArticleList'));
const ArticleDetail = lazy(() => import('./components/Articles/ArticleDetail'));
const StatistikPage = lazy(() => import('./components/Statistik/StatistikPage'));
const StatistikDetail = lazy(() => import('./components/Statistik/StatistikDetail'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const Portfolio = lazy(() => import('./components/HomePage/Portfolio'));
const ProjectArchive = lazy(() => import('./components/HomePage/ProjectArchive'));
const ImpactSnapshot = lazy(() => import('./components/HomePage/ImpactSnapshot'));
const CaseStudyModal = lazy(() => import('./components/HomePage/CaseStudyModal'));

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
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      if (event === 'PASSWORD_RECOVERY') navigate('/admin/reset');
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
      fetchArticles(false),
      fetchStatistics(false)
    ]);
    setProjects(p);
    setFeaturedProjects(f);
    setArticles(a);
    setStatistics(s);
    await fetchOwnerProfile();
  };

  const isOwner = userProfile?.role?.toLowerCase() === 'owner';
  const currentUid = session?.user?.id;
  const ownerId = ownerProfile?.id;

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

  const filteredArticles = useMemo(() => articles, [articles]);
  const filteredStats = useMemo(() => statistics, [statistics]);

  const isAdminPage = location.pathname.startsWith('/admin');

  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-[#0d2137] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {!isAdminPage && (
        <Navbar 
          onNavigate={(page) => navigate(page === 'home' ? '/' : `/${page}`)}
          currentPage={location.pathname === '/' ? 'home' : location.pathname.substring(1)}
          session={session}
          userProfile={userProfile}
        />
      )}
      
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <ImpactSnapshot projects={filteredFeatured} articles={filteredArticles} statistics={filteredStats} />
                <Portfolio 
                  projects={filteredProjects} 
                  onProjectClick={(p) => navigate(`/portfolio/${(p as any).slug || (p as any).id}`)}
                  onBackToHome={() => navigate('/')}
                />
                <ProjectArchive 
                  projects={filteredProjects}
                  onProjectClick={(p) => navigate(`/portfolio/${(p as any).slug || (p as any).id}`)}
                />
              </>
            } />

            <Route path="/about" element={
              <AboutPage onNavigate={(path) => navigate(path)} />
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
              <>
                <Portfolio 
                  projects={filteredProjects} 
                  onProjectClick={(p) => navigate(`/portfolio/${(p as any).slug || (p as any).id}`)}
                  onBackToHome={() => navigate('/')}
                />
                <ProjectArchive 
                  projects={filteredProjects}
                  onProjectClick={(p) => navigate(`/portfolio/${(p as any).slug || (p as any).id}`)}
                />
              </>
            } />

            {/* Project detail — replaces CaseStudy popup */}
            <Route path="/portfolio/:id" element={
              <ProjectDetailWrapper projects={filteredProjects} />
            } />

            <Route path="/articles/:slug" element={
              <ArticleDetailWrapper articles={filteredArticles} onBack={() => navigate('/articles')} onArticleClick={(article) => navigate(`/articles/${article.slug}`)} />
            } />

            <Route path="/author/:id" element={<AuthorPage />} />

            <Route path="/data" element={
              <StatistikPage 
                statistik={filteredStats} 
                onStatClick={(item) => navigate(`/data/${item.slug || item.id}`)}
              />
            } />
            <Route path="/data/:slug" element={
              <StatistikDetailWrapper statistics={filteredStats} />
            } />

            {/* Legacy routes */}
            <Route path="/statistik" element={<Navigate to="/data" replace />} />
            <Route path="/statistik/:slug" element={<StatistikDetailLegacyWrapper statistics={filteredStats} />} />

            <Route path="/admin" element={
              session ? <AdminDashboard /> : <Login onLoginSuccess={(s) => setSession(s)} />
            } />
            <Route path="/admin/reset" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPage && <Footer />}
      <SpeedInsights />
      <ToastContainer />
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
        <div className="w-8 h-8 border-2 border-[#0d2137]/30 border-t-[#0d2137] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading article...</p>
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
  const navigate = useNavigate();
  const decodedSlug = decodeURIComponent(slug || '');
  const statistic = statistics.find((s: any) => s.slug === decodedSlug || s.id === decodedSlug);
  if (!statistic) return (
    <div className="pt-32 flex justify-center items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#0d2137]/30 border-t-[#0d2137] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading data...</p>
      </div>
    </div>
  );
  return (
    <StatistikDetail 
      item={statistic} 
      allStats={statistics}
      onBack={() => navigate('/data')} 
      onStatClick={(s) => navigate(`/data/${s.slug || s.id}`)}
      onFilterChange={() => {}}
      onSearchChange={() => {}}
      searchQuery=""
    />
  );
}

function StatistikDetailLegacyWrapper({ statistics }: any) {
  const { slug } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/data/${slug}`, { replace: true });
  }, [slug]);
  return null;
}

function ProjectDetailWrapper({ projects }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p: any) => p.slug === id || p.id === id || String(p.id) === id);

  if (!project) return (
    <div className="pt-32 flex justify-center items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#0d2137]/30 border-t-[#0d2137] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading project...</p>
      </div>
    </div>
  );

  // Render CaseStudyModal content as a full page
  const { default: CaseStudyPage } = { default: lazy(() => import('./components/HomePage/CaseStudyModal')) };
  return (
    <Suspense fallback={<div className="pt-32 flex justify-center items-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-[#0d2137]/30 border-t-[#0d2137] rounded-full animate-spin" /></div>}>
      <CaseStudyPage
        project={project}
        isOpen={true}
        onClose={() => navigate('/portfolio')}
        isPage={true}
      />
    </Suspense>
  );
}

export default App;
