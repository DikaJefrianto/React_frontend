// src/components/pages/Laporan/components/ExportButtons.jsx
import { Button } from "../../../ui/button";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance"; // pastikan ini punya interceptor refresh token

export default function ExportButtons({ reportType, startDate, endDate }) {
    const start = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
    const end = endDate ? new Date(endDate).toISOString().split('T')[0] : '';

    const handleExport = async (format) => {
        if (!start || !end) {
            alert("Pilih Tanggal Mulai dan Tanggal Akhir terlebih dahulu!");
            return;
        }

        // Format URL backend
        const url = `/laporan/export/${reportType}?format=${format}&start_date=${start}&end_date=${end}`;

        try {
            const response = await axiosInstance.get(url, {
                responseType: 'blob', // Penting agar file bisa diunduh
            });

            // Tentukan ekstensi file sesuai format
            let ext = format;
            if (format === 'excel') ext = 'xlsx';
            if (format === 'csv') ext = 'csv';
            if (format === 'pdf') ext = 'pdf';

            // Ambil nama file dari header jika ada
            const contentDisposition = response.headers['content-disposition'];
            let filename = `Laporan_${reportType}_${start}_${end}.${ext}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename\*?=UTF-8''(.+)|filename="(.+)"/);
                if (filenameMatch && (filenameMatch[1] || filenameMatch[2])) {
                    filename = decodeURIComponent(filenameMatch[1] || filenameMatch[2]);
                }
            }

            // Trigger download
            const blob = new Blob([response.data], { type: response.data.type });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error("Export Failed:", error);
            alert(`Terjadi kesalahan: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="flex gap-3 items-center">
            <span className="text-sm text-gray-600 font-medium">Export:</span>
            <Button 
                onClick={() => handleExport('pdf')} 
                variant="outline" 
                className="hover:bg-red-50 text-red-600" 
                disabled={!start || !end}
            >
                <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button 
                onClick={() => handleExport('excel')} 
                variant="outline" 
                className="hover:bg-green-50 text-green-600" 
                disabled={!start || !end}
            >
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button 
                onClick={() => handleExport('csv')} 
                variant="outline" 
                className="hover:bg-blue-50 text-blue-600" 
                disabled={!start || !end}
            >
                <File className="w-4 h-4 mr-2" /> CSV
            </Button>
        </div>
    );
}
