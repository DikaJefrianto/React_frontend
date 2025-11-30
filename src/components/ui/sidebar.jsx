import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Building2, FileText, LogOut, Truck, DollarSign, ListChecks } from 'lucide-react';
import { cn } from "./utils";

// Menghapus semua definisi interface dan type

export function Sidebar({ currentRole, currentPage, onNavigate, onLogout }) {
    
    // Definisi menu berdasarkan Role
    const menuConfig = {
        admin: [
            { id: 'dashboard', label: 'Dashboard Admin', icon: LayoutDashboard, page: 'dashboard' },
            { id: 'master', label: 'Master Data', children: [
                // Sinkron dengan tabel user_account dan role
                { id: 'master-user', label: 'Pengguna & Role', icon: Users, page: 'master-user' }, 
                // Sinkron dengan tabel master_supplier
                { id: 'master-supplier', label: 'Pemasok', icon: Truck, page: 'master-supplier' }, 
                // Sinkron dengan tabel master_pelanggan
                { id: 'master-pelanggan', label: 'Pelanggan', icon: Users, page: 'master-pelanggan' },
                // Sinkron dengan tabel master_buah
                { id: 'master-buah', label: 'Jenis Buah', icon: Package, page: 'master-buah' },
            ]},
            { id: 'laporan', label: 'Laporan & Audit', children: [
                // Sinkron dengan trx_barang_keluar
                { id: 'laporan-penjualan', label: 'Laporan Penjualan', icon: DollarSign, page: 'laporan-penjualan' }, 
                // Sinkron dengan log_aktivitas
                { id: 'laporan-audit', label: 'Audit Aktivitas', icon: FileText, page: 'laporan-audit' },
            ]},
        ],
        manajer: [
            { id: 'dashboard', label: 'Dashboard Manajer', icon: LayoutDashboard, page: 'dashboard' },
            // Sinkron dengan batch_stok (inventaris)
            { id: 'stok-inventaris', label: 'Stok Inventaris', icon: ListChecks, page: 'stok-inventaris' },
            // Sinkron dengan trx_barang_keluar
            { id: 'laporan-penjualan', label: 'Laporan Penjualan', icon: DollarSign, page: 'laporan-penjualan' },
        ],
        petugas_gudang: [
            { id: 'dashboard', label: 'Dashboard Petugas', icon: LayoutDashboard, page: 'dashboard' },
            // Sinkron dengan trx_barang_masuk
            { id: 'trx-masuk', label: 'Barang Masuk', icon: Truck, page: 'trx-masuk' }, 
            // Sinkron dengan trx_barang_keluar
            { id: 'trx-keluar', label: 'Barang Keluar', icon: ShoppingCart, page: 'trx-keluar' },
            // Sinkron dengan batch_stok (inventaris)
            { id: 'stok-inventaris', label: 'Cek Stok Inventaris', icon: ListChecks, page: 'stok-inventaris' },
        ],
    };

    const currentMenu = menuConfig[currentRole] || [];

    const NavButton = ({ item, isChild = false }) => {
        const isCurrent = item.page === currentPage;
        const Icon = item.icon || LayoutDashboard;

        // Jika item.page tidak ada, ini adalah grup menu, jangan tampilkan sebagai tombol
        if (!item.page && !item.children) return null;

        return (
            <button
                key={item.id}
                // Hanya memanggil onNavigate jika item adalah halaman (memiliki properti page)
                onClick={() => item.page && onNavigate(item.page)} 
                className={cn(
                    "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
                    isCurrent
                        ? "bg-emerald-600 text-white font-semibold"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    isChild && "pl-8 text-sm",
                    !item.page && "cursor-default" // Non-aktifkan klik jika hanya grup
                )}
            >
                <Icon className={cn("w-4 h-4", !isCurrent && "opacity-70")} />
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <div className="w-64 fixed inset-y-0 left-0 bg-gray-800 text-white flex flex-col z-20 shadow-lg">
            {/* Header / Branding */}
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Package className="w-6 h-6" /> SIM-Buah
                </h2>
                <p className="text-xs mt-1 text-gray-400">
                    Role: <span className="capitalize font-semibold">{currentRole?.replace('_', ' ')}</span>
                </p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMenu.map(group => (
                    <div key={group.id} className="space-y-1">
                        {group.page ? (
                            // Render sebagai tombol navigasi tunggal
                            <NavButton item={group} />
                        ) : (
                            // Render sebagai grup dengan label
                            <>
                                <p className="text-xs font-semibold text-gray-400 uppercase mt-4 mb-1 pl-2">
                                    {group.label}
                                </p>
                                {group.children && group.children.map(child => (
                                    <NavButton key={child.id} item={child} isChild={true} />
                                ))}
                            </>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-700">
                <Button
                    onClick={onLogout}
                    className="w-full justify-start bg-gray-700 text-red-400 hover:bg-gray-600 hover:text-red-300"
                    variant="ghost"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}