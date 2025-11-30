import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import { LoginPage } from "./components/pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout.jsx";
import DashboardAdmin from "./components/pages/DashboardAdmin";
import DashboardManajer from "./components/pages/DashboardManajer";
import DashboardPetugas from "./components/pages/DashboardPetugas";
import ManageUserPage from "./components/pages/MasterUserPage.jsx";
import MasterbuahPage from "./components/pages/MasterBuahPage.jsx";
import MastersupplierPage from "./components/pages/MasterSupplierPage.jsx";
import MasterpelangganPage from "./components/pages/MasterPelangganPage.jsx";
import TransaksiPage from "./components/pages/TransaksiPage.jsx";
import TrxBarangMasukPage from "./components/pages/TrxBarangMasukPage.jsx";
import BatchStockPage from "./components/pages/LaporanFIFOAuditPage.jsx";
// In src/AppRouter.jsx
import LaporanTransaksiPage from "./components/pages/laporan/LaporanTransaksiPage.jsx"; 
import LaporanPenjualanPage from "./components/pages/laporan/LaporanPenjualanPage.jsx";
// ==========================================================

export default function AppRouter() {
  const { userRole, token, logout, userId } = useAuth();

  if (!token || !userRole) {
    return (
      <Routes>
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    );
  }

  const handleLogout = () => logout();

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <DashboardLayout userRole={userRole} onLogout={handleLogout}>
            {userRole === "Admin" && <DashboardAdmin />}
            {userRole === "Manajer" && <DashboardManajer />}
            {userRole === "Petugas Gudang" && <DashboardPetugas />}
          </DashboardLayout>
        }
      />

      {/* Manage User */}
      <Route
        path="/manage-users"
        element={
          userRole === "Admin" ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <ManageUserPage />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Master Data */}
      <Route
        path="/buah"
        element={
          ["Admin", "Petugas Gudang"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <MasterbuahPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/suppliers"
        element={
          ["Admin", "Petugas Gudang"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <MastersupplierPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/customers"
        element={
          ["Admin", "Petugas Gudang"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <MasterpelangganPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Inventory */}
      <Route
        path="/inventory/masuk"
        element={
          ["Admin", "Petugas Gudang"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <TrxBarangMasukPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/monitor/batch_stock"
        element={
          ["Admin", "Petugas Gudang"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <BatchStockPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Transaksi */}
      <Route
        path="/transaksi"
        element={
          ["Admin", "Petugas Gudang", "Manajer"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <TransaksiPage currentRole={userRole} currentUserId={userId} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* ========================================================== */}
      {/* 2. ROUTE LAPORAN BARU */}
      {/* ========================================================== */}
      <Route
        path="/laporan/transaksi"
        element={
          ["Admin", "Manajer"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <LaporanTransaksiPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/laporan/penjualan"
        element={
          ["Admin", "Manajer"].includes(userRole) ? (
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <LaporanPenjualanPage currentRole={userRole} />
            </DashboardLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}