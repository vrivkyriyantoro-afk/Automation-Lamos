import fs from 'fs';
import path from 'path';

export interface RoleCredential {
  role: string;
  username: string;
  password: string;
}

const DEFAULT_FILE = 'fixtures/credentials/roles.csv';

/** Parser CSV kecil: kutip ganda, BOM, CRLF, pemisah `,` atau `;` (terdeteksi dari baris header). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== '') && !r[0].trim().startsWith('#'));
}

/** Baca semua role dari CSV. Tanpa file CSV: fallback ke role `default` dari LAMOS_USERNAME/LAMOS_PASSWORD. */
export function loadRoles(file = process.env.ROLES_FILE || DEFAULT_FILE): RoleCredential[] {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    const username = process.env.LAMOS_USERNAME;
    const password = process.env.LAMOS_PASSWORD;
    if (username && password) return [{ role: 'default', username, password }];
    throw new Error(
      `File credential tidak ditemukan: ${file}. Salin fixtures/credentials/roles.example.csv ke roles.csv ` +
        `(lihat fixtures/credentials/README.md) atau isi LAMOS_USERNAME/LAMOS_PASSWORD di .env.`,
    );
  }
  const [header, ...body] = parseCsv(fs.readFileSync(abs, 'utf8'));
  if (!header) throw new Error(`File credential kosong: ${file}`);
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const [iRole, iUser, iPass] = [col('role'), col('username'), col('password')];
  if ([iRole, iUser, iPass].includes(-1)) {
    throw new Error(`Header ${file} wajib memuat kolom: role, username, password (ditemukan: ${header.join(' | ')})`);
  }
  const roles = body
    .map((r) => ({ role: (r[iRole] ?? '').trim(), username: (r[iUser] ?? '').trim(), password: r[iPass] ?? '' }))
    .filter((r) => r.role && r.username);
  const dup = roles.map((r) => r.role).filter((n, i, a) => a.indexOf(n) !== i);
  if (dup.length) throw new Error(`Nama role dobel di ${file}: ${[...new Set(dup)].join(', ')}`);
  // ROLES=maker,checker membatasi role yang dipakai
  const only = (process.env.ROLES || '').split(',').map((s) => s.trim()).filter(Boolean);
  return only.length ? roles.filter((r) => only.includes(r.role)) : roles;
}

/** Ambil satu role; pesan error menyebut nama role saja (password tidak pernah ikut tercetak). */
export function getRole(name: string, file?: string): RoleCredential {
  const found = loadRoles(file).find((r) => r.role === name);
  if (!found) throw new Error(`Role "${name}" tidak ada di file credential.`);
  return found;
}

/** true bila role tersedia (untuk test.skip bila role belum diisi). */
export function hasRole(name: string, file?: string): boolean {
  try { return loadRoles(file).some((r) => r.role === name); } catch { return false; }
}
