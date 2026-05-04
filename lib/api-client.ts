// Client-side helpers for the admin panel.

const TOKEN_KEY = "vh_admin_token";

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (init.auth) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; admin: { id: number; username: string } }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    ),

  me: () => request<{ admin: { id: number; username: string } }>("/api/auth/me", { auth: true }),

  listSegments: () => request<{ segments: any[] }>("/api/segments"),
  createSegment: (data: any) =>
    request<{ segment: any }>("/api/segments", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    }),
  updateSegment: (id: number | string, data: any) =>
    request<{ segment: any }>(`/api/segments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      auth: true,
    }),
  deleteSegment: (id: number | string) =>
    request<{ ok: true }>(`/api/segments/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  listProperties: (q: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    return request<{ properties: any[] }>(
      `/api/properties${params.toString() ? `?${params}` : ""}`
    );
  },
  createProperty: (data: any) =>
    request<{ property: any }>("/api/properties", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    }),
  updateProperty: (id: number | string, data: any) =>
    request<{ property: any }>(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      auth: true,
    }),
  deleteProperty: (id: number | string) =>
    request<{ ok: true }>(`/api/properties/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  /* ---------- contact submissions ---------- */
  submitContact: (data: {
    name: string;
    phone?: string;
    email?: string;
    segment?: string;
    message?: string;
    source?: string;
    property_id?: number;
  }) =>
    request<{ ok: true; id: number }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listSubmissions: (params: { status?: string; q?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    return request<{
      submissions: any[];
      stats: { new: number; contacted: number; done: number; trash: number; total: number };
    }>(`/api/contact${qs.toString() ? `?${qs}` : ""}`, { auth: true });
  },
  updateSubmission: (id: number, data: { status?: string; note?: string }) =>
    request<{ submission: any }>(`/api/contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      auth: true,
    }),
  deleteSubmission: (id: number) =>
    request<{ ok: true }>(`/api/contact/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};
