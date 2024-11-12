import React from 'react';
import { Plus } from 'lucide-react';
import { TodoList } from '../types/todo';

interface Props {
  isOpen: boolean;
  lists: TodoList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onCreateList: () => void;
}

export default function Sidebar({ isOpen, lists, activeListId, onSelectList, onCreateList }: Props) {
  return (
    <div 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-2">
        <button
          onClick={onCreateList}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          title="Create new list"
        >
          <Plus size={20} className="text-gray-600" />
        </button>

        <div className="mt-4 space-y-1">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => onSelectList(list.id)}
              className={`w-full px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                activeListId === list.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {list.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}