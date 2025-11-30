import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Package, Clock, AlertTriangle, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';

export default function DashboardPetugasGudang() {
    const navigate = useNavigate();

    const [buah, setBuah] = useState([]);
    const [orders, setOrders] = useState([]);
    const [fifoKritis, setFifoKritis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                // 1. DATA MASTER BUAH (untuk total stok)
                const resBuah = await axiosInstance.get('/master/buah');
                setBuah(resBuah.data || []);

                // 2. DATA DASHBOARD (PESANAN & FIFO)
                const resDash = await axiosInstance.get('/dashboard');

                // --- MAPPING DATA DARI RESPONSE BACKEND ---
                const stats = resDash.data.petugas_stats || {}; 
                const managerStats = resDash.data.manager_stats || {}; 
                
                // Mengambil data pesanan hari ini dari petugas_stats
                const rawOrders = stats.pesanan_hari_ini || []; 
                
                // FIFO Kritis diambil dari manager_stats karena itu data terlama
                const rawFifo = managerStats.fifo_critical_batches || []; 

                // Mapping pesanan untuk frontend
                const mappedOrders = rawOrders.map(order => ({
                    id: order.id || order.keluar_id,
                    pelanggan: order.pelanggan || 'N/A',
                    // Gunakan key 'waktu' yang sudah disederhanakan oleh backend
                    waktu: order.waktu || 'N/A', 
                    status: order.status_pesanan || order.status || 'Diproses',
                }));

                setOrders(mappedOrders);
                setFifoKritis(rawFifo);

            } catch (err) {
                console.error('Error load dashboard:', err.response?.data || err);
                setError('Gagal memuat data dashboard. Cek koneksi server.');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const getStatusBadge = (status) => {
        // Normalisasi status dari backend untuk pencocokan
        const key = status ? status.toLowerCase().replace(' ', '_') : 'diproses';
        
        const config = {
            diproses: { label: 'Diproses', className: 'bg-blue-100 text-blue-800 border-blue-300' },
            dikirim: { label: 'Dikirim', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
            batal: { label: 'Batal', className: 'bg-red-100 text-red-800 border-red-300' },
            'siap kirim': { label: 'Siap Kirim', className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
            menunggu: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        };
        
        const c = config[key] || config.diproses;
        return <Badge className={c.className}>{c.label}</Badge>;
    };

    if (loading) return <p className="p-5 text-gray-700 text-center">Loading dashboard...</p>;
    if (error) return <p className="p-5 text-red-600 text-center">{error}</p>;

    // Mengambil statistik dari state
    const totalStok = buah.reduce((sum, b) => sum + (b.stok_total || 0), 0);
    // Kita asumsikan hitungan dari backend lebih akurat
    const pesananMenunggu = orders.filter(o => o.status.toLowerCase() === 'diproses').length; 
    
    // Asumsi: jika ada pesanan hari ini, total pesanan menunggu adalah jumlah order.
    // Jika backend mengirim 'pesanan_menunggu_proses' (stat count), gunakan itu jika ada.
    // Untuk kode ini, kita hitung dari list yang difilter.


    return (
        <div className="space-y-6 p-4 md:p-8 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div>
                <h1 className="text-gray-900 mb-1 text-2xl font-bold">Dashboard Petugas Gudang</h1>
                <p className="text-gray-600">Operasional Harian dan Tugas Segera</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL STOK */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm text-gray-700">Stok Tersedia (kg)</CardTitle>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-emerald-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-gray-900 font-semibold text-2xl">{totalStok.toLocaleString()} kg</div>
                        <p className="text-xs text-gray-600 mt-1">{buah.length} jenis buah terdaftar</p>
                    </CardContent>
                </Card>

                {/* PESANAN MENUNGGU */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm text-gray-700">Pesanan Menunggu Proses</CardTitle>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Menggunakan hitungan dari list orders */}
                        <div className="text-gray-900 font-semibold text-2xl">{pesananMenunggu} Pesanan</div>
                        <p className="text-xs text-orange-700 mt-1">Perlu penanganan segera</p>
                    </CardContent>
                </Card>

                {/* FIFO KRITIS */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm text-gray-700">Batch Mendekati FIFO Kritis</CardTitle>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-gray-900 font-semibold text-2xl">{fifoKritis.length} Batch</div>
                        <p className="text-xs text-red-700 mt-1">Prioritaskan pengiriman</p>
                    </CardContent>
                </Card>
            </div>

            {/* ACTION BUTTONS (Navigasi menggunakan useNavigate) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                    className="border-2 border-emerald-600 bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:bg-emerald-50"
                    onClick={() => navigate('/inventory/masuk')}
                >
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Catat Buah Masuk</h3>
                            <p className="text-sm text-gray-600">Tambah data stok buah baru masuk ke gudang</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0" />
                    </CardContent>
                </Card>

                <Card
                    className="border-2 border-orange-600 bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:bg-orange-50"
                    onClick={() => navigate('/transaksi')}
                >
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Proses Pesanan Baru</h3>
                            <p className="text-sm text-gray-600">Buat dan kelola transaksi pengiriman buah</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0" />
                    </CardContent>
                </Card>
            </div>

            {/* DAFTAR PESANAN HARI INI (Tabel) */}
            <Card className="border-0 shadow-xl rounded-xl">
                <CardHeader className="pt-4">
                    <CardTitle className="text-gray-900">Daftar Pesanan Hari Ini</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Status pesanan yang perlu ditangani</p>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                                    <TableHead className="px-4 py-3">ID Transaksi</TableHead>
                                    <TableHead className="px-4 py-3">Pelanggan</TableHead>
                                    <TableHead className="px-4 py-3">Waktu</TableHead>
                                    <TableHead className="px-4 py-3">Status</TableHead>
                                    <TableHead className="px-4 py-3 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">Tidak ada pesanan aktif hari ini.</TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map(order => (
                                        <TableRow key={order.id} className="hover:bg-gray-50">
                                            <TableCell className="font-semibold text-gray-800">{order.id}</TableCell>
                                            <TableCell>{order.pelanggan}</TableCell>
                                            <TableCell>{order.waktu}</TableCell>
                                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-blue-600 hover:text-blue-700"
                                                    onClick={() => navigate('/transaksi')}
                                                >
                                                    Proses
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}