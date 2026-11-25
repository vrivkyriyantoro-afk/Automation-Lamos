# language: id
@agunan @S2CML-6018
Fitur: S2CML-6018 Summary Agunan - Validasi ikon kartu agunan vs desain Figma
  Sebagai QA
  Saya ingin memastikan ikon kartu agunan sesuai desain Figma
  Agar tampilan Summary Agunan konsisten dengan desain

  # Pilot Gherkin. Padanan TypeScript: validasi-icon-agunan.spec.ts (folder yang sama).
  # Jalankan: npm run bdd:test -- --grep @S2CML-6018

  Latar Belakang:
    Diketahui saya sudah login ke LAMOS
    Dan saya membuka bucket Agunan pada debitur perseorangan uji

  @TC-6018-01
  Skenario: Validasi Tampilan dan Kesesuaian Icon Kategori Dokumen (Kertas/Dokumen) pada Kartu Agunan Reksadana
    Ketika saya melihat kartu agunan "F041401 - Reksadana"
    Maka ikon kartu memakai asset "document.svg"
    Dan alt text ikon memuat "Reksadana"
    Dan bukti kartu agunan "TC-6018-01" tersimpan

  @TC-6018-02
  Skenario: Validasi Tampilan dan Kesesuaian Icon Kategori Cash (Koin Emas) pada Kartu Agunan Setoran Jaminan
    Ketika saya melihat kartu agunan "F15 - Setoran Jaminan"
    Maka ikon kartu memakai asset "cash.svg"
    Dan alt text ikon memuat "Setoran Jaminan"
    Dan bukti kartu agunan "TC-6018-02" tersimpan

  @TC-6018-03
  Skenario: Validasi Ketersediaan dan Integritas Seluruh Asset Icon Agunan (Housing, Vehicle, Document, Cash) pada Frontend
    Ketika saya mengambil asset ikon agunan dari frontend
    Maka asset ikon "housing.svg, vehicle.svg, document.svg, cash.svg" tersedia sebagai SVG valid
    Dan bukti matriks ikon "TC-6018-03" tersimpan

  @TC-6018-04
  Skenario: Validasi Dimensi dan Atribut Gambar Icon Agunan (48x48 px, Alt Text, Object Contain)
    Ketika saya melihat Daftar agunan
    Maka setiap ikon kartu berukuran 48 x 48 piksel dan memakai object-contain
    Dan bukti daftar agunan "TC-6018-04" tersimpan
