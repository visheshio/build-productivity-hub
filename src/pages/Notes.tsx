import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { useDarkMode } from '../hooks/useDarkMode';
import { TagAutoSuggest } from '../components/common/TagAutoSuggest';
import { useTags } from '../context/SuggestionsContext';
import { ExportButton } from '../components/common/ExportButton';
import { exportNotes } from '../utils/csvExport';
import { format } from 'date-fns';
import { Plus, Search, Pin, Trash2, Edit2, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { Note } from '../types';
import { staggerContainer, staggerItem } from '../utils/animations';

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
  const { tags: suggestionTags, addTag: saveSuggestionTag } = useTags();
  const allTags = Array.from(new Set(state.notes.flatMap((n) => n.tags)));
  // Merge existing note tags with default suggestions
  const tagSuggestions = Array.from(new Set([...suggestionTags, ...allTags]));

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



  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${dm.cardTitle}`}>Notes</h1>
          <p className={dm.subText}>Capture your thoughts and ideas</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExport={() => { exportNotes(state.notes); toast.success('Notes exported!'); }}
            label="Export"
            disabled={state.notes.length === 0}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-xl font-medium shadow-[var(--shadow-md)] hover:shadow-xl transition-shadow"
          >
            <Plus className="h-4 w-4" /> New Note
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-4"
      >
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
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!selectedTag ? dm.activeFilter : dm.inactiveFilter}`}
          >
            All
          </motion.button>
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTag === tag ? dm.activeFilter : dm.inactiveFilter}`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                variants={staggerItem}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                layout
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className={`rounded-2xl p-5 shadow-sm border transition-colors duration-200 group ${dm.card} ${note.isPinned ? 'ring-2 ring-amber-400/60' : ''
                  }`}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className={`font-semibold line-clamp-1 flex-1 ${dm.cardTitle}`}>
                    {note.isPinned && <span className="text-amber-400 mr-1">📌</span>}
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => dispatch({ type: 'TOGGLE_PIN_NOTE', payload: note.id })}
                      className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-amber-500' : dm.mutedText} ${dm.hoverItem}`}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => openModal(note)}
                      className={`p-1.5 rounded-lg transition-colors ${dm.mutedText} ${dm.hoverItem}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}
                      className={`p-1.5 rounded-lg transition-colors text-red-400 ${dm.isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dm.emptyBg}`}
          >
            <StickyNote className={`h-8 w-8 ${dm.emptyIcon}`} />
          </motion.div>
          <h3 className={`text-lg font-semibold mb-1 ${dm.cardTitle}`}>No notes found</h3>
          <p className={dm.subText}>{searchQuery || selectedTag ? 'Try a different search or filter' : 'Create your first note to get started'}</p>
        </motion.div>
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
            <TagAutoSuggest
              suggestions={tagSuggestions}
              selectedTags={tags}
              onTagsChange={(newTags) => {
                // Save any new custom tags to the suggestions context
                newTags.forEach((t) => {
                  if (!tags.includes(t)) saveSuggestionTag(t);
                });
                setTags(newTags);
              }}
              placeholder="Add tags..."
              allowCustom
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className={`flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${dm.cancelBtn}`}>
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:shadow-lg transition-shadow text-sm"
            >
              {editingNote ? 'Update Note' : 'Create Note'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
