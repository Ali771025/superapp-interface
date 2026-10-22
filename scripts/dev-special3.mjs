import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const env = {
  ...process.env,
  VITE_PREVIEW_MODE:'true', VITE_QA_CONNECTED_USER:'true', VITE_SPECIAL3_SHELL_ENABLED:'true',
  VITE_SPECIAL3_PROGRESSION_MODE:'legacy', VITE_ADAPTERS_AUDITED:'false',
  ...Object.fromEntries(['GENERATOR','SHIELD','STOCK','FORECAST','FAN','ERA','EID','SWAP','EDGE'].map((name) => [`VITE_SPECIAL3_${name}_PRESENTATION`,'special'])),
};
const child = spawn(process.execPath, [vite, ...process.argv.slice(2)], { stdio:'inherit', env });
child.on('exit', (code, signal) => signal ? process.kill(process.pid, signal) : process.exit(code ?? 1));
