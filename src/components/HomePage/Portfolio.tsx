import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, ArrowRight, X } from 'lucide-react';
import { Project } from '../../types';
import SafeImage from '../Common/SafeImage';
import project1 from '../img/1.webp';
import projectPengangguran from '../img/Pengangguran_Indonesia_2025.webp';
import projectTrackRecord from '../img/TrackRecord_MG.webp';

// Move projects data outside the component to prevent recreation on every render
interface PortfolioProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onBackToHome: () => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ projects, onProjectClick, onBackToHome }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PROJECTS_PER_PAGE = 6;

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesFilter = activeFilter === 'All' || p.category === activeFilter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, projects]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const clearFilters = () => {
    setActiveFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-5 mb-10">
          <button 
            onClick={onBackToHome}
            className="w-fit flex items-center gap-1.5 text-slate-500 text-sm hover:text-[#0d2137] transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 dark:border-white pb-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">Full Portfolio</h1>
              <p className="text-sm text-slate-500 max-w-lg">
                A complete collection of analytical projects, experiments, and technical case studies.
              </p>
            </div>
            
            <div className="flex items-center border border-slate-300 dark:border-slate-700 w-full md:w-72">
              <Search className="ml-4 text-slate-400 shrink-0" size={16} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 focus:outline-none text-sm dark:text-white placeholder-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-3 text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`shrink-0 text-xs font-semibold px-4 py-1.5 border transition-colors whitespace-nowrap ${
                activeFilter === cat 
                  ? 'bg-[#0d2137] text-white border-[#0d2137]' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Info */}
        {(activeFilter !== 'All' || searchQuery) && (
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredProjects.length}</span> projects
              {activeFilter !== 'All' && <span> in <span className="text-[#0d2137]">{activeFilter}</span></span>}
              {searchQuery && <span> matching "<span className="italic">{searchQuery}</span>"</span>}
            </p>
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-[#0d2137] hover:underline flex items-center gap-1"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Projects Grid */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {paginatedProjects.length > 0 ? (
              <>
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginatedProjects.map((project) => (
                    <motion.div
                      key={project.id || project.title}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => onProjectClick(project)}
                      className="group bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#c0392b] bg-white/90 dark:bg-slate-900/90 px-2 py-0.5">
                            {project.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#0d2137] dark:group-hover:text-blue-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        <button 
                          onClick={() => onProjectClick(project)}
                          className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all"
                        >
                          Explore Case Study <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      aria-label="Previous page"
                      className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-all ${
                        currentPage === 1 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ArrowLeft size={18} className="dark:text-white" />
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => {
                            setCurrentPage(i + 1);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          aria-label={`Go to page ${i + 1}`}
                          className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${
                            currentPage === i + 1
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-primary/50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      aria-label="Next page"
                      className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-all ${
                        currentPage === totalPages 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ArrowRight size={18} className="dark:text-white" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 mb-6 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-2xl font-bold dark:text-white mb-2">Belum ada portfolio</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Sepertinya belum ada karya yang dipajang di sini.</p>
                <button 
                  onClick={clearFilters}
                  className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
