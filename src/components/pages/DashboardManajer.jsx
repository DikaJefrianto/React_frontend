// src/components/pages/DashboardManajer.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- FIX 1: Impor useNavigate
import axiosInstance from '../../utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Package, TrendingUp, Star, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Hapus properti { onNavigate } karena tidak digunakan
export default function DashboardManajer() {
  const navigate = useNavigate(); 
  
  const [data, setData] = useState(null);
  // ERROR IS HERE: Ensure useState is used correctly for loading
  const [loading, setLoading] = useState(true); // <-- MUST be useState(true)
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/dashboard')
      .then(res => {
        setData(res.data.manager_stats ?? null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch dashboard manager error:', err);
        setError('Gagal mengambil data dashboard');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-700 text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!data) return <p className="text-gray-500 text-center mt-10">Tidak ada data tersedia</p>;

  // ===============================
  // Mapping Data Aman dari API
  // ===============================
  const totalStok = Number(data.total_stock_now ?? 0);
  const totalPenjualan = Number(data.total_sales_this_month ?? 0);
  const rataRataKualitas = data.average_quality ?? null;
  const jumlahPesananDibatalkan = data.canceled_orders ?? 0;
  const criticalBatches = data.fifo_critical_batches ?? [];
  const salesData = (data.sales_chart ?? []).map(row => ({
    month: row.bulan,
    penjualan: row.total
  }));

  // Handler untuk navigasi
  const handleReportNavigate = () => {
    // FIX 3: Panggil fungsi navigate dengan path yang benar
    navigate('/laporan/transaksi'); 
  };


  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-1 text-2xl md:text-3xl font-bold">Dashboard Manajer</h1>
        <p className="text-gray-600">Performa dan Manajemen Risiko Operasional</p>
      </div>

      {/* KPI Cards (Tidak diubah) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... (Konten Card) ... */}
        {/* Card 1: Total Stok */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-700">Total Stok (kg) Saat Ini</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 font-semibold">{totalStok.toLocaleString()} kg</div>
            <p className="text-xs text-emerald-700 mt-1">Data real-time</p>
          </CardContent>
        </Card>

        {/* Card 2: Total Penjualan */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-700">Total Penjualan Bulan Ini</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 font-semibold">
              Rp {totalPenjualan.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-emerald-700 mt-1">Data real-time</p>
          </CardContent>
        </Card>

        {/* Card 3: Rata-rata Kualitas */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-700">Rata-rata Kualitas Buah Masuk</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 font-semibold">
              {rataRataKualitas !== null ? rataRataKualitas.toFixed(2) : 'N/A'}
            </div>
            <p className="text-xs text-gray-600 mt-1">Nilai normal 1–3</p>
          </CardContent>
        </Card>

        {/* Card 4: Pesanan Dibatalkan */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm text-gray-700">Jumlah Pesanan Dibatalkan</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 font-semibold">{jumlahPesananDibatalkan} Pesanan</div>
            <p className="text-xs text-red-700 mt-1">Data real-time</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert Panel (Tidak diubah) */}
      {criticalBatches.length > 0 && (
        <Alert className="border-2 border-red-600 bg-red-50 shadow-lg rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-700" />
            <AlertTitle className="text-red-900 font-semibold">PERINGATAN FIFO KRITIS</AlertTitle>
          </div>
          <AlertDescription>
            <div className="space-y-2">
              {criticalBatches.map((batch, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border-2 border-red-300 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{batch.buah}</p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        Masuk: {new Date(batch.tanggal_masuk).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold">{batch.stok_saat_ini} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sales Chart (Tidak diubah) */}
      <Card className="border-0 shadow-lg rounded-xl">
        {/* ... (Konten Chart) ... */}
        <CardHeader>
          <CardTitle className="text-gray-900 font-semibold">
            Grafik Penjualan Bulanan (12 Bulan Terakhir)
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Total penjualan dalam Rupiah</p>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#374151" />
                <YAxis
                  stroke="#374151"
                  tickFormatter={value => `Rp ${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={value => `Rp ${Number(value).toLocaleString('id-ID')}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="penjualan" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Link to Reports */}
      <Card className="border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 to-white shadow-lg rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 mb-1 font-semibold">Akses Modul Laporan</h3>
              <p className="text-sm text-gray-600">
                Generate dan ekspor laporan detail untuk analisis lanjutan
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleReportNavigate} // <-- FIX 4: Panggil handler baru
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 flex items-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              Buka Laporan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}