// pages/LaporanFIFOAuditPage.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import dayjs from "dayjs";

export default function LaporanFIFOAudit() {
    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [filterNearExpire, setFilterNearExpire] = useState(false);
    const [sortByDate, setSortByDate] = useState("asc");

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await axiosInstance.get("/monitor/batch_stock");
            setBatches(res.data.data || []);
        } catch (err) {
            console.error("Error fetching batch stock:", err);
        }
    };

    const filteredBatches = batches
        .filter((b) => !search || b.buah.toLowerCase().includes(search.toLowerCase()))
        .filter((b) => !filterNearExpire || b.days_left <= 3)
        .sort((a, b) => {
            const dateA = new Date(a.tanggal_masuk);
            const dateB = new Date(b.tanggal_masuk);
            return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
        });

    const getStatusClass = (status) => {
        switch (status) {
            case "Kritis":
                return "text-red-600";
            case "Sedang":
                return "text-yellow-600";
            default:
                return "text-green-600";
        }
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Pemantauan Batch Stok</h2>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 ">
                <input
                    type="text"
                    placeholder="Cari buah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <div className="div flex items-center gap-4 end ">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filterNearExpire}
                            onChange={(e) => setFilterNearExpire(e.target.checked)}
                            className="w-4 h-4"
                        />
                        Hanya hampir kadaluarsa
                    </label>

                    <select
                        value={sortByDate}
                        onChange={(e) => setSortByDate(e.target.value)}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        <option value="asc">Tanggal Masuk Asc</option>
                        <option value="desc">Tanggal Masuk Desc</option>
                    </select>
                </div>
            </div>


            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Buah</th>
                            <th className="px-4 py-2 text-left">Batch ID</th>
                            <th className="px-4 py-2 text-left">Tanggal Masuk</th>
                            <th className="px-4 py-2 text-left">Stok</th>
                            <th className="px-4 py-2 text-left">Umur Simpan (hari)</th>
                            <th className="px-4 py-2 text-left">Sisa Umur (hari)</th>
                            <th className="px-4 py-2 text-left">Status FIFO</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBatches.map((batch) => (
                            <tr key={batch.batch_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{batch.buah}</td>
                                <td className="px-4 py-2">{batch.batch_id}</td>
                                <td className="px-4 py-2">{dayjs(batch.tanggal_masuk).format("YYYY-MM-DD")}</td>
                                <td className="px-4 py-2">{batch.stok_saat_ini}</td>
                                <td className="px-4 py-2">{batch.umur_simpan_hari}</td>
                                <td className="px-4 py-2">{batch.days_left}</td>
                                <td className={`px-4 py-2 font-bold ${getStatusClass(batch.status_fifo)}`}>
                                    {batch.status_fifo}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredBatches.length === 0 && (
                <p className="text-center text-gray-500 mt-6">Tidak ada batch yang ditampilkan.</p>
            )}
        </div>
    );
}
