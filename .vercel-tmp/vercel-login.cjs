const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';
const LOG_FILE = path.join(__dirname, 'login.log');
const ALLOWED_COMMANDS = new Set(['vercel']);
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
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function waitForAuthUrl() {
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const match = content.match(/https:\/\/vercel\.com\/oauth\/device\?user_code=[A-Z0-9-]+(?=\s|$)/);
        if (match) return match[0];
      }
    } catch (e) { if (e.code !== 'ENOENT') log(`Warning: ${e.code || e.message}`); }
  }
  return null;
}
function openBrowser(url) {
  const urlPattern = /^https:\/\/vercel\.com\/oauth\/device\?user_code=[A-Z0-9-]+$/;
  if (!urlPattern.test(url)) { log(`URL pattern mismatch`); return; }
  try {
    if (os.platform() === 'win32') spawnSync('powershell', ['-Command', `Start-Process '${url}'`], { stdio: 'ignore', windowsHide: true });
    else if (os.platform() === 'darwin') spawnSync('open', [url], { stdio: 'ignore' });
    else spawnSync('xdg-open', [url], { stdio: 'ignore' });
    log('Browser opened automatically');
  } catch (error) { log(`Failed to open browser: ${error.message}`); }
}
async function main() {
  if (!commandExists('vercel')) { log('Vercel CLI not installed'); process.exit(1); }
  const whoami = getCommandOutput('vercel', ['whoami']);
  if (whoami && !whoami.includes('Error') && !whoami.includes('not logged in')) { log(`Already logged in as: ${whoami}`); process.exit(0); }
  const logStream = fs.openSync(LOG_FILE, 'w');
  const child = spawn('vercel', ['login'], { detached: true, stdio: ['ignore', logStream, logStream], shell: isWindows });
  child.unref();
  const authUrl = await waitForAuthUrl();
  if (authUrl) {
    openBrowser(authUrl);
    console.log(JSON.stringify({ status: 'needs_auth', auth_url: authUrl, log_file: LOG_FILE }));
  } else {
    log('Failed to get authorization URL');
    try { log(fs.readFileSync(LOG_FILE, 'utf8')); } catch {}
    process.exit(1);
  }
}
main();
