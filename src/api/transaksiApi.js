import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/transaksi";

export const getTransactions = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;  // pastikan backend mengembalikan { data: [...] }
};

export const createTransaction = async (payload) => {
  const res = await axios.post(BASE_URL, payload);
  return res.data;  // pastikan backend mengembalikan { msg, data }
};

export const updateTransactionStatus = async (id, status) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, { status });
  return res.data;
};

export const deleteTransaction = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};
