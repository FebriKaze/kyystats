import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Project } from '../types';
import project1 from './img/1.jpg';
import projectPengangguran from './img/Pengangguran Indonesia 2025.jpg';
import projectTrackRecord from './img/TrackRecord MG.jpg';

interface ProjectArchiveProps {
  onProjectClick: (project: Project) => void;
}

const ProjectArchive: React.FC<ProjectArchiveProps> = ({ onProjectClick }) => {
  const projects: Project[] = [
    {
      category: 'KEMISKINAN',
      title: 'Papua jadi Provinsi dengan Kemiskinan Tertinggi',
      description: 'Papua Tengah mencatatkan persentase kemiskinan tertinggi',
      image: project1,
      details: {
        challenge: "Data terbaru menunjukkan tantangan besar bagi wilayah Timur Indonesia. Berdasarkan angka BPS, Papua Tengah mencatatkan persentase kemiskinan tertinggi mencapai 29,5%. Disusul oleh Papua Pegunungan dan Papua Selatan.",
        solution: "Implemented a Recency, Frequency, and Monetary (RFM) analysis pipeline using Python. Developed a K-means clustering model to segment customers into actionable groups.",
        result: "Targeted marketing campaigns based on these segments resulted in a 12% increase in customer retention and a 15% boost in average order value."
      }
    },
    {
      category: 'PREDICTIVE TECH',
      title: 'Server Load Forecasting',
      description: 'Leveraged LSTM neural networks to predict server demand spikes 48 hours in advance.',
      image: projectPengangguran,
      details: {
        challenge: "Frequent server outages during peak traffic periods were causing significant revenue loss and damaging user trust.",
        solution: "Built a time-series forecasting model using Long Short-Term Memory (LSTM) networks. Integrated real-time traffic data and historical patterns to predict load spikes.",
        result: "The model achieved 94% accuracy in predicting spikes 48 hours ahead, allowing for proactive resource scaling and reducing downtime by 80%."
      }
    },
    {
      category: 'FINANCE',
      title: 'Track Record MG dalam Mengawal IPO',
      description: 'Real-time transaction monitoring system identifying anomalies with 99.4% accuracy.',
      image: projectTrackRecord,
      details: {
        challenge: "Legacy fraud detection systems were too slow and produced too many false positives, frustrating legitimate customers.",
        solution: "Developed a real-time anomaly detection pipeline using Isolation Forests and Gradient Boosting Machines. Optimized for low-latency inference on AWS Lambda.",
        result: "Reduced false positives by 40% while maintaining a 99.4% detection rate for fraudulent transactions, saving the client an estimated $1.2M annually."
      }
    },
  ];

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
              key={idx}
              whileHover={{ y: -10 }}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-3 block">{project.category}</span>
                <h4 className="text-xl font-black tracking-tight mb-4 dark:text-white">{project.title}</h4>
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
