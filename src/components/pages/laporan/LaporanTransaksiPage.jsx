// src/components/pages/Laporan/LaporanTransaksiPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import dayjs from "dayjs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import ExportButtons from "./components/ExportButtons";

export default function LaporanTransaksiPage() {
    const [data, setData] = useState([]);
    // Menghitung tanggal default: 7 hari yang lalu hingga hari ini
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').toDate());
    const [endDate, setEndDate] = useState(dayjs().toDate());
    const [loading, setLoading] = useState(false);

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        // Pastikan format YYYY-MM-DD untuk backend
        const start = dayjs(startDate).format('YYYY-MM-DD');
        const end = dayjs(endDate).format('YYYY-MM-DD');
        
        try {
            const res = await axiosInstance.get(`/laporan/transaksi?start_date=${start}&end_date=${end}`);
            setData(res.data.data || []);
        } catch (error) {
            console.error("Error fetching report:", error);
            // Tangkap pesan error dari backend
            const errorMessage = error.response?.data?.message || "Gagal mengambil data laporan.";
            setData([]);
            // Anda bisa menampilkan error ini di UI jika Anda memiliki state error
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);


    // -------------------------------------------------------------------

    // Helper untuk menentukan style badge Tipe Transaksi
    const getTypeBadge = (tipe) => {
        if (tipe === 'Keluar') {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        return 'bg-green-100 text-green-800 border-green-200';
    };

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 border-b pb-2">Laporan Transaksi Gabungan </h1>
            <p className="text-gray-600">Gabungan aktivitas **Barang Masuk** (Pembelian) dan **Barang Keluar** (Penjualan) dalam rentang tanggal.</p>

            {/* Filter & Export Controls */}
            <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between border border-gray-200">
                
                {/* Filter Group: Tanggal dan Tombol Tampilkan */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                    
                    <span className="text-sm font-medium text-gray-700 self-start sm:self-center">Periode:</span>

                    <Input
                        type="date"
                        value={dayjs(startDate).format('YYYY-MM-DD')}
                        onChange={e => setStartDate(new Date(e.target.value))}
                        className="w-full sm:w-[150px] p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tanggal Mulai"
                    />
                    
                    <Input
                        type="date"
                        value={dayjs(endDate).format('YYYY-MM-DD')}
                        onChange={e => setEndDate(new Date(e.target.value))}
                        className="w-full sm:w-[150px] p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tanggal Akhir"
                    />
                    
                    <Button 
                        onClick={fetchReport} 
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        {loading ? 'Memuat...' : 'Tampilkan'}
                    </Button>
                </div>
                
                {/* Export Buttons Group */}
                {/* Garis vertikal pemisah di desktop */}
                <div className="pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-4 w-full lg:w-auto">
                    <ExportButtons 
                        reportType="transaksi" 
                        startDate={startDate} 
                        endDate={endDate} 
                    />
                </div>
            </div>

            {/* Laporan Tabel */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader className="bg-blue-600">
                            <TableRow className="uppercase text-xs text-white font-bold">
                                <TableHead className="px-4 py-3 w-[80px]">ID</TableHead>
                                <TableHead className="px-4 py-3">Tanggal</TableHead>
                                <TableHead className="px-4 py-3">Tipe</TableHead>
                                <TableHead className="px-4 py-3">Pihak (Pelanggan/Pemasok)</TableHead>
                                <TableHead className="px-4 py-3 text-right">Total Nilai</TableHead>
                                <TableHead className="px-4 py-3">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500 text-lg">Memuat data...</TableCell></TableRow>
                            ) : data.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500 text-lg">Tidak ada transaksi dalam rentang tanggal ini.</TableCell></TableRow>
                            ) : (
                                data.map((trx, index) => (
                                    <TableRow key={index} className="hover:bg-blue-50/50 transition duration-150">
                                        <TableCell className="px-4 py-3 font-semibold text-gray-800">{trx.id}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-700">{trx.tanggal}</TableCell>
                                        <TableCell className="px-4 py-3">
                                            {/* Badge Tipe Transaksi */}
                                            <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getTypeBadge(trx.tipe)}`}>
                                                {trx.tipe}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-700">{trx.pihak}</TableCell>
                                        <TableCell className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                                            {formatRupiah(trx.total)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-700">{trx.status}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}