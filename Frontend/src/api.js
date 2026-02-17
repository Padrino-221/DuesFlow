const API_BASE = "http://10.215.219.46:5000/api";


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
  // ✅ headers must be declared here
  const headers = { "Content-Type": "application/json" };

  // ✅ attach token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ✅ make request
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // ✅ better error reporting
  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    // response not JSON
  }

  if (!res.ok) {
    throw new Error(data.error || text || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),

  login: (payload) =>
    request("/auth/login", { method: "POST", body: payload }),

  studentDashboard: () =>
    request("/student/dashboard"),

  studentPayments: () =>
    request("/student/payments"),

  initPayment: (payload) =>
    request("/payments/init", { method: "POST", body: payload }),

  simulateSuccess: (ref) =>
    request(`/payments/simulate-success/${ref}`, { method: "POST" }),

  adminSummary: () =>
    request("/admin/reports/summary"),

  adminStudents: () =>
    request("/admin/students"),

  adminCreateDue: (payload) =>
    request("/admin/dues", { method: "POST", body: payload }),

  adminPayments: () =>
    request("/admin/payments"),

  adminVerify: (ref) =>
    request(`/admin/payments/verify/${ref}`, { method: "POST" }),

  receiptPdfUrl: (ref) =>
    `http://127.0.0.1:5000/api/receipts/${ref}.pdf`,
};
