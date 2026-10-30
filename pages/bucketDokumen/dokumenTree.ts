// Pohon kebutuhan dokumen hasil explore (tests/bucketDokumen/explore-dokumen.spec.ts -> explore-output/dokumen-tree.json).
// PARSIAL: explore baru selesai untuk 3 kategori pertama; kategori lain belum dipetakan sub-kategori/slot-nya.

export interface DokumenNode {
  title: string;
  /** sub-kategori -> daftar slot dokumen */
  children?: { title: string; documents: string[] }[];
}

export const DOKUMEN_TREE = [
  {
    title: 'Dokumen Pendukung Untuk Tujuan Modal Kerja/Investasi',
    children: [
      {
        title: 'Investasi = Pembelian Asset',
        documents: [
          'RAB',
          'Copy ldentitas Penjual (SLIK Penjual & Pasangan)',
          'IDEB Penjual & Pasangan',
          'Surat penawaran (tercantum no hp penjual)',
          'LPA Atas Aset Yang Akan Dibeli',
          'Copy Bukti Transfer Bank Pembayaran Down Payment (DP) / Booking Fee',
          'Foto Aset yang akan dibeli',
          'Bukti dana Self Financing wajib dilampirkan dan atau disetorkan ke rekening BSIM sebelum akad kredit dan pada saat pencairan BSIM langsung mentransfer dana pencairan bersamaan dengan dana self financing (sejumlah nilai transaksi) ke rekening penjual',
          'Copy Sertifikat Kepemilikan Atas Aset Yang Akan Dibeli',
        ],
      },
      {
        title: 'Investasi = Renovasi',
        documents: [
          'RAB Renovasi yang ditanda tangani cadeb/Kontraktor yang mengerjakan',
          'Foto Objek Yang Akan Direnovasi (sebelum renovasi)',
          'Copy Perjanjian Sewa (Mandatory jika Objek yang Akan Direnovasi Atas Nama Pihak Lain)',
          'Melampirkan Bukti Kepemilikan Asset yang akan direnovasi (jika dijadikan agunan)',
        ],
      },
    ],
  },
  { title: 'Lainnya' },
  { title: 'Pengajuan Take Over' },
  { title: 'Perpanjangan dan Pengajuan Penambahan Fasilitas' },
  { title: 'Dokumen Pengajuan' },
  { title: 'Dokumen Internal' },
  { title: 'Dokumen Pengikatan Agunan' },
  { title: 'Dokumen Legalitas Usaha' },
  { title: 'Data Keuangan' },
  { title: 'Dokumen Agunan' },
  { title: 'Identitas dan Legalitas Debitur' },
] as const satisfies readonly DokumenNode[];

export type DokumenKategori = (typeof DOKUMEN_TREE)[number]['title'];
