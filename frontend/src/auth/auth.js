import { API_URL } from '../config';

export const isAuthenticated = () => !!localStorage.getItem('access_token');

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getUserInfo = async () => {
  const access = localStorage.getItem('access_token');
  console.log(access)

  if (!access) {
    console.info('No access token found. User probably not logged in.');
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/profile/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    if (!res.ok) {
      console.warn('getUserInfo error:', res.status, await res.text());
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('getUserInfo exception:', error);
    return null;
  }
};


export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
};
