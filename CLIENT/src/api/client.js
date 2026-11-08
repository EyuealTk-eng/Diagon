// Access token lives in memory only, refresh token is the httpOnly cookie
let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };

const readJSON = (res) => res.json().catch(() => ({}));

// One refresh at a time. Refresh tokens rotate, so two at once = logged out
let refreshing = null;
export const refreshQ = () => {
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh-token', { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        const data = await readJSON(res);
        if (!res.ok) throw new Error(data.message || 'Session expired.');
        accessToken = data.accessToken;
        return data;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

// These handle their own 401s
const NO_RETRY = ['/auth/login', '/auth/signup', '/auth/refresh-token'];

// Every API call goes through here
export const api = async (path, { method = 'GET', body, retry = true } = {}) => {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: body && JSON.stringify(body),
  });

  // Access token expired? refresh once and try again
  if (res.status === 401 && retry && !NO_RETRY.includes(path)) {
    await refreshQ();
    return api(path, { method, body, retry: false });
  }

  const data = await readJSON(res);
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};
