import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  fetchArticles, 
  fetchPortfolios, 
  fetchStatistics,
  saveArticle,
  deleteArticle,
  savePortfolio,
  deletePortfolio,
  saveStatistic,
  deleteStatistic
} from '../../services/portfolioService';
import { Article, Project, Statistic } from '../../types';
import AdminHeader from './AdminHeader';
import AdminHome from './AdminHome';
import AdminContentList from './AdminContentList';
import AdminEditor from './AdminEditor';
import AdminUserManagement from './AdminUserManagement';
import AdminProfile from './AdminProfile';
import ArticleAssignment from './ArticleAssignment';
import { showToast } from '../Common/Toast';

type AdminView = 'home' | 'manage-articles' | 'manage-portfolio' | 'manage-statistics' | 'manage-users' | 'edit' | 'create' | 'profile' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('home');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rawViews, setRawViews] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [contentType, setContentType] = useState<'articles' | 'portfolio' | 'statistics'>('articles');
  const [lastView, setLastView] = useState<AdminView>('home');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    setLoading(true);
    try {
      // 1. Ambil Profil User
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (pData) setUserProfile(pData);
      }

      // 2. Ambil Data Konten (Sama persis logic-nya dengan UserManagement)
      const [artData, statData, projData] = await Promise.all([
        fetchArticles(false),
        fetchStatistics(false),
        fetchPortfolios()
      ]);

      // 3. Ambil MENTAH Data Views (Penting: Ambil '*' agar semua kolom terangkut)
      const { data: vData } = await supabase.from('page_views').select('*');
      const viewsList = vData || [];
      setRawViews(viewsList);

      // Hitung views per page_id
      const viewCounts: Record<string, number> = {};
      viewsList.forEach((v: any) => {
        const pid = String(v.page_id);
        if (pid) {
          viewCounts[pid] = (viewCounts[pid] || 0) + 1;
        }
      });

      // 4. Mapping Views ke Artikel & Statistik (Gunakan Triple Check: ID, Slug, and Title ID)
      const mappedArticles = (artData || []).map(a => {
        const idViews = a.id ? (viewCounts[String(a.id)] || 0) : 0;
        const slugViews = a.slug ? (viewCounts[String(a.slug)] || 0) : 0;
        return { ...a, views: idViews + slugViews };
      });

      const mappedStatistics = (statData || []).map(s => {
        const idViews = s.id ? (viewCounts[String(s.id)] || 0) : 0;
        return { ...s, views: idViews };
      });

      setArticles(mappedArticles);
      setStatistics(mappedStatistics);
      setProjects(projData || []);

    } catch (err) {
      console.error('Dashboard Init Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (view: AdminView) => {
    setActiveView(view);
    if (view !== 'edit' && view !== 'create') setLastView(view);
  };

  const handleEdit = (type: any, item: any) => {
    setEditingItem(item);
    setContentType(type);
    navigateTo('edit');
  };

  const handleCreate = (type: any) => {
    setContentType(type);
    setEditingItem(type === 'articles' ? { is_published: true, author: userProfile?.full_name } : { is_published: true, author: userProfile?.full_name, category: 'Ekonomi' });
    navigateTo('create');
  };

  const handleSave = async (item: any) => {
     try {
       if (contentType === 'articles') await saveArticle(item);
       if (contentType === 'portfolio') await savePortfolio(item);
       if (contentType === 'statistics') await saveStatistic(item);
       showToast('success', 'Konten berhasil disimpan!');
       initDashboard();
       navigateTo(lastView);
     } catch (err) { showToast('error', 'Gagal menyimpan konten!'); }
  };

  
  const handleDelete = async (type: any, id: string) => {
    if (!window.confirm('Hapus konten ini?')) return;
    let success = false;
    if (type === 'articles') success = await deleteArticle(id);
    if (type === 'portfolio') success = await deletePortfolio(id);
    if (type === 'statistics') success = await deleteStatistic(id);
    if (success) {
      showToast('success', 'Konten berhasil dihapus!');
      initDashboard();
    } else {
      showToast('error', 'Gagal menghapus konten!');
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const isOwner = userProfile?.role?.toLowerCase() === 'owner';
    const uid = userProfile?.id;

    const fArticles = isOwner ? articles : articles.filter(a => a.user_id === uid);
    const fStatistics = isOwner ? statistics : statistics.filter(s => s.user_id === uid);
    const fProjects = isOwner ? projects : projects.filter(p => (p as any).user_id === uid);

    const popularList = [...fArticles].sort((a,b) => (b.views||0) - (a.views||0)).slice(0,5);

    switch (activeView) {
      case 'home':
        return <AdminHome 
          stats={{
            articles: fArticles.length,
            statistics: fStatistics.length
          }}
          popularArticles={popularList}
          items={{ articles: fArticles, statistics: fStatistics }}
          profile={userProfile}
          rawViews={rawViews}
          currentUserId={uid}
          onEdit={(type, item) => handleEdit(type, item)}
        />;
      case 'manage-articles':
        const hasUnassignedArticles = articles.some(a => !a.user_id);
        return <AdminContentList 
          data={fArticles} 
          type="articles" 
          onEdit={(i) => handleEdit('articles', i)} 
          onCreate={() => handleCreate('articles')} 
          onDelete={(id) => handleDelete('articles', id)}
          onManageAssignments={() => setShowAssignmentModal(true)}
          showManageAssignments={isOwner && hasUnassignedArticles}
        />;
      case 'manage-statistics':
        return <AdminContentList data={fStatistics} type="statistics" onEdit={(i) => handleEdit('statistics', i)} onCreate={() => handleCreate('statistics')} onDelete={(id) => handleDelete('statistics', id)} />;
      case 'manage-portfolio':
        return <AdminContentList data={fProjects} type="portfolio" onEdit={(i) => handleEdit('portfolio', i)} onCreate={() => handleCreate('portfolio')} onDelete={(id) => handleDelete('portfolio', id)} />;
      case 'manage-users': return <AdminUserManagement />;
      case 'profile': return <AdminProfile />;
      case 'edit':
      case 'create':
        return <AdminEditor type={contentType} item={editingItem} onSave={handleSave} onCancel={() => navigateTo(lastView)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <AdminHeader activeView={activeView} onNavigate={navigateTo} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 overflow-hidden">
         {renderContent()}
      </div>
      
      {showAssignmentModal && (
        <ArticleAssignment
          onClose={() => setShowAssignmentModal(false)}
          onAssignmentComplete={initDashboard}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
