import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminHeader from './AdminHeader';
import AdminHome from './AdminHome';
import AdminContentList from './AdminContentList';
import AdminEditor from './AdminEditor';
import AdminProfile from './AdminProfile';
import { 
  fetchArticles, 
  saveArticle, 
  deleteArticle, 
  fetchPortfolios, 
  savePortfolio, 
  deletePortfolio,
  fetchFeaturedProjects,
  saveFeaturedProject,
  deleteFeaturedProject
} from '../../services/portfolioService';
import { Article, Project, FeaturedProject } from '../../types';

type AdminView = 'home' | 'manage-articles' | 'manage-portfolio' | 'manage-featured' | 'edit' | 'create' | 'profile' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('home');
  const [lastView, setLastView] = useState<AdminView>('home');
  const [loading, setLoading] = useState(false);
  
  // Data lists
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featured, setFeatured] = useState<FeaturedProject[]>([]);
  
  // Editorial State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [contentType, setContentType] = useState<'articles' | 'portfolio' | 'featured'>('articles');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [a, p, f] = await Promise.all([
      fetchArticles(),
      fetchPortfolios(),
      fetchFeaturedProjects()
    ]);
    setArticles(a);
    setProjects(p);
    setFeatured(f);
    setLoading(false);
  };

  const navigateTo = (view: AdminView) => {
    setActiveView(view);
    if (view !== 'edit' && view !== 'create') setLastView(view);
  };

  const handleEdit = (type: 'articles' | 'portfolio' | 'featured', item: any) => {
    setContentType(type);
    setEditingItem(item);
    navigateTo('edit');
  };

  const handleCreate = (type: 'articles' | 'portfolio' | 'featured') => {
    setContentType(type);
    const defaultData = type === 'articles' 
      ? { is_published: true, author: 'KyyStats', content: '', summary: '' } 
      : type === 'portfolio' 
        ? { category: '', title: '', description: '', details: { challenge: '', solution: '', result: '' } } 
        : { tags: [] };
    setEditingItem(defaultData);
    navigateTo('create');
  };

  const handleSave = async (item: any) => {
    try {
      if (contentType === 'articles') await saveArticle(item);
      if (contentType === 'portfolio') await savePortfolio(item);
      if (contentType === 'featured') await saveFeaturedProject(item);
      
      alert('Konten berhasil disimpan!');
      loadAllData();
      navigateTo(lastView);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan konten: ' + (err?.message || 'Error tidak diketahui'));
    }
  };

  const handleDelete = async (type: 'articles' | 'portfolio' | 'featured', id: string) => {
    if (!window.confirm('Hapus konten ini?')) return;
    
    let success = false;
    if (type === 'articles') success = await deleteArticle(id);
    if (type === 'portfolio') success = await deletePortfolio(id);
    if (type === 'featured') success = await deleteFeaturedProject(id);
    
    if (success) {
      alert('Berhasil dihapus');
      loadAllData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col">
      <AdminHeader activeView={activeView} onNavigate={(v) => navigateTo(v)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {activeView === 'home' && (
          <AdminHome 
            stats={{
              articles: articles.length,
              portfolio: projects.length,
              featured: featured.length
            }} 
            popularArticles={articles.slice(0, 5)}
          />
        )}

        {activeView === 'manage-articles' && (
          <AdminContentList 
            type="articles" 
            data={articles} 
            onEdit={(item) => handleEdit('articles', item)}
            onDelete={(id) => handleDelete('articles', id)}
            onCreate={() => handleCreate('articles')}
          />
        )}

        {activeView === 'manage-portfolio' && (
          <AdminContentList 
            type="portfolio" 
            data={projects} 
            onEdit={(item) => handleEdit('portfolio', item)}
            onDelete={(id) => handleDelete('portfolio', id)}
            onCreate={() => handleCreate('portfolio')}
          />
        )}

        {activeView === 'manage-featured' && (
          <AdminContentList 
            type="featured" 
            data={featured} 
            onEdit={(item) => handleEdit('featured', item)}
            onDelete={(id) => handleDelete('featured', id)}
            onCreate={() => handleCreate('featured')}
          />
        )}

        {activeView === 'profile' && (
          <AdminProfile />
        )}

        {activeView === 'settings' && (
          <div className="py-20 text-center text-slate-400">
             <h2 className="text-2xl font-black">Sistem Pengaturan</h2>
             <p className="mt-2">Halaman konfigurasi sistem akan segera tersedia.</p>
          </div>
        )}

        {(activeView === 'edit' || activeView === 'create') && (
          <AdminEditor 
            type={contentType} 
            item={editingItem} 
            onSave={handleSave} 
            onCancel={() => navigateTo(lastView)} 
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
