import React, { useState } from "react";
import { api } from "../api.js";

export default function Register() {
  const [form, setForm] = useState({ student_id:"", name:"", program:"", level:"", phone:"", email:"", password:"" });
  const [msg, setMsg] = useState("");

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.register(form);
      setMsg("Registered. Now login.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <h3>Student Registration</h3>
      <input placeholder="Student ID / Index Number" value={form.student_id} onChange={(e) => update("student_id", e.target.value)} />
      <input placeholder="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
      <input placeholder="Program" value={form.program} onChange={(e) => update("program", e.target.value)} />
      <input placeholder="Year/Level (e.g., 200)" value={form.level} onChange={(e) => update("level", e.target.value)} />
      <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
      <input placeholder="Email (optional)" value={form.email} onChange={(e) => update("email", e.target.value)} />
      <input placeholder="Password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
      <button>Create Account</button>
      {msg && <small>{msg}</small>}
    </form>
  );
}
