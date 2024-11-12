import React from 'react';
import { Menu } from 'lucide-react';
import { useUser, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { TodoList, TodoItem } from './types/todo';
import TodoItemComponent from './components/TodoItem';
import Sidebar from './components/Sidebar';
import ListTitle from './components/ListTitle';
import Settings from './components/Settings';
import { useLocalStorage } from './hooks/useLocalStorage';

function createId() {
  return Math.random().toString(36).substr(2, 9);
}

function App() {
  const { user } = useUser();
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const [lists, setLists] = useLocalStorage<TodoList[]>('todoLists', []);
  const [activeListId, setActiveListId] = useLocalStorage<string | null>('activeListId', null);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const activeList = lists.find(list => list.id === activeListId);

  const handleCreateList = () => {
    const newList: TodoList = {
      id: createId(),
      name: 'Untitled List',
      todos: []
    };
    setLists([...lists, newList]);
    setActiveListId(newList.id);
  };

  const updateListTitle = (newTitle: string) => {
    if (!activeListId) return;
    setLists(lists.map(list => 
      list.id === activeListId ? { ...list, name: newTitle } : list
    ));
  };

  const updateTodo = (id: string, updates: Partial<TodoItem>) => {
    if (!activeListId) return;
    setLists(lists.map(list => {
      if (list.id !== activeListId) return list;
      return {
        ...list,
        todos: list.todos.map(todo => 
          todo.id === id ? { ...todo, ...updates } : todo
        )
      };
    }));
  };

  const duplicateTodo = (id: string) => {
    if (!activeListId) return;
    const currentList = lists.find(list => list.id === activeListId)!;
    const todoToDuplicate = currentList.todos.find(todo => todo.id === id)!;
    const currentIndex = currentList.todos.findIndex(todo => todo.id === id);
    
    const newTodo: TodoItem = {
      ...todoToDuplicate,
      id: createId(),
      title: todoToDuplicate.title
    };

    setLists(lists.map(list => {
      if (list.id !== activeListId) return list;
      const newTodos = [...list.todos];
      newTodos.splice(currentIndex + 1, 0, newTodo);
      return { ...list, todos: newTodos };
    }));
  };

  const deleteTodo = (id: string) => {
    if (!activeListId) return;
    setLists(lists.map(list => {
      if (list.id !== activeListId) return list;
      return {
        ...list,
        todos: list.todos.filter(todo => todo.id !== id)
      };
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (!activeListId) return;
    
    const currentList = lists.find(list => list.id === activeListId)!;
    const currentIndex = currentList.todos.findIndex(todo => todo.id === id);
    const currentTodo = currentList.todos[currentIndex];

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const newTodo: TodoItem = {
        id: createId(),
        title: '',
        completed: false,
        level: currentTodo.level,
        isEmpty: true
      };

      setLists(lists.map(list => {
        if (list.id !== activeListId) return list;
        const newTodos = [...list.todos];
        newTodos.splice(currentIndex + 1, 0, newTodo);
        return { ...list, todos: newTodos };
      }));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const newLevel = e.shiftKey 
        ? Math.max(0, currentTodo.level - 1)
        : currentTodo.level + 1;
      
      updateTodo(id, { level: newLevel });
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors`}>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        </header>

        <Sidebar
          isOpen={isSidebarOpen}
          lists={lists}
          activeListId={activeListId || ''}
          onSelectList={setActiveListId}
          onCreateList={handleCreateList}
        />

        <Settings isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

        <main className={`pt-24 pb-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-3xl mx-auto px-4">
            {activeList ? (
              <>
                <ListTitle 
                  title={activeList.name}
                  onUpdateTitle={updateListTitle}
                />
                {activeList.todos.map((todo) => (
                  <TodoItemComponent
                    key={todo.id}
                    item={todo}
                    onUpdate={updateTodo}
                    onKeyDown={handleKeyDown}
                    onDelete={deleteTodo}
                    onDuplicate={duplicateTodo}
                  />
                ))}
                {activeList.todos.length === 0 && (
                  <button
                    onClick={() => {
                      setLists(lists.map(list => {
                        if (list.id !== activeListId) return list;
                        return {
                          ...list,
                          todos: [...list.todos, {
                            id: createId(),
                            title: '',
                            completed: false,
                            level: 0,
                            isEmpty: true
                          }]
                        };
                      }));
                    }}
                    className="w-full text-left px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Click to add a task...
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Click the + button in the sidebar to create a new list
                </p>
              </div>
            )}
          </div>
        </main>
      </SignedIn>
    </div>
  );
}

export default App;