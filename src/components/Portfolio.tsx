import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, ArrowRight, X } from 'lucide-react';
import { Project } from '../types';
import project1 from './img/1.jpg';
import projectPengangguran from './img/Pengangguran Indonesia 2025.jpg';
import projectTrackRecord from './img/TrackRecord MG.jpg';

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
    <div className="pt-24 min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-12">
          <button 
            onClick={onBackToHome}
            className="group w-fit flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={20} /> Back to Home
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white">Full Portfolio</h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-lg text-lg">
                A complete collection of analytical projects, experiments, and technical case studies.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Improved Responsiveness */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Filter by Category</span>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  activeFilter === cat 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {(activeFilter !== 'All' || searchQuery) && (
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredProjects.length}</span> projects
              {activeFilter !== 'All' && <span> in <span className="text-primary">{activeFilter}</span></span>}
              {searchQuery && <span> matching "<span className="italic">{searchQuery}</span>"</span>}
            </p>
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {paginatedProjects.map((project) => (
                    <motion.div
                      key={project.id || project.title}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
                            {project.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8">
                        <h4 className="text-xl font-black tracking-tight mb-4 dark:text-white group-hover:text-primary transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 line-clamp-3">
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
                <h3 className="text-2xl font-bold dark:text-white mb-2">No projects found</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">We couldn't find any projects matching your current filter and search criteria.</p>
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
