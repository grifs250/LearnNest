export interface Category {
  id: string;
  name: string;
  subjects: Subject[];
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  category?: Category;
} 