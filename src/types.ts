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
}
