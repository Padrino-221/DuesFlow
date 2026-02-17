import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

export default function VerifyPayments() {
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyRef, setBusyRef] = useState(null);

  const [filters, setFilters] = useState({
    q: "",
    status: "ALL", // ALL, PENDING, SUCCESS, FAILED
  });

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const d = await api.adminPayments();
      setPayments(d.payments || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const verify = async (reference) => {
    setMsg("");
    setBusyRef(reference);
    try {
      await api.adminVerify(reference);
      setMsg(`Verified: ${reference}`);
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusyRef(null);
    }
  };

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return payments.filter((p) => {
      const statusOk = filters.status === "ALL" ? true : p.status === filters.status;
      if (!statusOk) return false;

      if (!q) return true;

      const hay = [
        p.reference,
        p.due_title,
        p.student?.student_id,
        p.student?.name,
        p.method,
        p.status
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });
  }, [payments, filters]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Verify Payments</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Search: ref, student name, student id, due title..."
          value={filters.q}
          onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
          style={{ flex: 1, minWidth: 240 }}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>

        <button onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {msg && <small style={{ color: msg.toLowerCase().includes("verified") ? "green" : "crimson" }}>{msg}</small>}

      {loading ? (
        <div>Loading payments...</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.length === 0 && <div>No payments found.</div>}

          {filtered.map((p) => (
            <div key={p.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <strong>{p.due_title}</strong>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Student: {p.student?.name} ({p.student?.student_id})
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div><strong>GH₵ {p.amount}</strong></div>
                  <div style={{ fontSize: 13 }}>Status: <strong>{p.status}</strong></div>
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, display: "grid", gap: 3 }}>
                <div>Ref: <strong>{p.reference}</strong></div>
                <div>Method: {p.method}</div>
                <div>Date: {p.date}</div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={api.receiptPdfUrl(p.reference)} target="_blank" rel="noreferrer">
                  Open Receipt PDF
                </a>

                <button
                  onClick={() => verify(p.reference)}
                  disabled={busyRef === p.reference || p.status !== "SUCCESS"}
                  title={p.status !== "SUCCESS" ? "Only SUCCESS payments can be verified" : "Verify"}
                >
                  {busyRef === p.reference ? "Verifying..." : "Verify"}
                </button>
              </div>

              {p.status !== "SUCCESS" && (
                <small style={{ display: "block", marginTop: 6, opacity: 0.75 }}>
                  Tip: A payment must be SUCCESS before verification (in real payment integration, SUCCESS comes from the provider webhook).
                </small>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
