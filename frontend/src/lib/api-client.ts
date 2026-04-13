const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { isFormData?: boolean },
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!options?.isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: options?.isFormData
      ? (body as FormData)
      : body
        ? JSON.stringify(body)
        : undefined,
  });

  if (!res.ok) {
    // Auto-redirect on session expiry, but NOT when the 401 came from an auth
    // endpoint — otherwise a wrong-password submit reloads /login before the
    // error toast can render, which looks like "Study Login is on a loop".
    const isAuthEndpoint = path.startsWith('/api/auth/login')
      || path.startsWith('/api/auth/register')
      || path.startsWith('/api/auth/forgot-password')
      || path.startsWith('/api/auth/reset-password');
    if (res.status === 401 && !isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    const errorText = await res.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export const apiClient = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T = any>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
  upload: <T = any>(path: string, formData: FormData) =>
    request<T>('POST', path, formData, { isFormData: true }),
};
