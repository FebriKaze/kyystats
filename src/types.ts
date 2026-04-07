export interface Project {
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
