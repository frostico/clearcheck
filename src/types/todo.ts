export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  level: number;
  isEmpty?: boolean;
  dueDate?: Date;
  priority?: 'high' | 'medium' | 'low' | 'none';
}

export interface TodoList {
  id: string;
  name: string;
  todos: TodoItem[];
}
