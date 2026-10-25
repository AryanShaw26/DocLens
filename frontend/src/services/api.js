const BASE_URL = import.meta.env.VITE_API_URL;
class ApiService {
  constructor() {
    this.token = localStorage.getItem('doclens_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('doclens_token', token);
    } else {
      localStorage.removeItem('doclens_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('doclens_token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.setToken(null);
        window.dispatchEvent(new Event('auth_unauthorized'));
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.detail || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // --- Auth ---
  async register(email, password, fullName) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (res?.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  logout() {
    this.setToken(null);
  }

  async getMe() {
    return this.request('/users/me');
  }

  // --- Reports ---
  async uploadReport(file, notes = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }
    return this.request('/reports/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async createDemoReport() {
    return this.request('/reports/demo', {
      method: 'POST',
    });
  }

  async getReports() {
    return this.request('/reports');
  }

  async getHealthTrends() {
    return this.request('/reports/trends');
  }

  async getReport(reportId) {
    return this.request(`/reports/${reportId}`);
  }

  async deleteReport(reportId) {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // --- Assistant ---
  async askReportAssistant(reportId, question, history = []) {
    return this.request(`/assistant/${reportId}`, {
      method: 'POST',
      body: JSON.stringify({ question, history }),
    });
  }

  // --- Compare ---
  async compareReports(reportAId, reportBId) {
    return this.request('/compare', {
      method: 'POST',
      body: JSON.stringify({
        report_a_id: parseInt(reportAId, 10),
        report_b_id: parseInt(reportBId, 10),
      }),
    });
  }
}

export const api = new ApiService();
