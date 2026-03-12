import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { exportEvents } from '../utils/csvExport';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2, Edit2, Calendar } from 'lucide-react';
import { Event } from '../types';
import toast from 'react-hot-toast';

const eventColors = [
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
];

type ViewType = 'month' | 'week' | 'day';

export function Scheduler() {
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
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState(eventColors[0]);

  const navigatePrev = () => {
    if (viewType === 'month') setViewDate(subMonths(viewDate, 1));
    else if (viewType === 'week') setViewDate(subWeeks(viewDate, 1));
    else setViewDate(subDays(viewDate, 1));
  };

  const navigateNext = () => {
    if (viewType === 'month') setViewDate(addMonths(viewDate, 1));
    else if (viewType === 'week') setViewDate(addWeeks(viewDate, 1));
    else setViewDate(addDays(viewDate, 1));
  };

  const openModal = (event?: Event, date?: Date) => {
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setDescription(event.description);
      setStartTime(format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"));
      setColor(event.color);
    } else {
      setEditingEvent(null);
      setTitle('');
      setDescription('');
      const defaultDate = date || new Date();
      setStartTime(format(defaultDate, "yyyy-MM-dd'T'09:00"));
      setEndTime(format(defaultDate, "yyyy-MM-dd'T'10:00"));
      setColor(eventColors[Math.floor(Math.random() * eventColors.length)]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    const eventData = {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reminderTime: null,
      color,
    };

    if (editingEvent) {
      dispatch({
        type: 'UPDATE_EVENT',
        payload: { ...editingEvent, ...eventData },
      });
    } else {
      dispatch({
        type: 'ADD_EVENT',
        payload: eventData,
      });
    }
    setIsModalOpen(false);
  };

  // Get calendar days for month view
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get week days for week view
  const weekStart = startOfWeek(viewDate);
  const weekEnd = endOfWeek(viewDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForDay = (date: Date) => {
    return state.events.filter((event) => isSameDay(new Date(event.startTime), date));
  };

  const selectedDayEvents = getEventsForDay(selectedDate).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${cardTitle}`}>Plan Scheduler</h1>
          <p className={`${subText} mt-1`}>Organize your events and appointments</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExport={() => { exportEvents(state.events); toast.success('Events exported!'); }}
            label="Export"
            disabled={state.events.length === 0}
          />
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl transition-shadow"
          >
            <Plus className="h-5 w-5" />
            New Event
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className={`flex-1 ${card} rounded-2xl border  shadow-sm overflow-hidden`}>
          {/* Calendar Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={navigatePrev} className={`p-2 rounded-lg hover:${isDark ? 'bg-gray-800' : 'bg-slate-100'} transition-colors`}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className={`text-lg font-semibold ${cardTitle} min-w-[180px] text-center`}>
                  {viewType === 'month'
                    ? format(viewDate, 'MMMM yyyy')
                    : viewType === 'week'
                      ? `Week of ${format(weekStart, 'MMM d')}`
                      : format(viewDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                <button onClick={navigateNext} className={`p-2 rounded-lg hover:${isDark ? 'bg-gray-800' : 'bg-slate-100'} transition-colors`}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className={`flex gap-1 ${isDark ? 'bg-gray-800' : 'bg-slate-100'} p-1 rounded-lg`}>
                {(['month', 'week', 'day'] as ViewType[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewType(v)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewType === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setViewDate(new Date());
                setSelectedDate(new Date());
              }}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              Today
            </button>
          </div>

          {/* Month View */}
          {viewType === 'month' && (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className={`text-center text-xs font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'} py-2`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, viewDate);
                  const isCurrent = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-1 rounded-lg text-left transition-all ${isSelected
                          ? 'bg-violet-100 ring-2 ring-violet-500'
                          : isCurrent
                            ? 'bg-violet-50'
                            : 'hover:bg-slate-50'
                        } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${isCurrent ? 'bg-violet-600 text-white font-medium' : 'text-slate-700'
                          }`}
                      >
                        {format(day, 'd')}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs px-1 py-0.5 rounded truncate text-white"
                            style={{ backgroundColor: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'} px-1`}>+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewType === 'week' && (
            <div className="p-4 overflow-x-auto">
              <div className="grid grid-cols-8 gap-1 min-w-[600px]">
                <div className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'} py-2`} />
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`text-center py-2 ${isToday(day) ? 'bg-violet-50 rounded-t-lg' : ''}`}
                  >
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{format(day, 'EEE')}</div>
                    <div
                      className={`text-lg font-medium ${isToday(day) ? 'text-violet-600' : 'text-slate-700'
                        }`}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-96 overflow-y-auto">
                {hours.slice(6, 22).map((hour) => (
                  <div key={hour} className="grid grid-cols-8 gap-1 min-w-[600px]">
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'} py-2 text-right pr-2`}>
                      {format(new Date().setHours(hour, 0), 'ha')}
                    </div>
                    {weekDays.map((day) => {
                      const dayEvents = getEventsForDay(day).filter(
                        (e) => new Date(e.startTime).getHours() === hour
                      );
                      return (
                        <div
                          key={day.toISOString()}
                          className={`border-t border-slate-100 min-h-[40px] ${isToday(day) ? 'bg-violet-50/50' : ''
                            }`}
                          onClick={() => openModal(undefined, new Date(day.setHours(hour)))}
                        >
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="text-xs px-1 py-0.5 rounded text-white cursor-pointer"
                              style={{ backgroundColor: event.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(event);
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day View */}
          {viewType === 'day' && (
            <div className="p-4 h-96 overflow-y-auto">
              {hours.map((hour) => {
                const hourEvents = getEventsForDay(viewDate).filter(
                  (e) => new Date(e.startTime).getHours() === hour
                );
                return (
                  <div
                    key={hour}
                    className={`flex gap-4 border-t border-slate-100 min-h-[60px] hover:${isDark ? 'bg-gray-800' : 'bg-slate-50'} transition-colors cursor-pointer`}
                    onClick={() => openModal(undefined, new Date(viewDate.setHours(hour)))}
                  >
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'} py-2 w-16 text-right flex-shrink-0`}>
                      {format(new Date().setHours(hour, 0), 'h:mm a')}
                    </div>
                    <div className="flex-1 py-1">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className="px-3 py-2 rounded-lg text-white mb-1 cursor-pointer"
                          style={{ backgroundColor: event.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(event);
                          }}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm opacity-80">
                            {format(new Date(event.startTime), 'h:mm a')} -{' '}
                            {format(new Date(event.endTime), 'h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Events */}
        <div className={`lg:w-80 ${card} rounded-2xl border  shadow-sm p-4`}>
          <h3 className={`font-semibold ${cardTitle} mb-4 flex items-center gap-2`}>
            <Calendar className="h-5 w-5 text-violet-500" />
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          {selectedDayEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${cardTitle} truncate`}>{event.title}</h4>
                      <div className={`flex items-center gap-1 text-sm ${subText} mt-1`}>
                        <Clock className="h-4 w-4" />
                        {format(new Date(event.startTime), 'h:mm a')} -{' '}
                        {format(new Date(event.endTime), 'h:mm a')}
                      </div>
                      {event.description && (
                        <p className={`text-sm ${subText} mt-1 line-clamp-2`}>{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(event)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 ${isDark ? 'text-gray-500' : 'text-slate-400'} transition-colors`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_EVENT', payload: event.id })}
                        className={`p-1.5 rounded-lg hover:bg-red-50 ${isDark ? 'text-gray-500' : 'text-slate-400'} hover:text-red-500 transition-colors`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events scheduled</p>
              <button
                onClick={() => openModal(undefined, selectedDate)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium mt-2"
              >
                Add event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'New Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title..."
              className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description..."
              rows={3}
              className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500  resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-3 py-2 outline-none transition-all ${inputCls}  rounded-xl focus:ring-2 focus:ring-violet-500 `}
                required
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-1`}>Color</label>
            <div className="flex gap-2">
              {eventColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              {editingEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
