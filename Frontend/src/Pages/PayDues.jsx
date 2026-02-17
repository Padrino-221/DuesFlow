import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function PayDues() {
  const [dues, setDues] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Load unpaid dues
  useEffect(() => {
    async function loadDues() {
      try {
        const data = await api.studentDashboard();
        const unpaid = (data.dues || []).filter((d) => d.status !== "PAID");
        setDues(unpaid);
      } catch (err) {
        setMsg(err.message);
      }
    }

    loadDues();
  }, []);

  // Simulated payment
  async function pay(assigned_due_id, method) {
    setBusy(true);
    setMsg("");

    try {
      const init = await api.initPayment({
        assigned_due_id,
        method,
      });

      // DEV: simulate success
      await api.simulateSuccess(init.payment.reference);

      setMsg(`Payment successful! Receipt Ref: ${init.payment.reference}`);

      // Reload dues after payment
      const updated = await api.studentDashboard();
      setDues((updated.dues || []).filter((d) => d.status !== "PAID"));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Pay Departmental Dues</h3>

      {msg && <small style={{ color: "green" }}>{msg}</small>}

      {dues.length === 0 ? (
        <p>No unpaid dues available 🎉</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {dues.map((d) => (
            <div
              key={d.assigned_due_id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <strong>{d.title}</strong>
              <div>Amount: GH₵ {d.amount}</div>
              <div>Status: {d.status}</div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  disabled={busy}
                  onClick={() => pay(d.assigned_due_id, "MTN_MOMO")}
                >
                  Pay MTN MoMo
                </button>

                <button
                  disabled={busy}
                  onClick={() => pay(d.assigned_due_id, "VODAFONE_CASH")}
                >
                  Pay Vodafone
                </button>

                <button
                  disabled={busy}
                  onClick={() => pay(d.assigned_due_id, "AIRTELTIGO")}
                >
                  Pay AirtelTigo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
