import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * Main area for viewing and editing a note.
 */
function NoteEditor({
  note,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  keyProp,
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");

  // Reset editor if switching to a different note (or a new note)
  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
  }, [note, keyProp]);

  // PUBLIC_INTERFACE
  const handleSave = e => {
    e.preventDefault();
    if (!title && !content) return;
    onSave({ ...note, title: title.trim(), content });
  };

  // PUBLIC_INTERFACE
  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This cannot be undone."
      )
    ) {
      onDelete(note.id);
    }
  };

  if (!note) {
    return (
      <main className="editor-main">
        <div className="empty-message">Select a note or create a new one.</div>
      </main>
    );
  }

  return (
    <main className="editor-main">
      <form onSubmit={handleSave} className="editor-form">
        <input
          type="text"
          className="editor-title"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={100}
          aria-label="Note title"
          autoFocus
        />
        <textarea
          className="editor-content"
          placeholder="Start typing your note..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          aria-label="Note content"
        />
        <div className="editor-actions">
          <button
            className="primary-btn"
            type="submit"
            disabled={isSaving || (!title && !content)}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            className="delete-btn"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ marginLeft: 8 }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default NoteEditor;
