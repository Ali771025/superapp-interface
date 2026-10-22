import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const executablePath = process.env.CHROMIUM_PATH;
if (!executablePath) throw new Error('CHROMIUM_PATH is required');
const mode = process.env.RUN_C_MODE ?? 'final';
const outputRoot = resolve(process.env.RUN_C_OUTPUT ?? `artifacts/run_c/${mode}`);
const screenshotRoot = resolve(outputRoot, 'screenshots');
await mkdir(screenshotRoot, { recursive: true });

process.env.VITE_SPECIAL3_SHELL_ENABLED = 'true';
const vite = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
await vite.listen();
const address = vite.httpServer?.address();
if (!address || typeof address === 'string') throw new Error('Vite address unavailable');
const baseUrl = `http://127.0.0.1:${address.port}`;
const runtimeModule = await vite.ssrLoadModule('/src/special3/convergence/runtimeBindings.ts');
const allBindings = runtimeModule.runtimeBindings;
const runtimeUrl = runtimeModule.runtimeUrl;
if (allBindings.length !== 90) throw new Error(`Expected 90 canonical bindings, found ${allBindings.length}`);

const gate0Ids = new Set(['WF-SHD-08', 'WF-EDGE-02', 'WF-EDGE-03', 'WF-ACT-05', 'WF-EXP-02', 'WF-EXP-03', 'WF-EXP-04']);
const productProof = {
  'WF-SHD-08': ['SHIELD referral network', 'Direct SHIELD referrals'],
  'WF-EDGE-02': ['learning path', 'SOURCE HIERARCHY'],
  'WF-EDGE-03': ['Placement assessment', '18 QUESTIONS'],
  'WF-ACT-05': ['Product eligibility check', 'Product provider rejected eligibility'],
  'WF-EXP-02': ['SHIELD lifecycle history', 'PROVIDER LEDGER'],
  'WF-EXP-03': ['Forecast network history', 'FORECAST RECORDS'],
  'WF-EXP-04': ['Product Prize transaction', 'PRIZE ≠ REWARD ≠ DIVIDEND ≠ INCOME'],
};
const bindings = mode === 'gate0' ? allBindings.filter((binding) => gate0Ids.has(binding.wireframeId)) : allBindings;

const browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--hide-scrollbars'] });
const assertions = [];
const records = [];
const pass = (name, condition, detail = '') => {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
  assertions.push(name);
};
const sha256 = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
const slug = (binding) => `${binding.wireframeId.toLowerCase()}--${binding.state.replace(/[^a-z0-9]+/gi, '-')}`;

const makeContext = async (width, height) => {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: 'dark', reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    localStorage.setItem('eternity-theme', 'dark');
    localStorage.setItem('eternity-language-v1', 'en');
    sessionStorage.setItem('eternity:intro-seen', '1');
  });
  return context;
};

const capture = async (context, binding, viewportName, width, height) => {
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  const url = runtimeUrl(binding);
  await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' });
  await page.locator('[data-s3-shell]').waitFor({ state: 'visible' });
  await page.evaluate(async () => document.fonts.ready);
  const truth = await page.evaluate(({ expected, proofs }) => {
    const root = document.querySelector(`[data-wireframe-id="${expected.wireframeId}"]`);
    const body = document.querySelector('.recovery-shell__body');
    const text = (body?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const interactive = [...document.querySelectorAll('button,a[href],input,select,textarea')].filter((node) => {
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    const unnamedControls = interactive.filter((node) => {
      const explicit = node.getAttribute('aria-label') || node.getAttribute('title');
      const labelledBy = node.getAttribute('aria-labelledby');
      const labelledText = labelledBy ? document.getElementById(labelledBy)?.textContent : '';
      const fieldName = (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) ? node.placeholder || (node instanceof HTMLInputElement && node.type === 'file') : false;
      const nativeLabel = node.closest('label')?.textContent || (node.id ? document.querySelector(`label[for="${CSS.escape(node.id)}"]`)?.textContent : '');
      return !(explicit || labelledText || nativeLabel || (node.textContent ?? '').trim() || fieldName);
    }).length;
    return {
      found: Boolean(root),
      wireframeId: root?.getAttribute('data-wireframe-id') ?? null,
      canonicalState: root?.getAttribute('data-canonical-state') ?? null,
      component: root?.getAttribute('data-resolved-component') ?? null,
      bodyTextLength: text.length,
      overflowPx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      visibleQaPanel: Boolean(document.querySelector('.cd-canonical-state,[data-canonical-state-panel]')),
      visibleWireframeId: text.includes(expected.wireframeId),
      visibleComponentName: text.includes(expected.component),
      visibleDiagnosticCopy: /CANONICAL STATE|owns the resolved .+ state|current-design identity/i.test(text),
      productProof: proofs.length === 0 || proofs.every((proof) => text.includes(proof)),
      unnamedControls,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      theme: document.documentElement.dataset.theme,
    };
  }, { expected: binding, proofs: productProof[binding.wireframeId] ?? [] });
  pass(`${binding.wireframeId} ${viewportName} root`, truth.found, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} wireframe`, truth.wireframeId === binding.wireframeId, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} state`, truth.canonicalState === binding.state, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} component`, truth.component === binding.component, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} nonblank`, truth.bodyTextLength >= 20, String(truth.bodyTextLength));
  pass(`${binding.wireframeId} ${viewportName} overflow`, truth.overflowPx <= 1, String(truth.overflowPx));
  pass(`${binding.wireframeId} ${viewportName} no visible QA panel`, !truth.visibleQaPanel, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} no visible wireframe ID`, !truth.visibleWireframeId, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} no visible component name`, !truth.visibleComponentName, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} no diagnostic prose`, !truth.visibleDiagnosticCopy, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} Product state`, truth.productProof, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} accessibility names`, truth.unnamedControls === 0, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} reduced motion`, truth.reducedMotion, JSON.stringify(truth));
  pass(`${binding.wireframeId} ${viewportName} errors`, pageErrors.length === 0 && consoleErrors.length === 0, [...pageErrors, ...consoleErrors].join(' | '));
  const directory = resolve(screenshotRoot, viewportName);
  await mkdir(directory, { recursive: true });
  const filename = `${viewportName}/${slug(binding)}.png`;
  const filePath = resolve(screenshotRoot, filename);
  await page.screenshot({ path: filePath, type: 'png', fullPage: true, animations: 'disabled' });
  records.push({ binding, runtimeUrl: url, viewport: { name: viewportName, width, height }, filename, sha256: await sha256(filePath), truth, pageErrors, consoleErrors });
  await page.close();
};

try {
  const mobile = await makeContext(390, 844);
  const desktop = await makeContext(1440, 900);
  for (const binding of bindings) await Promise.all([
    capture(mobile, binding, 'mobile', 390, 844),
    capture(desktop, binding, 'desktop', 1440, 900),
  ]);
  const result = { run: 'RUN_C_FINAL_ACCEPTANCE', mode, generatedAt: new Date().toISOString(), canonicalBindingCount: allBindings.length, selectedBindingCount: bindings.length, recordCount: records.length, assertionCount: assertions.length, assertions, records };
  await writeFile(resolve(outputRoot, mode === 'gate0' ? 'RUN_C_GATE0_CANONICAL_STATE_RECORDS.json' : 'RUN_C_CANONICAL_90_RECORDS.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`RUN C ${mode.toUpperCase()} CANONICAL PASS · ${bindings.length} bindings · ${records.length} records · ${assertions.length} assertions`);
  await Promise.all([mobile.close(), desktop.close()]);
} finally {
  await browser.close();
  await vite.close();
}
