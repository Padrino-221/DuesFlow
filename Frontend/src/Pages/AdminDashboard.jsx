import React, { useEffect, useState } from "react";
import { api, getUser } from "../api.js";

export default function AdminDashboard({ onGo }) {
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState("");

  const user = getUser();

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await api.adminSummary();
        setSummary(data);
      } catch (err) {
        setMsg(err.message);
      }
    }

    loadSummary();
  }, []);

  return (
    <div style={{ display: "grid", gap: 15 }}>
      <h2>Admin Dashboard</h2>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
        <strong>Logged in as:</strong> {user?.name} ({user?.role})
      </div>

      {msg && <small style={{ color: "crimson" }}>{msg}</small>}

      {summary ? (
        <div
          style={{
            display: "grid",
            gap: 10,
            border: "1px solid #ddd",
            padding: 15,
            borderRadius: 12,
          }}
        >
          <h3>System Summary</h3>

          <p>
            💰 Total Collections: <strong>GH₵ {summary.total_collections}</strong>
          </p>

          <p>
            👨‍🎓 Students Registered: <strong>{summary.students_total}</strong>
          </p>

          <p>
            ✅ Students Paid: <strong>{summary.students_paid}</strong>
          </p>

          <p>
            ⏳ Students Pending: <strong>{summary.students_pending}</strong>
          </p>
        </div>
      ) : (
        <p>Loading dashboard summary...</p>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onGo("dues")}>Manage Dues</button>
        <button onClick={() => onGo("students")}>View Students</button>
        <button onClick={() => onGo("verify")}>Verify Payments</button>
        <button onClick={() => onGo("reports")}>Reports</button>
      </div>
    </div>
  );
}
