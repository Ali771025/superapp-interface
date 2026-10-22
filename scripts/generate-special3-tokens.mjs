import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourcePath = `${root}/src/special3/tokens/source.json`;
const templatePath = `${root}/src/special3/tokens/generated.css.tpl`;
const outputPath = `${root}/src/special3/tokens/generated.css`;

const get = (source, path) => path.split('.').reduce((value, key) => value?.[key], source)?.$value;
function format(path, value) {
  if (Array.isArray(value)) return `cubic-bezier(${value.join(',')})`;
  if (path.startsWith('typography.font.')) return String(value).split(',').map((part) => /\s/.test(part.trim()) && !/^(ui-|system-ui|-apple-system|sans-serif|monospace)/.test(part.trim()) ? `"${part.trim()}"` : part.trim()).join(',');
  return String(value);
}

export async function generateSpecial3Tokens() {
  const [source, template] = await Promise.all([readFile(sourcePath,'utf8').then(JSON.parse), readFile(templatePath,'utf8')]);
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = get(source, path);
    if (value === undefined) throw new Error(`Unknown token placeholder: ${path}`);
    return format(path, value);
  });
}

const generated = await generateSpecial3Tokens();
if (process.argv.includes('--check')) {
  const current = await readFile(outputPath,'utf8');
  if (current !== generated) { console.error('SPECIAL token drift detected. Run npm run generate:special3-tokens.'); process.exit(1); }
  console.log('PASS complete SPECIAL token artifact is deterministic');
} else {
  await writeFile(outputPath, generated);
  console.log('Generated src/special3/tokens/generated.css from source.json');
}
