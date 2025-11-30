import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook untuk menentukan apakah lebar viewport saat ini kurang dari MOBILE_BREAKPOINT (768px).
 * Menggunakan window.matchMedia dan melacak perubahan ukuran layar.
 */
export function useIsMobile() {
  // Menghilangkan tipe <boolean | undefined>
  const [isMobile, setIsMobile] = React.useState(
    undefined,
  );

  React.useEffect(() => {
    // Media Query List untuk mendeteksi perubahan lebar layar
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Handler yang dipanggil saat matchMedia berubah
    const onChange = () => {
      // Menggunakan window.innerWidth untuk kompatibilitas yang lebih luas
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Mendaftarkan event listener
    mql.addEventListener("change", onChange);
    
    // Menetapkan status awal (initial value)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Cleanup function: menghapus listener saat komponen dilepas
    return () => mql.removeEventListener("change", onChange);
    
  }, []); // Array dependensi kosong agar hanya berjalan sekali (mounting)

  // Mengembalikan nilai boolean, memastikan ia selalu boolean (meskipun state awal undefined)
  return !!isMobile;
}