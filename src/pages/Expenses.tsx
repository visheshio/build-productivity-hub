import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/common/Modal';
import { CategoryAutoSuggest } from '../components/common/CategoryAutoSuggest';
import { useCategories } from '../context/SuggestionsContext';
import { ExportDropdown } from '../components/common/ExportDropdown';
import { exportExpenses } from '../utils/csvExport';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Trash2,
  Edit2,
  Filter,
  Repeat,
  PiggyBank,
  FileSpreadsheet,
} from 'lucide-react';
import { Expense } from '../types';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export function Expenses() {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
  const cardTitle = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-gray-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
  const expenseCategoryOptions = useCategories('expenses');
  const incomeCategoryOptions = useCategories('income');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(false);

  const [budgetCategory, setBudgetCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');

  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));

  const monthlyExpenses = state.expenses.filter((e) =>
    isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  );

  const filteredExpenses = monthlyExpenses
    .filter((e) => filterType === 'all' || e.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = monthlyExpenses.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = monthlyExpenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Expense breakdown by category
  const expensesByCategory = monthlyExpenses
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  // Budget vs actual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthBudgets = state.budgets.filter((b) => b.month === currentMonth && b.year === currentYear);

  const budgetComparisonData = monthBudgets.map((budget) => ({
    category: budget.category,
    budget: budget.amount,
    spent: expensesByCategory[budget.category] || 0,
  }));

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setAmount(expense.amount.toString());
      setType(expense.type);
      setCategory(expense.category);
      setDescription(expense.description);
      setDate(format(new Date(expense.date), 'yyyy-MM-dd'));
      setIsRecurring(expense.isRecurring);
    } else {
      setEditingExpense(null);
      setAmount('');
      setType('expense');
      setCategory('Food');
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setIsRecurring(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const expenseData = {
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date(date),
      isRecurring,
    };

    if (editingExpense) {
      dispatch({
        type: 'UPDATE_EXPENSE',
        payload: { ...editingExpense, ...expenseData },
      });
    } else {
      dispatch({
        type: 'ADD_EXPENSE',
        payload: expenseData,
      });
    }
    setIsModalOpen(false);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;

    dispatch({
      type: 'SET_BUDGET',
      payload: {
        category: budgetCategory,
        amount: parseFloat(budgetAmount),
        month: currentMonth,
        year: currentYear,
      },
    });
    setIsBudgetModalOpen(false);
    setBudgetAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${cardTitle}`}>Expense Tracker</h1>
          <p className={`${subText} mt-1`}>Track your income and expenses</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            options={[
              {
                label: 'Export Current Month',
                icon: <FileSpreadsheet className="h-4 w-4" />,
                onExport: () => { exportExpenses(monthlyExpenses); toast.success('Monthly expenses exported!'); },
              },
              {
                label: `Export All (${state.expenses.length})`,
                onExport: () => { exportExpenses(state.expenses); toast.success('All expenses exported!'); },
              },
            ]}
            label="Export"
            disabled={state.expenses.length === 0}
          />
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PiggyBank className="h-5 w-5" />
            Set Budget
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium shadow-[var(--shadow-md)] hover:shadow-xl transition-shadow"
          >
            <Plus className="h-5 w-5" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${card} rounded-2xl p-5 border  shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className={`text-sm ${subText}`}>Income</p>
              <p className="text-2xl font-bold text-emerald-600">₹{totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={`${card} rounded-2xl p-5 border  shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className={`text-sm ${subText}`}>Expenses</p>
              <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={`${card} rounded-2xl p-5 border  shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl ${balance >= 0 ? 'bg-violet-100' : 'bg-amber-100'} flex items-center justify-center`}>
              <IndianRupee className={`h-6 w-6 ${balance >= 0 ? 'text-violet-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${subText}`}>Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-violet-600' : 'text-amber-600'}`}>
                ₹{Math.abs(balance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`${card} rounded-2xl p-6 border  shadow-sm`}>
          <h3 className={`font-semibold ${cardTitle} mb-4`}>Expense Breakdown</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-4 max-h-40 overflow-y-auto">
                {pieData.map((item, index) => (
                  <div key={item.name} className={`flex items-center justify-between gap-2 text-xs px-2 py-1 rounded hover:${isDark ? 'bg-gray-800' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} flex-shrink-0`}>₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`h-80 flex items-center justify-center ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>No expense data</div>
          )}
        </div>

        <div className={`${card} rounded-2xl p-6 border  shadow-sm`}>
          <h3 className={`font-semibold ${cardTitle} mb-4`}>Budget vs Actual</h3>
          {budgetComparisonData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparisonData} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Bar dataKey="budget" fill="#c4b5fd" name="Budget" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" fill="#8b5cf6" name="Spent" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-56 flex items-center justify-center ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              No budgets set. Click "Set Budget" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className={`px-3 py-2 outline-none transition-all ${inputCls}  rounded-lg focus:ring-2 focus:ring-violet-500 `}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={`px-3 py-2 outline-none transition-all ${inputCls}  rounded-lg focus:ring-2 focus:ring-violet-500 `}
        />
      </div>

      {/* Transactions List */}
      {filteredExpenses.length > 0 ? (
        <div className={`${card} rounded-2xl border  shadow-sm overflow-hidden`}>
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className={`p-4 hover:${isDark ? 'bg-gray-800' : 'bg-slate-50'} transition-colors`}>
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${expense.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}
                  >
                    {expense.type === 'income' ? (
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${cardTitle}`}>{expense.category}</h4>
                      {expense.isRecurring && <Repeat className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />}
                    </div>
                    <p className={`text-sm ${subText} truncate`}>{expense.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${expense.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                    >
                      {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toLocaleString()}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(expense)}
                      className={`p-2 rounded-lg hover:bg-slate-100 ${isDark ? 'text-gray-500' : 'text-slate-400'} transition-colors`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: expense.id })}
                      className={`p-2 rounded-lg hover:bg-red-50 ${isDark ? 'text-gray-500' : 'text-slate-400'} hover:text-red-500 transition-colors`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className={`h-16 w-16 ${isDark ? 'bg-gray-800' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <IndianRupee className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          </div>
          <h3 className={`text-lg font-medium ${cardTitle} mb-1`}>No transactions found</h3>
          <p className={`${subText}`}>Add your first transaction to get started</p>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Entry' : 'Add Entry'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`flex-1 py-2 rounded-xl font-medium transition-colors ${type === 'income'
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-2 border-transparent'
                  }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Food');
                }}
                className={`flex-1 py-2 rounded-xl font-medium transition-colors ${type === 'expense'
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-slate-100 text-slate-600 border-2 border-transparent'
                  }`}
              >
                Expense
              </button>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Amount</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Category</label>
              <CategoryAutoSuggest
                categories={
                  type === 'income'
                    ? (incomeCategoryOptions.length > 0 ? incomeCategoryOptions : incomeCategories)
                    : (expenseCategoryOptions.length > 0 ? expenseCategoryOptions : expenseCategories)
                }
                value={category}
                onChange={setCategory}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Recurring transaction</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`flex-1 px-4 py-2 border rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              {editingExpense ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Budget Modal */}
      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Set Budget">
        <form onSubmit={handleBudgetSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Category</label>
            <select
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Monthly Budget</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className={`flex-1 px-4 py-2 border rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Set Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
