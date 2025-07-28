import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./notesapp.css";
import { supabase } from "./supabaseClient";
import NotesSidebar from "./components/NotesSidebar";
import NoteEditor from "./components/NoteEditor";
import Auth from "./components/Auth";

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
  // Auth/session state
  const [session, setSession] = useState(null);

  // Listen to Auth State
  useEffect(() => {
    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // Listen for auth events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSelectedId(null); // Reset selection on login/logout
      setActiveNote(null);
      setNotes([]);
      setSearch("");
    });
    return () => { listener?.subscription?.unsubscribe?.(); };
  }, []);

  // Fetch all notes belonging to the logged-in user (or by search)
  const fetchNotes = useCallback(async (searchTerm) => {
    if (!session?.user) { setNotes([]); return; }
    setLoading(true);
    let query = supabase
      .from("notes")
      .select("id,title,content,updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });
    if (searchTerm && searchTerm.trim()) {
      query = query.ilike("title", `%${searchTerm}%`);
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    else setNotes(data || []);
    setLoading(false);
  }, [session]);

  // Load the currently selected note (by id)
  const fetchNoteById = useCallback(
    async (id) => {
      if (!session?.user || !id) {
        setActiveNote(null);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();
      if (error) setError(error.message);
      setActiveNote(data || null);
      setLoading(false);
    },
    [session]
  );

  // Initial fetch, and repeat whenever search or session changes.
  useEffect(() => {
    if (session?.user) fetchNotes(search);
    // else no fetch, handled by login
  }, [fetchNotes, search, session]);

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
    if (!session?.user) return;
    setSaving(true);
    const now = new Date();
    const { data, error } = await supabase
      .from("notes")
      .insert([{
        title: "New Note",
        content: "",
        updated_at: now.toISOString(),
        user_id: session.user.id,
      }])
      .select()
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
    if (!editedNote.id || !session?.user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: editedNote.title,
        content: editedNote.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editedNote.id)
      .eq("user_id", session.user.id)
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
    if (!id || !session?.user) return;
    setDeleting(true);
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);
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

  // -- Main render --
  if (session === undefined)
    return null; // Still loading

  return (
    <div style={{ height: "100vh", background: "var(--bg-main)" }}>
      {!session?.user && (
        <Auth session={null} onAuthChange={setSession} />
      )}
      {session?.user && (
        <div className="notesapp-row">
          <div style={{ width: "100vw", padding: 0, background: "#e3f2fd" }}>
            <Auth session={session} onAuthChange={setSession} />
          </div>
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
              keyProp={selectedId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
