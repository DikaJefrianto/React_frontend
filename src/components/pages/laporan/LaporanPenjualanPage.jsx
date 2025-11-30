// src/components/pages/Laporan/LaporanPenjualanPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import dayjs from "dayjs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { Button } from "../../ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../ui/select";
import ExportButtons from "./components/ExportButtons";

export default function LaporanPenjualanPage() {
    const today = dayjs();
    const [data, setData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(today.month() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(today.year());
    const [loading, setLoading] = useState(false);

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    // Hitung tanggal mulai dan akhir bulan yang dipilih
    const dateRange = useMemo(() => {
        const start = dayjs(`${selectedYear}-${selectedMonth}-01`).startOf('month');
        const end = dayjs(`${selectedYear}-${selectedMonth}-01`).endOf('month');
        return { start: start.toDate(), end: end.toDate(), startStr: start.format('YYYY-MM-DD'), endStr: end.format('YYYY-MM-DD') };
    }, [selectedMonth, selectedYear]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/laporan/penjualan?start_date=${dateRange.startStr}&end_date=${dateRange.endStr}`);
            setData(res.data.data || []);
        } catch (error) {
            console.error("Error fetching sales report:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Opsi Bulan & Tahun
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: dayjs().month(i).format('MMMM') })), []);
    const yearOptions = useMemo(() => Array.from({ length: 5 }, (_, i) => today.year() - i), [today]);

    // Hitung total keseluruhan
    const grandTotal = data.reduce((sum, item) => sum + item.total_penjualan, 0);

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 border-b pb-2">Laporan Penjualan Harian </h1>
            <p className="text-gray-600">Ringkasan total penjualan dan jumlah transaksi per hari dalam periode bulan {dayjs().month(selectedMonth - 1).format('MMMM')} {selectedYear}.</p>

            {/* Filter & Export Controls */}
            <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between border border-gray-200">
                
                {/* Filter Group: Responsive Flex for Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                    
                    <span className="text-sm font-medium text-gray-700 self-start sm:self-center">Pilih Periode:</span>

                    {/* Pilih Bulan */}
                    <Select value={selectedMonth.toString()} onValueChange={val => setSelectedMonth(parseInt(val))}>
                        <SelectTrigger 
                            // FIX: Menambahkan styling solid dan shadow
                            className="w-full sm:w-[150px] bg-white border border-gray-300 shadow-sm hover:border-blue-400 transition"
                        >
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg">
                            {monthOptions.map(m => (
                                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* Pilih Tahun */}
                    <Select value={selectedYear.toString()} onValueChange={val => setSelectedYear(parseInt(val))}>
                        <SelectTrigger 
                            // FIX: Menambahkan styling solid dan shadow
                            className="w-full sm:w-[120px] bg-white border border-gray-300 shadow-sm hover:border-blue-400 transition"
                        >
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg">
                            {yearOptions.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Button 
                        onClick={fetchReport} 
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        {loading ? 'Memuat...' : 'Tampilkan'}
                    </Button>
                </div>
                
                {/* Export Buttons Group */}
                <div className="pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-4 w-full lg:w-auto">
                    <ExportButtons 
                        reportType="penjualan" 
                        startDate={dateRange.start} 
                        endDate={dateRange.end} 
                    />
                </div>
            </div>

            {/* Laporan Tabel */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader className="bg-blue-600">
                            <TableRow className="uppercase text-xs text-white font-bold">
                                <TableHead className="px-4 py-3 w-[120px]">Tanggal</TableHead>
                                <TableHead className="px-4 py-3 text-right">Jumlah Transaksi</TableHead>
                                <TableHead className="px-4 py-3 text-right">Total Nilai Penjualan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-500 text-lg">Memuat data...</TableCell></TableRow>
                            ) : data.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-500 text-lg">Tidak ada penjualan di bulan ini.</TableCell></TableRow>
                            ) : (
                                data.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-blue-50/50 transition duration-150">
                                        <TableCell className="px-4 py-3 font-semibold text-gray-800">{item.tanggal}</TableCell>
                                        <TableCell className="px-4 py-3 text-right text-gray-700">{item.jumlah_transaksi}</TableCell>
                                        <TableCell className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                                            {formatRupiah(item.total_penjualan)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            
                            {/* Baris Total Keseluruhan */}
                            {data.length > 0 && (
                                <TableRow className="bg-blue-50 font-extrabold border-t-4 border-blue-200 shadow-inner">
                                    <TableCell className="px-4 py-3 text-base">TOTAL KESELURUHAN</TableCell>
                                    <TableCell className="text-right"></TableCell>
                                    <TableCell className="px-4 py-3 text-right text-xl text-blue-700">
                                        {formatRupiah(grandTotal)}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}