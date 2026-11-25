#!/usr/bin/env node
/**
 * Jalankan semua test satu story (folder tests/<bucket>/<STORY>/).
 *
 * Pakai:
 *   npm run test:story -- 4890                      # S2CML-4890
 *   npm run test:story -- S2CML-4890 --headed
 *   npm run test:story -- 4890 --workers=2 -g "TC-4890-0[1-5]"
 *
 * Argumen pertama = nomor/kode story; sisanya diteruskan apa adanya ke `playwright test`.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [storyArg, ...rest] = process.argv.slice(2);
if (!storyArg) {
  console.error('Pakai: npm run test:story -- <nomor|S2CML-xxxx> [opsi playwright]');
  process.exit(2);
}

const key = /^\d+$/.test(storyArg) ? `S2CML-${storyArg}` : storyArg.toUpperCase();
const testsDir = path.resolve(__dirname, '..', 'tests');
const dirs = fs
  .readdirSync(testsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('bucket'))
  .map((d) => path.join('tests', d.name, key))
  .filter((p) => fs.existsSync(path.resolve(__dirname, '..', p)));

if (!dirs.length) {
  console.error(`Folder story ${key} tidak ditemukan di tests/bucket*/.`);
  process.exit(2);
}

const args = ['playwright', 'test', ...dirs.map((d) => d.replace(/\\/g, '/')), '--project=chromium', ...rest];
console.log(`> npx ${args.join(' ')}`);
const r = spawnSync('npx', args, { stdio: 'inherit', shell: true, cwd: path.resolve(__dirname, '..') });
process.exit(r.status ?? 1);
