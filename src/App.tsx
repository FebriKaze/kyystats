import { useState, useEffect, lazy, Suspense } from 'react';
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

// Lazy load heavy page components for performance
const ArticleList = lazy(() => import('./components/Articles/ArticleList'));
const ArticleDetail = lazy(() => import('./components/Articles/ArticleDetail'));
const StatistikPage = lazy(() => import('./components/Statistik/StatistikPage'));
const StatistikDetail = lazy(() => import('./components/Statistik/StatistikDetail'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const Portfolio = lazy(() => import('./components/HomePage/Portfolio'));
const ProjectArchive = lazy(() => import('./components/HomePage/ProjectArchive'));
const ImpactSnapshot = lazy(() => import('./components/HomePage/ImpactSnapshot'));
import project1 from './components/img/1.webp';
import projectPengangguran from './components/img/Pengangguran Indonesia 2025.webp';
import projectTrackRecord from './components/img/TrackRecord MG.webp';
import projectPajak from './components/img/Pendapatan Pajak Negara.webp';

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

type Page = 'home' | 'portfolio' | 'articles' | 'article-detail' | 'statistik' | 'statistik-detail' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedStat, setSelectedStat] = useState<any | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [articleFilter, setArticleFilter] = useState('All');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [session, setSession] = useState<any>(null);

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
    const handleHashChange = () => {
      const fullHash = window.location.hash;
      const hash = fullHash.replace('#', '');
      
      if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash.startsWith('article-detail/')) {
        const slug = hash.replace('article-detail/', '');
        const found = articles.find(a => a.slug === slug);
        if (found) setSelectedArticle(found);
        setCurrentPage('article-detail');
      } else if (hash.startsWith('statistik-detail/')) {
        const id = hash.replace('statistik-detail/', '');
        const found = statistics.find(s => s.id === id);
        if (found) setSelectedStat(found);
        setCurrentPage('statistik-detail');
      } else if (hash === 'portfolio' || hash === 'articles' || hash === 'statistik') {
        setCurrentPage(hash as Page);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [articles, statistics]);

  useEffect(() => {
    const loadData = async () => {
      const [dbProjects, dbFeatured, dbArticles, dbStats] = await Promise.all([
        fetchPortfolios(),
        fetchFeaturedProjects(),
        fetchArticles(),
        fetchStatistics()
      ]);
      
      setFeaturedProjects(dbFeatured);
      setArticles(dbArticles);
      setStatistics(dbStats);
      
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('article-detail/')) {
        const slug = hash.replace('article-detail/', '');
        const article = dbArticles.find(a => a.slug === slug);
        if (article) setSelectedArticle(article);
      } else if (hash.startsWith('statistik-detail/')) {
        const id = hash.replace('statistik-detail/', '');
        const stat = dbStats.find(s => s.id === id);
        if (stat) setSelectedStat(stat);
      }

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

  const handleNavigate = (page: string) => {
    if (page === 'home' || page.startsWith('#')) {
      window.location.hash = page === 'home' ? '' : page;
      setCurrentPage('home');
    } else {
      window.location.hash = page;
      setCurrentPage(page as Page);
    }
    
    if (page !== 'article-detail') setSelectedArticle(null);
    if (page !== 'statistik-detail') setSelectedStat(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArticleClick = (article: Article) => {
    window.location.hash = `article-detail/${article.slug}`;
  };

  const handleStatClick = (stat: any) => {
    window.location.hash = `statistik-detail/${stat.id}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      {currentPage !== 'admin' && (
        <Navbar onContactClick={() => setIsContactOpen(true)} onNavigate={handleNavigate} currentPage={currentPage} />
      )}
      
      <main>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
        {currentPage === 'home' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0"
          >
            <Hero />
            <ImpactSnapshot projects={featuredProjects} />
            <ProjectArchive 
              projects={projects.slice(0, 3)} 
              onProjectClick={(p) => setSelectedProject(p)}
            />
          </motion.div>
        ) : currentPage === 'portfolio' ? (
          <Portfolio 
            projects={projects} 
            onProjectClick={(p) => setSelectedProject(p)} 
            onBackToHome={() => handleNavigate('home')}
          />
        ) : currentPage === 'statistik' ? (
          <StatistikPage 
            statistik={statistics} 
            onStatClick={handleStatClick}
          />
        ) : currentPage === 'statistik-detail' ? (
          <StatistikDetail 
            item={selectedStat}
            allStats={statistics}
            onBack={() => handleNavigate('statistik')}
            onStatClick={handleStatClick}
            onFilterChange={() => {}}
            onSearchChange={() => {}}
            searchQuery=""
          />
        ) : currentPage === 'articles' ? (
          <ArticleList 
            articles={articles}
            onArticleClick={handleArticleClick}
            activeFilter={articleFilter}
            onFilterChange={setArticleFilter}
            searchQuery={articleSearchQuery}
            onSearchChange={setArticleSearchQuery}
          />
        ) : currentPage === 'article-detail' ? (
          <ArticleDetail 
            article={selectedArticle!} 
            articles={articles}
            onBack={() => handleNavigate('articles')}
            onArticleClick={handleArticleClick}
            onFilterChange={() => {}}
            onSearchChange={() => {}}
            searchQuery=""
          />
        ) : currentPage === 'admin' ? (
          session ? (
            <AdminDashboard />
          ) : (
            <Login onLoginSuccess={(s) => setSession(s)} />
          )
        ) : (
          <div className="pt-32 text-center text-slate-500">Page not found</div>
        )}
        </Suspense>
      </main>

      {currentPage !== 'admin' && <Footer />}
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
          currentPage === 'admin' ? 'hidden' : (currentPage === 'portfolio' || currentPage === 'article-detail') ? 'hidden md:flex' : 'flex'
        }`}
      >
        <span className="text-sm font-bold tracking-tight">Let's Collaborate</span>
        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
}
