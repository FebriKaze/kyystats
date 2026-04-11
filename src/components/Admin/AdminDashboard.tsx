import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminHeader from './AdminHeader';
import AdminHome from './AdminHome';
import AdminContentList from './AdminContentList';
import AdminEditor from './AdminEditor';
import AdminProfile from './AdminProfile';
import AdminUserManagement from './AdminUserManagement';
import { 
  fetchArticles, 
  saveArticle, 
  deleteArticle, 
  fetchPortfolios, 
  savePortfolio, 
  deletePortfolio,
  fetchFeaturedProjects,
  fetchStatistics,
  saveStatistic,
  deleteStatistic
} from '../../services/portfolioService';
import { Article, Project, FeaturedProject, Statistic } from '../../types';

type AdminView = 'home' | 'manage-articles' | 'manage-portfolio' | 'manage-statistics' | 'manage-users' | 'edit' | 'create' | 'profile' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('home');
  const [lastView, setLastView] = useState<AdminView>('home');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Data lists
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  
  // Editorial State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [contentType, setContentType] = useState<'articles' | 'portfolio' | 'statistics'>('articles');

  useEffect(() => {
    loadAllData();
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(data);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    const [a, p, s, f] = await Promise.all([
      fetchArticles(),
      fetchPortfolios(),
      fetchStatistics(),
      fetchFeaturedProjects()
    ]);
    setArticles(a);
    setProjects(p);
    setStatistics(s);
    setFeaturedCount(f.length);
    setLoading(false);
  };

  const navigateTo = (view: AdminView) => {
    setActiveView(view);
    if (view !== 'edit' && view !== 'create') setLastView(view);
  };

  const handleEdit = (type: 'articles' | 'portfolio' | 'statistics', item: any) => {
    setContentType(type);
    setEditingItem(item);
    navigateTo('edit');
  };

  const handleCreate = (type: 'articles' | 'portfolio' | 'statistics') => {
    setContentType(type);
    const defaultData = type === 'articles' 
      ? { is_published: true, author: userProfile?.full_name || 'KyyStats', content: '', summary: '' } 
      : type === 'portfolio' 
        ? { category: '', title: '', description: '', details: { challenge: '', solution: '', result: '' } } 
        : { is_published: true, author: userProfile?.full_name || 'KyyStats', content: '', category: 'Ekonomi' };
    setEditingItem(defaultData);
    navigateTo('create');
  };

  const handleSave = async (item: any) => {
    try {
      if (contentType === 'articles') await saveArticle(item);
      if (contentType === 'portfolio') await savePortfolio(item);
      if (contentType === 'statistics') await saveStatistic(item);
      
      alert('Konten berhasil disimpan!');
      loadAllData();
      navigateTo(lastView);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan konten: ' + (err?.message || 'Error tidak diketahui'));
    }
  };

  const handleDelete = async (type: 'articles' | 'portfolio' | 'statistics', id: string) => {
    if (!window.confirm('Hapus konten ini?')) return;
    
    let success = false;
    if (type === 'articles') success = await deleteArticle(id);
    if (type === 'portfolio') success = await deletePortfolio(id);
    if (type === 'statistics') success = await deleteStatistic(id);

    if (success) {
      alert('Konten berhasil dihapus!');
      loadAllData();
    } else {
      alert('Gagal menghapus konten.');
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    const isOwner = userProfile?.role === 'owner';
    const currentUserId = userProfile?.id;

    // Filter data based on user role
    const filteredArticles = isOwner ? articles : articles.filter(a => a.user_id === currentUserId);
    const filteredStatistics = isOwner ? statistics : statistics.filter(s => s.user_id === currentUserId);
    const filteredProjects = isOwner ? projects : projects.filter(p => (p as any).user_id === currentUserId);

    const popularList = [...filteredArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

    switch (activeView) {
      case 'home':
        return <AdminHome 
          stats={{
            articles: filteredArticles.length,
            statistics: filteredStatistics.length
          }}
          popularArticles={popularList}
          items={{ articles: filteredArticles, statistics: filteredStatistics }}
        />;
      case 'manage-articles':
        return <AdminContentList 
          type="articles" 
          data={filteredArticles} 
          onEdit={(item) => handleEdit('articles', item)} 
          onCreate={() => handleCreate('articles')}
          onDelete={(id) => handleDelete('articles', id)} 
        />;
      case 'manage-statistics':
        return <AdminContentList 
          type="statistics" 
          data={filteredStatistics} 
          onEdit={(item) => handleEdit('statistics', item)} 
          onCreate={() => handleCreate('statistics')}
          onDelete={(id) => handleDelete('statistics', id)} 
        />;
      case 'manage-users':
        return <AdminUserManagement />;
      case 'edit':
      case 'create':
        return <AdminEditor 
          item={editingItem} 
          type={contentType} 
          onSave={handleSave} 
          onCancel={() => navigateTo(lastView)} 
        />;
      case 'profile':
        return <AdminProfile />;
      case 'manage-portfolio':
        return <AdminContentList 
          type="portfolio" 
          data={projects} 
          onEdit={(item) => handleEdit('portfolio', item)} 
          onCreate={() => handleCreate('portfolio')}
          onDelete={(id) => handleDelete('portfolio', id)} 
        />;
      default:
        return <AdminHome stats={{ articles: filteredArticles.length, statistics: filteredStatistics.length }} popularArticles={popularList} items={{ articles: filteredArticles, statistics: filteredStatistics }} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <AdminHeader onNavigate={navigateTo} activeView={activeView} />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
