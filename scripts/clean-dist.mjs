import { rm } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const target = resolve(process.cwd(),'dist');
if (basename(target) !== 'dist' || target === resolve(process.cwd())) throw new Error(`Refusing unsafe build cleanup target: ${target}`);
await rm(target,{recursive:true,force:true});
