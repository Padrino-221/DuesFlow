import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [msg, setMsg] = useState("Loading students...");

  // Load students from backend
  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await api.adminStudents();
        setStudents(data.students || []);
        setMsg("");
      } catch (err) {
        setMsg("Error: " + err.message);
      }
    }

    loadStudents();
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Registered Students</h3>

      {msg && <small style={{ color: "crimson" }}>{msg}</small>}

      {students.length === 0 ? (
        <p>No students registered yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {students.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <strong>{s.name}</strong>
              <div>ID: {s.student_id}</div>
              <div>Program: {s.program}</div>
              <div>Level: {s.level}</div>
              {s.phone && <div>Phone: {s.phone}</div>}
              {s.email && <div>Email: {s.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
