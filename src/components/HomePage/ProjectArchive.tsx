import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Project } from '../../types';
import SafeImage from '../Common/SafeImage';
import project1 from '../img/1.webp';
import projectPengangguran from '../img/Pengangguran_Indonesia_2025.webp';
import projectTrackRecord from '../img/TrackRecord_MG.webp';

interface ProjectArchiveProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const ProjectArchive: React.FC<ProjectArchiveProps> = ({ projects, onProjectClick }) => {

  return (
    <section className="py-24 px-6" id="projects">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter dark:text-white">Project Archive</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg">A deep dive into complex problems solved through systematic data exploration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              whileHover={{ y: -10 }}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800">
                <SafeImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-3 block">{project.category}</span>
                <h3 className="text-xl font-black tracking-tight mb-4 dark:text-white">{project.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{project.description}</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onProjectClick(project);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all cursor-pointer"
                >
                  Read Case Study <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectArchive;
