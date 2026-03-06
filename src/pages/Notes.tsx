import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { useDarkMode } from '../hooks/useDarkMode';
import { format } from 'date-fns';
import { Plus, Search, Pin, Trash2, Edit2, X, StickyNote } from 'lucide-react';
import { Note } from '../types';

export function Notes() {
  const { state, dispatch } = useApp();
  const dm = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const allTags = Array.from(new Set(state.notes.flatMap((n) => n.tags)));

  const filteredNotes = state.notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note); setTitle(note.title); setContent(note.content); setTags(note.tags);
    } else {
      setEditingNote(null); setTitle(''); setContent(''); setTags([]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingNote) {
      dispatch({ type: 'UPDATE_NOTE', payload: { ...editingNote, title, content, tags } });
    } else {
      dispatch({ type: 'ADD_NOTE', payload: { title, content, tags, isPinned: false } });
    }
    setIsModalOpen(false);
  };

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag(''); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${dm.cardTitle}`}>Notes</h1>
          <p className={dm.subText}>Capture your thoughts and ideas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200/50 hover:shadow-xl transition-all"
        >
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${dm.mutedText}`} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none text-sm transition-all ${dm.input}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!selectedTag ? dm.activeFilter : dm.inactiveFilter}`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTag === tag ? dm.activeFilter : dm.inactiveFilter}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-2xl p-5 shadow-sm border transition-all duration-200 group ${dm.card} ${
                note.isPinned ? 'ring-2 ring-amber-400/60' : ''
              } hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className={`font-semibold line-clamp-1 flex-1 ${dm.cardTitle}`}>
                  {note.isPinned && <span className="text-amber-400 mr-1">📌</span>}
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_PIN_NOTE', payload: note.id })}
                    className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-amber-500' : dm.mutedText} ${dm.hoverItem}`}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openModal(note)} className={`p-1.5 rounded-lg transition-colors ${dm.mutedText} ${dm.hoverItem}`}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}
                    className={`p-1.5 rounded-lg transition-colors text-red-400 ${dm.isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className={`text-sm line-clamp-3 mb-3 whitespace-pre-wrap ${dm.subText}`}>{note.content}</p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map((tag) => (
                    <span key={tag} className={`px-2 py-0.5 rounded-md text-xs font-medium ${dm.tagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
              )}
              <p className={`text-xs ${dm.mutedText}`}>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dm.emptyBg}`}>
            <StickyNote className={`h-8 w-8 ${dm.emptyIcon}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-1 ${dm.cardTitle}`}>No notes found</h3>
          <p className={dm.subText}>{searchQuery || selectedTag ? 'Try a different search or filter' : 'Create your first note to get started'}</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? 'Edit Note' : 'New Note'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dm.label}`}>Title</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..." required
              className={`w-full px-3 py-2.5 border rounded-xl outline-none text-sm transition-all ${dm.input}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dm.label}`}>Content</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..." rows={6}
              className={`w-full px-3 py-2.5 border rounded-xl outline-none text-sm resize-none transition-all ${dm.input}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dm.label}`}>Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className={`flex-1 px-3 py-2 border rounded-xl outline-none text-sm transition-all ${dm.input}`}
              />
              <button type="button" onClick={addTag}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dm.isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${dm.tagColor(tag)}`}>
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className={`flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${dm.cancelBtn}`}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow text-sm">
              {editingNote ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
