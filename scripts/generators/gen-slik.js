#!/usr/bin/env node
// Generator file SLIK mock (NIK_<nik>.txt / NPWP_<npwp>.txt) dari daftar entitas.
// Pakai: node scripts/generators/gen-slik.js [--entities fixtures/entities/slik-entities.json] [--out fixtures/slik/slik-auto] [--force]
// Struktur diklon dari template fixtures/slik/NIK_3276020602850001.txt (Windows-1252) dan fixtures/slik/NPWP_3210077012810002.txt (UTF-8).
// Yang diubah: nomor identitas/NPWP, nama, jenis kelamin, tanggal lahir (NIK); nama, NPWP, pengurus (NPWP).
// Data fasilitas = salinan template (BUKAN data nyata). File yang sudah ada tidak ditimpa tanpa --force.
const fs = require('fs');
const path = require('path');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const ENT = arg('--entities', 'fixtures/entities/slik-entities.json');
const OUT = arg('--out', 'fixtures/slik/slik-auto');
const FORCE = process.argv.includes('--force');
const TPL_NIK = 'fixtures/slik/NIK_3276020602850001.txt';
const TPL_NPWP = 'fixtures/slik/NPWP_3210077012810002.txt';
const OLD_NIK = '3276020602850001';
const OLD_NPWP = '4850241603710928';

// Windows-1252 <-> string (templat NIK memuat byte 0x96); simpan balik sebagai Windows-1252 supaya format sama.
const dec1252 = b => new TextDecoder('windows-1252').decode(b);
function enc1252(s) {
  const map = { '–': 0x96, '—': 0x97, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94 };
  const out = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) out.push(c);
    else if (map[ch] !== undefined) out.push(map[ch]);
    else out.push(0x3f);
  }
  return Buffer.from(out);
}
const walk = (o, fn) => { if (Array.isArray(o)) o.forEach(x => walk(x, fn)); else if (o && typeof o === 'object') { fn(o); Object.values(o).forEach(x => walk(x, fn)); } };
const replAll = (o, from, to) => walk(o, ob => { for (const k of Object.keys(ob)) if (typeof ob[k] === 'string' && ob[k].includes(from)) ob[k] = ob[k].split(from).join(to); });

function genNik(e) {
  const j = JSON.parse(dec1252(fs.readFileSync(TPL_NIK)));
  const gKet = e.gender === 'P' ? 'PEREMPUAN' : 'LAKI-LAKI';
  replAll(j, OLD_NIK, e.id);
  walk(j, o => {
    if (o.namaDebitur) o.namaDebitur = e.name;
    if (o.jenisKelamin) { o.jenisKelamin = e.gender; if ('jenisKelaminKet' in o) o.jenisKelaminKet = gKet; }
    if (o.tanggalLahir && e.dob) o.tanggalLahir = e.dob;
  });
  JSON.parse(JSON.stringify(j)); // validasi
  return enc1252(JSON.stringify(j, null, 4));
}

function genNpwp(e) {
  const j = JSON.parse(fs.readFileSync(TPL_NPWP, 'utf8'));
  replAll(j, OLD_NPWP, e.id);
  walk(j, o => {
    if (o.namaDebitur) o.namaDebitur = e.name;
    if (o.namaLengkap) o.namaLengkap = e.name;
  });
  const kp = j.perusahaan && j.perusahaan.kelompokPengurusPemilik;
  if (Array.isArray(kp) && kp[0] && kp[0].pengurusPemilik) {
    const shape = kp[0].pengurusPemilik[0] || {};
    kp.length = 1;
    kp[0].pengurusPemilik = (e.pengurus || []).map(p => ({
      ...shape,
      namaSesuaiIdentitas: p.name,
      nomorIdentitas: p.id,
      kodeJenisKelamin: p.gender || '',
      jenisKelamin: p.gender === 'P' ? 'PEREMPUAN' : p.gender === 'L' ? 'LAKI-LAKI' : '',
      posisiPekerjaan: p.posisi || shape.posisiPekerjaan,
      prosentaseKepemilikan: p.persen || shape.prosentaseKepemilikan,
    }));
  }
  return Buffer.from(JSON.stringify(j, null, 4), "utf8");
}

const { entities } = JSON.parse(fs.readFileSync(ENT, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
const hasil = [];
for (const e of entities) {
  const fn = `${e.type}_${e.id}.txt`;
  const dest = path.join(OUT, fn);
  if (fs.existsSync(dest) && !FORCE) { hasil.push({ row: e.row, file: fn, status: 'SKIP (sudah ada)' }); continue; }
  fs.writeFileSync(dest, e.type === 'NPWP' ? genNpwp(e) : genNik(e));
  hasil.push({ row: e.row, file: fn, status: 'DIBUAT' });
}
console.table(hasil);
console.log('Output:', OUT);
