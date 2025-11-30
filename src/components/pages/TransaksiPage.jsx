import React, { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Edit2, X, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import axiosInstance from "../../utils/axiosInstance";

// ==========================
// Notification Modal
// ==========================
const NotificationModal = ({ isOpen, message, onClose, type = "success" }) => {
    if (!isOpen) return null;
    const Icon = type === "success" ? CheckCircle : AlertTriangle;
    const color = type === "success" ? "text-emerald-500" : "text-red-500";
    const buttonClass = type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700";

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full text-center relative"
                onClick={(e) => e.stopPropagation()}
            >
                <Icon className={`w-12 h-12 mx-auto mb-4 ${color}`} />
                <h3 className="text-xl font-bold mb-2">{type === "success" ? "Berhasil!" : "Terjadi Kesalahan"}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <Button onClick={onClose} className={`text-white px-4 py-2 rounded transition duration-150 ${buttonClass}`}>Tutup</Button>
            </div>
        </div>
    );
};

// ==========================
// TrxBarangKeluarPage
// ==========================
export default function TrxBarangKeluarPage({ currentRole }) {
    const [transaksi, setTransaksi] = useState([]);
    const [pelangganList, setPelangganList] = useState([]);
    const [batchList, setBatchList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: "", type: "success" });

    const [formData, setFormData] = useState({
        customer_id: "",
        items: [],
        total: 0,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const token = localStorage.getItem("access_token");
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // =========================
    // Fetch Data
    // =========================
    const fetchTransaksi = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/transaksi/keluar");

            // Ambil array dari response, fallback ke []
            const dataArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);

            const mappedData = dataArray.map(trx => ({
                id: trx.id || trx.keluar_id,
                tanggal: trx.tanggal,
                namaPelanggan: trx.pelanggan || "N/A",
                totalNilai: trx.total_penjualan || 0,
                status: trx.status || "N/A",
                items: trx.items || [] // ✅ pastikan selalu array
            }));

            setTransaksi(mappedData);

        } catch (error) {
            console.error("Error fetch transaksi:", error);
            setTransaksi([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPelanggan = async () => {
        try {
            const res = await axiosInstance.get("/master/pelanggan");
            setPelangganList(res.data || []);
        } catch (error) {
            console.error("Error fetch pelanggan:", error);
            setPelangganList([]);
        }
    };

    const fetchBatch = async () => {
        try {
            const res = await axiosInstance.get("/batch-stock/");
            const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const availableBatches = rawData.filter(b => (b.stok_saat_ini || 0) > 0);
            setBatchList(availableBatches);
        } catch (error) {
            console.error("Error fetching available batch list:", error);
            setBatchList([]);
        }
    };

    useEffect(() => {
        fetchTransaksi();
        fetchPelanggan();
        fetchBatch();
    }, [token]);

    const openModalAndFetch = () => {
        setFormData({ customer_id: "", items: [], total: 0 });
        fetchPelanggan();
        fetchBatch();
        setModalOpen(true);
    };

    // =========================
    // Helper Update Stok
    // =========================
    const updateBatchStock = (items, isAdd = false) => {
        setBatchList(prev =>
            prev.map(b => {
                const item = items.find(i => i.batch_id.toString() === b.batch_id.toString());
                if (!item) return b;
                const qty = parseFloat(item.kuantitas || item.jumlah || 0);
                return { ...b, stok_saat_ini: b.stok_saat_ini + (isAdd ? qty : -qty) };
            })
        );
    };

    // =========================
    // Item Logic
    // =========================
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { batch_id: "", buah_id: "", kuantitas: 0, hargaPerKg: 0, maxStok: 0 }],
        }));
    };

    const removeItem = index => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const handleChangeItem = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index][field] = value;

            if (field === "batch_id" && value) {
                const selectedBatch = batchList.find(b => b.batch_id?.toString() === value.toString());
                if (selectedBatch) {
                    newItems[index].buah_id = selectedBatch.buah_id.toString();
                    newItems[index].hargaPerKg = selectedBatch.harga_jual?.toString() || 0;
                    newItems[index].maxStok = selectedBatch.stok_saat_ini || 0;
                } else {
                    newItems[index].buah_id = "";
                    newItems[index].hargaPerKg = 0;
                    newItems[index].maxStok = 0;
                    newItems[index].kuantitas = 0;
                }
            }

            if (field === "kuantitas") {
                const maxStok = newItems[index].maxStok || 0;
                let kuantitasBaru = parseFloat(value) || 0;
                newItems[index][field] = kuantitasBaru > maxStok ? maxStok : kuantitasBaru;
            }

            return { ...prev, items: newItems };
        });
    };

    const calculateTotal = (items) => {
        return (items || []).reduce(
            (acc, cur) => acc + (parseFloat(cur.kuantitas) || 0) * (parseFloat(cur.hargaPerKg) || 0),
            0
        );
    };

    // =========================
    // Handle Submit Transaksi
    // =========================
    const handleSubmit = async () => {
        if (!formData.customer_id) return setNotificationModal({ isOpen: true, message: "Pilih pelanggan terlebih dahulu!", type: "error" });
        if (formData.items.length === 0) return setNotificationModal({ isOpen: true, message: "Tambahkan minimal 1 item!", type: "error" });

        for (const item of formData.items) {
            if (!item.batch_id) return setNotificationModal({ isOpen: true, message: "Pilih Batch ID untuk semua item.", type: "error" });
            if (item.kuantitas <= 0) return setNotificationModal({ isOpen: true, message: "Kuantitas harus lebih dari 0.", type: "error" });
        }

        const total = calculateTotal(formData.items);

        const payload = {
            pelanggan_id: parseInt(formData.customer_id),
            total_penjualan: total,
            items: formData.items.map(i => ({
                batch_id: parseInt(i.batch_id),
                jumlah: parseFloat(i.kuantitas),
                harga_satuan: parseFloat(i.hargaPerKg)
            }))
        }

        try {
            const res = await axiosInstance.post("/transaksi/keluar", payload);
            setModalOpen(false);
            setFormData({ customer_id: "", items: [], total: 0 });

            // 🔹 Update stok otomatis di frontend
            updateBatchStock(formData.items, false);

            fetchTransaksi();
            setNotificationModal({ isOpen: true, message: res.data.msg || "Transaksi berhasil disimpan!", type: "success" });
        } catch (err) {
            console.error(err);
            setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Terjadi kesalahan saat menyimpan transaksi.", type: "error" });
        }
    };
    const handleStatusUpdate = async (trxId, newStatus) => {
        if (!trxId || !newStatus) {
            return setNotificationModal({ isOpen: true, message: "ID Transaksi atau Status baru tidak valid.", type: "error" });
        }

        try {
            // Asumsi endpoint API untuk update status adalah PUT /transaksi/keluar/:id/status
            const res = await axiosInstance.put(`/transaksi/keluar/${trxId}`, {
                status: newStatus
            });

            // 1. Tutup modal edit
            setEditModalOpen(false);

            // 2. Perbarui state transaksi secara lokal
            setTransaksi(prev =>
                prev.map(trx =>
                    (trx.id || trx.keluar_id) === trxId ? { ...trx, status: newStatus } : trx
                )
            );

            // 3. Tampilkan notifikasi berhasil
            setNotificationModal({
                isOpen: true,
                message: res.data.msg || `Status Transaksi ID ${trxId} berhasil diubah menjadi: ${newStatus}.`,
                type: "success"
            });
        } catch (err) {
            console.error("Error updating status:", err);
            setNotificationModal({
                isOpen: true,
                message: err.response?.data?.error || "Gagal memperbarui status transaksi.",
                type: "error"
            });
        }
    };
    // =========================
    // Handle Delete Transaksi
    // =========================
    const handleDelete = async () => {
        if (!selectedTrx) return;
        const trxId = selectedTrx.id || selectedTrx.keluar_id;

        try {
            const res = await axiosInstance.delete(`/transaksi/keluar/${trxId}`);
            setDeleteModalOpen(false);

            // 🔹 Update stok batch di frontend (optional)
            if (selectedTrx.items && selectedTrx.items.length > 0) {
                updateBatchStock(selectedTrx.items, true);
            }

            // 🔹 Hapus transaksi dari state langsung (tidak perlu fetch ulang)
            setTransaksi(prev => prev.filter(trx => (trx.id || trx.keluar_id) !== trxId));

            setNotificationModal({
                isOpen: true,
                message: res.data.msg || `Transaksi ID ${trxId} berhasil dihapus.`,
                type: "success"
            });

        } catch (err) {
            console.error(err);
            setNotificationModal({
                isOpen: true,
                message: err.response?.data?.error || "Gagal menghapus transaksi.",
                type: "error"
            });
        }
    };

    // =========================
    // Sorting & Pagination
    // =========================
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        else if (sortConfig.key === key && sortConfig.direction === "desc") { key = 'id'; direction = 'asc'; }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const getTrxSortIcon = (key) => sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : null;

    const sortedAndFilteredTrx = useMemo(() => {
        let list = [...transaksi];
        list = list.filter(trx =>
            trx.namaPelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trx.id?.toString().includes(searchTerm)
        );
        if (sortConfig.key) {
            list.sort((a, b) => {
                const key = sortConfig.key;
                let aValue = a[key] || a.keluar_id;
                let bValue = b[key] || b.keluar_id;
                return sortConfig.direction === "asc"
                    ? (typeof aValue === "string" ? aValue.localeCompare(bValue) : aValue - bValue)
                    : (typeof aValue === "string" ? bValue.localeCompare(aValue) : bValue - aValue);
            });
        }
        return list;
    }, [transaksi, searchTerm, sortConfig]);

    const totalItems = sortedAndFilteredTrx.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedAndFilteredTrx.slice(indexOfFirstRow, indexOfLastRow);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // =========================
    // Render Component
    // =========================
    return (
        <div className="p-6 space-y-6">
            {/* Notification Modal */}
            <NotificationModal
                isOpen={notificationModal.isOpen}
                message={notificationModal.message}
                onClose={() => setNotificationModal({ isOpen: false, message: "", type: "success" })}
                type={notificationModal.type}
            />

            {/* Kontrol & Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Transaksi Barang Keluar</h1>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <Button onClick={() => openModalAndFetch()} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Transaksi
                    </Button>
                    <Input
                        placeholder="Cari ID atau Pelanggan..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-60 border"
                    />

                </div>
            </div>

            {/* ========================= */}
            {/* Tabel transaksi keluar (Modern) */}
            {/* ========================= */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-gray-50">
                            <TableRow className="uppercase text-xs text-gray-600">
                                <TableHead className="w-[80px] cursor-pointer hover:bg-gray-100" onClick={() => handleSort("id")}>
                                    ID {getTrxSortIcon('id')}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("namaPelanggan")}>
                                    Pelanggan {getTrxSortIcon('namaPelanggan')}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("tanggal")}>
                                    Tanggal {getTrxSortIcon('tanggal')}
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort("totalNilai")}>
                                    Total Nilai {getTrxSortIcon('totalNilai')}
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRows.length === 0 && !loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-6">Tidak ada data transaksi.</TableCell></TableRow>
                            ) : loading ? (
                                <TableRow><TableCell colSpan={6} className="p-6 text-center text-gray-500">Memuat data...</TableCell></TableRow>
                            ) : (
                                currentRows.map(trx => (
                                    <TableRow key={trx.id || trx.keluar_id} className="hover:bg-gray-50 transition duration-75">
                                        <TableCell className="font-semibold text-gray-800">{trx.id || trx.keluar_id}</TableCell>
                                        <TableCell className="font-medium">{trx.namaPelanggan}</TableCell>
                                        <TableCell className="text-sm">{trx.tanggal}</TableCell>
                                        <TableCell className="text-right font-semibold text-emerald-600">
                                            Rp {new Intl.NumberFormat('id-ID').format(trx.totalNilai || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trx.status === 'Terkirim' ? 'bg-green-100 text-green-800' :
                                                trx.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {trx.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-500"
                                                onClick={() => {
                                                    setSelectedTrx(trx);
                                                    setEditModalOpen(true);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-500"
                                                onClick={() => {
                                                    setSelectedTrx(trx);
                                                    setDeleteModalOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {totalItems > rowsPerPage && (
                    <div className="flex justify-between items-center p-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <div className="flex space-x-2">
                            {pageNumbers.map(number => (
                                <Button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    variant={number === currentPage ? "default" : "outline"}
                                    size="sm"
                                    className={number === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
                                >
                                    {number}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>


            {/* Modal Add Transaksi (Form) */}
            <Dialog
                open={modalOpen}
                onOpenChange={setModalOpen}
                // HANYA MENCEGAH INTERAKSI JIKA NOTIFIKASI ERROR AKTIF
                modal={!notificationModal.isOpen}
            >
                <DialogContent
                    className="bg-white p-6 rounded-xl w-full max-w-3xl"
                    style={{ pointerEvents: notificationModal.isOpen ? 'none' : 'auto' }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Tambah Transaksi Keluar</DialogTitle>
                        <DialogDescription>Masukkan detail pelanggan dan item buah yang dijual.</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {/* PILIH PELANGGAN */}
                        <div>
                            <Select
                                value={formData.customer_id?.toString() || ""}
                                onValueChange={val => setFormData({ ...formData, customer_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Pelanggan" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border shadow-md">
                                    {(pelangganList || []).map(p => (
                                        <SelectItem key={p.pelanggan_id} value={p.pelanggan_id.toString()}>
                                            {p.nama_pelanggan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">Pelanggan yang melakukan pembelian.</p>
                        </div>

                        {/* ITEMS HEADER */}
                        <div className="flex gap-2 font-bold text-sm text-gray-600 border-b pb-1 mt-4">
                            <span className="w-2/5">Batch & Buah</span>
                            <span className="w-1/5">Kuantitas (Kg)</span>
                            <span className="w-1/5">Harga Jual/Kg</span>
                            <span className="w-1/5 text-right">Subtotal</span>
                            <span className="w-[40px]"></span>
                        </div>

                        {/* Items */}
                        {(formData.items || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center">

                                {/* INPUT BATCH ID (Select) */}
                                <div className="w-2/5 space-y-1">
                                    <Select
                                        value={item.batch_id?.toString() || ""}
                                        onValueChange={val => handleChangeItem(idx, "batch_id", val)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Batch ID" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border shadow-md">
                                            {(batchList || []).filter(b => (b.stok_saat_ini || 0) > 0).map(b => (
                                                <SelectItem key={b.batch_id} value={b.batch_id.toString()}>
                                                    Batch: {b.batch_id} ({b.nama_buah} | Stok: {b.stok_saat_ini})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">Buah: {batchList.find(b => b.batch_id?.toString() === item.batch_id)?.nama_buah || '-'} | Max: {item.maxStok || 0} Kg</p>
                                </div>

                                {/* INPUT KUANTITAS */}
                                <div className="w-1/5">
                                    <Input
                                        placeholder="Qty"
                                        type="number"
                                        min="0"
                                        max={item.maxStok || 0}
                                        value={item.kuantitas === 0 ? "" : item.kuantitas}
                                        onChange={e => handleChangeItem(idx, "kuantitas", e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                {/* INPUT HARGA PER KG (Dapat Diedit) */}
                                <div className="w-1/5">
                                    <Input
                                        placeholder="Harga Jual"
                                        type="number"
                                        value={item.hargaPerKg}
                                        onChange={e => handleChangeItem(idx, "hargaPerKg", e.target.value)}
                                        className="w-full text-sm"
                                    />
                                </div>

                                {/* SUBTOTAL */}
                                <div className="w-1/5 text-right font-semibold text-sm">
                                    Rp {new Intl.NumberFormat('id-ID').format(calculateTotal([item]))}
                                </div>

                                <Button variant="destructive" size="sm" onClick={() => removeItem(idx)} className="w-[40px] p-2">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}

                        <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white">Tambah Item</Button>

                        <Input
                            placeholder="Total Keseluruhan"
                            value={`Rp ${new Intl.NumberFormat('id-ID').format(calculateTotal(formData.items).toFixed(0))}`}
                            readOnly
                            className="text-lg font-bold bg-gray-100"
                        />
                    </div>

                    <DialogFooter>
                        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">Submit Transaksi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Delete (Modern) */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto text-center">
                    <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <p className="mt-2 text-sm text-gray-600">Apakah Anda yakin ingin menghapus transaksi **ID {selectedTrx?.id || selectedTrx?.keluar_id}**? Aksi ini tidak bisa dibatalkan.</p>
                    <DialogFooter className="flex justify-center gap-3 mt-4">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Batal</Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus Permanen</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Status (Modern) */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="bg-white p-6 rounded-lg w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Status Transaksi ID {selectedTrx?.id || selectedTrx?.keluar_id}</DialogTitle>
                        <DialogDescription>Pilih status baru untuk transaksi ini.</DialogDescription>
                    </DialogHeader>
                    <Select
                        value={selectedTrx?.status || ""}
                        onValueChange={val => setSelectedTrx({ ...selectedTrx, status: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-md">
                            <SelectItem value="Diproses">Diproses</SelectItem>
                            <SelectItem value="Dikirim">Dikirim</SelectItem>
                            <SelectItem value="Batal">Batal</SelectItem>
                        </SelectContent>
                    </Select>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>Batal</Button>
                        <Button
                            onClick={() =>
                                handleStatusUpdate(selectedTrx?.id || selectedTrx?.keluar_id, selectedTrx?.status)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}