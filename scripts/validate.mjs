import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync('extension.schema.json', 'utf8'));
const validate = ajv.compile(schema);

const extensionsDir = path.resolve('extensions');
const folders = fs.readdirSync(extensionsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let hasErrors = false;

for (const folder of folders) {
  const themePath = path.join(extensionsDir, folder, 'theme.json');
  if (!fs.existsSync(themePath)) {
    console.error(`❌ [${folder}]: Missing theme.json in submodule`);
    hasErrors = true;
    continue;
  }

  let themeData;
  try {
    themeData = JSON.parse(fs.readFileSync(themePath, 'utf8'));
  } catch (err) {
    console.error(`❌ [${folder}]: Invalid JSON syntax:`, err.message);
    hasErrors = true;
    continue;
  }

  if (themeData.id !== folder) {
    console.error(`❌ [${folder}]: Folder name does not match theme.id "${themeData.id}"`);
    hasErrors = true;
  }

  const valid = validate(themeData);
  if (!valid) {
    console.error(`❌ [${folder}]: Schema validation errors:`, validate.errors);
    hasErrors = true;
  } else {
    console.log(`✅ [${folder}]: Valid theme manifest`);
  }
}

if (hasErrors) process.exit(1);
