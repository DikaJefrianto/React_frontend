import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Package, Lock, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Asumsi fungsi login mengurus set state auth dan menyimpan token

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        'https://ideal-commitment-production.up.railway.app/api/auth/login',
        { username, password }
      );

      // 1. EKSTRAK REFRESH TOKEN DARI RESPON
      const { access_token, refresh_token, user_role } = res.data;

      // 2. SIMPAN KEDUA TOKEN DI LOCALSTORAGE
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token); // <-- Tambahan

      // 3. Simpan token + role ke Context (mungkin perlu diperbarui)
      // Asumsi: fungsi login di context Anda akan membaca token dari localStorage, 
      // atau Anda perlu memodifikasi fungsi login agar menerima kedua token.
      login(user_role, access_token);

      // Arahkan dashboard sesuai ROLE
      if (user_role === 'Admin') navigate('/dashboard/admin');
      else if (user_role === 'Manajer') navigate('/dashboard/manajer');
      else if (user_role === 'Petugas') navigate('/dashboard/petugas');

    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.msg || 'Login gagal.');
      } else {
        setError('Tidak bisa menghubungi server.');
      }
    }
  };
  // ... (sisa return JSX tidak berubah) ...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl mb-6">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sistem Informasi Manajemen
          </h1>
          <h2 className="text-xl font-semibold text-white">
            Gudang Buah (SIM-Buah)
          </h2>
          <p className="text-gray-400 mt-2">Solusi manajemen gudang terintegrasi</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-2xl text-gray-900">Login ke Sistem</CardTitle>
            <p className="text-center text-sm text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-900">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    className="pl-10 h-12 border-gray-300"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    className="pl-10 h-12 border-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3">
                  <p className="text-sm text-red-900 text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              >
                LOGIN
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-400 text-sm mt-6">
          © 2025 SIM-Buah. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
