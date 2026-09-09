// frontend/src/api/auth.js
import axios from './axios';

export const login = async (username, password) => {
  const response = await axios.post('/auth/login.php', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/auth/logout.php');
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get('/auth/me.php');
  return response.data;
};