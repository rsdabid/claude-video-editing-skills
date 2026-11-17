// open.js: starts the Review Desk if it isn't running and opens it in the default browser, optionally on one video.
//   node open.js                      -> the newest video
//   node open.js "My Cut v2.mp4"      -> that video
//   node open.js "My Cut v2.mp4" "My Cut v1.mp4"   -> side by side (Compare)
const {spawn, exec} = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cfgFile = path.join(__dirname, 'config.json');
const port = (fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, 'utf8')).port : 0) || 7905;
const [v, cmp] = process.argv.slice(2);
const url = `http://127.0.0.1:${port}/` + (v ? `?v=${encodeURIComponent(v)}` + (cmp ? `&cmp=${encodeURIComponent(cmp)}` : '') : '');

const alive = () => new Promise((ok) => http.get(`http://127.0.0.1:${port}/api/config`, (r) => { r.resume(); ok(r.statusCode === 200); }).on('error', () => ok(false)));
const openUrl = (u) => exec(process.platform === 'win32' ? `start "" "${u}"` : process.platform === 'darwin' ? `open "${u}"` : `xdg-open "${u}"`);

(async () => {
  if (!(await alive())) {
    spawn(process.execPath, [path.join(__dirname, 'server.js')], {cwd: __dirname, detached: true, stdio: 'ignore', windowsHide: true}).unref();
    for (let i = 0; i < 40 && !(await alive()); i++) await new Promise((r) => setTimeout(r, 250));
  }
  openUrl(url);
  console.log('Review Desk:', url);
})();
