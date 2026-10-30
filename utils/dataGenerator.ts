/**
 * Generator Data Testing Badan Usaha & Pengurus untuk LAMOS SME Bank Sinarmas
 */

export interface PengurusBadanUsaha {
  jabatan: 'Direktur Utama' | 'Direktur' | 'Komisaris Utama' | 'Komisaris' | 'Pemegang Saham';
  namaLengkap: string;
  nikKtp: string;
  npwp: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  statusPerkawinan: 'Menikah' | 'Belum Menikah' | 'Duda/Janda';
  namaIbuKandung: string;
  nomorHp: string;
  email: string;
  alamatKtp: string;
  rtRw: string;
  provinsi: string;
  kotaKabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
  persentaseSaham: number; // e.g. 60%
  lembarSaham: number;
  nilaiSaham: number; // e.g. 600.000.000
}

export interface BadanUsahaData {
  // 1. Identitas Badan Usaha
  bentukBadanUsaha: 'PT' | 'CV' | 'Firma' | 'UD' | 'Koperasi' | 'Yayasan';
  namaBadanUsaha: string;
  npwpBadanUsaha: string;
  nib: string; // 13 digit
  bidangUsaha: string;
  sektorEkonomiKbli: string;
  tanggalMulaiUsaha: string;
  lamaUsahaTahun: number;
  lamaUsahaBulan: number;
  teleponKantor: string;
  emailPerusahaan: string;
  website?: string;

  // 2. Legalitas Pendirian & Perubahan
  aktaPendirian: {
    nomorAkta: string;
    tanggalAkta: string;
    namaNotaris: string;
    nomorSkKemenkumham: string;
    tanggalSkKemenkumham: string;
  };
  aktaPerubahanTerakhir?: {
    nomorAkta: string;
    tanggalAkta: string;
    namaNotaris: string;
    nomorSkKemenkumham: string;
    tanggalSkKemenkumham: string;
  };

  // 3. Alamat Domisili & Operasional
  alamatDomisili: {
    alamatLengkap: string;
    rtRw: string;
    provinsi: string;
    kotaKabupaten: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
    statusTempatUsaha: 'Milik Sendiri' | 'Sewa' | 'Keluarga';
    lamaMenempatiTahun: number;
  };

  // 4. Struktur Pengurus & Pemegang Saham
  pengurus: PengurusBadanUsaha[];

  // 5. Data Rekening Operasional & Keuangan
  rekeningBank: {
    namaBank: string;
    nomorRekening: string;
    namaPemilikRekening: string;
    omsetRataRataBulanan: number;
  };
}

/**
 * Helper Random Utilities
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDigitString(length: number): string {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 10).toString();
  }
  return res;
}

/**
 * Generate NIK 16-digit valid format (Prov 31=DKI, Tanggal lahir, urutan)
 */
export function generateNik(isFemale: boolean = false, birthYear: number = 1985): string {
  const prov = '3171'; // Jakarta Pusat
  const kec = '01';
  let day = getRandomInt(1, 28);
  if (isFemale) day += 40;
  const dayStr = day.toString().padStart(2, '0');
  const monthStr = getRandomInt(1, 12).toString().padStart(2, '0');
  const yearStr = (birthYear % 100).toString().padStart(2, '0');
  const serial = getRandomInt(1, 9999).toString().padStart(4, '0');
  return `${prov}${kec}${dayStr}${monthStr}${yearStr}${serial}`;
}

/**
 * Generate NPWP Badan Usaha (15 digit standar)
 * Format: 01.234.567.8-012.000 / 012345678012000
 */
export function generateNpwpBadanUsaha(formatted: boolean = false): string {
  const p1 = getRandomInt(1, 99).toString().padStart(2, '0');
  const p2 = getRandomInt(100, 999).toString();
  const p3 = getRandomInt(100, 999).toString();
  const p4 = getRandomInt(0, 9).toString();
  const kpp = getRandomInt(10, 99).toString().padStart(3, '0');
  const branch = '000';

  if (formatted) {
    return `${p1}.${p2}.${p3}.${p4}-${kpp}.${branch}`;
  }
  return `${p1}${p2}${p3}${p4}${kpp}${branch}`;
}

/**
 * Generate NIB (Nomor Induk Berusaha - 13 digit OSS)
 */
export function generateNib(): string {
  // Format OSS biasanya 13 digit numerik
  return `${getRandomInt(1000000000000, 9999999999999)}`;
}

/**
 * Generate No HP Indonesia (08...)
 */
