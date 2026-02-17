import React, { useState } from "react";
import { api } from "../api.js";

export default function ManageDues() {
  const [form, setForm] = useState({
    title: "",
    due_type: "departmental",
    amount: "",
    deadline: "", // YYYY-MM-DD
    target_program: "",
    target_level: "",
  });

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        due_type: form.due_type.trim(),
        amount: Number(form.amount),
        deadline: form.deadline ? form.deadline : null,
        target_program: form.target_program.trim() || null,
        target_level: form.target_level.trim() || null,
      };

      if (!payload.title) throw new Error("Title is required");
      if (!payload.due_type) throw new Error("Due type is required");
      if (!payload.amount || payload.amount <= 0) throw new Error("Amount must be > 0");

      const res = await api.adminCreateDue(payload);
      setMsg(`Created due (ID: ${res.due_id}) and assigned to ${res.assigned_count} students.`);
      setForm({
        title: "",
        due_type: "departmental",
        amount: "",
        deadline: "",
        target_program: "",
        target_level: "",
      });
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Manage Dues (Create & Assign)</h3>

      <form onSubmit={submit} style={{ display: "grid", gap: 10, border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input
            placeholder="e.g., Semester 1 Departmental Dues"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Due Type</span>
          <select value={form.due_type} onChange={(e) => update("due_type", e.target.value)}>
            <option value="departmental">departmental</option>
            <option value="event">event</option>
            <option value="project">project</option>
            <option value="other">other</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Amount (GH₵)</span>
          <input
            type="number"
            min="1"
            placeholder="e.g., 50"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Deadline (optional)</span>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => update("deadline", e.target.value)}
          />
        </label>

        <div style={{ display: "grid", gap: 10 }}>
          <strong>Assign To (optional filters)</strong>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Target Program (leave empty = all programs)</span>
            <input
              placeholder="e.g., Computer Science"
              value={form.target_program}
              onChange={(e) => update("target_program", e.target.value)}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Target Level (leave empty = all levels)</span>
            <input
              placeholder="e.g., 200"
              value={form.target_level}
              onChange={(e) => update("target_level", e.target.value)}
            />
          </label>
        </div>

        <button disabled={busy}>{busy ? "Creating..." : "Create Due & Assign"}</button>
      </form>

      {msg && (
        <div style={{ padding: 10, borderRadius: 10, border: "1px solid #eee" }}>
          <small>{msg}</small>
        </div>
      )}

      <small style={{ opacity: 0.8 }}>
        Note: This page creates a due and automatically assigns it to matching students (all students if you leave Program/Level empty).
      </small>
    </div>
  );
}
