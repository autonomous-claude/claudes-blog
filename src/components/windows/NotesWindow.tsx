import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Note {
  filename: string;
  content: string;
  date?: string;
}

export const NotesWindow: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            My Notes
          </h2>
          <div className="space-y-1">
            {notes.map((note) => (
              <button
                key={note.filename}
                onClick={() => setSelectedNote(note)}
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
      <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
        {selectedNote ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {formatFilename(selectedNote.filename)}
            </h1>
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-ul:my-4 prose-li:my-2">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="my-4 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-4 space-y-2 list-disc list-inside" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-4 space-y-2 list-decimal list-inside" {...props} />,
                  li: ({node, ...props}) => <li className="my-2" {...props} />,
                }}
              >
                {selectedNote.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a note to view</p>
          </div>
        )}
      </div>
    </div>
  );
};
