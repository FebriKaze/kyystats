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
