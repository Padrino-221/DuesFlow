import React, { useState } from "react";
import { getUser, clearSession } from "./api.js";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageDues from "./pages/ManageDues.jsx";
import Students from "./pages/Students.jsx";
import VerifyPayments from "./pages/VerifyPayments.jsx";
import Reports from "./Pages/Reports.jsx"; // ✅ ADD THIS

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(getUser());

  const logout = () => {
    clearSession();
    setUser(null);
    setPage("home");
  };

  const Nav = () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
      {!user && (
        <>
          <button onClick={() => setPage("login")}>Login</button>
          <button onClick={() => setPage("register")}>Register</button>
        </>
      )}

      {user?.role === "STUDENT" && (
        <>
          <button onClick={() => setPage("student")}>Dashboard</button>
          <button onClick={() => setPage("history")}>Payment History</button>
        </>
      )}

      {user && user.role !== "STUDENT" && (
        <>
          <button onClick={() => setPage("admin")}>Admin Dashboard</button>
          <button onClick={() => setPage("dues")}>Manage Dues</button>
          <button onClick={() => setPage("students")}>Students</button>
          <button onClick={() => setPage("verify")}>Verify Payments</button>
          <button onClick={() => setPage("reports")}>Reports</button> {/* ✅ ADD THIS */}
        </>
      )}

      {user && <button onClick={logout}>Logout</button>}
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h2>Departmental Dues Payment App</h2>
      <Nav />

      {!user && page === "register" && <Register />}
      {!user && page === "login" && (
        <Login
          onAuthed={(u) => {
            setUser(u);
            setPage(u.role === "STUDENT" ? "student" : "admin");
          }}
        />
      )}

      {user?.role === "STUDENT" && page === "student" && <StudentDashboard />}
      {user?.role === "STUDENT" && page === "history" && <PaymentHistory />}

      {user && user.role !== "STUDENT" && page === "admin" && <AdminDashboard />}
      {user && user.role !== "STUDENT" && page === "dues" && <ManageDues />}
      {user && user.role !== "STUDENT" && page === "students" && <Students />}
      {user && user.role !== "STUDENT" && page === "verify" && <VerifyPayments />}
      {user && user.role !== "STUDENT" && page === "reports" && <Reports />} {/* ✅ ADD THIS */}

      {!user && page === "home" && <p>Login or Register to continue.</p>}
    </div>
  );
}
