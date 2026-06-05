#!/usr/bin/env node
const { spawnSync } = require('child_process');
const os = require('os');
const isWindows = os.platform() === 'win32';
const ALLOWED_COMMANDS = new Set(['node', 'npm', 'pnpm', 'yarn', 'vercel']);
function log(msg) { console.error(msg); }
function commandExists(cmd) {
  if (!ALLOWED_COMMANDS.has(cmd)) throw new Error(`Command not in whitelist: ${cmd}`);
  try {
    if (isWindows) { const r = spawnSync('where', [cmd], { stdio: 'ignore' }); return r.status === 0; }
    else { const r = spawnSync('sh', ['-c', `command -v "$1"`, '--', cmd], { stdio: 'ignore' }); return r.status === 0; }
  } catch { return false; }
}
function getCommandOutput(cmd, args) {
  try { const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], shell: isWindows }); return r.status === 0 ? (r.stdout || '').trim() : null; }
  catch { return null; }
}
function main() {
  if (!commandExists('node')) { log('Error: Node.js not installed'); process.exit(1); }
  if (commandExists('vercel')) { log('Vercel CLI already installed'); process.exit(0); }
  const pm = commandExists('pnpm') ? 'pnpm' : commandExists('yarn') ? 'yarn' : 'npm';
  const cmds = { pnpm: ['pnpm', ['add', '-g', 'vercel']], yarn: ['yarn', ['global', 'add', 'vercel']], npm: ['npm', ['install', '-g', 'vercel']] };
  log(`Installing Vercel CLI via ${pm}...`);
  spawnSync(cmds[pm][0], cmds[pm][1], { stdio: 'inherit', shell: isWindows });
  if (commandExists('vercel')) { log('Vercel CLI installed successfully'); } else { log('Install failed'); process.exit(1); }
}
main();
