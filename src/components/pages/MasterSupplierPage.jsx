import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit, CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import axiosInstance from "../../utils/axiosInstance";

// ====================================================================
// Notification Modal (Z-INDEX 9999)
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
                <h3 className="text-xl font-bold mb-2">{type === "success" ? "Berhasil!" : "Terjadi Kesalahan"}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <Button onClick={onClose} className={`text-white px-4 py-2 rounded transition duration-150 ${buttonClass}`}>Tutup</Button>
            </div>
        </div>
    );
};

// ====================================================================
// Main Component
// ====================================================================
export default function MasterSupplierPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // FIX: Menggunakan dialogOpen (sesuai deklarasi awal)
    const [dialogOpen, setDialogOpen] = useState(false); 
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: "", type: "success" });

    const [formData, setFormData] = useState({ nama_supplier: "", alamat: "", kontak: "" });

    const canModify = ["Admin", "Petugas Gudang"].includes(localStorage.getItem("user_role")); // Mengambil role dari localStorage

    // Search, filter, sort
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSatuan, setFilterSatuan] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "supplier_id", direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => { loadSuppliers(); }, []);

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/master/supplier");
            setSuppliers(res.data || []);
        } catch (err) {
            console.error(err);
            setNotificationModal({ isOpen: true, message: "Gagal memuat data supplier.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Add / Edit / Delete
    // -------------------------
    const openDialog = (supplier = null) => {
        setSelectedSupplier(supplier);
        setFormData(supplier ? { ...supplier } : { nama_supplier: "", alamat: "", kontak: "" });
        setDialogOpen(true); // FIX: Menggunakan setDialogOpen
    };

    const openEditDialog = (supplier) => {
        setSelectedSupplier(supplier);
        setFormData({ ...supplier });
        setDialogOpen(true); // FIX: Menggunakan setDialogOpen
    };

    const handleSave = async () => {
        if (!formData.nama_supplier || !formData.alamat) {
            // FIX: Tutup Dialog form saat memunculkan Notification Modal
            setDialogOpen(false); 
            setNotificationModal({ isOpen: true, message: "Nama dan alamat wajib diisi!", type: "error" });
            return;
        }

        try {
            const isEdit = !!selectedSupplier;
            const method = isEdit ? "put" : "post";
            const url = isEdit
                ? `/master/supplier/${selectedSupplier.supplier_id}`
                : "/master/supplier";

            const res = await axiosInstance({ method, url, data: formData });

            const msg = isEdit ? "Data supplier berhasil diperbarui!" : "Data supplier berhasil ditambahkan!";
            setNotificationModal({ isOpen: true, message: res.data.msg || msg, type: "success" });
            setDialogOpen(false); // Pastikan ini ditutup
            loadSuppliers();

        } catch (err) {
            console.error(err);
            // FIX: Tutup Dialog form saat memunculkan Notification Modal
            setDialogOpen(false); 
            setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Gagal menyimpan supplier.", type: "error" });
        }
    };

    const handleDelete = async () => {
        if (!selectedSupplier) return;
        const supplierName = selectedSupplier.nama_supplier;

        try {
            const res = await axiosInstance.delete(`/master/supplier/${selectedSupplier.supplier_id}`);
            setNotificationModal({ isOpen: true, message: res.data.msg || `Supplier ${supplierName} berhasil dihapus.`, type: "success" });
            setIsDeleteDialogOpen(false);
            loadSuppliers();

        } catch (err) {
            console.error(err);
            setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Gagal menghapus supplier.", type: "error" });
        }
    };

    // -------------------------
    // Sort/Search/Filter/Pagination
    // -------------------------
    const getSortIcon = (key) => sortConfig.key !== key ? null : (sortConfig.direction === "asc" ? "▲" : "▼");

    const handleSortChange = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        else if (sortConfig.key === key && sortConfig.direction === "desc") direction = "asc";
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

    const sortedSuppliers = useMemo(() => {
        let array = [...suppliers];
        array = array
            .filter(s => s.nama_supplier?.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(s => filterSatuan ? s.satuan === filterSatuan : true);

        if (sortConfig.key) {
            array.sort((a,b) => {
                let aValue = a[sortConfig.key], bValue = b[sortConfig.key];
                let cmp = typeof aValue === "string" ? aValue.localeCompare(bValue) : (parseFloat(aValue) || 0) - (parseFloat(bValue) || 0);
                return sortConfig.direction === "asc" ? cmp : -cmp;
            });
        }
        return array;
    }, [suppliers, searchTerm, filterSatuan, sortConfig]);

    const totalItems = sortedSuppliers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedSuppliers.slice(indexOfFirstRow, indexOfLastRow);
    const pageNumbers = Array.from({length: totalPages}, (_,i) => i+1);

    // ====================================================================
    // Render
    // ====================================================================
    return (
        <div className="p-6 space-y-6">
            {/* Modal Notifikasi */}
            <NotificationModal
                isOpen={notificationModal.isOpen}
                message={notificationModal.message}
                onClose={() => setNotificationModal({ isOpen: false, message: "", type: "success" })}
                type={notificationModal.type}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Master Supplier</h1>
                    <p className="text-gray-600">Kelola data pemasok buah untuk transaksi masuk.</p>
                </div>
            </div>

            {/* Search & Add */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-white rounded-lg shadow-md border">
                {canModify && (
                    <Button onClick={() => openDialog()} className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 mt-4 md:mt-0">
                        <Plus className="w-4 h-4" /> Tambah Supplier
                    </Button>
                )}
                <Input
                    placeholder="Cari nama, alamat, atau kontak supplier..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-1/3"
                />
            </div>

            {/* Table */}
            <Card className="border shadow-lg">
                <div className="overflow-x-auto min-w-full">
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[80px] cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("supplier_id")}>
                                    ID {getSortIcon('supplier_id')}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("nama_supplier")}>
                                    Nama Supplier {getSortIcon('nama_supplier')}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("alamat")}>
                                    Alamat {getSortIcon('alamat')}
                                </TableHead>
                                <TableHead>Kontak</TableHead>
                                {canModify && <TableHead className="w-[100px] text-center">Aksi</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-gray-500">Memuat data...</TableCell></TableRow>
                            ) : currentRows.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-gray-500">Tidak ada data supplier ditemukan.</TableCell></TableRow>
                            ) : (
                                currentRows.map(s => (
                                    <TableRow key={s.supplier_id} className="hover:bg-gray-50 transition duration-75">
                                        <TableCell className="font-semibold text-gray-700">{s.supplier_id}</TableCell>
                                        <TableCell className="font-medium text-gray-800">{s.nama_supplier}</TableCell>
                                        <TableCell className="text-sm text-gray-700">{s.alamat}</TableCell>
                                        <TableCell className="text-sm text-gray-700">{s.kontak}</TableCell>
                                        {canModify && (
                                            <TableCell className="flex justify-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openDialog(s)} className="text-blue-600 hover:text-blue-500">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => { setSelectedSupplier(s); setIsDeleteDialogOpen(true); }} className="text-red-600 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalItems > rowsPerPage && (
                    <div className="flex justify-between items-center p-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Menampilkan {Math.min(indexOfLastRow, totalItems)} dari {totalItems} data
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
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                // Jika notifikasi error terbuka, jangan izinkan interaksi dengan Dialog form ini
                modal={!notificationModal.isOpen}
            >
                <DialogContent 
                    className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto"
                    // Memastikan modal form tidak bisa di-click jika notifikasi aktif
                    style={{ pointerEvents: notificationModal.isOpen ? 'none' : 'auto' }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{selectedSupplier ? "Edit Supplier" : "Tambah Supplier"}</DialogTitle>
                        <DialogDescription>
                            Isi detail informasi kontak dan lokasi pemasok buah.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Input placeholder="Nama Supplier" value={formData.nama_supplier} onChange={e => setFormData({ ...formData, nama_supplier: e.target.value })} required />
                            <p className="text-xs text-gray-500">Nama lengkap atau perusahaan pemasok.</p>
                        </div>
                        <div className="space-y-1">
                            <Input placeholder="Alamat Lengkap" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} required />
                            <p className="text-xs text-gray-500">Alamat fisik supplier.</p>
                        </div>
                        <div className="space-y-1">
                            <Input placeholder="Kontak (Nomor Telepon/HP)" type="tel" value={formData.kontak} onChange={e => setFormData({ ...formData, kontak: e.target.value })} />
                            <p className="text-xs text-gray-500">Nomor kontak yang dapat dihubungi.</p>
                        </div>
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 transition duration-150" disabled={submitting}>{submitting ? "Menyimpan..." : (selectedSupplier ? "Update" : "Simpan")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto text-center">
                    <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <p className="mt-2 text-sm text-gray-600">Apakah yakin menghapus supplier <strong>{selectedSupplier?.nama_supplier}</strong>?</p>
                    <DialogFooter className="flex justify-center gap-4 mt-6">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}