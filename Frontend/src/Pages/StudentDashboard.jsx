import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    try {
      const d = await api.studentDashboard();
      setData(d);
    } catch (e) {
      setMsg(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const pay = async (assigned_due_id, method) => {
    setMsg("");
    try {
      const init = await api.initPayment({ assigned_due_id, method });
      // DEV: simulate success immediately
      await api.simulateSuccess(init.payment.reference);
      await load();
      setMsg(`Paid successfully. Receipt ref: ${init.payment.reference}`);
    } catch (e) {
      setMsg(e.message);
    }
  };

  if (!data) return <div>{msg || "Loading..."}</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <strong>Total Owed:</strong> GH₵ {data.total_owed}
      </div>

      <div>
        <h4>My Dues</h4>
        <div style={{ display: "grid", gap: 10 }}>
          {data.dues.map((d) => (
            <div key={d.assigned_due_id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 10 }}>
              <div><strong>{d.title}</strong></div>
              <div>Type: {d.type}</div>
              <div>Amount: GH₵ {d.amount}</div>
              <div>Deadline: {d.deadline || "—"}</div>
              <div>Status: <strong>{d.status}</strong></div>

              {d.status !== "PAID" ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <button onClick={() => pay(d.assigned_due_id, "MTN_MOMO")}>Pay MTN MoMo</button>
                  <button onClick={() => pay(d.assigned_due_id, "VODAFONE_CASH")}>Pay Vodafone</button>
                  <button onClick={() => pay(d.assigned_due_id, "AIRTELTIGO")}>Pay AirtelTigo</button>
                </div>
              ) : (
                <small>Paid ✅</small>
              )}
            </div>
          ))}
        </div>
      </div>

      {msg && <small>{msg}</small>}
    </div>
  );
}
