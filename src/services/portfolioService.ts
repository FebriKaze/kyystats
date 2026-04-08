import { supabase } from '../lib/supabase';
import { Project } from '../types';

export const fetchPortfolios = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolios:', error);
    return [];
  }

  return data.map((row: any, index: number) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.short_desc,
    image: row.image_url || '', // Fallback to empty, will be handled if needed
    details: {
      challenge: row.challenge_text,
      solution: row.sulotion_text, // Consistent with screenshot typo
      result: row.result_text || 'Project completed with significant impact and measurable success.'
    }
  }));
};