export function generatePhone(isCompanyPhone: boolean = false): string {
  if (isCompanyPhone) {
    return `021${getRandomInt(1000000, 9999999)}`;
  }
  const prefixes = ['0812', '0813', '0821', '0857', '0878', '0818'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${getRandomInt(10000000, 99999999)}`;
}

/**
 * Generator Data Badan Usaha Lengkap
 */
export function generateBadanUsahaData(customBentuk: 'PT' | 'CV' | 'UD' = 'PT'): BadanUsahaData {
  const companyKeywords = [
    'SUMBER MAKMUR ABADI',
    'BERKAH JAYA NUSANTARA',
    'SINAR MITRA SEJAHTERA',
    'KARYA PRIMA MANDIRI',
    'GLOBAL LOGISTIK UTAMA',
    'MEGAH TEKNIK PERKASA',
    'AGRO PERSADA INDONESIA',
    'BINA SUKSES BERSAMA'
  ];
  
  const chosenName = companyKeywords[getRandomInt(0, companyKeywords.length - 1)];
  const fullCompanyName = `${customBentuk} ${chosenName}`;
  const npwpCompany = generateNpwpBadanUsaha(false);
  const nibCompany = generateNib();
  const notarisList = ['Bambang Sugiharto, S.H., M.Kn.', 'Ratna Juwita, S.H., M.Kn.', 'Hendrawan Kusuma, S.H.', 'Dewi Kartika, S.H., M.Kn.'];
  const chosenNotaris = notarisList[getRandomInt(0, notarisList.length - 1)];

  // Direktur Utama
  const dirutNik = generateNik(false, 1980);
  const dirutNpwp = generateNpwpBadanUsaha(false);

  // Komisaris Utama
  const komutNik = generateNik(true, 1983);
  const komutNpwp = generateNpwpBadanUsaha(false);

  return {
    bentukBadanUsaha: customBentuk,
    namaBadanUsaha: fullCompanyName,
    npwpBadanUsaha: npwpCompany,
    nib: nibCompany,
    bidangUsaha: 'Perdagangan Besar dan Eceran / Distribusi FMCG',
    sektorEkonomiKbli: '46311 - Perdagangan Besar Beras dan Palawija',
    tanggalMulaiUsaha: '2018-05-15',
    lamaUsahaTahun: 6,
    lamaUsahaBulan: 4,
    teleponKantor: generatePhone(true),
    emailPerusahaan: `info@${chosenName.toLowerCase().replace(/\s+/g, '')}.co.id`,
    website: `https://www.${chosenName.toLowerCase().replace(/\s+/g, '')}.co.id`,

    aktaPendirian: {
      nomorAkta: `${getRandomInt(1, 99)}`,
      tanggalAkta: '2018-05-10',
      namaNotaris: chosenNotaris,
      nomorSkKemenkumham: `AHU-${getRandomInt(10000, 99999)}.AH.01.01.TAHUN 2018`,
      tanggalSkKemenkumham: '2018-05-20'
    },
    aktaPerubahanTerakhir: {
      nomorAkta: `${getRandomInt(1, 50)}`,
      tanggalAkta: '2023-08-14',
      namaNotaris: chosenNotaris,
      nomorSkKemenkumham: `AHU-AH.01.03-${getRandomInt(10000, 99999)}`,
      tanggalSkKemenkumham: '2023-08-25'
    },

    alamatDomisili: {
      alamatLengkap: 'Jl. Boulevard Raya Barat No. 88, Kawasan Niaga Cempaka Mas',
      rtRw: '005/010',
      provinsi: 'DKI JAKARTA',
      kotaKabupaten: 'KOTA ADM. JAKARTA PUSAT',
      kecamatan: 'KEMAYORAN',
      kelurahan: 'SUMUR BATU',
      kodePos: '10640',
      statusTempatUsaha: 'Milik Sendiri',
      lamaMenempatiTahun: 6
    },

    pengurus: [
      {
        jabatan: 'Direktur Utama',
        namaLengkap: 'HENDRA WIJAYA SAPUTRA',
        nikKtp: dirutNik,
        npwp: dirutNpwp,
        jenisKelamin: 'Laki-laki',
        tempatLahir: 'JAKARTA',
        tanggalLahir: '1980-08-17',
        statusPerkawinan: 'Menikah',
        namaIbuKandung: 'SITI MARYAM',
        nomorHp: generatePhone(false),
        email: 'hendra.wijaya@gmail.com',
        alamatKtp: 'Jl. Kebon Kacang IX No. 24',
        rtRw: '003/004',
        provinsi: 'DKI JAKARTA',
        kotaKabupaten: 'KOTA ADM. JAKARTA PUSAT',
        kecamatan: 'TANAH ABANG',
        kelurahan: 'KEBON KACANG',
        kodePos: '10240',
        persentaseSaham: 60,
        lembarSaham: 600,
        nilaiSaham: 600000000
      },
      {
        jabatan: 'Komisaris Utama',
        namaLengkap: 'RATNA KARTIKA DEWI',
        nikKtp: komutNik,
        npwp: komutNpwp,
        jenisKelamin: 'Perempuan',
        tempatLahir: 'SURABAYA',
        tanggalLahir: '1983-11-20',
        statusPerkawinan: 'Menikah',
        namaIbuKandung: 'ENDANG LESTARI',
        nomorHp: generatePhone(false),
        email: 'ratna.kartika@gmail.com',
        alamatKtp: 'Jl. Kebon Kacang IX No. 24',
        rtRw: '003/004',
        provinsi: 'DKI JAKARTA',
        kotaKabupaten: 'KOTA ADM. JAKARTA PUSAT',
        kecamatan: 'TANAH ABANG',
        kelurahan: 'KEBON KACANG',
        kodePos: '10240',
        persentaseSaham: 40,
        lembarSaham: 400,
        nilaiSaham: 400000000
      }
    ],

    rekeningBank: {
      namaBank: 'BANK SINARMAS',
      nomorRekening: `00${getRandomDigitString(8)}`,
      namaPemilikRekening: fullCompanyName,
      omsetRataRataBulanan: 450000000 // Rp 450 Juta / bulan
    }
  };
}

