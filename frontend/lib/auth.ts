// Authentication utilities for session management

const TOKEN_KEY = "access_token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const LAST_ACTIVITY_KEY = "last_activity";
const TOKEN_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

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
