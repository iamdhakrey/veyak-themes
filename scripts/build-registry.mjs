import fs from 'node:fs';
import path from 'node:path';

const extensionsDir = path.resolve('extensions');
const folders = fs.readdirSync(extensionsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const registry = [];

for (const folder of folders) {
  const themePath = path.join(extensionsDir, folder, 'theme.json');
  const readmePath = path.join(extensionsDir, folder, 'README.md');
  if (!fs.existsSync(themePath)) continue;

  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
  const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';

  registry.push({
    ...theme,
    downloadUrl: `https://raw.githubusercontent.com/iamdhakrey/veyak-themes/main/extensions/${folder}/theme.json`,
    readmeContent: readme,
    lastUpdated: new Date().toISOString()
  });
}

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/registry.json', JSON.stringify(registry, null, 2));
fs.writeFileSync('dist/registry.min.json', JSON.stringify(registry));
console.log(`Generated registry with ${registry.length} themes.`);
