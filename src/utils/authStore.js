// Uses relative path for Netlify Functions (proxied via netlify.toml)
const API_URL = '/api';

// Retry a fetch up to `attempts` times (handles cold-start timeout)
async function fetchWithRetry(url, options, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 1000)); // wait 1s between retries
    }
  }
}

export const authStore = {
  getUser() {
    const user = localStorage.getItem('fair_ride_user');
    return user ? JSON.parse(user) : null;
  },

  async login(email, password) {
    try {
      const res = await fetchWithRetry(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };

      localStorage.setItem('fair_ride_user', JSON.stringify(data.user));
      localStorage.setItem('fair_ride_token', data.token);
      return { success: true, role: data.user.role };
    } catch (err) {
      return { success: false, error: 'Server is warming up. Please try again in a moment.' };
    }
  },

  async register(name, email, password) {
    try {
      const res = await fetchWithRetry(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' };

      localStorage.setItem('fair_ride_user', JSON.stringify(data.user));
      localStorage.setItem('fair_ride_token', data.token);
      return { success: true, role: data.user.role };
    } catch (err) {
      return { success: false, error: 'Server is warming up. Please wait a moment and try again.' };
    }
  },

  logout() {
    localStorage.removeItem('fair_ride_user');
    localStorage.removeItem('fair_ride_token');
  },

  getApiKey(providerId) {
    return localStorage.getItem(`fair_ride_key_${providerId}`) || '';
  },

  getAllApiKeys() {
    return {
      uber: this.getApiKey('uber'),
      ola: this.getApiKey('ola'),
      rapido: this.getApiKey('rapido'),
      nammayatri: this.getApiKey('nammayatri')
    };
  },

  saveApiKey(providerId, key) {
    if (key) {
      localStorage.setItem(`fair_ride_key_${providerId}`, key);
    } else {
      localStorage.removeItem(`fair_ride_key_${providerId}`);
    }
  }
};
