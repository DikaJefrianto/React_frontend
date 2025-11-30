import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, Search, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import axiosInstance from "../../utils/axiosInstance"; 

// ====================================================================
// KOMPONEN: NotificationModal (Z-INDEX 9999)
// ====================================================================
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
                <h3 className="text-xl font-bold mb-2">{type === "success" ? "Berhasil!" : "Terjadi Kesalahan"}</h3> {/* Logic ini sudah benar */}
                <p className="text-gray-600 mb-4">{message}</p>
                <Button onClick={onClose} className={`text-white px-4 py-2 rounded transition duration-150 ${buttonClass}`}>Tutup</Button>
            </div>
        </div>
    );
};
// ====================================================================

export default function TrxBarangMasukPage({ currentRole }) {
    const [modalOpen, setModalOpen] = useState(false);
    // NOTE: Inisialisasi awal type adalah 'success'.
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: "", type: "success" });
    const [buahList, setBuahList] = useState([]);
    const [supplierList, setSupplierList] = useState([]);
    const [transaksiList, setTransaksiList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // State untuk Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    // State untuk Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'masuk_id', direction: 'ascending' });

    const [formData, setFormData] = useState({
        supplier_id: "",
        items: [],
    });

    const token = localStorage.getItem("access_token");
    const canModify = ["Admin", "Petugas Gudang"].includes(currentRole);

    // =========================
    // Fetch data (MENGGUNAKAN AXIOS INSTANCE)
    // =========================
    const fetchBuah = async () => {
        if (!token) return;
        try {
            const res = await axiosInstance.get("/master/buah");
            setBuahList(res.data || []);
        } catch (err) {
            console.error("Error fetch buah:", err.response?.data || err.message);
        }
    };

    const fetchSupplier = async () => {
        if (!token) return;
        try {
            const res = await axiosInstance.get("/master/supplier");
            setSupplierList(res.data || []);
        } catch (err) {
            console.error("Error fetch supplier:", err.response?.data || err.message);
        }
    };

    const fetchTransaksi = async () => {
        if (!token) return;
        try {
            const res = await axiosInstance.get("/inventory/masuk");
            const rawData = res.data?.data || [];
            setTransaksiList(rawData);
        } catch (err) {
            console.error("Error fetch transaksi:", err.response?.data || err.message);
        }
    };

    useEffect(() => {
        fetchTransaksi();
    }, [token]);

    const openModalAndFetch = () => {
        setFormData({ supplier_id: "", items: [] });
        fetchSupplier();
        fetchBuah();
        setModalOpen(true);
    };

    // =========================
    // Item logic
    // =========================
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { buah_id: "", kuantitas: 0, kualitas: "Grade A", hargaPerKg: "" }],
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

            // LOGIC AUTO-FILL HARGA
            if (field === "buah_id" && value) {
                const selectedBuah = buahList.find(b => b.buah_id?.toString() === value.toString());
                if (selectedBuah) {
                    newItems[index].hargaPerKg = selectedBuah.harga_satuan?.toString() || "";
                } else {
                    newItems[index].hargaPerKg = "";
                }
            }

            return { ...prev, items: newItems };
        });
    };

    const calculateTotal = () => {
        return formData.items.reduce((acc, cur) => {
            const harga = parseFloat(cur.hargaPerKg) || 0;
            const kuantitas = parseFloat(cur.kuantitas) || 0;
            return acc + (kuantitas * harga);
        }, 0);
    };

    // =========================
    // Submit form (FIXED VALIDATION CLOSING AND TYPE)
    // =========================
    const handleSubmit = async () => {
        
        // Lakukan validasi terlebih dahulu (diperbaiki agar menutup modal dan type: "error")
        if (!formData.supplier_id) {
            setModalOpen(false); // TUTUP MODAL
            return setNotificationModal({ isOpen: true, message: "Pilih supplier dulu.", type: "error" }); // TYPE: ERROR
        }
        if (formData.items.length === 0) {
            setModalOpen(false); // TUTUP MODAL
            return setNotificationModal({ isOpen: true, message: "Tambahkan minimal 1 item.", type: "error" }); // TYPE: ERROR
        }

        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.buah_id) {
                setModalOpen(false); // TUTUP MODAL
                return setNotificationModal({ isOpen: true, message: `Pilih buah pada item ${i + 1}`, type: "error" }); // TYPE: ERROR
            }
            if (item.kuantitas <= 0) {
                setModalOpen(false); // TUTUP MODAL
                return setNotificationModal({ isOpen: true, message: `Stok awal harus > 0 pada item ${i + 1}`, type: "error" }); // TYPE: ERROR
            }
            if (!parseFloat(item.hargaPerKg) || parseFloat(item.hargaPerKg) <= 0) {
                setModalOpen(false); // TUTUP MODAL
                return setNotificationModal({ isOpen: true, message: `Harga/Kg harus > 0 pada item ${i + 1}`, type: "error" }); // TYPE: ERROR
            }
            if (!item.kualitas) {
                setModalOpen(false); // TUTUP MODAL
                return setNotificationModal({ isOpen: true, message: `Pilih kualitas pada item ${i + 1}`, type: "error" }); // TYPE: ERROR
            }
        }

        const payload = {
            supplier_id: parseInt(formData.supplier_id),
            items: formData.items.map(i => ({
                buah_id: parseInt(i.buah_id),
                stok_awal: parseFloat(i.kuantitas),
                harga_beli: parseFloat(i.hargaPerKg),
                kualitas: i.kualitas || "Grade A",
            })),
            total_biaya: parseFloat(calculateTotal()),
        };

        try {
            const res = await axiosInstance.post(
                "/inventory/masuk",
                payload
            );
            setModalOpen(false); // Tutup saat Sukses
            setFormData({ supplier_id: "", items: [] });
            fetchTransaksi();
            // Tampilkan modal notifikasi (TYPE: SUCCESS)
            setNotificationModal({ isOpen: true, message: res.data.msg || "Data transaksi berhasil disimpan!", type: "success" });

        } catch (err) {
            console.error(err);
            setModalOpen(false); // FIX: Tutup jika API gagal
            setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Terjadi kesalahan saat menyimpan data.", type: "error" }); // TYPE: ERROR
        }
    };

    // =========================
    // SORTING & PAGINATION LOGIC
    // =========================

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
            key = 'masuk_id'; // Default key
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedAndFilteredTransaksi = useMemo(() => {
            let sortedArray = [...transaksiList];

            // 1. Filtering
            const filteredArray = sortedArray.filter(trx =>
                trx.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (trx.id || trx.masuk_id)?.toString().includes(searchTerm)
            );

            // 2. Sorting
            if (sortConfig.key) {
                filteredArray.sort((a, b) => {
                    const key = sortConfig.key;
                    let aValue = a[key] || a.masuk_id;
                    let bValue = b[key] || b.masuk_id;

                    let comparison = 0; 
                    
                    if (typeof aValue === 'string') {
                        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
                    } else if (key === 'total_biaya' || key === 'masuk_id' || key === 'id') {
                        comparison = (parseFloat(aValue) || 0) - (parseFloat(bValue) || 0);
                    } else if (key === 'tanggal') {
                        comparison = new Date(aValue) - new Date(bValue);
                    }
    
                    return sortConfig.direction === 'ascending' ? comparison : -comparison;
                });
            } else {
                // Default sort: ID terbesar ke terkecil
                filteredArray.sort((a, b) => (b.id || b.masuk_id) - (a.id || a.masuk_id));
            }
    
            return filteredArray;
        }, [transaksiList, searchTerm, sortConfig]);


    // 3. Pagination
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedAndFilteredTransaksi.slice(indexOfFirstRow, indexOfLastRow);

    const totalPages = Math.ceil(sortedAndFilteredTransaksi.length / rowsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending'
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />;
    };


    return (
        <div className="p-6 space-y-6">
            <NotificationModal
                isOpen={notificationModal.isOpen}
                message={notificationModal.message}
                onClose={() => setNotificationModal(prev => ({ ...prev, isOpen: false, message: "" }))} // FIX: Reset state tanpa mengubah type
                type={notificationModal.type}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Transaksi Barang Masuk</h1>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transition duration-150"
                        onClick={openModalAndFetch}
                    >
                        <Plus className="w-4 h-4" /> Tambah Transaksi
                    </Button>
                    <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm w-full md:w-auto">
                        <Input
                            placeholder="Search Supplier atau ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="border-none focus:ring-0 px-3 py-2 text-sm w-full"
                        />
                        <div className="px-3">
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                {/* Table - Dibuat Responsive dan Modern */}
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {/* Kolom ID: Default Sort ID kecil ke besar (initial), klik kedua ID besar ke kecil, klik ketiga ID kecil ke besar */}
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer min-w-[80px]"
                                    onClick={() => requestSort('id')} // Asumsi key di data adalah 'id'
                                >
                                    ID {getSortIcon('id')}
                                </th>
                                {/* Kolom Tanggal */}
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer min-w-[120px]"
                                    onClick={() => requestSort('tanggal')}
                                >
                                    Tanggal {getSortIcon('tanggal')}
                                </th>
                                {/* Kolom Supplier */}
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer min-w-[150px]"
                                    onClick={() => requestSort('supplier')}
                                >
                                    Supplier {getSortIcon('supplier')}
                                </th>
                                {/* Kolom Total Biaya */}
                                <th
                                    className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase cursor-pointer min-w-[100px]"
                                    onClick={() => requestSort('total_biaya')}
                                >
                                    Total Biaya {getSortIcon('total_biaya')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentRows.length > 0 ? (
                                currentRows.map(trx => (
                                    <tr key={trx.id || trx.masuk_id} className="hover:bg-gray-50 transition duration-75">
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{trx.id || trx.masuk_id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{trx.tanggal}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{trx.supplier}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 text-right font-semibold">
                                            Rp {new Intl.NumberFormat('id-ID').format(trx.total_biaya)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">Tidak ada data transaksi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
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
                // FIX: Menutup Dialog Form ketika notifikasi error muncul
                modal={!notificationModal.isOpen} 
            >
                <DialogContent 
                    className="bg-white p-6 rounded-xl w-full max-w-3xl"
                    // Memastikan modal form tidak bisa di-click jika notifikasi aktif
                    style={{ pointerEvents: notificationModal.isOpen ? 'none' : 'auto' }}
                >
                    <DialogHeader>
                        <DialogTitle>Tambah Transaksi Masuk</DialogTitle>
                        <DialogDescription>
                            Masukkan detail supplier, daftar buah, kuantitas, dan harga beli per kg.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {/* INPUT SUPPLIER */}
                        <div>
                            <Select
                                value={formData.supplier_id?.toString() || ""}
                                onValueChange={val => setFormData(prev => ({ ...prev, supplier_id: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Supplier" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border shadow-md">
                                    {supplierList.map(s => (
                                        <SelectItem key={s.supplier_id} value={s.supplier_id.toString()}>
                                            {s.nama_supplier}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Pilih supplier yang menyediakan buah.</p>
                        </div>

                        {/* ITEM HEADER BARU: Menghapus layout flex horizontal global */}
                        <div className="grid grid-cols-4 gap-2 font-bold text-sm text-gray-600 border-b pb-1">
                            <span className="col-span-1">Buah & Kualitas</span>
                            <span className="col-span-1">Stok (Kg)</span>
                            <span className="col-span-1">Harga/Kg</span>
                            <span className="col-span-1">Aksi</span>
                        </div>

                        {/* ITEM LIST */}
                        {formData.items.map((item, idx) => (
                            // Kontainer Utama Item: Menggunakan flex col dan grid 2 kolom
                            <div key={idx} className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50">
                                
                                {/* BARIS 1: BUAH DAN KUALITAS */}
                                <div className="grid grid-cols-2 gap-2">
                                    {/* INPUT BUAH */}
                                    <Select
                                        value={item.buah_id?.toString() || ""}
                                        onValueChange={val => handleChangeItem(idx, "buah_id", val)}
                                        className="w-full"
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Buah" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border shadow-md">
                                            {buahList.map(b => (
                                                <SelectItem key={b.buah_id} value={b.buah_id.toString()}>
                                                    {b.nama_buah}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* INPUT KUALITAS */}
                                    <Select
                                        value={item.kualitas || ""}
                                        onValueChange={val => handleChangeItem(idx, "kualitas", val)}
                                        className="w-full"
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border shadow-md">
                                            {["Grade A", "Grade B", "Grade C", "Grade D"].map(q => (
                                                <SelectItem key={q} value={q}>
                                                    {q}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                </div>
                                
                                {/* BARIS 2: STOK, HARGA, HAPUS */}
                                <div className="grid grid-cols-4 gap-2 items-center">
                                    <div className="col-span-1">
                                        <Input
                                            type="number"
                                            placeholder="Stok (Kg)"
                                            value={item.kuantitas === 0 ? "" : item.kuantitas}
                                            onChange={e => handleChangeItem(idx, "kuantitas", e.target.value)}
                                            className="w-full text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Harga Beli/Kg"
                                            value={item.hargaPerKg}
                                            onChange={e => handleChangeItem(idx, "hargaPerKg", e.target.value)}
                                            className="w-full text-sm"
                                        />
                                    </div>

                                    <Button variant="destructive" onClick={() => removeItem(idx)} className="w-full col-span-1">
                                        <X className="w-4 h-4" /> Hapus Item
                                    </Button>
                                </div>


                                <p className="text-xs text-gray-500 italic mt-1">
                                    Subtotal: Rp {new Intl.NumberFormat('id-ID').format(calculateTotal([item]).toFixed(2))}
                                </p>
                            </div>
                        ))}

                        {/* ITEM HINT */}
                        {formData.items.length === 0 && (
                            <p className="text-xs text-red-500 italic">Klik 'Tambah Item' untuk mulai memasukkan buah.</p>
                        )}


                        <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white transition duration-150">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Item
                        </Button>

                        {/* INPUT TOTAL BIAYA */}
                        <div>
                            <Input
                                placeholder="Total Biaya"
                                value={`Rp ${new Intl.NumberFormat('id-ID').format(calculateTotal().toFixed(2))}`}
                                readOnly
                                className="text-lg font-bold bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Total biaya dihitung dari semua Stok * Harga/Kg.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSubmit}
                            className="bg-green-600 hover:bg-green-700 text-white transition duration-150"
                        >
                            Submit Transaksi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}