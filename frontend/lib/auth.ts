// Authentication utilities for session management

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "access_token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const LAST_ACTIVITY_KEY = "last_activity";
const TOKEN_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const REFRESH_THRESHOLD = 25 * 60 * 1000; // renew once less than this much life remains

export function setAuthToken(token: string) {
  const expiryTime = Date.now() + TOKEN_DURATION;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  updateLastActivity();
}

export function updateLastActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiryTime) {
    return null;
  }

  // Check if token has expired
  if (Date.now() > parseInt(expiryTime)) {
    clearAuthToken();
    return null;
  }

  return token;
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function isTokenExpired(): boolean {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!expiryTime) {
    return true;
  }

  return Date.now() > parseInt(expiryTime);
}

export function isSessionInactive(): boolean {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

  if (!lastActivity) {
    return true;
  }

  const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
  return timeSinceLastActivity > INACTIVITY_TIMEOUT;
}

// True once the token is nearing its hard expiry but the user is still
// active — the signal to silently renew rather than log out.
export function shouldRefreshToken(): boolean {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return false;
  if (isTokenExpired() || isSessionInactive()) return false;

  return parseInt(expiryTime) - Date.now() < REFRESH_THRESHOLD;
}

// Exchanges the current token for a fresh one, sliding the session forward.
// Silent no-op on failure — the regular expiry/inactivity check will log
// the user out on its own if the token is genuinely no longer valid.
export async function refreshAuthToken(): Promise<boolean> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;

    const data = await res.json();
    setAuthToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}
