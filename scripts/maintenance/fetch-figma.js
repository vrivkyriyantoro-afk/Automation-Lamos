const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const token = (process.env.FIGMA_TOKEN || '').trim();
const fileKey = 'hayDfdzm40LHECLlcVsebo';
const nodeId = '488:173708';

console.log(`📡 Fetching Figma Node ${nodeId} from ${fileKey}...`);

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
  headers: { 'X-Figma-Token': token }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    if (res.statusCode !== 200) {
      console.error('Error Response:', data);
      process.exit(1);
    }
    try {
      const parsed = JSON.parse(data);
      const targetNode = parsed.nodes ? parsed.nodes[nodeId] : null;
      if (!targetNode) {
        console.error('Node not found in response!');
        process.exit(1);
      }

      const outPath = path.resolve(__dirname, '../../explore-output/figma/figma-488-173708.json');
      fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
      console.log(`✅ Saved full node to ${outPath}`);

      // Extract texts and structure
      const texts = [];
      const components = [];
      function walk(node, parent = '') {
        if (!node) return;
        if (node.type === 'TEXT' && node.characters) {
          texts.push({ id: node.id, text: node.characters.trim(), parent });
        }
        if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
          components.push({ id: node.id, name: node.name, type: node.type });
        }
        if (node.children) {
          node.children.forEach(c => walk(c, node.name || parent));
        }
      }
      walk(targetNode.document);

      const uniqueTexts = Array.from(new Set(texts.map(t => t.text).filter(Boolean)));
      const summary = {
        name: targetNode.document.name,
        type: targetNode.document.type,
        totalTextCount: texts.length,
        uniqueTextsCount: uniqueTexts.length,
        componentsCount: components.length,
        uniqueTexts,
        components: components.slice(0, 30)
      };

      const summaryPath = path.resolve(__dirname, '../../explore-output/figma/figma-488-173708-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log(`✅ Saved summary to ${summaryPath}`);
      console.log('Document Name:', targetNode.document.name);
      console.log('Document Type:', targetNode.document.type);
      console.log('Total Texts:', texts.length);
      console.log('Unique Texts:', uniqueTexts.length);
    } catch (e) {
      console.error('JSON Parse error:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Network error:', e.message);
});
