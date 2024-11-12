import React, { useRef, useEffect } from 'react';
import { Check, MoreVertical, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { TodoItem as TodoItemType, Priority } from '../types/todo';
import 'react-day-picker/dist/style.css';

interface Props {
  item: TodoItemType;
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const priorities: { value: Priority | null; label: string; icon: JSX.Element }[] = [
  { value: null, label: 'No Priority', icon: <AlertTriangle className="text-gray-400" size={16} /> },
  { value: 'high', label: 'High Priority', icon: <AlertTriangle className="text-red-500" size={16} /> },
  { value: 'medium', label: 'Medium Priority', icon: <AlertTriangle className="text-yellow-500" size={16} /> },
  { value: 'low', label: 'Low Priority', icon: <AlertTriangle className="text-blue-500" size={16} /> },
];

export default function TodoItem({ item, onUpdate, onKeyDown, onDelete, onDuplicate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = React.useState(false);

  useEffect(() => {
    if (item.title === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [item.title]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const newLevel = e.shiftKey ? Math.max(0, item.level - 1) : item.level + 1;
      onUpdate(item.id, { level: newLevel });
    } else {
      onKeyDown(e, item.id);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(item.id, { dueTime: e.target.value });
    setIsTimePickerOpen(false);
  };

  const priorityInfo = item.priority ? priorities.find(p => p.value === item.priority) : priorities[0];

  return (
    <div 
      className="group flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      style={{ marginLeft: `${item.level * 24}px` }}
    >
      <button
        onClick={() => onUpdate(item.id, { completed: !item.completed })}
        className="flex-shrink-0 w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-500 transition-colors"
      >
        {item.completed && <Check size={14} className="text-blue-500" />}
      </button>

      <input
        ref={inputRef}
        value={item.title}
        onChange={(e) => onUpdate(item.id, { title: e.target.value })}
        onKeyDown={handleKeyDown}
        className={`flex-grow bg-transparent outline-none ${
          item.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'
        }`}
        placeholder="Type your task..."
      />

      <div className="flex items-center gap-2">
        {(item.dueDate || item.priority) && (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex items-center gap-2">
                  {item.dueDate && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(item.dueDate, 'MMM d')}
                      {item.dueTime && ` at ${item.dueTime}`}
                    </span>
                  )}
                  {priorityInfo && (
                    <span className="flex items-center gap-1">
                      {priorityInfo.icon}
                    </span>
                  )}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-2 py-1 rounded text-sm"
                  sideOffset={5}
                >
                  {item.dueDate && (
                    <div>
                      Due: {format(item.dueDate, 'PPP')}
                      {item.dueTime && ` at ${item.dueTime}`}
                    </div>
                  )}
                  {priorityInfo && <div>Priority: {priorityInfo.label}</div>}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 z-50"
                sideOffset={5}
              >
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Calendar size={16} />
                      {item.dueDate ? 'Change due date' : 'Set due date'}
                    </DropdownMenu.Item>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-50">
                      <DayPicker
                        mode="single"
                        selected={item.dueDate}
                        onSelect={(date) => onUpdate(item.id, { dueDate: date || undefined })}
                        className="dark:text-white"
                      />
                      <Popover.Arrow className="fill-white dark:fill-gray-800" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                >
                  <Clock size={16} />
                  {item.dueTime ? 'Change time' : 'Set time'}
                </DropdownMenu.Item>
                
                {isTimePickerOpen && (
                  <div className="px-2 py-1">
                    <input
                      type="time"
                      value={item.dueTime || ''}
                      onChange={handleTimeChange}
                      className="w-full p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                )}

                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                {priorities.map(({ value, label, icon }) => (
                  <DropdownMenu.Item
                    key={value || 'none'}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => onUpdate(item.id, { priority: value })}
                  >
                    {icon}
                    {label}
                  </DropdownMenu.Item>
                ))}

                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => onDuplicate(item.id)}
                >
                  Duplicate task
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  );
}