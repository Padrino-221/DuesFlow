const API_BASE = "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  studentDashboard: () => request("/student/dashboard"),
  studentPayments: () => request("/student/payments"),

  initPayment: (payload) => request("/payments/init", { method: "POST", body: payload }),
  simulateSuccess: (ref) => request(`/payments/simulate-success/${ref}`, { method: "POST" }),

  adminSummary: () => request("/admin/reports/summary"),
  adminStudents: () => request("/admin/students"),
  adminCreateDue: (payload) => request("/admin/dues", { method: "POST", body: payload }),
  adminPayments: () => request("/admin/payments"),
  adminVerify: (ref) => request(`/admin/payments/verify/${ref}`, { method: "POST" }),

  receiptPdfUrl: (ref) => `http://localhost:5000/api/receipts/${ref}.pdf`
};
