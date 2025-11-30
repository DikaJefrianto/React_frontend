// Mock Data for Development/Testing (Before Flask Backend is Connected)
// This file provides fallback data when API is not available

import type {
  InventoryItem,
  Supplier,
  Customer,
  TransactionRecord,
} from '../types';

export const mockInventoryData: InventoryItem[] = [
  { 
    id: 'STK-001', 
    jenisBuah: 'Apel Fuji', 
    tanggalMasuk: '2025-10-01', 
    kuantitas: 150, 
    kualitas: 'A', 
    pemasok: 'PT Buah Segar',
    statusFIFO: 'kritis' 
  },
  { 
    id: 'STK-002', 
    jenisBuah: 'Mangga Gedong', 
    tanggalMasuk: '2025-10-15', 
    kuantitas: 320, 
    kualitas: 'A', 
    pemasok: 'CV Tani Makmur',
    statusFIFO: 'normal' 
  },
  { 
    id: 'STK-003', 
    jenisBuah: 'Durian Montong', 
    tanggalMasuk: '2025-10-12', 
    kuantitas: 200, 
    kualitas: 'B', 
    pemasok: 'PT Buah Segar',
    statusFIFO: 'peringatan' 
  },
  { 
    id: 'STK-004', 
    jenisBuah: 'Semangka Tanpa Biji', 
    tanggalMasuk: '2025-10-18', 
    kuantitas: 450, 
    kualitas: 'A', 
    pemasok: 'UD Maju Jaya',
    statusFIFO: 'normal' 
  },
  { 
    id: 'STK-005', 
    jenisBuah: 'Jeruk Mandarin', 
    tanggalMasuk: '2025-10-03', 
    kuantitas: 200, 
    kualitas: 'A', 
    pemasok: 'PT Buah Segar',
    statusFIFO: 'kritis' 
  },
  { 
    id: 'STK-006', 
    jenisBuah: 'Anggur Hijau', 
    tanggalMasuk: '2025-10-20', 
    kuantitas: 180, 
    kualitas: 'C', 
    pemasok: 'CV Tani Makmur',
    statusFIFO: 'normal' 
  },
  { 
    id: 'STK-007', 
    jenisBuah: 'Melon Golden', 
    tanggalMasuk: '2025-10-10', 
    kuantitas: 250, 
    kualitas: 'B', 
    pemasok: 'UD Maju Jaya',
    statusFIFO: 'peringatan' 
  },
  { 
    id: 'STK-008', 
    jenisBuah: 'Pisang Cavendish', 
    tanggalMasuk: '2025-10-05', 
    kuantitas: 180, 
    kualitas: 'A', 
    pemasok: 'PT Buah Segar',
    statusFIFO: 'kritis' 
  },
];

export const mockSuppliersData: Supplier[] = [
  { 
    id: 'SUP-001', 
    nama: 'PT Buah Segar Indonesia', 
    kontak: '021-12345678',
    email: 'info@buahsegar.co.id',
    alamat: 'Jakarta Selatan',
    status: 'aktif',
    jumlahPasokan: 45
  },
  { 
    id: 'SUP-002', 
    nama: 'CV Tani Makmur Jaya', 
    kontak: '022-98765432',
    email: 'tani@makmur.com',
    alamat: 'Bandung',
    status: 'aktif',
    jumlahPasokan: 32
  },
  { 
    id: 'SUP-003', 
    nama: 'UD Maju Jaya Sejahtera', 
    kontak: '031-55512345',
    email: 'maju@sejahtera.id',
    alamat: 'Surabaya',
    status: 'aktif',
    jumlahPasokan: 28
  },
  { 
    id: 'SUP-004', 
    nama: 'Koperasi Petani Nusantara', 
    kontak: '0274-777888',
    email: 'koperasi@petani.co.id',
    alamat: 'Yogyakarta',
    status: 'nonaktif',
    jumlahPasokan: 15
  },
  { 
    id: 'SUP-005', 
    nama: 'PT Organik Fresh Farm', 
    kontak: '021-33344455',
    email: 'contact@organikfresh.com',
    alamat: 'Bogor',
    status: 'aktif',
    jumlahPasokan: 38
  },
];

export const mockCustomersData: Customer[] = [
  { 
    id: 'CUST-001', 
    nama: 'Toko Buah Segar Jaya', 
    kontak: '021-55567890',
    email: 'jaya@tokosegar.com',
    alamat: 'Jakarta Selatan',
    tipe: 'retail',
    totalPesanan: 87
  },
  { 
    id: 'CUST-002', 
    nama: 'Supermarket Fresh Mart', 
    kontak: '022-44455566',
    email: 'order@freshmart.co.id',
    alamat: 'Bandung',
    tipe: 'grosir',
    totalPesanan: 124
  },
  { 
    id: 'CUST-003', 
    nama: 'CV Distribusi Buah Nusantara', 
    kontak: '031-77788899',
    email: 'distribusi@nusantara.id',
    alamat: 'Surabaya',
    tipe: 'distributor',
    totalPesanan: 156
  },
  { 
    id: 'CUST-004', 
    nama: 'Pasar Modern Sehat', 
    kontak: '0274-33344455',
    email: 'pasar@sehat.com',
    alamat: 'Yogyakarta',
    tipe: 'retail',
    totalPesanan: 63
  },
  { 
    id: 'CUST-005', 
    nama: 'Toko Organik Fresh', 
    kontak: '021-66677788',
    email: 'fresh@organik.co.id',
    alamat: 'Jakarta Pusat',
    tipe: 'retail',
    totalPesanan: 45
  },
  { 
    id: 'CUST-006', 
    nama: 'PT Retailindo Makmur', 
    kontak: '021-99988877',
    email: 'retailindo@makmur.id',
    alamat: 'Tangerang',
    tipe: 'grosir',
    totalPesanan: 98
  },
];

export const mockTransactionsData: TransactionRecord[] = [
  {
    id: 'TRX-2025-087',
    idPelanggan: 'CUST-001',
    namaPelanggan: 'Toko Buah Segar Jaya',
    alamatPelanggan: 'Jakarta Selatan',
    tanggal: '2025-10-23',
    items: [],
    totalNilai: 3450000,
    status: 'diproses'
  },
  {
    id: 'TRX-2025-086',
    idPelanggan: 'CUST-002',
    namaPelanggan: 'Supermarket Fresh Mart',
    alamatPelanggan: 'Bandung',
    tanggal: '2025-10-23',
    items: [],
    totalNilai: 5230000,
    status: 'selesai'
  },
  {
    id: 'TRX-2025-085',
    idPelanggan: 'CUST-003',
    namaPelanggan: 'CV Distribusi Buah Nusantara',
    alamatPelanggan: 'Surabaya',
    tanggal: '2025-10-22',
    items: [],
    totalNilai: 8920000,
    status: 'selesai'
  },
];

// Flag to enable/disable mock data (set to false when backend is ready)
export const USE_MOCK_DATA = true;
