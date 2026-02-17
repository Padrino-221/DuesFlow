import React, { useState } from "react";
import { api, setSession } from "../api.js";

export default function Login({ onAuthed }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const data = await api.login({ student_id: identifier, email: identifier, password });
      setSession(data.access_token, data.user);
      onAuthed(data.user);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <h3>Login</h3>
      <input placeholder="Student ID or Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button>Login</button>
      {msg && <small style={{ color: "crimson" }}>{msg}</small>}
    </form>
  );

  setSession(data.access_token, data.user);
}
