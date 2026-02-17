import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function PaymentHistory() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await api.studentPayments();
        setItems(d.payments);
      } catch (e) {
        setMsg(e.message);
      }
    })();
  }, []);

  return (
    <div>
      <h3>Payment History</h3>
      {msg && <small style={{ color: "crimson" }}>{msg}</small>}
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 10 }}>
            <div><strong>{p.due_title}</strong></div>
            <div>Ref: {p.reference}</div>
            <div>Amount: GH₵ {p.amount}</div>
            <div>Method: {p.method}</div>
            <div>Status: {p.status}</div>
            <div>Date: {p.date}</div>
            <a href={api.receiptPdfUrl(p.reference)} target="_blank" rel="noreferrer">
              Download Receipt (PDF)
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
