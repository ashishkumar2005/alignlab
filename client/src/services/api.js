const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "alignlab_token";
const USER_KEY = "alignlab_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseError(response) {
  try {
    const data = await response.json();
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg).join(", ");
    }
    return data.detail || data.message || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    throw new Error(await parseError(response));
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function loginRequest(username, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function downloadCsv(path, filename) {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
