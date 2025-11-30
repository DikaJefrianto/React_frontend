import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label"; // Ditambahkan Label import yang hilang
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
export default function MasterPelangganPage({ currentRole }) {
  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // DEKLARASI MODAL YANG BENAR
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState(null);
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: "", type: "success" });

  const [formData, setFormData] = useState({ nama_pelanggan: "", alamat: "", telepon: "" });
  const canModify = ["Admin", "Petugas Gudang"].includes(currentRole);

  // Search, sort, pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "pelanggan_id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => { fetchPelanggan(); }, []);

  const fetchPelanggan = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/master/pelanggan");
      setPelanggan(res.data || []);
    } catch (err) {
      console.error(err);
      setNotificationModal({ isOpen: true, message: "Gagal memuat data pelanggan.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    else if (sortConfig.key === key && sortConfig.direction === "desc") direction = "asc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  // Search + Sort + Filter Logic
  const sortedPelanggan = useMemo(() => {
    let list = [...pelanggan];
    list = list.filter(p =>
      p.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.alamat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telepon?.includes(searchTerm)
    );

    if (sortConfig.key) {
      list.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        let comparison = 0;
        if (typeof aValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue - bValue;
        }
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    // Default sort: ID ASC
    else {
      list.sort((a, b) => a.pelanggan_id - b.pelanggan_id);
    }

    return list;
  }, [pelanggan, searchTerm, sortConfig]);

  const totalItems = sortedPelanggan.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedPelanggan.slice(indexOfFirstRow, indexOfLastRow);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const openDialog = (p = null) => {
    setSelectedPelanggan(p);
    setFormData(p ? { ...p } : { nama_pelanggan: "", alamat: "", telepon: "" });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama_pelanggan || !formData.alamat) {
      setIsDialogOpen(false); // FIX: Tutup dialog utama
      setNotificationModal({ isOpen: true, message: "Nama dan alamat wajib diisi!", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = !!selectedPelanggan;
      const url = isEdit ? `/master/pelanggan/${selectedPelanggan.pelanggan_id}` : "/master/pelanggan";
      const method = isEdit ? "put" : "post";

      // Menggunakan axiosInstance
      const res = await axiosInstance({ method, url, data: formData });

      const msg = isEdit ? "Data pelanggan berhasil diperbarui!" : "Data pelanggan ditambahkan!";
      setNotificationModal({ isOpen: true, message: res.data.msg || msg, type: "success" });
      setIsDialogOpen(false); // Tutup dialog utama
      fetchPelanggan();
    } catch (err) {
      console.error(err);
      setIsDialogOpen(false); // Tutup dialog utama
      setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Gagal menyimpan pelanggan.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPelanggan) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.delete(`/master/pelanggan/${selectedPelanggan.pelanggan_id}`);
      setNotificationModal({ isOpen: true, message: res.data.msg || `Pelanggan ${selectedPelanggan.nama_pelanggan} berhasil dihapus.`, type: "success" });
      setIsDeleteDialogOpen(false);
      fetchPelanggan();
    } catch (err) {
      console.error(err);
      setNotificationModal({ isOpen: true, message: err.response?.data?.error || "Gagal menghapus pelanggan.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Modal Notifikasi (Selalu di atas) */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        message={notificationModal.message}
        onClose={() => setNotificationModal({ isOpen: false, message: "", type: "success" })}
        type={notificationModal.type}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Pelanggan</h1>
          <p className="text-gray-600">Kelola data pelanggan untuk keperluan transaksi keluar.</p>
        </div>
      </div>

      {/* Search & Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-white rounded-lg shadow-md border">
        {canModify && (
          <Button onClick={() => openDialog()} className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 mt-4 md:mt-0">
            <Plus className="w-4 h-4" /> Tambah Pelanggan
          </Button>
        )}
        <Input
          placeholder="Cari nama, alamat, atau telepon pelanggan..."
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
                <TableHead className="w-[80px] cursor-pointer hover:bg-gray-100" onClick={() => handleSort("pelanggan_id")}>
                  ID {getSortIcon('pelanggan_id')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("nama_pelanggan")}>
                  Nama Pelanggan {getSortIcon('nama_pelanggan')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("alamat")}>
                  Alamat {getSortIcon('alamat')}
                </TableHead>
                <TableHead>Telepon</TableHead>
                {canModify && <TableHead className="w-[100px] text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500">Memuat data...</TableCell></TableRow>
              ) : currentRows.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500">Tidak ada data pelanggan ditemukan.</TableCell></TableRow>
              ) : (
                currentRows.map(p => (
                  <TableRow key={p.pelanggan_id} className="hover:bg-gray-50 transition duration-75">
                    <TableCell className="font-semibold text-gray-700">{p.pelanggan_id}</TableCell>
                    <TableCell className="font-medium text-gray-800">{p.nama_pelanggan}</TableCell>
                    <TableCell className="text-sm text-gray-700">{p.alamat}</TableCell>
                    <TableCell className="text-sm text-gray-700">{p.telepon}</TableCell>
                    {canModify && (
                      <TableCell className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDialog(p)} className="text-blue-600 hover:text-blue-500">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedPelanggan(p); setIsDeleteDialogOpen(true); }} className="text-red-600 hover:text-red-500">
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedPelanggan ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
            <DialogDescription>Isi detail informasi kontak dan lokasi pelanggan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Input placeholder="Nama Pelanggan" value={formData.nama_pelanggan} onChange={e => setFormData({ ...formData, nama_pelanggan: e.target.value })} required />
              <p className="text-xs text-gray-500">Nama lengkap atau perusahaan pelanggan.</p>
            </div>
            <div className="space-y-1">
              <Input placeholder="Alamat Lengkap" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} required />
              <p className="text-xs text-gray-500">Alamat fisik pelanggan.</p>
            </div>
            <div className="space-y-1">
              <Input placeholder="Telepon" type="tel" value={formData.telepon} onChange={e => setFormData({ ...formData, telepon: e.target.value })} />
              <p className="text-xs text-gray-500">Nomor kontak pelanggan (opsional).</p>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 transition duration-150" disabled={submitting}>
              {submitting ? "Menyimpan..." : selectedPelanggan ? "Update" : "Simpan"}
            </Button>
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
          <p className="mt-2 text-sm text-gray-600">Apakah Anda yakin ingin menghapus pelanggan <strong>{selectedPelanggan?.nama_pelanggan}</strong>?</p>
          <DialogFooter className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={submitting}>
              {submitting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}