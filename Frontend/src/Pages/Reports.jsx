import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "SUCCESS",
    method: "ALL",
  });

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const [s, p] = await Promise.all([api.adminSummary(), api.adminPayments()]);
      setSummary(s);
      setPayments(p.payments || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const statusOk = filters.status === "ALL" ? true : p.status === filters.status;
      const methodOk = filters.method === "ALL" ? true : p.method === filters.method;
      return statusOk && methodOk;
    });
  }, [payments, filters]);

  const totalFiltered = useMemo(() => {
    return filtered.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filtered]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Reports</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        <select
          value={filters.status}
          onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
        >
          <option value="ALL">All Status</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
        </select>

        <select
          value={filters.method}
          onChange={(e) => setFilters((s) => ({ ...s, method: e.target.value }))}
        >
          <option value="ALL">All Methods</option>
          <option value="MTN_MOMO">MTN_MOMO</option>
          <option value="VODAFONE_CASH">VODAFONE_CASH</option>
          <option value="AIRTELTIGO">AIRTELTIGO</option>
          <option value="CARD">CARD</option>
        </select>
      </div>

      {msg && <small style={{ color: "crimson" }}>{msg}</small>}

      {loading ? (
        <div>Loading report...</div>
      ) : (
        <>
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12, display: "grid", gap: 6 }}>
            <strong>Summary</strong>
            <div>Total Collections (SUCCESS): <strong>GH₵ {summary?.total_collections ?? 0}</strong></div>
            <div>Students Total: <strong>{summary?.students_total ?? 0}</strong></div>
            <div>Students Paid: <strong>{summary?.students_paid ?? 0}</strong></div>
            <div>Students Pending: <strong>{summary?.students_pending ?? 0}</strong></div>
          </div>

          <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}>
            <strong>Filtered Totals</strong>
            <div style={{ marginTop: 6 }}>
              Payments: <strong>{filtered.length}</strong> | Amount: <strong>GH₵ {totalFiltered}</strong>
            </div>
            <small style={{ opacity: 0.75 }}>
              Filters apply to the payment list below (status + method).
            </small>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <strong>Payment List</strong>

            {filtered.slice(0, 200).map((p) => (
              <div key={p.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <strong>{p.due_title}</strong>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      {p.student?.name} ({p.student?.student_id})
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

                <div style={{ marginTop: 10 }}>
                  <a href={api.receiptPdfUrl(p.reference)} target="_blank" rel="noreferrer">
                    Open Receipt PDF
                  </a>
                </div>
              </div>
            ))}

            {filtered.length > 200 && (
              <small style={{ opacity: 0.75 }}>
                Showing first 200 results. (Add pagination if you expect many payments.)
              </small>
            )}
          </div>
        </>
      )}
    </div>
  );
}
