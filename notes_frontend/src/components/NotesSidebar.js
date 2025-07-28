import React from "react";

// PUBLIC_INTERFACE
/**
 * Sidebar component for displaying list of notes and searching.
 */
function NotesSidebar({
  notes,
  selectedNoteId,
  onSelect,
  onCreate,
  searchTerm,
  onSearch,
  isLoading
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">📝 Notes</h1>
        <button
          className="accent-btn"
          title="Create new note"
          onClick={onCreate}
        >
          + New
        </button>
      </div>
      <input
        className="sidebar-search"
        type="text"
        value={searchTerm}
        placeholder="Search notes…"
        onChange={e => onSearch(e.target.value)}
      />
      <div className="sidebar-list">
        {isLoading ? (
          <div className="sidebar-loading">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="sidebar-empty">No notes found.</div>
        ) : (
          <ul>
            {notes.map(note => (
              <li
                key={note.id}
                className={
                  "sidebar-note" +
                  (note.id === selectedNoteId ? " selected" : "")
                }
                onClick={() => onSelect(note.id)}
                tabIndex={0}
                aria-selected={note.id === selectedNoteId}
              >
                <div className="sidebar-note-title">
                  {note.title ? note.title : <span className="untitled">(Untitled)</span>}
                </div>
                <div className="sidebar-note-time">
                  {note.updated_at
                    ? new Date(note.updated_at).toLocaleString()
                    : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default NotesSidebar;
