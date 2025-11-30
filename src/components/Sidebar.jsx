import { LayoutDashboard, Package, ShoppingCart, Users, Building2, FileText, LogOut, X, ChevronDown } from 'lucide-react';
import { BuahIcon, SupplierIcon, PelangganIcon } from './icons/Icons'; 
import { cn } from './ui/utils';
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';

export function Sidebar({ currentRole, onLogout, isOpen, closeSidebar }) {

  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    'master-data': false,
    'inventory': false,
    'reports': false, // <-- TAMBAH STATE UNTUK MENU LAPORAN
  });

  // Tutup submenu otomatis saat navigasi ke halaman lain
  useEffect(() => {
    const menuToKeepOpen = menuItems.find(menu => 
      menu.subMenu && menu.subMenu.some(sub => location.pathname.startsWith(`/${sub.id}`))
    );

    Object.keys(openMenus).forEach(menuId => {
      // Hanya update jika statusnya salah atau jika itu bukan menu yang harus tetap terbuka
      if (openMenus[menuId] && menuId !== menuToKeepOpen?.id) {
        setOpenMenus(prev => ({ ...prev, [menuId]: false }));
      }
    });
  }, [location.pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Petugas Gudang', 'Manajer'] },
    { id: 'manage-users', label: 'Kelola User', icon: Users, roles: ['Admin'] },
    { id: 'master-data', label: 'Master Data', icon: Package, roles: ['Admin', 'Petugas Gudang'], subMenu: [
      { id: 'buah', label: 'Buah', icon: BuahIcon },
      { id: 'suppliers', label: 'Supplier', icon: SupplierIcon },
      { id: 'customers', label: 'Pelanggan', icon: PelangganIcon }
    ]},
    {
      id: 'inventory', label: 'Inventaris Stok', icon: Package, roles: ['Admin', 'Petugas Gudang'], subMenu: [
        { id: 'inventory/masuk', label: 'Barang Masuk', icon: Package },
        { id: 'monitor/batch_stock', label: 'Batch Stok', icon: Package }
      ]
    },
    { id: 'transaksi', label: 'Transaksi Pesanan', icon: ShoppingCart, roles: ['Admin', 'Manajer', 'Petugas Gudang'] },
    
    // ==========================================================
    // MENU LAPORAN YANG DIMODIFIKASI
    // ==========================================================
    { 
      id: 'reports', 
      label: 'Laporan', 
      icon: FileText, 
      roles: ['Admin', 'Manajer'], 
      subMenu: [
        { id: 'laporan/transaksi', label: 'Laporan Transaksi', icon: FileText },
        { id: 'laporan/penjualan', label: 'Laporan Penjualan', icon: FileText },
      ]
    },
    // ==========================================================
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentRole));

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isMenuActive = (item) => {
    if (item.subMenu) {
      // Cek apakah URL saat ini dimulai dengan path dari salah satu sub-menu
      return item.subMenu.some(sub => location.pathname.startsWith(`/${sub.id}`));
    }
    // Untuk menu non-submenu
    return location.pathname.startsWith(`/${item.id}`);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeSidebar} />}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-slate-900 flex flex-col shadow-2xl z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-64 md:translate-x-0"
        )}
      >
        <button className="md:hidden absolute top-4 right-4 text-white" onClick={closeSidebar}><X /></button>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">SIM-Buah</h1>
              <p className="text-sm text-gray-400">Manajemen Gudang</p>
            </div>
          </div>
        </div>

        {/* Navigation — scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isMenuActive(item);

            if (item.subMenu) {
              // Jika menu aktif secara default, buka menu secara default
              const isOpen = openMenus[item.id] || active;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-all",
                      active ? "bg-emerald-600 text-white shadow-lg" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
                  </button>

                  {isOpen && (
                    <div className="pl-8 mt-1 space-y-1">
                      {item.subMenu.map(sub => {
                        // Tidak menggunakan SubIcon karena kedua sub-menu laporan menggunakan FileText dari parent
                        const isSubActive = location.pathname.startsWith(`/${sub.id}`);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => { navigate(`/${sub.id}`); closeSidebar(); }}
                            className={cn(
                              "w-full flex items-center gap-2 text-gray-300 hover:bg-slate-800 hover:text-white px-4 py-2 rounded-lg text-sm",
                              isSubActive ? "bg-emerald-500 text-white" : ""
                            )}
                          >
                            <FileText className="w-4 h-4" /> {/* Gunakan FileText untuk sub-menu laporan */}
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => { navigate(`/${item.id}`); closeSidebar(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  active ? "bg-emerald-600 text-white shadow-lg" : "text-gray-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}