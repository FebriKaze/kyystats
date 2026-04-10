import { supabase } from '../lib/supabase';
import { Project, FeaturedProject, Article, Statistic } from '../types';

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
    category: row.category,
    title: row.title,
    description: row.short_desc,
    image: row.thumbnail_url || '',
    details: {
      challenge: row.challenge_text,
      solution: row.sulotion_text,
      result: row.key_result || 'Project completed with significant impact and measurable success.'
    }
  }));
};

export const fetchFeaturedProjects = async (): Promise<FeaturedProject[]> => {
  const { data, error } = await supabase
    .from('featured_project')
    .select('*')
    .order('updated_at', { ascending: false });

  return data.map((row: any) => ({
    id: String(row.id),
    title: row.title || '',
    description: row.description || '',
    image_url: row.image_url || '',
    tags: row.tags || [],
    impact_val: row.impact_value || '', // Matches DB column: impact_value
    impact_desc: row.impact_desc || '',
    highlight_y: row.highlight_year || '', // Matches DB column: highlight_year
    hightlight_desc: row.hightlight_desc || '',
    image_label: row.image_label || ''
  }));
};

export const fetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data as Article[];
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data as Article;
};
// --- ARTICLES CRUD ---
export const saveArticle = async (article: Partial<Article>): Promise<Article | null> => {
  const isNew = !article.id;
  const { data, error } = isNew
    ? await supabase.from('articles').insert([article]).select().single()
    : await supabase.from('articles').update(article).eq('id', article.id).select().single();

  if (error) {
    console.error('Error saving article:', error);
    throw error;
  }
  return data as Article;
};

export const deleteArticle = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) {
    console.error('Error deleting article:', error);
    return false;
  }
  return true;
};

// --- PORTFOLIO CRUD ---
export const savePortfolio = async (project: any): Promise<any> => {
  const isNew = !project.id;
  
  // Map back to DB schema
  const dbData = {
    category: project.category,
    title: project.title,
    short_desc: project.description,
    thumbnail_url: project.image,
    challenge_text: project.details.challenge,
    sulotion_text: project.details.solution,
    key_result: project.details.result
  };

  const { data, error } = isNew
    ? await supabase.from('portfolios').insert([dbData]).select().single()
    : await supabase.from('portfolios').update(dbData).eq('id', project.id).select().single();

  if (error) {
    console.error('Error saving portfolio:', error);
    throw error;
  }
  return data;
};

export const deletePortfolio = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('portfolios').delete().eq('id', id);
  if (error) {
    console.error('Error deleting portfolio:', error);
    return false;
  }
  return true;
};

// --- FEATURED CRUD ---
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
    image_label: featured.image_label
  };

  const { data, error } = isNew
    ? await supabase.from('featured_project').insert([dbData]).select().single()
    : await supabase.from('featured_project').update(dbData).eq('id', featured.id).select().single();

  if (error) {
    console.error('Error saving featured:', error);
    throw error;
  }
  return data;
};

export const deleteFeaturedProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('featured_project').delete().eq('id', id);
  if (error) {
    console.error('Error deleting featured:', error);
    return false;
  }
  return true;
};

// --- STATISTICS CRUD ---
export const fetchStatistics = async (): Promise<Statistic[]> => {
  const { data, error } = await supabase
    .from('statistics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching statistics:', error);
    return [];
  }
  return data.map((row: any) => ({
    ...row,
    summary: row.short_desc || ''
  })) as Statistic[];
};

export const saveStatistic = async (stat: Partial<Statistic>): Promise<Statistic | null> => {
  const isNew = !stat.id;
  // Map summary back to short_desc
  const { summary, ...rest } = stat;
  const dbData = { ...rest, short_desc: summary };

  const { data, error } = isNew
    ? await supabase.from('statistics').insert([dbData]).select().single()
    : await supabase.from('statistics').update(dbData).eq('id', stat.id).select().single();

  if (error) {
    console.error('Error saving statistic:', error);
    throw error;
  }
  return data as Statistic;
};

export const deleteStatistic = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('statistics').delete().eq('id', id);
  if (error) {
    console.error('Error deleting statistic:', error);
    return false;
  }
  return true;
};

// --- PAGE VIEWS ---
export const fetchWeeklyPageViews = async (pageType: string): Promise<{ name: string; views: number }[]> => {
  const now = new Date();
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const result: { name: string; views: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const { count, error } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('page_type', pageType)
      .gte('viewed_at', startOfDay)
      .lt('viewed_at', endOfDay);

    result.push({
      name: dayNames[date.getDay()],
      views: error ? 0 : (count || 0)
    });
  }

  return result;
};

export const fetchPageViewCount = async (pageType: string, pageId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('page_type', pageType)
    .eq('page_id', pageId);

  if (error) return 0;
  return count || 0;
};

export const fetchTotalViews = async (pageType: string): Promise<number> => {
  const { count, error } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('page_type', pageType);

  if (error) return 0;
  return count || 0;
};
