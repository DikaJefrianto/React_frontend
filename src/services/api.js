const API_URL = "http://localhost:5000/api";

export async function getAdminDashboard() {
  const res = await fetch(`${API_URL}/dashboard/admin`);
  return res.json();
}

export async function getManagerDashboard() {
  const res = await fetch(`${API_URL}/dashboard/manajer`);
  return res.json();
}

export async function getPetugasDashboard() {
  const res = await fetch(`${API_URL}/dashboard/petugas`);
  return res.json();
}
