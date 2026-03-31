const fs = require('fs');
const path = require('path');

function extractKeys(obj, prefix = '') {
  let keys = new Set();
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      extractKeys(obj[key], prefix + key + '.').forEach(k => keys.add(k));
    } else {
      keys.add(prefix + key);
    }
  }
  return keys;
}

const i18nContents = fs.readFileSync('c:\\Users\\estde\\Documents\\GitHub\\Site Web\\Poke\\src\\lib\\i18n-resources.ts', 'utf8');
const cleanI18n = i18nContents.replace(/export const resources[^=]*=/, 'const resources =');

let validKeys = new Set();
try {
  const fn = new Function(`${cleanI18n}\nreturn resources.en.translation;`);
  const translationObj = fn();
  validKeys = extractKeys(translationObj);
} catch(e) {
  console.error("Error", e);
  process.exit(1);
}

function walkDir(dir) {
  let results = [];
  if (dir.includes('node_modules') || dir.includes('.next')) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const allFiles = walkDir('c:\\Users\\estde\\Documents\\GitHub\\Site Web\\Poke\\src');
let invalidKeys = [];

// Matches t('key') or t("key") ignoring variables right now.
const tRegex = /(?:[^a-zA-Z0-9_]t\(|[^a-zA-Z0-9_]i18n\.t\()[\s]*['"`](.+?)['"`][,\)]/g;

allFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    if (key.includes('${') || key.includes('{{')) continue;
    
    let isPrefix = false;
    for (const validKey of validKeys) {
      if (validKey === key || validKey.startsWith(key + '.')) {
        isPrefix = true;
        break;
      }
    }
    
    if (!isPrefix) {
      invalidKeys.push({ file: f, key });
    }
  }
});

fs.writeFileSync('c:\\Users\\estde\\Documents\\GitHub\\Site Web\\Poke\\tmp\\invalid-keys.txt', invalidKeys.map(k => `${k.file} ::: ${k.key}`).join('\n'), 'utf8');
console.log('Done, wrote to invalid-keys.txt');
