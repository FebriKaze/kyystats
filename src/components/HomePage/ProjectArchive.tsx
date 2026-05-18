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
    <section className="py-16 px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800" id="projects">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Project Archive</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">A deep dive into complex problems solved through systematic data exploration.</p>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id || idx}
                whileHover={{ y: -4 }}
                className="group bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => onProjectClick(project)}
              >
                <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800 aspect-video">
                  <SafeImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto block group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#c0392b] mb-2 block">{project.category}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">{project.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{project.description}</p>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onProjectClick(project); }}
                    className="text-xs font-bold text-[#0d2137] dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Read Case Study <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            <p className="text-slate-400 font-bold italic">Belum ada Project Archive</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectArchive;
