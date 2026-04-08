import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ImpactSnapshot from './components/ImpactSnapshot';
import ProjectArchive from './components/ProjectArchive';
import ContactModal from './components/ContactModal';
import CaseStudyModal from './components/CaseStudyModal';
import Portfolio from './components/Portfolio';
import Footer from './components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Project, FeaturedProject } from './types';
import { fetchPortfolios, fetchFeaturedProjects } from './services/portfolioService';
import project1 from './components/img/1.jpg';
import projectPengangguran from './components/img/Pengangguran Indonesia 2025.jpg';
import projectTrackRecord from './components/img/TrackRecord MG.jpg';
import projectPajak from './components/img/Pendapatan Pajak Negara.jpg';

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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [dbProjects, dbFeatured] = await Promise.all([
        fetchPortfolios(),
        fetchFeaturedProjects()
      ]);
      
      setFeaturedProjects(dbFeatured);
      
      // Map local images to DB projects if image_url is missing
      const projectsWithImages = dbProjects.map(p => {
        if (!p.image) {
          if (p.title.includes('Papua')) return { ...p, image: project1 };
          if (p.title.includes('Pengangguran')) return { ...p, image: projectPengangguran };
          if (p.title.includes('MG') || p.title.includes('IPO')) return { ...p, image: projectTrackRecord };
          if (p.title.includes('Pajak')) return { ...p, image: projectPajak };
        }
        return p;
      });

      // Combine DB projects (4) with local ones (2 or more) to make it at least 6
      const allProjects = [...projectsWithImages, ...LOCAL_FALLBACK_PROJECTS].slice(0, 6);
      setProjects(allProjects);
    };
    loadData();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <SpeedInsights />
      <Navbar 
        onContactClick={() => setIsContactOpen(true)} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      
      <main>
        {currentPage === 'home' ? (
          <>
            <Hero />
            <ImpactSnapshot projects={featuredProjects} />
            <ProjectArchive 
              projects={projects.slice(0, 3)} 
              onProjectClick={(project) => setSelectedProject(project)} 
            />
          </>
        ) : (
          <Portfolio 
            projects={projects}
            onProjectClick={(project) => setSelectedProject(project)} 
            onBackToHome={() => handleNavigate('home')}
          />
        )}
      </main>

      <Footer />
      <SpeedInsights />
      
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <CaseStudyModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsContactOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-primary text-white pl-6 pr-5 py-4 rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 group"
      >
        <span className="text-sm font-bold tracking-tight">Let's Collaborate</span>
        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
}
