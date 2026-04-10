import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Navbar from './components/HomePage/Navbar';
import Hero from './components/HomePage/Hero';
import Footer from './components/HomePage/Footer';
import ContactModal from './components/HomePage/ContactModal';
import CaseStudyModal from './components/HomePage/CaseStudyModal';
import Login from './components/Admin/Login';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Project, FeaturedProject, Article } from './types';
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

import project1 from './components/img/1.webp';
import projectPengangguran from './components/img/Pengangguran_Indonesia_2025.webp';
import projectTrackRecord from './components/img/TrackRecord_MG.webp';
import projectPajak from './components/img/Pendapatan_Pajak_Negara.webp';

const LOCAL_FALLBACK_PROJECTS: Project[] = [
  {
    category: 'DATA VISUALIZATION',
    title: 'Global Warming Trends 2024',
    description: 'Interactive visualization of temperature shifts across the globe over the last decade.',
    image: project1,
    details: {
      challenge: "Communicating complex climate data to a non-technical audience in an engaging way.",
      solution: "Developed a D3.js powered dashboard with interactive maps and historical timelines.",
      result: "Viral reach with over 500k unique visitors and positive feedback from environmental NGOs."
    }
  },
  {
    category: 'KEMISKINAN',
    title: 'Economic Impact on Rural Areas',
    description: 'Analyzing the shift in household income after the latest subsidy reforms.',
    image: projectPengangguran,
    details: {
      challenge: "Understanding the granular impact of macro-economic changes on remote villages.",
      solution: "Conducted field surveys and processed data using R and Hadoop for large-scale analysis.",
      result: "Policy recommendations were adopted by the local government to improve distribution efficiency."
    }
  },
  {
    category: 'FINANCE',
    title: 'Stock Market Sentiment Analysis',
    description: 'Predicting market trends using NLP on social media and news sources.',
    image: projectTrackRecord,
    details: {
      challenge: "Processing millions of social media posts to find meaningful market indicators.",
      solution: "Built a BERT-based sentiment analysis model integrated with historical price data.",
      result: "Outperformed the baseline index by 8.5% over a 6-month backtesting period."
    }
  }
];

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [articleFilter, setArticleFilter] = useState('All');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [session, setSession] = useState<any>(null);

  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [dbProjects, dbFeatured, dbArticles, dbStats] = await Promise.all([
        fetchPortfolios(),
        fetchFeaturedProjects(),
        fetchArticles(),
        fetchStatistics()
      ]);
      
      // Ambil view counts untuk setiap artikel
      const { fetchPageViewCount } = await import('./services/portfolioService');
      const articlesWithViews = await Promise.all(dbArticles.map(async (art) => {
        const views = await fetchPageViewCount('article', art.id);
        return { ...art, views };
      }));
      
      setFeaturedProjects(dbFeatured);
      setArticles(articlesWithViews);
      setStatistics(dbStats);

      const projectsWithImages = dbProjects.map(p => {
        if (!p.image) {
          if (p.title.includes('Papua')) return { ...p, image: project1 };
          if (p.title.includes('Pengangguran')) return { ...p, image: projectPengangguran };
          if (p.title.includes('MG') || p.title.includes('IPO')) return { ...p, image: projectTrackRecord };
          if (p.title.includes('Pajak')) return { ...p, image: projectPajak };
        }
        return p;
      });

      const allProjects = [...projectsWithImages, ...LOCAL_FALLBACK_PROJECTS].slice(0, 6);
      setProjects(allProjects);
    };
    loadData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      {!isAdminPage && (
        <Navbar 
          onContactClick={() => setIsContactOpen(true)} 
          onNavigate={(path) => navigate(path)} 
          currentPage={location.pathname.replace('/', '') || 'home'} 
        />
      )}
      
      <main>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
                <Hero />
                <ImpactSnapshot projects={featuredProjects} />
                <ProjectArchive 
                  projects={projects.slice(0, 3)} 
                  onProjectClick={(p) => setSelectedProject(p)}
                />
              </motion.div>
            } />
            
            <Route path="/portfolio" element={
              <Portfolio 
                projects={projects} 
                onProjectClick={(p) => setSelectedProject(p)} 
                onBackToHome={() => navigate('/')}
              />
            } />

            <Route path="/statistik" element={
              <StatistikPage 
                statistik={statistics} 
                onStatClick={(stat) => navigate(`/statistik/${stat.id}`)}
              />
            } />

            <Route path="/statistik/:id" element={
              <StatistikDetailWrapper statistics={statistics} onBack={() => navigate('/statistik')} onStatClick={(stat) => navigate(`/statistik/${stat.id}`)} />
            } />

            <Route path="/articles" element={
              <ArticleList 
                articles={articles}
                onArticleClick={(article) => navigate(`/articles/${article.slug}`)}
                activeFilter={articleFilter}
                onFilterChange={setArticleFilter}
                searchQuery={articleSearchQuery}
                onSearchChange={setArticleSearchQuery}
              />
            } />

            <Route path="/articles/:slug" element={
              <ArticleDetailWrapper articles={articles} onBack={() => navigate('/articles')} onArticleClick={(article) => navigate(`/articles/${article.slug}`)} />
            } />

            <Route path="/admin" element={
              session ? (
                <AdminDashboard />
              ) : (
                <Login onLoginSuccess={(s) => setSession(s)} />
              )
            } />

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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsContactOpen(true)}
        className={`fixed bottom-8 right-8 z-40 bg-primary text-white pl-6 pr-5 py-4 rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 group transition-all ${
          isAdminPage ? 'hidden' : (location.pathname === '/portfolio' || location.pathname.startsWith('/articles/')) ? 'hidden md:flex' : 'flex'
        }`}
      >
        <span className="text-sm font-bold tracking-tight">Let's Collaborate</span>
        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
}

// Wrapper components for single detail pages using params
import { useParams } from 'react-router-dom';

function ArticleDetailWrapper({ articles, onBack, onArticleClick }: any) {
  const { slug } = useParams();
  const decodedSlug = decodeURIComponent(slug || '');
  const article = articles.find((a: any) => a.slug === decodedSlug || a.slug === slug);
  if (!article) return <div className="pt-32 text-center">Article not found</div>;
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

function StatistikDetailWrapper({ statistics, onBack, onStatClick }: any) {
  const { id } = useParams();
  const stat = statistics.find((s: any) => s.id === id);
  if (!stat) return <div className="pt-32 text-center">Statistic not found</div>;
  return (
    <StatistikDetail 
      item={stat}
      allStats={statistics}
      onBack={onBack}
      onStatClick={onStatClick}
      onFilterChange={() => {}}
      onSearchChange={() => {}}
      searchQuery=""
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

