import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Pencil, Trash2, UserPlus, X, CheckCircle, AlertTriangle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance"; // Pastikan path ini benar!

// ====================================================================
// KOMPONEN: NotificationModal
// ====================================================================
const NotificationModal = ({ isOpen, message, onClose, type = "success" }) => {
    if (!isOpen) return null;

    const Icon = type === "success" ? CheckCircle : AlertTriangle;
    const color = type === "success" ? "text-emerald-500" : "text-red-500";
    const buttonClass = type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
                <Icon className={`w-12 h-12 mx-auto mb-4 ${color}`} />
                <h3 className="text-xl font-bold mb-2">{type === "success" ? "Berhasil!" : "Terjadi Kesalahan"}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <button onClick={onClose} className={`text-white px-4 py-2 rounded transition duration-150 ${buttonClass}`}>Tutup</button>
            </div>
        </div>
    );
};
// ====================================================================


export default function MasterUserPage() {
    const { token } = useAuth(); 

    // Raw Data & State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false); 
    const [isDeleteOpen, setIsDeleteOpen] = useState(false); 
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: "", type: "success" });
    const [formMode, setFormMode] = useState("create"); 
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        user_id: "",
        username: "",
        nama_lengkap: "",
        role: "",
        is_active: true,
        password: "",
    });

    // Table Controls & Pagination
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [sortBy, setSortBy] = useState({ column: "username", dir: "asc" });
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const roleOptions = ["Admin", "Manajer", "Petugas Gudang"];


    // ------------------ FETCH USERS (CRUD READ) ------------------
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX: Menggunakan axiosInstance
            const res = await axiosInstance.get("/admin/users"); 
            setUsers(res.data); 
            
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.msg || err.message || "Gagal mengambil data user";
            setError(errorMessage);
            // Tambahkan notifikasi error jika gagal fetch
            setNotificationModal({ isOpen: true, message: errorMessage, type: "error" });

        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); 

    // ------------------ HANDLERS (DIPINDAHKAN KE ATAS UNTUK FIX ReferenceError) ------------------

    const openCreate = () => {
        setFormMode("create");
        setFormData({ user_id: "", username: "", nama_lengkap: "", role: "", is_active: true, password: "" });
        setIsFormOpen(true);
    };

    const openEdit = (user) => {
        setFormMode("edit");
        setFormData({
            user_id: user.user_id,
            username: user.username || "",
            nama_lengkap: user.nama_lengkap || "",
            role: user.role || "",
            is_active: !!user.is_active,
            password: "",
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setFormData({ user_id: "", username: "", nama_lengkap: "", role: "", is_active: true, password: "" });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "is_active") {
            setFormData((p) => ({ ...p, is_active: value === "true" }));
            return;
        }
        setFormData((p) => ({ ...p, [name]: value }));
    };
    
    // ------------------ SUBMIT (CREATE/EDIT) ------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Validasi di sini
            if (!formData.username || !formData.nama_lengkap || !formData.role || (formMode === "create" && !formData.password)) {
                 if (formMode === "create" && !formData.password) {
                    throw new Error("Password wajib diisi untuk user baru.");
                 }
                throw new Error("Lengkapi semua field yang wajib.");
            }

            const payload = {
                username: formData.username,
                nama_lengkap: formData.nama_lengkap,
                role: formData.role,
                is_active: !!formData.is_active,
            };
            if (formData.password) payload.password = formData.password;

            const url = `/admin/users${formMode === "create" ? "" : `/${formData.user_id}`}`;
            const method = formMode === "create" ? "POST" : "PUT";

            let res;
            if (method === "POST") {
                res = await axiosInstance.post(url, payload);
            } else {
                res = await axiosInstance.put(url, payload);
            }

            await fetchUsers();
            closeForm();
            const message = formMode === "create" ? "Data user berhasil ditambahkan!" : "Data user berhasil diperbarui!";
            setNotificationModal({ isOpen: true, message: message, type: "success" });

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.msg || err.message || "Gagal menyimpan data.";
            setError(errorMessage);
            setNotificationModal({ isOpen: true, message: errorMessage, type: "error" });

        } finally {
            setSubmitting(false);
        }
    };

    // ------------------ DELETE ------------------
    const confirmDelete = (user) => {
        setDeleteTarget(user);
        setIsDeleteOpen(true);
    };

    const doDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        setError(null);

        try {
            await axiosInstance.delete(`/admin/users/${deleteTarget.user_id}`);
            
            // Perbarui state secara lokal
            setUsers((p) => p.filter((u) => u.user_id !== deleteTarget.user_id));
            setIsDeleteOpen(false);
            setDeleteTarget(null);
            setNotificationModal({ isOpen: true, message: `User ${deleteTarget.username} berhasil dinonaktifkan.`, type: "success" });

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.msg || err.message || "Gagal menghapus user.";
            setError(errorMessage);
            setNotificationModal({ isOpen: true, message: errorMessage, type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------ HELPERS: FILTER/SORT/PAGINATE ------------------
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        let list = users.slice();

        if (roleFilter) {
            list = list.filter((u) => (u.role || "").toLowerCase() === roleFilter.toLowerCase());
        }

        if (q) {
            list = list.filter((u) => {
                return (
                    (u.username || "").toLowerCase().includes(q) ||
                    (u.nama_lengkap || "").toLowerCase().includes(q) ||
                    (u.role || "").toLowerCase().includes(q)
                );
            });
        }

        const { column, dir } = sortBy;
        list.sort((a, b) => {
            const A = (a[column] || "").toString().toLowerCase();
            const B = (b[column] || "").toString().toLowerCase();
            if (A < B) return dir === "asc" ? -1 : 1;
            if (A > B) return dir === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [users, query, roleFilter, sortBy]);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages]);

    // ... (Pagination helpers dan UI helpers tetap sama)
    const pagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const getBadge = (u) => {
        if (u.is_active) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Aktif</span>;
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Nonaktif</span>;
    };

    const getSortIcon = (column) => {
        if (sortBy.column !== column) return null;
        return sortBy.dir === "asc" ? "▲" : "▼";
    };

    return (
        <div className="p-6">
            {/* INI ADALAH KOMPONEN NOTIFIKASI SUKSES BARU */}
            <NotificationModal
                isOpen={notificationModal.isOpen}
                message={notificationModal.message}
                onClose={() => setNotificationModal({ isOpen: false, message: "", type: "success" })}
                type={notificationModal.type}
            />

            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
                    <p className="text-sm text-gray-600">Kelola Akun Pengguna Sistem dan Role.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border px-3 py-1.5">
                        <input
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                            placeholder="Cari user / nama / role..."
                            className="outline-none text-sm w-48"
                        />
                        <button onClick={() => { setQuery(""); setRoleFilter(""); }} className="text-gray-400 text-sm hover:text-gray-600">Reset</button>
                    </div>

                    <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="bg-white rounded-lg shadow-sm border px-3 py-2 text-sm appearance-none">
                        <option value="">Semua Role</option>
                        {roleOptions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>

                    <button onClick={openCreate} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-emerald-700 transition duration-150">
                        <UserPlus className="w-5 h-5" /> <span className="text-sm font-semibold">Tambah User</span>
                    </button>
                </div>
            </div>

            {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

            {/* TABLE CONTENT */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto">
                        <thead>
                            <tr className="text-left border-b bg-gray-50 text-gray-600 uppercase text-xs">
                                <th className="p-3 cursor-pointer hover:bg-gray-100 transition" onClick={() => toggleSort("username")}>
                                    Username {getSortIcon("username")}
                                </th>
                                <th className="p-3 cursor-pointer hover:bg-gray-100 transition" onClick={() => toggleSort("nama_lengkap")}>
                                    Nama Lengkap {getSortIcon("nama_lengkap")}
                                </th>
                                <th className="p-3 cursor-pointer hover:bg-gray-100 transition" onClick={() => toggleSort("role")}>
                                    Role {getSortIcon("role")}
                                </th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-gray-500">Loading data user...</td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-sm text-gray-500">Tidak ada user yang ditemukan.</td>
                                </tr>
                            ) : (
                                paginated.map((u) => (
                                    <tr key={u.user_id} className="border-b last:border-b-0 hover:bg-gray-50 transition duration-75">
                                        <td className="p-3 font-medium text-sm text-gray-800">{u.username}</td>
                                        <td className="p-3 text-sm text-gray-700">{u.nama_lengkap}</td>
                                        <td className="p-3 text-sm text-gray-700">{u.role}</td>
                                        <td className="p-3">{getBadge(u)}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-500 transition" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => confirmDelete(u)} className="text-red-600 hover:text-red-500 transition" title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER & PAGINATION CONTROLS */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 bg-white rounded-b-xl">
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 md:mb-0">
                        <div>Menampilkan <strong>{(page - 1) * perPage + 1}</strong> - <strong>{Math.min(page * perPage, totalItems)}</strong> dari <strong>{totalItems}</strong> user</div>
                        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded-lg px-2 py-1 text-sm bg-gray-50 outline-none">
                            <option value={5}>5 / halaman</option>
                            <option value={10}>10 / halaman</option>
                            <option value={20}>20 / halaman</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 border rounded-lg text-sm bg-gray-50 hover:bg-gray-200 disabled:opacity-50 transition">
                            &lt;&lt;
                        </button>
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-lg text-sm bg-gray-50 hover:bg-gray-200 disabled:opacity-50 transition">
                            &lt;
                        </button>

                        {pageNumbers.map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 text-sm rounded-lg font-semibold transition ${p === page ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-blue-100 border'}`}
                            >
                                {p}
                            </button>
                        ))}

                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded-lg text-sm bg-gray-50 hover:bg-gray-200 disabled:opacity-50 transition">
                            &gt;
                        </button>
                        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 border rounded-lg text-sm bg-gray-50 hover:bg-gray-200 disabled:opacity-50 transition">
                            &gt;&gt;
                        </button>
                    </div>
                </div>
            </div>


            {/* ================= MODAL FORM (CREATE/EDIT) ================= */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border">
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-800">{formMode === "create" ? "Tambah User Baru" : "Edit User"}</h3>
                            <button onClick={closeForm} className="text-gray-500 hover:text-red-600 transition"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                <p className="text-xs text-gray-500 mt-1">Digunakan untuk login ke sistem.</p>
                            </div>
                            <div className="col-span-1">
                                <input name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} placeholder="Nama Lengkap" className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                <p className="text-xs text-gray-500 mt-1">Nama user yang akan tampil di laporan.</p>
                            </div>

                            <div className="col-span-1">
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white appearance-none focus:ring-blue-500 focus:border-blue-500 outline-none" required>
                                    <option value="">Pilih Role</option>
                                    {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Menentukan hak akses user dalam sistem.</p>
                            </div>

                            <div className="col-span-1">
                                <select name="is_active" value={formData.is_active ? "true" : "false"} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white appearance-none focus:ring-blue-500 focus:border-blue-500 outline-none">
                                    <option value="true">Aktif</option>
                                    <option value="false">Nonaktif</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Status user saat ini.</p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <input name="password" value={formData.password} onChange={handleChange} placeholder={formMode === "create" ? "Password (wajib)" : "Password (isi untuk ganti)"} className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" type="password" required={formMode === "create"} />
                                <p className="text-xs text-gray-500 mt-1">Password awal untuk user baru.</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={closeForm} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition">Batal</button>
                                <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
                                    {submitting ? "Menyimpan..." : formMode === "create" ? "Tambah User" : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL DELETE (Diperbarui) ================= */}
            {isDeleteOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border">
                        <div className="p-6 text-center">
                            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Konfirmasi Hapus User</h3>
                            <p className="text-sm text-gray-600 mb-6">Yakin ingin menghapus user <strong>{deleteTarget.username}</strong>? Aksi ini tidak bisa dibatalkan.</p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={doDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60"
                                    disabled={submitting}
                                >
                                    {submitting ? "Menghapus..." : "Hapus Permanen"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}