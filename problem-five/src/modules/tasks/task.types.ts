export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  q?: string;
  project_id?: number;
  limit: number;
  offset: number;
}
