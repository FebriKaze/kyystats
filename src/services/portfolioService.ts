import { supabase } from '../lib/supabase';
import { Project, FeaturedProject, Article, Statistic } from '../types';
import { showToast } from '../components/Common/Toast';

export const generateSlug = (text?: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const fetchPortfolios = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolios:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    slug: row.slug || (row.title ? generateSlug(row.title) : row.id),
    category: row.category,
    title: row.title,
    description: row.short_desc,
    image: row.thumbnail_url || '',
    details: {
      challenge: row.challenge_text,
      solution: row.sulotion_text,
      result: row.key_result || 'Project completed.'
    },
    user_id: row.user_id
  }));
};

export const fetchFeaturedProjects = async (): Promise<FeaturedProject[]> => {
  const { data, error } = await supabase
    .from('featured_project')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return [];

  return data.map((row: any) => ({
    id: String(row.id),
    slug: row.slug || (row.title ? generateSlug(row.title) : row.id),
    title: row.title || '',
    description: row.description || '',
    image_url: row.image_url || '',
    tags: row.tags || [],
    impact_val: row.impact_value || '', 
    impact_desc: row.impact_desc || '',
    highlight_y: row.highlight_year || '', 
    hightlight_desc: row.hightlight_desc || '',
    image_label: row.image_label || '',
    user_id: row.user_id
  }));
};

export const fetchArticles = async (onlyPublished = true): Promise<Article[]> => {
  let query = supabase.from('articles').select('*, profiles(full_name, avatar_url)');
  if (onlyPublished) query = query.eq('is_published', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return (await supabase.from('articles').select('*').order('created_at', { ascending: false })).data as Article[] || [];
  return (data || []).map((row: any) => ({ 
    ...row, 
    slug: row.slug || (row.title ? generateSlug(row.title) : row.id),
    image_url: row.thumbnail_url || '',
    author: row.profiles?.full_name || 'Admin' 
  })) as Article[];
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
  const { data, error } = await supabase.from('articles').select('*, profiles(full_name, avatar_url)').eq('slug', slug).single();
  if (error) return null;
  return { 
    ...data, 
    image_url: (data as any).thumbnail_url || '',
    author: (data as any).profiles?.full_name || 'Admin' 
  } as Article;
};

export const saveArticle = async (article: Partial<Article>): Promise<Article | null> => {
  const isNew = !article.id;
  const dbData = { ...article };
  
  // Clean UI fields
  const uiFields = ['views', 'profiles', 'author', 'chart_data', 'impact_val', 'impact_desc', 'tags', 'image', 'image_url', 'highlight_y', 'hightlight_desc', 'image_label'];
  uiFields.forEach(f => delete (dbData as any)[f]);
  
  if (isNew && !dbData.user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) dbData.user_id = user.id;
  }
  
  const { data, error } = isNew
    ? await supabase.from('articles').insert([dbData]).select().single()
    : await supabase.from('articles').update(dbData).eq('id', dbData.id).select().single();

  if (error) throw error;
  return data as Article;
};

export const deleteArticle = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  return !error;
};

export const savePortfolio = async (project: any): Promise<any> => {
  const isNew = !project.id;
  const dbData = {
    category: project.category,
    title: project.title,
    short_desc: project.description,
    thumbnail_url: project.image,
    challenge_text: project.details?.challenge,
    sulotion_text: project.details?.solution,
    key_result: project.details?.result,
    user_id: project.user_id
  };
  const { data, error } = isNew
    ? await supabase.from('portfolios').insert([dbData]).select().single()
    : await supabase.from('portfolios').update(dbData).eq('id', project.id).select().single();
  if (error) throw error;
  return data;
};

export const deletePortfolio = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('portfolios').delete().eq('id', id);
  return !error;
};

export const saveFeaturedProject = async (featured: any): Promise<any> => {
  const isNew = !featured.id;
  const dbData = {
    title: featured.title,
    description: featured.description,
    image_url: featured.image_url,
    tags: featured.tags,
    impact_value: featured.impact_val,
    impact_desc: featured.impact_desc,
    highlight_year: featured.highlight_y,
    hightlight_desc: featured.hightlight_desc,
    image_label: featured.image_label,
    user_id: featured.user_id
  };
  const { data, error } = isNew
    ? await supabase.from('featured_project').insert([dbData]).select().single()
    : await supabase.from('featured_project').update(dbData).eq('id', featured.id).select().single();
  if (error) throw error;
  return data;
};

export const deleteFeaturedProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('featured_project').delete().eq('id', id);
  return !error;
};

export const fetchStatistics = async (onlyPublished = true): Promise<Statistic[]> => {
  let query = supabase.from('statistics').select('*, profiles(full_name, avatar_url)');
  if (onlyPublished) query = query.eq('is_published', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((row: any) => ({
    ...row,
    image_url: row.image_url || '',
    summary: row.short_desc || '',
    slug: row.slug || (row.title ? generateSlug(row.title) : row.id),
    author: row.profiles?.full_name || 'Admin',
    chart_data: typeof row.chart_data === 'string' ? JSON.parse(row.chart_data) : row.chart_data
  })) as Statistic[];
};

export const saveStatistic = async (stat: Partial<Statistic>): Promise<Statistic | null> => {
  const isNew = !stat.id;
  const { summary, chart_data, ...rest } = stat;
  const dbData: any = { ...rest, short_desc: summary };
  delete (dbData as any).profiles;
  delete (dbData as any).views;
  delete (dbData as any).author;
  delete (dbData as any).slug;
  if (chart_data != null) dbData.chart_data = JSON.stringify(chart_data);
  const { data, error } = isNew
    ? await supabase.from('statistics').insert([dbData]).select().single()
    : await supabase.from('statistics').update(dbData).eq('id', stat.id).select().single();
  if (error) throw error;
  if (data && data.chart_data) data.chart_data = JSON.parse(data.chart_data);
  return data as Statistic;
};

export const deleteStatistic = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('statistics').delete().eq('id', id);
  return !error;
};

export const fetchWeeklyPageViews = async (pageType: string): Promise<{ name: string; views: number }[]> => {
  const now = new Date();
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const result: { name: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();
    const { count } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('page_type', pageType).gte('viewed_at', startOfDay).lt('viewed_at', endOfDay);
    result.push({ name: dayNames[date.getDay()], views: count || 0 });
  }
  return result;
};

export const fetchPageViewCount = async (pageType: string, pageId: string): Promise<number> => {
  const { count } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('page_type', pageType).eq('page_id', pageId);
  return count || 0;
};

export const assignOrphanedToOwner = async (ownerId: string): Promise<void> => {
  await supabase.from('articles').update({ user_id: ownerId }).is('user_id', null);
  await supabase.from('statistics').update({ user_id: ownerId }).is('user_id', null);
  await supabase.from('portfolios').update({ user_id: ownerId }).is('user_id', null);
  await supabase.from('featured_project').update({ user_id: ownerId }).is('user_id', null);
};
