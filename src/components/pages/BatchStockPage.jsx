import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BatchStockPage() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBuah, setFilterBuah] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "tanggal_masuk_batch", direction: "asc" });

  useEffect(() => {
    axios.get("http://localhost:5000/api/batch-stock", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      setBatches(res.data.data);
      setFilteredBatches(res.data.data);
      setLoading(false);
    })
    .catch(err => console.error(err));
  }, []);

  // Filter & Search
  useEffect(() => {
    let data = [...batches];
    if (filterBuah !== "all") {
      data = data.filter(b => b.nama_buah.toLowerCase() === filterBuah.toLowerCase());
    }
    if (search.trim() !== "") {
      data = data.filter(b => b.nama_buah.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredBatches(data);
  }, [search, filterBuah, batches]);

  // Sorting
  const sortBy = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });

    const sorted = [...filteredBatches].sort((a, b) => {
      if (key === "tanggal_masuk_batch") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      return direction === "asc"
        ? a[key] - b[key]
        : b[key] - a[key];
    });
    setFilteredBatches(sorted);
  };

  if (loading) return <p>Loading...</p>;

  const buahList = ["all", ...new Set(batches.map(b => b.nama_buah))];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pemantauan Batch Stok (FIFO)</h1>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Cari buah..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={filterBuah}
          onChange={e => setFilterBuah(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {buahList.map(b => (
            <option key={b} value={b}>{b === "all" ? "Semua Buah" : b}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="py-2 px-4 cursor-pointer" onClick={() => sortBy("batch_id")}>Batch ID</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => sortBy("masuk_id")}>Masuk ID</th>
              <th className="py-2 px-4">Buah</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => sortBy("tanggal_masuk_batch")}>Tanggal Masuk</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => sortBy("stok_awal")}>Stok Awal</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => sortBy("stok_saat_ini")}>Stok Saat Ini</th>
              <th className="py-2 px-4">Kualitas</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.map(batch => (
              <tr key={batch.batch_id} className={batch.stok_saat_ini <= 5 ? "bg-red-100" : ""}>
                <td className="py-2 px-4">{batch.batch_id}</td>
                <td className="py-2 px-4">{batch.masuk_id}</td>
                <td className="py-2 px-4">{batch.nama_buah}</td>
                <td className="py-2 px-4">{batch.tanggal_masuk_batch}</td>
                <td className="py-2 px-4">{batch.stok_awal}</td>
                <td className="py-2 px-4">{batch.stok_saat_ini}</td>
                <td className="py-2 px-4">{batch.kualitas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
