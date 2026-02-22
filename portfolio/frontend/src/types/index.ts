export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  stars?: number;
  link?: string;
  highlight?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: string[];
  stack: string[];
}

export interface Skill {
  category: string;
  items: string[];
}
