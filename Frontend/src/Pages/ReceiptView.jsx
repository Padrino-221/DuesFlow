import React, { useState } from "react";
import { api } from "../api.js";

export default function ReceiptView() {
  const [ref, setRef] = useState("");
  const [msg, setMsg] = useState("");

  const openReceipt = () => {
    setMsg("");
    const clean = ref.trim();
    if (!clean) {
      setMsg("Enter a receipt reference (e.g., DUE-XXXXXX).");
      return;
    }

    // Opens the PDF in a new tab (and you can print from there)
    window.open(api.receiptPdfUrl(clean), "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <h3>Receipt</h3>

      <input
        placeholder="Enter receipt reference e.g. DUE-ABC123..."
        value={ref}
        onChange={(e) => setRef(e.target.value)}
      />

      <button onClick={openReceipt}>Open / Print Receipt</button>

      {msg && <small style={{ color: "crimson" }}>{msg}</small>}

      <small style={{ opacity: 0.75 }}>
        Tip: You can copy the reference from your Payment History page.
      </small>
    </div>
  );
}
