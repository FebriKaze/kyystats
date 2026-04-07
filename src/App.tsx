import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ImpactSnapshot from './components/ImpactSnapshot';
import ProjectArchive from './components/ProjectArchive';
import ContactModal from './components/ContactModal';
import CaseStudyModal from './components/CaseStudyModal';
import Portfolio from './components/Portfolio';
import Footer from './components/Footer';
import { Project } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <Navbar 
        onContactClick={() => setIsContactOpen(true)} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      
      <main>
        {currentPage === 'home' ? (
          <>
            <Hero />
            <ImpactSnapshot />
            <ProjectArchive onProjectClick={(project) => setSelectedProject(project)} />
          </>
        ) : (
          <Portfolio 
            onProjectClick={(project) => setSelectedProject(project)} 
            onBackToHome={() => handleNavigate('home')}
          />
        )}
      </main>

      <Footer />
      
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
