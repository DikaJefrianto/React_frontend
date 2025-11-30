// Type definitions for the application

export type UserRole = 'manajer' | 'petugas_gudang' | 'admin';
export type Page = 'dashboard' | 'inventory' | 'transaction' | 'suppliers' | 'customers' | 'reports';

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  role: UserRole;
  token?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  nama: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  jenisBuah: string;
  tanggalMasuk: string;
  kuantitas: number;
  kualitas: string;
  pemasok: string;
  statusFIFO: 'normal' | 'peringatan' | 'kritis';
}

export interface InventoryFormData {
  jenisBuah: string;
  tanggalMasuk: string;
  kuantitas: string;
  kualitas: string;
  pemasok: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  nama: string;
  kontak: string;
  email: string;
  alamat: string;
  status: 'aktif' | 'nonaktif';
  jumlahPasokan: number;
}

export interface SupplierFormData {
  nama: string;
  kontak: string;
  email: string;
  alamat: string;
}

// Customer Types
export interface Customer {
  id: string;
  nama: string;
  kontak: string;
  email: string;
  alamat: string;
  tipe: 'retail' | 'grosir' | 'distributor';
  totalPesanan: number;
}

export interface CustomerFormData {
  nama: string;
  kontak: string;
  email: string;
  alamat: string;
}

// Transaction Types
export interface CartItem {
  id: string;
  jenisBuah: string;
  kuantitas: number;
  hargaPerKg: number;
  stokTersedia: number;
}

export interface TransactionRecord {
  id: string;
  idPelanggan: string;
  namaPelanggan: string;
  alamatPelanggan: string;
  tanggal: string;
  items: CartItem[];
  totalNilai: number;
  status: 'diproses' | 'selesai';
}

export interface TransactionCreateData {
  idPelanggan: string;
  items: CartItem[];
}

// Report Types
export interface ReportSummary {
  totalStok: number;
  totalPemasok: number;
  totalPelanggan: number;
  totalTransaksi: number;
  nilaiInventaris: number;
}

export interface FIFOAlert {
  id: string;
  jenisBuah: string;
  tanggalMasuk: string;
  hariTersisa: number;
  kuantitas: number;
  statusFIFO: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
