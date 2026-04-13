export interface Project {
  id?: string;
  category: string;
  title: string;
  description: string;
  image: string;
  details: {
    challenge: string;
    solution: string;
    result: string;
  };
  user_id?: string;
}

export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  impact_val: string;
  impact_desc: string;
  highlight_y: string;
  hightlight_desc: string;
  image_label: string;
  user_id?: string;
}

export interface Article {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  thumbnail_url: string;
  author: string;
  is_published: boolean;
  views?: number;
  user_id?: string;
  chart_data?: {
    title: string;
    data: Array<{
      label: string;
      value: number;
      color?: string;
    }>;
    source: 'upload' | 'manual';
    originalFile?: {
      name: string;
      type: string;
    };
  };
}

export interface Statistic {
  id: string;
  created_at: string;
  title: string;
  slug?: string;
  category: string;
  author: string;
  image_url: string;
  summary: string;
  content: string;
  views: number;
  is_published: boolean;
  user_id?: string;
  chart_data?: {
    title: string;
    data: Array<{
      label: string;
      value: number;
      color?: string;
    }>;
    source: 'upload' | 'manual';
    originalFile?: {
      name: string;
      type: string;
    };
  };
}
