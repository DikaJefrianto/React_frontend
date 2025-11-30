import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api'; // sesuaikan base URL

export const getInventory = async () => {
  const res = await axios.get(`${API_BASE}/inventory`);
  return res.data;
};

export const addInventory = async (payload) => {
  const res = await axios.post(`${API_BASE}/inventory`, payload);
  return res.data;
};

export const updateInventory = async (id, payload) => {
  const res = await axios.put(`${API_BASE}/inventory/${id}`, payload);
  return res.data;
};

export const deleteInventory = async (id) => {
  const res = await axios.delete(`${API_BASE}/inventory/${id}`);
  return res.data;
};
