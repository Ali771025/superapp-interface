import { pathToFileURL } from 'node:url';

const requiredContracts = ['GENERATOR','FAN','FORECAST','INSURANCE','EES','ERA','QORA','ETER_TOKEN','Q_TOKEN','ET_TOKEN'];
export function validateProductionEnv(env) {
  const errors = [];
  if (env.VITE_PREVIEW_MODE !== 'false') errors.push('VITE_PREVIEW_MODE must be false');
  if (env.VITE_QA_CONNECTED_USER !== 'false') errors.push('VITE_QA_CONNECTED_USER must be false');
  if (env.VITE_ADAPTERS_AUDITED !== 'true') errors.push('VITE_ADAPTERS_AUDITED must be true');
  if (env.VITE_SPECIAL3_SHELL_ENABLED !== 'true') errors.push('VITE_SPECIAL3_SHELL_ENABLED must be true');
  for (const key of requiredContracts) {
    const value = env[`VITE_${key}_ADDRESS`]?.trim();
    if (!value || /^0x0{40}$/i.test(value)) errors.push(`VITE_${key}_ADDRESS is required`);
  }
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const errors = validateProductionEnv(process.env);
  if (errors.length) { console.error(`Unsafe production environment:\n- ${errors.join('\n- ')}`); process.exit(1); }
  console.log('PASS production environment guard');
}
