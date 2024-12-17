'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Task } from '@/types/task';
import { api } from '@/lib/api';

const COLORS = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
];

export default function TaskForm() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = pathname.startsWith('/tasks/') && !pathname.includes('/new');

  useEffect(() => {
    if (isEditing) {
      fetchTask();
    }
  }, [params?.id]);

  const fetchTask = async () => {
    try {
      const tasks = await api.getTasks();
      const task = tasks.find(t => t.id === params?.id);
      if (task) {
        setTitle(task.title);
        setColor(task.color);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (isEditing && params?.id) {
        await api.updateTask(params?.id, { title, color });
      } else {
        // Use createTask instead of updateTask for new tasks
        await api.createTask({ title, color, completed: false });
      }
      router.push('/');
    } catch (error) {
      console.error('Failed to save task:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Task' : 'Create Task'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="mt-2 space-x-4">
            {COLORS.map(({ label, value }) => (
              <label key={value} className="inline-flex items-center">
                <input
                  type="radio"
                  value={value}
                  checked={color === value}
                  onChange={(e) => setColor(e.target.value)}
                  className="mr-2"
                />
                <span style={{ color: value }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Task'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}