const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const AUTH_CHANGE_EVENT = "relay:auth-change";

function getTokenExpiry(token: string): number | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    ) as { exp?: unknown };

    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function saveSession(accessToken: string, user: unknown) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function hasValidSession(): boolean {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return false;

  const expiresAt = getTokenExpiry(token);
  if (!expiresAt || expiresAt <= Date.now()) {
    clearSession();
    return false;
  }

  return true;
}

export function initializeSessionExpiry() {
  let expiryTimer = 0;

  const syncExpiryTimer = () => {
    window.clearTimeout(expiryTimer);

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    const expiresAt = getTokenExpiry(token);
    if (!expiresAt || expiresAt <= Date.now()) {
      clearSession();
      window.location.replace("/auth/login?reason=session-expired");
      return;
    }

    expiryTimer = window.setTimeout(() => {
      clearSession();
      window.location.replace("/auth/login?reason=session-expired");
    }, expiresAt - Date.now());
  };

  window.addEventListener(AUTH_CHANGE_EVENT, syncExpiryTimer);
  window.addEventListener("storage", syncExpiryTimer);
  syncExpiryTimer();

  return () => {
    window.clearTimeout(expiryTimer);
    window.removeEventListener(AUTH_CHANGE_EVENT, syncExpiryTimer);
    window.removeEventListener("storage", syncExpiryTimer);
  };
}
