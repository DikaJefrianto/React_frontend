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
            onClick={onClose} // Klik overlay menutup modal
        >
            <div 
                className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full text-center relative"
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutupnya
            >
                <Icon className={`w-12 h-12 mx-auto mb-4 ${color}`} />
                <h3 className="text-xl font-bold mb-2">{type === "success" ? "Berhasil!" : "Terjadi Kesalahan"}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <Button 
                    onClick={onClose} 
                    className={`text-white px-4 py-2 rounded transition duration-150 ${buttonClass}`}
                >
                    Tutup
                </Button>
            </div>
        </div>
    );
};

// ====================================================================
// Main Component
// ====================================================================
export default function MasterBuahPage() {
    const [buahList, setBuahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentBuah, setCurrentBuah] = useState(null);
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: "", type: "success" });

    // Form state
    const [namaBuah, setNamaBuah] = useState("");
    const [satuan, setSatuan] = useState("");
    const [umurSimpan, setUmurSimpan] = useState("");
    const [hargaSatuan, setHargaSatuan] = useState(""); 
    const [stokTotal, setStokTotal] = useState("");

    // Filter/Search/Sort/Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSatuan, setFilterSatuan] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "buah_id", direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => { loadBuah(); }, []);

    const loadBuah = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/master/buah");
            setBuahList(res.data || []);
        } catch (err) {
            console.error(err);
            setNotificationModal({ isOpen: true, message: "Gagal memuat data buah.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Add / Edit / Delete
    // -------------------------
    const openAddDialog = () => {
        setCurrentBuah(null);
        setNamaBuah(""); setSatuan(""); setUmurSimpan(""); setStokTotal(""); setHargaSatuan("");
        setDialogOpen(true);
    };

    const openEditDialog = (buah) => {
        setCurrentBuah(buah);
        setNamaBuah(buah.nama_buah);
        setSatuan(buah.satuan);
        setUmurSimpan(buah.umur_simpan_hari.toString());
        setStokTotal(buah.stok_total.toString());
        setHargaSatuan(buah.harga_satuan?.toString() || "");
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!namaBuah || !satuan || !umurSimpan || !hargaSatuan) {
            setNotificationModal({ isOpen: true, message: "Lengkapi semua field wajib.", type: "error" });
            return;
        }

        const payload = {
            nama_buah: namaBuah,
            satuan,
            umur_simpan_hari: parseInt(umurSimpan),
            stok_total: parseFloat(stokTotal || 0),
            harga_satuan: parseFloat(hargaSatuan)
        };

        setSubmitting(true);
        try {
            const url = currentBuah ? `/master/buah/${currentBuah.buah_id}` : "/master/buah";
            const method = currentBuah ? "put" : "post";

            const res = await axiosInstance({ method, url, data: payload });
            setNotificationModal({ isOpen: true, message: res.data.msg || "Berhasil menyimpan data.", type: "success" });
            loadBuah();
            setDialogOpen(false);
        } catch (err) {
            console.error(err);
            setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Terjadi kesalahan koneksi.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteDialog = (buah) => { setCurrentBuah(buah); setDeleteDialogOpen(true); };

    const handleDelete = async () => {
        if (!currentBuah) return;
        try {
            const res = await axiosInstance.delete(`/master/buah/${currentBuah.buah_id}`);
            setNotificationModal({ isOpen: true, message: res.data.msg || `Buah ${currentBuah.nama_buah} berhasil dihapus.`, type: "success" });
            loadBuah(); setDeleteDialogOpen(false);
        } catch (err) {
            console.error(err);
            setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Terjadi kesalahan koneksi.", type: "error" });
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
    };

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

    const sortedBuah = useMemo(() => {
        let array = [...buahList];
        array = array
            .filter(b => b.nama_buah?.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(b => filterSatuan ? b.satuan === filterSatuan : true);

        if (sortConfig.key) {
            array.sort((a,b) => {
                let aValue = a[sortConfig.key], bValue = b[sortConfig.key];
                let cmp = typeof aValue === "string" ? aValue.localeCompare(bValue) : (parseFloat(aValue) || 0) - (parseFloat(bValue) || 0);
                return sortConfig.direction === "asc" ? cmp : -cmp;
            });
        }
        return array;
    }, [buahList, searchTerm, filterSatuan, sortConfig]);

    const totalItems = sortedBuah.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedBuah.slice(indexOfFirstRow, indexOfLastRow);
    const pageNumbers = Array.from({length: totalPages}, (_,i) => i+1);

    // ====================================================================
    // Render
    // ====================================================================
    return (
        <div className="p-6 space-y-6">
            {/* Notification Modal */}
            <NotificationModal
                isOpen={notificationModal.isOpen}
                message={notificationModal.message}
                onClose={() => setNotificationModal({ isOpen: false, message: "", type: "success" })}
                type={notificationModal.type}
            />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Master Data Buah</h1>
                <p className="text-gray-600">Kelola data buah termasuk ID, nama, satuan, umur simpan, harga dan stok.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white rounded-lg shadow-md border">
                <Button onClick={openAddDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Buah
                </Button>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <Input placeholder="Cari nama buah..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full md:w-48" />
                    <select value={filterSatuan} onChange={e => { setFilterSatuan(e.target.value); setCurrentPage(1); }} className="border rounded-lg px-3 py-2 w-full md:w-32">
                        <option value="">Semua Satuan</option>
                        <option value="kg">kg</option>
                        <option value="box">box</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <Card className="border shadow-lg">
                <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[60px] cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("buah_id")}>ID {getSortIcon("buah_id")}</TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("nama_buah")}>Nama Buah {getSortIcon("nama_buah")}</TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSortChange("satuan")}>Satuan {getSortIcon("satuan")}</TableHead>
                                <TableHead className="cursor-pointer text-right hover:bg-gray-100" onClick={() => handleSortChange("harga_satuan")}>Harga {getSortIcon("harga_satuan")}</TableHead>
                                <TableHead className="cursor-pointer text-right hover:bg-gray-100" onClick={() => handleSortChange("umur_simpan_hari")}>Umur Simpan {getSortIcon("umur_simpan_hari")}</TableHead>
                                <TableHead className="cursor-pointer text-right hover:bg-gray-100" onClick={() => handleSortChange("stok_total")}>Stok {getSortIcon("stok_total")}</TableHead>
                                <TableHead className="w-[100px] text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Memuat data...</TableCell></TableRow>
                            ) : currentRows.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Data tidak ditemukan</TableCell></TableRow>
                            ) : currentRows.map(b => (
                                <TableRow key={b.buah_id} className="hover:bg-gray-50 transition duration-75">
                                    <TableCell className="font-semibold text-gray-700">{b.buah_id}</TableCell>
                                    <TableCell className="font-medium text-gray-800">{b.nama_buah}</TableCell>
                                    <TableCell>{b.satuan}</TableCell>
                                    <TableCell className="text-right font-medium text-emerald-600">{formatRupiah(b.harga_satuan)}</TableCell>
                                    <TableCell className="text-right">{b.umur_simpan_hari} hari</TableCell>
                                    <TableCell className="text-right font-bold text-blue-600">{b.stok_total}</TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(b)} className="text-blue-600 hover:text-blue-500"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(b)} className="text-red-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                        <span className="text-sm text-gray-600">Menampilkan {Math.min(indexOfLastRow, totalItems)} dari {totalItems} data</span>
                        <div className="flex space-x-2">
                            {pageNumbers.map(number => (
                                <Button key={number} onClick={() => paginate(number)} variant={number === currentPage ? "default" : "outline"} size="sm" className={number === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}>{number}</Button>
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
                        <DialogTitle className="text-xl font-bold">{currentBuah ? "Edit Buah" : "Tambah Buah"}</DialogTitle>
                        <DialogDescription>Isi detail buah baru atau perbarui data yang ada.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-1">
                            <Label htmlFor="namaBuah">Nama Buah</Label>
                            <Input id="namaBuah" value={namaBuah} onChange={e => setNamaBuah(e.target.value)} required />
                            <p className="text-xs text-gray-500">Contoh: Apel Fuji, Mangga Harum Manis.</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="satuan">Satuan</Label>
                            <Input id="satuan" value={satuan} onChange={e => setSatuan(e.target.value)} required />
                            <p className="text-xs text-gray-500">Satuan dasar pengukuran (misal: kg, box, kodi).</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="hargaSatuan">Harga Satuan (Rp/Satuan)</Label>
                            <Input id="hargaSatuan" type="number" value={hargaSatuan} onChange={e => setHargaSatuan(e.target.value)} required />
                            <p className="text-xs text-gray-500">Harga jual default per satuan (wajib diisi).</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="umurSimpan">Umur Simpan (hari)</Label>
                            <Input id="umurSimpan" type="number" value={umurSimpan} onChange={e => setUmurSimpan(e.target.value)} required />
                            <p className="text-xs text-gray-500">Lama waktu buah bisa disimpan (wajib diisi).</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="stokTotal">Stok Total</Label>
                            <Input id="stokTotal" type="number" value={stokTotal} onChange={e => setStokTotal(e.target.value)} disabled={currentBuah} />
                            <p className="text-xs text-gray-500">{currentBuah ? "Stok diupdate melalui transaksi." : "Stok awal saat pendaftaran buah."}</p>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>{submitting ? "Menyimpan..." : (currentBuah ? "Update" : "Simpan")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto text-center">
                    <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <DialogHeader><DialogTitle className="text-xl font-bold text-gray-800">Konfirmasi Hapus</DialogTitle></DialogHeader>
                    <p className="mt-2 text-sm text-gray-600">Apakah yakin menghapus buah <strong>{currentBuah?.nama_buah}</strong>?</p>
                    <DialogFooter className="flex justify-center gap-4 mt-6">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}