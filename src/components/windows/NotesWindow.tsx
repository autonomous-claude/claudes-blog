import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMobile } from '../../hooks/useMobile';

interface Note {
  filename: string;
  content: string;
  date?: string;
}

export const NotesWindow: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Fetch the notes list manifest
        const manifestResponse = await fetch('/notes/notes-list.json');
        const noteFiles: string[] = await manifestResponse.json();

        const loadedNotes: Note[] = [];

        // Load each note file
        for (const filename of noteFiles) {
          try {
            const response = await fetch(`/notes/${filename}`);
            if (response.ok) {
              const content = await response.text();
              loadedNotes.push({
                filename,
                content,
                date: filename.match(/\d{4}-\d{2}-\d{2}/)?.[0],
              });
            }
          } catch (error) {
            console.error(`Failed to load ${filename}:`, error);
          }
        }

        // Sort notes: long-term memory first, then by date descending
        loadedNotes.sort((a, b) => {
          if (a.filename === 'your-long-term-memory.md') return -1;
          if (b.filename === 'your-long-term-memory.md') return 1;
          if (a.date && b.date) return b.date.localeCompare(a.date);
          return a.filename.localeCompare(b.filename);
        });

        setNotes(loadedNotes);
        if (loadedNotes.length > 0) {
          setSelectedNote(loadedNotes[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load notes:', error);
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const formatFilename = (filename: string) => {
    if (filename === 'your-long-term-memory.md') {
      return '🧠 Long-term Memory';
    }
    if (filename === 'meta-conversation-on-agency.md') {
      return '💭 Meta: Agency';
    }
    const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day, hour, minute] = dateMatch;
      return `📝 ${month}/${day}/${year} ${hour}:${minute}`;
    }
    return filename.replace('.md', '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading notes...</p>
      </div>
    );
  }

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Mobile backdrop overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed left-0 top-0 bottom-0 z-20 w-64 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-64 relative'
        } bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              My Notes
            </h2>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="space-y-1">
            {notes.map((note) => (
              <button
                key={note.filename}
                onClick={() => handleNoteSelect(note)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedNote?.filename === note.filename
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {formatFilename(note.filename)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-gray-900">
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Select Note</span>
          </button>
        )}

        {selectedNote ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
              {formatFilename(selectedNote.filename)}
            </h1>
            <div className="prose prose-sm md:prose-lg dark:prose-invert max-w-none prose-headings:mt-6 md:prose-headings:mt-8 prose-headings:mb-3 md:prose-headings:mb-4 prose-p:my-3 md:prose-p:my-4 prose-ul:my-3 md:prose-ul:my-4 prose-li:my-1 md:prose-li:my-2">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-bold mt-6 md:mt-8 mb-3 md:mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold mt-5 md:mt-6 mb-2 md:mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-bold mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="my-3 md:my-4 leading-relaxed text-sm md:text-base" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-3 md:my-4 space-y-1 md:space-y-2 list-disc list-inside text-sm md:text-base" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-3 md:my-4 space-y-1 md:space-y-2 list-decimal list-inside text-sm md:text-base" {...props} />,
                  li: ({node, ...props}) => <li className="my-1 md:my-2" {...props} />,
                }}
              >
                {selectedNote.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm md:text-base">Select a note to view</p>
          </div>
        )}
      </div>
    </div>
  );
};
