const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script untuk membaca struktur desain Figma (Node tree, teks, form fields, label)
 * Penggunaan:
 *   node scripts/read-figma.js <Figma_URL_atau_File_Key> [--pages]
 */

const token = process.env.FIGMA_ACCESS_TOKEN;

if (!token) {
  console.error('❌ Error: FIGMA_ACCESS_TOKEN belum diset di .env!');
  process.exit(1);
}

const inputArg = process.argv[2] || process.env.FIGMA_FILE_KEY;
const isListPages = process.argv.includes('--pages');

if (!inputArg) {
  console.error('❌ Error: Berikan URL Figma atau File Key!');
  console.error('Contoh: node scripts/read-figma.js "https://www.figma.com/design/xyz123/LAMOS"');
  process.exit(1);
}

function extractFileKey(input) {
  const match = input.match(/(?:file|design)\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return input.split('?')[0].trim();
}

function extractNodeId(input) {
  if (isListPages) return null;
  const match = input.match(/node-id=([a-zA-Z0-9%_-]+)/);
  if (match) {
    return decodeURIComponent(match[1]).replace('-', ':');
  }
  return null;
}

const fileKey = extractFileKey(inputArg);
const targetNodeId = extractNodeId(inputArg);

console.log(`🔍 Memproses Figma File Key: ${fileKey}`);

async function listAllPages() {
  console.log(`📡 Mengambil daftar halaman (pages) dari file Figma...`);
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=2`, {
    headers: { 'X-Figma-Token': token }
  });
  if (!res.ok) {
    throw new Error(`Figma API Error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log(`\n======================================================`);
  console.log(`📄 Dokumen: "${data.name}"`);
  console.log(`======================================================`);
  data.document.children.forEach((page, idx) => {
    console.log(`\n📌 [Page ${idx + 1}] "${page.name}" (ID: ${page.id})`);
    if (page.children && page.children.length > 0) {
      page.children.slice(0, 15).forEach((frame, fIdx) => {
        console.log(`   ${fIdx + 1}. [${frame.type}] "${frame.name}" (Node ID: ${frame.id.replace(':', '-')})`);
      });
      if (page.children.length > 15) {
        console.log(`   ... dan ${page.children.length - 15} frame lainnya.`);
      }
    }
  });
  console.log(`======================================================\n`);
}

async function fetchFigmaData() {
  const endpoint = targetNodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(targetNodeId)}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  console.log(`🎯 Target Node ID: ${targetNodeId || 'Seluruh Dokumen'}`);
  console.log(`📡 Menghubungi Figma API...`);

  const res = await fetch(endpoint, {
    headers: { 'X-Figma-Token': token }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Figma API Error (${res.status} ${res.statusText}): ${errText}`);
  }

  return await res.json();
}

function extractElements(node, results = { textItems: [], frames: [], components: [] }, currentSection = 'Root') {
  if (!node) return results;

  const nodeName = node.name || '';
  const nodeType = node.type || '';

  if (nodeType === 'FRAME' || nodeType === 'SECTION' || nodeType === 'GROUP' || nodeType === 'CANVAS') {
    results.frames.push({
      id: node.id,
      name: nodeName,
      type: nodeType
    });
    currentSection = nodeName;
  }

  if (nodeType === 'COMPONENT' || nodeType === 'INSTANCE') {
    results.components.push({
      id: node.id,
      name: nodeName,
      section: currentSection
    });
  }

  if (nodeType === 'TEXT' && node.characters) {
    const text = node.characters.trim();
    if (text) {
      results.textItems.push({
        id: node.id,
        text: text,
        section: currentSection
      });
    }
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractElements(child, results, currentSection);
    }
  }

  return results;
}

async function main() {
  try {
    if (isListPages) {
      await listAllPages();
      return;
    }

    const figmaJson = await fetchFigmaData();
    const rootNode = targetNodeId
      ? (figmaJson.nodes && figmaJson.nodes[targetNodeId]?.document)
      : figmaJson.document;

    const documentName = figmaJson.name || 'Figma Document';
    const extracted = extractElements(rootNode);

    const outDir = path.resolve(__dirname, '../explore-output/figma');
    fs.mkdirSync(outDir, { recursive: true });

    const safeFilename = targetNodeId ? `${fileKey}_node_${targetNodeId.replace(':', '-')}.json` : `${fileKey}.json`;
    const outFilePath = path.join(outDir, safeFilename);

    const uniqueTexts = Array.from(new Set(extracted.textItems.map(t => t.text)));
    const summary = {
      documentName,
      fileKey,
      targetNodeId,
      lastModified: figmaJson.lastModified,
      totalFrames: extracted.frames.length,
      totalComponents: extracted.components.length,
      totalTextElements: extracted.textItems.length,
      uniqueTexts,
      extracted
    };

    fs.writeFileSync(outFilePath, JSON.stringify(summary, null, 2));

    console.log(`\n======================================================`);
    console.log(`✅ BERHASIL MEMBACA DESAIN FIGMA`);
    console.log(`======================================================`);
    console.log(`Dokumen             : "${documentName}"`);
    console.log(`Target Node         : ${targetNodeId || 'Seluruh Dokumen'}`);
    console.log(`Output disimpan di  : ${outFilePath}`);
    console.log(`Total Frame/Section : ${extracted.frames.length}`);
    console.log(`Total Komponen      : ${extracted.components.length}`);
    console.log(`Total Elemen Teks   : ${extracted.textItems.length}`);
    console.log(`Jumlah Teks Unik    : ${uniqueTexts.length}`);
    console.log(`======================================================\n`);

    console.log(`Daftar Teks & Label Desain:`);
    uniqueTexts.forEach((t, idx) => {
      console.log(`  ${idx + 1}. "${t}"`);
    });
    console.log(`\n======================================================\n`);
  } catch (err) {
    console.error('❌ Gagal:', err.message);
    process.exit(1);
  }
}

main();
