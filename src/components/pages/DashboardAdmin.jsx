// src/components/pages/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Users, Building2, UserCircle, Database, Server, Activity, User, Clock, CheckCircle } from "lucide-react"; // Tambah Clock & CheckCircle
import axiosInstance from "../../utils/axiosInstance";

export default function DashboardAdmin() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosInstance.get("/dashboard")
          .then((res) => {
            setDashboardData(res.data);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Fetch dashboard admin error:", err);
            setError(err);
            setLoading(false);
          });
    }, []);

    const getActivityBadge = (type) => {
        const config = {
          create: { label: "Tambah", className: "bg-emerald-100 text-emerald-700" },
          update: { label: "Update", className: "bg-blue-100 text-blue-700" },
          delete: { label: "Hapus", className: "bg-red-100 text-red-700" },
          // Tambahkan tipe lain jika backend mengembalikannya
          login: { label: "Login", className: "bg-yellow-100 text-yellow-700" },
        };
        const badge = config[type] || { label: "Info", className: "bg-gray-100 text-gray-700" };
        return <Badge className={`${badge.className} px-2 py-0.5 rounded-lg`}>{badge.label}</Badge>;
    };

    if (loading) return <div className="flex items-center justify-center p-12"><div className="text-gray-600">Loading dashboard...</div></div>;
    if (error) return <div className="p-6"><div className="text-red-600">Gagal memuat dashboard: {String(error.message || error)}</div></div>;

    const { kpi_data = {}, system_health = {}, recent_activities = [] } = dashboardData || {};
    const activeUsers = kpi_data?.active_users ?? 0;
    const totalSuppliers = kpi_data?.total_suppliers ?? 0;
    const totalCustomers = kpi_data?.total_customers ?? 0;
    const totalStock = kpi_data?.total_stock ?? 0;

    return (
        <div className="space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrator</h1>
                <p className="text-gray-600 mt-1 text-base sm:text-lg">Kesehatan Sistem & Pemeliharaan Data Gudang</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <DashboardCard title="Total Pengguna Aktif" value={`${activeUsers} Pengguna`} icon={Users} iconBg="bg-purple-100" iconColor="text-purple-700" />
                <DashboardCard title="Total Pemasok" value={`${totalSuppliers} Pemasok`} icon={Building2} iconBg="bg-orange-100" iconColor="text-orange-700" />
                <DashboardCard title="Total Pelanggan" value={`${totalCustomers} Pelanggan`} icon={UserCircle} iconBg="bg-blue-100" iconColor="text-blue-700" />
                <DashboardCard title="Total Stok Buah" value={`${Number(totalStock).toLocaleString()} kg`} icon={Database} iconBg="bg-emerald-100" iconColor="text-emerald-700" />
            </div>

            {/* SYSTEM HEALTH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {Object.entries(system_health).map(([key, value]) => {
                    const Icon = key === "database" ? Database : Server;
                    const isOnline = value?.status_text === "Online";

                    return (
                        <Card key={key} className="border shadow-md hover:shadow-xl transition-all rounded-xl">
                            <CardHeader className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl ${isOnline ? 'bg-green-600' : 'bg-gray-400'} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-gray-800 text-sm">{value?.name ?? key}</CardTitle>
                                    <p className="text-gray-500 text-xs">{value?.detail ?? "-"}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <span className={`${value?.status_color ?? "bg-gray-400 text-white"} px-3 py-1 rounded-lg text-xs font-semibold`}>
                                    {value?.status_text ?? "Unknown"}
                                </span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* RECENT ACTIVITIES (FIXED MAPPING) */}
            <Card className="border shadow-md hover:shadow-xl transition-all rounded-xl">
                <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Log Aktivitas Terbaru (Maks. 5 Log)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recent_activities.length === 0 && <div className="text-gray-500">Belum ada aktivitas terbaru yang tercatat.</div>}
                        {recent_activities.map((activity, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl border hover:bg-gray-100 transition">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    {/* Menggunakan icon berdasarkan tipe */}
                                    {activity?.type === 'create' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <User className="w-5 h-5 text-gray-500" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* FIX: Menggunakan activity.user dan activity.type */}
                                        <p className="font-medium text-gray-900">{activity.user || "Unknown"}</p>
                                        {getActivityBadge(activity.type)}
                                    </div>
                                    <p className="text-gray-700 text-sm">{activity.action || "-"}</p>
                                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3"/> {activity.time || "-"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* KPI Card component */
function DashboardCard({ title, value, icon: Icon, iconBg, iconColor }) {
    return (
        <Card className="border shadow-md hover:shadow-xl transition-all rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-700">{title}</CardTitle>
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-900 text-xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}