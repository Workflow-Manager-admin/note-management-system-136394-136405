import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./notesapp.css";
import { supabase } from "./supabaseClient";
import NotesSidebar from "./components/NotesSidebar";
import NoteEditor from "./components/NoteEditor";

// PUBLIC_INTERFACE
/**
 * The main Notes App component with sidebar and main note editing area.
 */
function App() {
  // Application state
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all notes (or by search)
  const fetchNotes = useCallback(async (searchTerm) => {
    setLoading(true);
    let query = supabase
      .from("notes")
      .select("id,title,content,updated_at")
      .order("updated_at", { ascending: false });
    if (searchTerm && searchTerm.trim()) {
      query = query.ilike("title", `%${searchTerm}%`);
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    else setNotes(data || []);
    setLoading(false);
  }, []);

  // Load the currently selected note (by id)
  const fetchNoteById = useCallback(
    async (id) => {
      if (!id) {
        setActiveNote(null);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setError(error.message);
      setActiveNote(data || null);
      setLoading(false);
    },
    []
  );

  // Initial fetch, and repeat whenever search changes.
  useEffect(() => {
    fetchNotes(search);
  }, [fetchNotes, search]);

  // Reset selected note if it vanishes from the list (e.g. deleted)
  useEffect(() => {
    if (!notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes.length ? notes[0].id : null);
    }
  }, [notes, selectedId]);

  // Fetch note data when selectedId changes
  useEffect(() => {
    fetchNoteById(selectedId);
  }, [selectedId, fetchNoteById]);

  // HANDLERS
  // PUBLIC_INTERFACE
  const handleSelectNote = (id) => {
    setSelectedId(id);
    setError(null);
  };

  // PUBLIC_INTERFACE
  const handleCreateNote = async () => {
    setSaving(true);
    const now = new Date();
    const { data, error } = await supabase
      .from("notes")
      .insert([{ title: "New Note", content: "", updated_at: now.toISOString() }])
      .single();
    if (error) {
      setError("Could not create a new note: " + error.message);
      setSaving(false);
      return;
    }
    setNotes((prev) => [data, ...prev]);
    setSelectedId(data.id);
    setSaving(false);
    setError(null);
  };

  // PUBLIC_INTERFACE
  const handleSaveNote = async (editedNote) => {
    if (!editedNote.id) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: editedNote.title,
        content: editedNote.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editedNote.id)
      .select()
      .single();

    if (error) {
      setError("Could not save the note: " + error.message);
    } else {
      setError(null);
      setNotes((prev) =>
        prev.map((n) => (n.id === data.id ? data : n))
      );
      setActiveNote(data);
    }
    setSaving(false);
  };

  // PUBLIC_INTERFACE
  const handleDeleteNote = async (id) => {
    if (!id) return;
    setDeleting(true);
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      setError("Could not delete the note: " + error.message);
      setDeleting(false);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedId(null);
    setActiveNote(null);
    setDeleting(false);
    setError(null);
  };

  // PUBLIC_INTERFACE
  const handleSearch = (term) => {
    setSearch(term);
  };

  // Theming: document's data-theme is 'light' (enforce)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  return (
    <div style={{ height: "100vh", background: "var(--bg-main)" }}>
      <div className="notesapp-row">
        <NotesSidebar
          notes={notes}
          selectedNoteId={selectedId}
          onSelect={handleSelectNote}
          onCreate={handleCreateNote}
          searchTerm={search}
          onSearch={handleSearch}
          isLoading={loading}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && (
            <div
              style={{
                background: "#ffeaea",
                color: "#a94442",
                padding: "14px 24px",
                border: "1px solid #ffb3b3",
                borderRadius: 6,
                margin: "24px"
              }}
              role="alert"
            >
              {error}
              <button
                onClick={() => setError(null)}
                style={{
                  float: "right",
                  background: "none",
                  border: "none",
                  color: "#c60000",
                  fontWeight: 700,
                  fontSize: "1.3em",
                  cursor: "pointer"
                }}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          <NoteEditor
            note={activeNote}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
            isSaving={saving}
            isDeleting={deleting}
            keyProp={selectedId} // To reset editor state on note switch
          />
        </div>
      </div>
    </div>
  );
}

export default App;
