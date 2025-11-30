const API_BASE_URL = "http://localhost:5000/api";

export const authGet = async (endpoint) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return res.json();
};
