import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Trash2, Plus, Search, 
  Sun, Moon, BarChart3, ListTodo, Loader2 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tasks`);
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setFetching(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    const promise = axios.post(`${API_BASE}/api/tasks`, { title: newTask, completed: false });
    toast.promise(promise, {
      loading: 'Adding task...',
      success: 'Task added!',
      error: 'Failed to add task'
    });
    try {
      await promise;
      setNewTask('');
      fetchTasks();
    } catch (err) {}
  };

  const handleToggleComplete = async (task) => {
    try {
      await axios.patch(`${API_BASE}/api/tasks/${task.id}`, { completed: !task.completed });
      fetchTasks();
      toast.success(task.completed ? 'Task marked incomplete' : 'Task completed!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id, title) => {
    const promise = axios.delete(`${API_BASE}/api/tasks/${id}`);
    toast.promise(promise, {
      loading: 'Deleting...',
      success: `"${title}" deleted`,
      error: 'Failed to delete'
    });
    try {
      await promise;
      fetchTasks();
    } catch (err) {}
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/search`, { params: { q: searchQuery } });
      setSearchResults(res.data);
      if (res.data.length === 0) toast('No results found', { icon: '🔍' });
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark:bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            ✦ TaskFlow
          </motion.h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              </div>
              <ListTodo className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-80" />
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-400 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Add Task Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddTask}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </div>
        </motion.form>

        {/* Task List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Tasks</h2>
          </div>
          {fetching ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">All clear! Add a new task to get started.</p>
            </div>
          ) : (
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition group"
                >
                  <button onClick={() => handleToggleComplete(task)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500 transition" />
                    )}
                  </button>
                  <span className={`flex-1 text-gray-800 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                    {task.title}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5" /> Search Tasks
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Results ({searchResults.length})</h3>
              <ul className="space-y-2">
                {searchResults.map((task) => (
                  <li key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {task.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                    <span className={task.completed ? 'line-through text-gray-500' : 'dark:text-white'}>{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
