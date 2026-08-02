// Authentication utilities for session management

const TOKEN_KEY = "access_token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const TOKEN_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function setAuthToken(token: string) {
  const expiryTime = Date.now() + TOKEN_DURATION;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
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
}

export function isTokenExpired(): boolean {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!expiryTime) {
    return true;
  }

  return Date.now() > parseInt(expiryTime);
}
