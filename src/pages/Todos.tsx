import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { format, isBefore, startOfDay } from 'date-fns';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Filter,
  ChevronDown,
  AlertCircle,
  ListChecks,
  X,
} from 'lucide-react';
import { Todo, ChecklistItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { staggerContainer, staggerItem, slideUp } from '../utils/animations';

const priorityColors = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const statusColors = {
  pending: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Other'];

export function Todos() {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Personal');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const filteredTodos = state.todos
    .filter((todo) => {
      const matchesStatus = !filterStatus || todo.status === filterStatus;
      const matchesCategory = !filterCategory || todo.category === filterCategory;
      return matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by status (completed last), then by priority, then by due date
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
      setTitle(todo.title);
      setDescription(todo.description);
      setPriority(todo.priority);
      setStatus(todo.status);
      setDueDate(todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd') : '');
      setCategory(todo.category);
      setChecklist(todo.checklist);
    } else {
      setEditingTodo(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('pending');
      setDueDate('');
      setCategory('Personal');
      setChecklist([]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todoData = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      category,
      checklist,
    };

    if (editingTodo) {
      dispatch({
        type: 'UPDATE_TODO',
        payload: { ...editingTodo, ...todoData },
      });
    } else {
      dispatch({
        type: 'ADD_TODO',
        payload: todoData,
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    dispatch({
      type: 'UPDATE_TODO',
      payload: { ...todo, status: newStatus },
    });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([...checklist, { id: uuidv4(), text: newChecklistItem, completed: false }]);
      setNewChecklistItem('');
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const isOverdue = (todo: Todo) =>
    todo.dueDate &&
    isBefore(new Date(todo.dueDate), startOfDay(new Date())) &&
    todo.status !== 'completed';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">To-Do List</h1>
          <p className="text-slate-500 mt-1">Manage your tasks and stay productive</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl font-medium transition-colors ${
              showFilters ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filters
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl transition-shadow"
          >
            <Plus className="h-5 w-5" />
            Add Task
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl p-4 border border-slate-200 flex flex-wrap gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value || null)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {state.todos.filter((t) => t.status === 'pending').length}
          </p>
          <p className="text-sm text-slate-500">Pending</p>
        </motion.div>
        <motion.div variants={staggerItem} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {state.todos.filter((t) => t.status === 'in-progress').length}
          </p>
          <p className="text-sm text-slate-500">In Progress</p>
        </motion.div>
        <motion.div variants={staggerItem} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {state.todos.filter((t) => t.status === 'completed').length}
          </p>
          <p className="text-sm text-slate-500">Completed</p>
        </motion.div>
      </motion.div>

      {/* Todos List */}
      {filteredTodos.length > 0 ? (
        <motion.div 
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                variants={staggerItem}
                exit={{ opacity: 0, x: -100 }}
                layout
                className={`bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow ${
                  todo.status === 'completed' ? 'opacity-75' : ''
                } ${isOverdue(todo) ? 'border-red-300 bg-red-50' : ''}`}
              >
              <div className="flex items-start gap-3">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleStatus(todo)}
                  className={`mt-1 flex-shrink-0 ${
                    todo.status === 'completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-violet-500'
                  }`}
                >
                  {todo.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </motion.button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`font-medium text-slate-900 ${
                        todo.status === 'completed' ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {todo.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(todo)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                  {todo.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{todo.description}</p>
                  )}
                  {todo.checklist.length > 0 && (
                    <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      {todo.checklist.filter((c) => c.completed).length}/{todo.checklist.length} completed
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityColors[todo.priority]}`}>
                      {todo.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[todo.status]}`}>
                      {todo.status.replace('-', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {todo.category}
                    </span>
                    {todo.dueDate && (
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          isOverdue(todo) ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOverdue(todo) ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {format(new Date(todo.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks found</h3>
          <p className="text-slate-500">
            {filterStatus || filterCategory ? 'Try different filters' : 'Add your first task to get started'}
          </p>
        </motion.div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTodo ? 'Edit Task' : 'Add Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Checklist</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={item.completed ? 'text-emerald-500' : 'text-slate-300'}
                  >
                    {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : ''}`}>
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              {editingTodo ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
