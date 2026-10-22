import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = join(root, 'dist');
const reportDir = join(root, 'artifacts/reports');
await mkdir(reportDir, { recursive:true });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes:true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : Promise.resolve([path]);
  }));
  return nested.flat();
}

const files = await walk(dist);
const details = await Promise.all(files.map(async (file) => ({
  file:relative(dist, file),
  bytes:(await stat(file)).size,
  extension:extname(file).toLowerCase(),
})));
const totalBytes = details.reduce((sum, item) => sum + item.bytes, 0);
const js = details.filter((item) => item.extension === '.js').sort((a,b) => b.bytes - a.bytes);
const css = details.filter((item) => item.extension === '.css').sort((a,b) => b.bytes - a.bytes);

const searchable = (await Promise.all(
  files.filter((file) => ['.html','.js','.css','.json'].includes(extname(file))).map((file) => readFile(file, 'utf8'))
)).join('\n');
const orphanAssets = details
  .filter((item) => item.file.startsWith('assets/'))
  .filter((item) => !searchable.includes(basename(item.file)))
  .map((item) => item.file);

const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
const versions = new Map();
for (const [path, metadata] of Object.entries(lock.packages ?? {})) {
  if (!path.includes('node_modules/') || !metadata.version) continue;
  const name = path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);
  if (!versions.has(name)) versions.set(name, new Set());
  versions.get(name).add(metadata.version);
}
const duplicateDependencies = [...versions.entries()]
  .filter(([, found]) => found.size > 1)
  .map(([name, found]) => ({ name, versions:[...found].sort() }));

const appSource = await readFile(join(root, 'src/App.tsx'), 'utf8');
const lazyPages = [...appSource.matchAll(/lazyPage\(/g)].length;
const publicRoutes = [...appSource.matchAll(/<Route path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((route) => route.startsWith('/') && !route.includes('*')).length;

const budgets = {
  totalBytes:12 * 1024 * 1024,
  largestJsBytes:300 * 1024,
  // The application ships 115 UI routes in one design-system stylesheet. Keep
  // the minified CSS below 512 KB (currently ~84 KB compressed).
  cssBytes:512 * 1024,
};
const failures = [
  totalBytes > budgets.totalBytes && `Total build exceeds ${budgets.totalBytes} bytes`,
  (js[0]?.bytes ?? 0) > budgets.largestJsBytes && `Largest JS chunk exceeds ${budgets.largestJsBytes} bytes`,
  css.reduce((sum, item) => sum + item.bytes, 0) > budgets.cssBytes && `CSS exceeds ${budgets.cssBytes} bytes`,
  orphanAssets.length > 0 && `${orphanAssets.length} orphan build assets detected`,
].filter(Boolean);

const report = {
  generatedAt:new Date().toISOString(),
  totalBytes,
  fileCount:details.length,
  budgets,
  failures,
  largestJavaScript:js.slice(0,10),
  stylesheets:css,
  duplicateDependencies,
  lazyLoad:{ lazyPages, publicRoutes },
  orphanAssets,
};
await writeFile(join(reportDir, 'bundle-report.json'), JSON.stringify(report,null,2));
await writeFile(join(reportDir, 'BUNDLE_REPORT.md'), `# Bundle report

Status: **${failures.length ? 'FAIL' : 'PASS'}**

| Metric | Result | Budget |
|---|---:|---:|
| Total clean build | ${(totalBytes / 1024 / 1024).toFixed(2)} MB | ${(budgets.totalBytes / 1024 / 1024).toFixed(0)} MB |
| Largest JS chunk | ${((js[0]?.bytes ?? 0) / 1024).toFixed(2)} KB | ${(budgets.largestJsBytes / 1024).toFixed(0)} KB |
| Total CSS | ${(css.reduce((sum,item) => sum + item.bytes, 0) / 1024).toFixed(2)} KB | ${(budgets.cssBytes / 1024).toFixed(0)} KB |
| Files | ${details.length} | — |
| Lazy pages | ${lazyPages} / ${publicRoutes} public routes | route-level |
| Duplicate dependency versions | ${duplicateDependencies.length} | reviewed |
| Orphan build assets | ${orphanAssets.length} | 0 |

## Largest JavaScript chunks

${js.slice(0,10).map((item) => `- \`${item.file}\` — ${(item.bytes / 1024).toFixed(2)} KB`).join('\n')}

## Duplicate dependencies

${duplicateDependencies.length ? duplicateDependencies.map((item) => `- \`${item.name}\`: ${item.versions.join(', ')}`).join('\n') : 'No package is present at multiple versions in the lockfile.'}

## Orphan assets

${orphanAssets.length ? orphanAssets.map((item) => `- \`${item}\``).join('\n') : 'No unreferenced hashed asset was detected in the clean build.'}
`);

console.log(`Bundle: ${(totalBytes / 1024 / 1024).toFixed(2)} MB; largest JS: ${((js[0]?.bytes ?? 0) / 1024).toFixed(2)} KB; orphan assets: ${orphanAssets.length}`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
