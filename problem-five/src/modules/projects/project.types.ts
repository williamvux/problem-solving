export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFilters {
  q?: string;
  limit: number;
  offset: number;
}
