# language: id
@auth
Fitur: Login LAMOS
  Sebagai pengguna LAMOS
  Saya ingin masuk dengan akun saya
  Agar dapat mengakses pengajuan kredit

  Latar Belakang:
    Diketahui saya membuka halaman login LAMOS

  @smoke
  Skenario: Login berhasil dengan kredensial valid
    Ketika saya login dengan kredensial yang valid
    Maka saya diarahkan keluar dari halaman login

  Skenario: Login gagal dengan password salah
    Ketika saya login dengan password "WrongPassword123!"
    Maka muncul pesan gagal login
