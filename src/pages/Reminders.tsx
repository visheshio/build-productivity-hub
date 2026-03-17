import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { exportReminders } from '../utils/csvExport';
import { format, isBefore, addMinutes, addHours, addDays, isPast } from 'date-fns';
import {
  Plus,
  Bell,
  BellOff,
  Clock,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Volume2,
} from 'lucide-react';
import { Reminder } from '../types';
import toast from 'react-hot-toast';

export function Reminders() {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
  const cardTitle = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-gray-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState('');

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Check for due reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dueReminders = state.reminders.filter((r) => {
        const remindTime = r.snoozedUntil ? new Date(r.snoozedUntil) : new Date(r.remindAt);
        return !r.isSent && isBefore(remindTime, now);
      });

      if (dueReminders.length > 0) {
        setActiveReminders(dueReminders);

        // Send browser notification
        if (notificationPermission === 'granted') {
          dueReminders.forEach((reminder) => {
            new Notification('Reminder', {
              body: reminder.title,
              icon: '/favicon.ico',
            });
          });
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [state.reminders, notificationPermission]);

  const openModal = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setTitle(reminder.title);
      setRemindAt(format(new Date(reminder.remindAt), "yyyy-MM-dd'T'HH:mm"));
    } else {
      setEditingReminder(null);
      setTitle('');
      setRemindAt(format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"));
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !remindAt) return;

    const reminderData = {
      title,
      referenceType: 'custom' as const,
      referenceId: null,
      remindAt: new Date(remindAt),
      snoozedUntil: null,
    };

    if (editingReminder) {
      dispatch({
        type: 'UPDATE_REMINDER',
        payload: { ...editingReminder, ...reminderData },
      });
    } else {
      dispatch({
        type: 'ADD_REMINDER',
        payload: reminderData,
      });
    }
    setIsModalOpen(false);
  };

  const snoozeReminder = (id: string, minutes: number) => {
    const snoozeUntil = addMinutes(new Date(), minutes);
    dispatch({
      type: 'SNOOZE_REMINDER',
      payload: { id, until: snoozeUntil },
    });
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const dismissReminder = (id: string) => {
    dispatch({ type: 'DISMISS_REMINDER', payload: id });
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const upcomingReminders = state.reminders
    .filter((r) => !isPast(new Date(r.remindAt)))
    .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());

  const pastReminders = state.reminders
    .filter((r) => isPast(new Date(r.remindAt)))
    .sort((a, b) => new Date(b.remindAt).getTime() - new Date(a.remindAt).getTime());

  const quickAddReminder = (minutes: number, label: string) => {
    dispatch({
      type: 'ADD_REMINDER',
      payload: {
        title: `Reminder in ${label}`,
        referenceType: 'custom',
        referenceId: null,
        remindAt: addMinutes(new Date(), minutes),
        snoozedUntil: null,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${cardTitle}`}>Reminders</h1>
          <p className={`${subText} mt-1`}>Never forget important things</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExport={() => { exportReminders(state.reminders); toast.success('Reminders exported!'); }}
            label="Export"
            disabled={state.reminders.length === 0}
          />
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium shadow-[var(--shadow-md)] hover:shadow-xl transition-shadow"
          >
            <Plus className="h-5 w-5" />
            New Reminder
          </button>
        </div>
      </div>

      {/* Active Reminders Alert */}
      {activeReminders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Active Reminders</h3>
          </div>
          <div className="space-y-3">
            {activeReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white rounded-xl p-4 border border-amber-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-amber-600 animate-pulse" />
                  <div>
                    <p className={`font-medium ${cardTitle}`}>{reminder.title}</p>
                    <p className={`text-sm ${subText}`}>
                      Due: {format(new Date(reminder.remindAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => snoozeReminder(reminder.id, 5)}
                    className={`px-3 py-1 text-sm bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-lg hover:bg-slate-200`}
                  >
                    5 min
                  </button>
                  <button
                    onClick={() => snoozeReminder(reminder.id, 15)}
                    className={`px-3 py-1 text-sm bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-lg hover:bg-slate-200`}
                  >
                    15 min
                  </button>
                  <button
                    onClick={() => snoozeReminder(reminder.id, 60)}
                    className={`px-3 py-1 text-sm bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-lg hover:bg-slate-200`}
                  >
                    1 hour
                  </button>
                  <button
                    onClick={() => dismissReminder(reminder.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Permission */}
      {notificationPermission !== 'granted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Enable Notifications</p>
              <p className="text-sm text-blue-600">Get notified when reminders are due</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Enable
          </button>
        </div>
      )}

      {/* Quick Add */}
      <div className={`${card} rounded-2xl border  p-4`}>
        <h3 className={`font-medium ${cardTitle} mb-3`}>Quick Add</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => quickAddReminder(5, '5 minutes')}
            className={`px-4 py-2 bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-xl hover:bg-slate-200 transition-colors`}
          >
            In 5 min
          </button>
          <button
            onClick={() => quickAddReminder(15, '15 minutes')}
            className={`px-4 py-2 bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-xl hover:bg-slate-200 transition-colors`}
          >
            In 15 min
          </button>
          <button
            onClick={() => quickAddReminder(30, '30 minutes')}
            className={`px-4 py-2 bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-xl hover:bg-slate-200 transition-colors`}
          >
            In 30 min
          </button>
          <button
            onClick={() => quickAddReminder(60, '1 hour')}
            className={`px-4 py-2 bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-xl hover:bg-slate-200 transition-colors`}
          >
            In 1 hour
          </button>
          <button
            onClick={() => {
              dispatch({
                type: 'ADD_REMINDER',
                payload: {
                  title: 'Reminder tomorrow',
                  referenceType: 'custom',
                  referenceId: null,
                  remindAt: addDays(new Date(), 1),
                  snoozedUntil: null,
                },
              });
            }}
            className={`px-4 py-2 bg-slate-100 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-xl hover:bg-slate-200 transition-colors`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <h3 className={`font-semibold ${cardTitle} mb-3 flex items-center gap-2`}>
          <Bell className="h-5 w-5 text-violet-500" />
          Upcoming Reminders ({upcomingReminders.length})
        </h3>
        {upcomingReminders.length > 0 ? (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`${card} rounded-xl p-4 border  hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${cardTitle}`}>{reminder.title}</h4>
                      <div className={`flex items-center gap-1 text-sm ${subText}`}>
                        <Clock className="h-4 w-4" />
                        {format(new Date(reminder.remindAt), 'MMM d, yyyy at h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(reminder)}
                      className={`p-2 rounded-lg hover:bg-slate-100 ${isDark ? 'text-gray-500' : 'text-slate-400'} transition-colors`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_REMINDER', payload: reminder.id })}
                      className={`p-2 rounded-lg hover:bg-red-50 ${isDark ? 'text-gray-500' : 'text-slate-400'} hover:text-red-500 transition-colors`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${card} rounded-2xl border `}>
            <div className={`h-16 w-16 ${isDark ? 'bg-gray-800' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <BellOff className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-medium ${cardTitle} mb-1`}>No upcoming reminders</h3>
            <p className={`${subText}`}>Create a reminder to get notified</p>
          </div>
        )}
      </div>

      {/* Past Reminders */}
      {pastReminders.length > 0 && (
        <div>
          <h3 className={`font-semibold ${cardTitle} mb-3 flex items-center gap-2`}>
            <Clock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
            Past Reminders ({pastReminders.length})
          </h3>
          <div className="space-y-2">
            {pastReminders.slice(0, 5).map((reminder) => (
              <div
                key={reminder.id}
                className={`${isDark ? 'bg-gray-800' : 'bg-slate-50'} rounded-xl p-3 border border-slate-200 flex items-center justify-between opacity-75`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                  <div>
                    <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{reminder.title}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                      {format(new Date(reminder.remindAt), 'MMM d, yyyy at h:mm a')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'DELETE_REMINDER', payload: reminder.id })}
                  className={`p-2 rounded-lg hover:bg-slate-200 ${isDark ? 'text-gray-500' : 'text-slate-400'} transition-colors`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReminder ? 'Edit Reminder' : 'New Reminder'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Reminder Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to be reminded about?"
              className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Remind At</label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`flex-1 px-4 py-2 border border-slate-200 ${isDark ? 'text-gray-300' : 'text-slate-700'} rounded-xl hover:bg-slate-50 transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              {editingReminder ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
