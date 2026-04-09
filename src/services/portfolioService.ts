import { supabase } from '../lib/supabase';
import { Project, FeaturedProject, Article } from '../types';

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
