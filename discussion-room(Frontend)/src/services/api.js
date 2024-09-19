import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password });
  return response.data;
};

export const register = async (username, email, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/register/', { username, email, password, confirm_password: confirmPassword });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
};

export const logout = async () => {
  await api.post('/auth/logout/');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/user/');
  return response.data;
};

export const getTopics = async () => {
  const response = await api.get('/topics/');
  return response.data;
};

export const createTopic = async (title, description) => {
  const response = await api.post('/topics/', { title, description });
  return response.data;
};

export const getMessages = async (topicId) => {
  const response = await api.get(`/topics/${topicId}/messages/`);
  return response.data;
};

export const sendMessage = async (topicId, content) => {
  const response = await api.post(`/topics/${topicId}/add_message/`, { content });
  return response.data;
};

export default api;