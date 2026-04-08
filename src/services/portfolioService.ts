import { supabase } from '../lib/supabase';
import { Project, FeaturedProject } from '../types';

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
    image: row.image_url || '',
    details: {
      challenge: row.challenge_text,
      solution: row.sulotion_text,
      result: row.result_text || 'Project completed with significant impact and measurable success.'
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
