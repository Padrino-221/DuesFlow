import React, { useState } from "react";
import { getUser, clearSession } from "./api.js";

/* Student Pages */
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import PayDues from "./pages/PayDues.jsx";
import ReceiptView from "./pages/ReceiptView.jsx";

/* Admin Pages */
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import ManageDues from "./pages/ManageDues.jsx";
import Students from "./Pages/Students.jsx";
import VerifyPayments from "./pages/VerifyPayments.jsx";
import Reports from "./pages/Reports.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(getUser());

  /* Logout */
  const logout = () => {
    clearSession();
    setUser(null);
    setPage("home");
  };

  /* Navigation Menu */
  const Nav = () => (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 15,
      }}
    >
      {/* Not Logged In */}
      {!user && (
        <>
          <button onClick={() => setPage("login")}>Login</button>
          <button onClick={() => setPage("register")}>Register</button>
        </>
      )}

      {/* Student Navigation */}
      {user?.role === "STUDENT" && (
        <>
          <button onClick={() => setPage("student")}>Dashboard</button>
          <button onClick={() => setPage("pay")}>Pay Dues</button>
          <button onClick={() => setPage("history")}>Payment History</button>
          <button onClick={() => setPage("receipt")}>Receipt</button>
        </>
      )}

      {/* Admin Navigation */}
      {user && user.role !== "STUDENT" && (
        <>
          <button onClick={() => setPage("admin")}>Admin Dashboard</button>
          <button onClick={() => setPage("dues")}>Manage Dues</button>
          <button onClick={() => setPage("students")}>Students</button>
          <button onClick={() => setPage("verify")}>Verify Payments</button>
          <button onClick={() => setPage("reports")}>Reports</button>
        </>
      )}

      {/* Logout Button */}
      {user && <button onClick={logout}>Logout</button>}
    </div>
  );

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui",
      }}
    >
      <h2>Departmental Dues Payment App</h2>

      {/* Navbar */}
      <Nav />

      {/* ========================= */}
      {/* Authentication Pages */}
      {/* ========================= */}
      {!user && page === "register" && <Register />}

      {!user && page === "login" && (
        <Login
          onAuthed={(u) => {
            setUser(u);

            /* Redirect based on role */
            if (u.role === "STUDENT") {
              setPage("student");
            } else {
              setPage("admin");
            }
          }}
        />
      )}

      {/* ========================= */}
      {/* Student Pages */}
      {/* ========================= */}
      {user?.role === "STUDENT" && page === "student" && (
        <StudentDashboard />
      )}

      {user?.role === "STUDENT" && page === "pay" && <PayDues />}

      {user?.role === "STUDENT" && page === "history" && (
        <PaymentHistory />
      )}

      {user?.role === "STUDENT" && page === "receipt" && <ReceiptView />}

      {/* ========================= */}
      {/* Admin Pages */}
      {/* ========================= */}
      {user && user.role !== "STUDENT" && page === "admin" && (
        <AdminDashboard onGo={(p) => setPage(p)} />
      )}

      {user && user.role !== "STUDENT" && page === "dues" && <ManageDues />}

      {user && user.role !== "STUDENT" && page === "students" && <Students />}

      {user && user.role !== "STUDENT" && page === "verify" && (
        <VerifyPayments />
      )}

      {user && user.role !== "STUDENT" && page === "reports" && <Reports />}

      {/* ========================= */}
      {/* Home Page */}
      {/* ========================= */}
      {!user && page === "home" && (
        <p style={{ marginTop: 20 }}>
          Welcome! Please Login or Register to continue.
        </p>
      )}
    </div>
  );
}
