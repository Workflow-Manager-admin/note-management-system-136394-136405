import React, { useState } from "react";
import { supabase } from "../supabaseClient";

// PUBLIC_INTERFACE
/**
 * Authentication (Sign Up, Login, Logout) UI using Supabase Auth.
 * Handles email + password authentication.
 */
function Auth({ session, onAuthChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [variant, setVariant] = useState("sign_in"); // "sign_in" | "sign_up"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // PUBLIC_INTERFACE
  // Handles login or signup submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (variant === "sign_in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
    }
    setLoading(false);
    // Session will be updated on parent useEffect/subscription
  };

  // PUBLIC_INTERFACE
  // Handles logout
  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    if (onAuthChange) onAuthChange(null);
  };

  if (session) {
    // Show logged-in state
    return (
      <div className="auth-box logged-in" style={{
        padding: "8px 18px",
        margin: "12px 0",
        background: "#e3f2fd",
        borderRadius: 10,
        color: "#1976d2",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span>
          Signed in as <b>{session.user.email}</b>
        </span>
        <button
          className="primary-btn"
          onClick={handleLogout}
          disabled={loading}
          style={{ marginLeft: 16, minWidth: 88 }}
        >
          Log Out
        </button>
      </div>
    );
  }

  // Show auth form
  return (
    <div className="auth-box" style={{
      maxWidth: 330, margin: "30px auto", padding: "28px 18px 18px 18px",
      background: "#fff", boxShadow: "0 2px 14px rgba(30,80,100,0.06)",
      borderRadius: 16, border: "1px solid #e5e7eb"
    }}>
      <h2 style={{ color: "#1976d2", fontWeight: 700, marginBottom: 18 }}>
        {variant === "sign_in" ? "Sign In" : "Sign Up"}
      </h2>
      <form onSubmit={handleSubmit} autoComplete="on">
        <input
          type="email"
          placeholder="Email address"
          autoFocus
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: "100%", fontSize: "1rem", padding: 10, marginBottom: 13,
            border: "1.5px solid #ddd", borderRadius: 6, background: "#f9fafd"
          }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          autoComplete="current-password"
          minLength={6}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%", fontSize: "1rem", padding: 10, marginBottom: 16,
            border: "1.5px solid #ddd", borderRadius: 6, background: "#f9fafd"
          }}
        />
        {error && (
          <div style={{
            background: "#ffeaea", color: "#a94442", padding: "8px 10px",
            border: "1px solid #ffb3b3", borderRadius: 6, marginBottom: 12,
            fontSize: "0.98em"
          }}>{error}</div>
        )}
        <button
          type="submit"
          className="primary-btn"
          style={{ width: "100%", fontWeight: 700 }}
          disabled={loading}
        >
          {loading
            ? (variant === "sign_in" ? "Signing In…" : "Signing Up…")
            : (variant === "sign_in" ? "Sign In" : "Sign Up")}
        </button>
      </form>
      <div style={{ marginTop: 15, fontSize: "0.96em" }}>
        {variant === "sign_in" ? (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              style={{
                color: "#1976d2",
                background: "none",
                border: "none",
                fontWeight: 700,
                cursor: "pointer"
              }}
              onClick={() => { setVariant("sign_up"); setError(""); }}
            >Sign up</button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              style={{
                color: "#1976d2",
                background: "none",
                border: "none",
                fontWeight: 700,
                cursor: "pointer"
              }}
              onClick={() => { setVariant("sign_in"); setError(""); }}
            >Sign in</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;
