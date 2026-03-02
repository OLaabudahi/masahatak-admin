import api from '../utils/api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  },

  getCurrentAdmin: async () => {
    const response = await api.get('/auth/profile');
    return response.data.admin;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  getAdminData: () => {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
  },
};

export default authService;
