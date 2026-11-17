// Review Desk: a Frame.io-style review tool for a video editor (human or Claude) and the person reviewing.
// Plays the renders in the folders listed in config.json; the reviewer pins text notes, ranges and drawings to exact
// frames; notes save instantly to notes/<video>.json (drawings as PNG next to them), where the editor reads them.
// No dependencies: node server.js -> http://localhost:<port>   (see README-FOR-CLAUDE.md)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {execFile} = require('child_process');

const ROOT = __dirname;
const CFG = Object.assign({port: 7905, reviewer: 'You', editor: 'Claude', fps: 60, folders: ['videos']},
  fs.existsSync(path.join(ROOT, 'config.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8')) : {});
const PORT = Number(process.env.PORT || CFG.port);
const NOTES = path.join(ROOT, 'notes');
// folders whose .mp4 files show up in the list (newest first); relative paths are relative to this folder
const FOLDERS = CFG.folders.map((d) => path.resolve(ROOT, d));
FOLDERS.forEach((d) => { try { fs.mkdirSync(d, {recursive: true}); } catch (e) {} });
fs.mkdirSync(NOTES, {recursive: true});

const safe = (s) => String(s).replace(/[^a-zA-Z0-9 ._()-]/g, '_');
const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

// "Reel 1 - blue v4.mp4" -> base "Reel 1 - blue", ver "4" (sort key 4.0); "v1b" -> ver "1b"
const parse = (f) => {
  const m = /^(.*?)\s+v(\d+)([a-z]?)\.mp4$/i.exec(f);
  return m ? {base: m[1], ver: m[2] + m[3], key: Number(m[2]) + (m[3] ? (m[3].toLowerCase().charCodeAt(0) - 96) / 100 : 0)} : {base: f.replace(/\.mp4$/i, ''), ver: '', key: 0};
};
const notesOf = (name) => {
  const f = path.join(NOTES, safe(name) + '.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
};
// Voice notes: the browser records audio, it is saved next to the notes, and whisper.cpp writes the words into the note's text.
const BIN_ENV = {...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}`};
const MODEL = (CFG.whisperModel || '~/whisper-models/ggml-small.bin').replace(/^~/, os.homedir());
const AUDIO_TYPES = {webm: 'audio/webm', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav'};
const run = (bin, args) => new Promise((ok, no) => execFile(bin, args, {env: BIN_ENV, maxBuffer: 1 << 26}, (e, out) => (e ? no(e) : ok(out))));
function patchNote(name, id, fn) { saveNotes(name, notesOf(name).map((n) => (n.id === id ? fn(n) : n))); }
async function transcribe(name, id, file) {
  const wav = path.join(os.tmpdir(), `rd_${id}.wav`);
  try {
    await run('ffmpeg', ['-nostdin', '-v', 'error', '-i', path.join(NOTES, file), '-ar', '16000', '-ac', '1', '-y', wav]);
    const out = await run('whisper-cli', ['-m', MODEL, '-f', wav, '-l', 'en', '-nt', '-np', '-t', '6']);
    const said = out.split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
    patchNote(name, id, ({transcribing, ...n}) => ({...n, transcript: said, text: [n.text, said].filter(Boolean).join('\n')}));
  } catch (e) {
    patchNote(name, id, ({transcribing, ...n}) => ({...n, transcript_error: String(e.message || e).slice(0, 200)}));
  } finally { fs.rm(wav, {force: true}, () => {}); }
}
const mtimeOr0 = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);

function listVideos() {
  const out = [];
  FOLDERS.forEach((dir, fi) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      if (!f.toLowerCase().endsWith('.mp4') || f.startsWith('_') || /\(phone\)/i.test(f)) continue;  // phone copies + temp files are noise
      const st = fs.statSync(path.join(dir, f));
      const list = notesOf(f);
      const lastNote = list.reduce((m, n) => Math.max(m, Date.parse(n.at || 0) || 0), 0);
      const sub = mtimeOr0(path.join(NOTES, safe(f) + '.submitted'));
      out.push({id: `${fi}/${f}`, name: f, fps: (CFG.fpsByName || {})[parse(f).base] || CFG.fps, folder: path.basename(dir), mtime: st.mtimeMs, size: st.size, notes: list.length,
        open: list.filter((n) => !n.done).length, sent: sub > 0 && sub >= lastNote, ...parse(f),
        status: fs.existsSync(path.join(NOTES, safe(f) + '.status')) ? fs.readFileSync(path.join(NOTES, safe(f) + '.status'), 'utf8') : 'none'});
    }
  });
  return out.sort((a, b) => b.mtime - a.mtime);
}

function videoPath(id) {
  const [fi, ...rest] = id.split('/');
  const name = rest.join('/');
  const dir = FOLDERS[Number(fi)];
  if (!dir || name.includes('..')) return null;
  const p = path.join(dir, name);
  return fs.existsSync(p) ? p : null;
}

function streamVideo(req, res, p) {
  const size = fs.statSync(p).size;
  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m[1] ? Number(m[1]) : 0;
    let end = m[2] ? Number(m[2]) : Math.min(size - 1, start + 8 * 1024 * 1024);
    if (start >= size) { res.writeHead(416, {'Content-Range': `bytes */${size}`}); return res.end(); }
    end = Math.min(end, size - 1);
    res.writeHead(206, {'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': 'video/mp4'});
    fs.createReadStream(p, {start, end}).pipe(res);
  } else {
    res.writeHead(200, {'Content-Length': size, 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes'});
    fs.createReadStream(p).pipe(res);
  }
}

const readBody = (req) => new Promise((ok) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => ok(b)); });
const saveNotes = (name, list) => fs.writeFileSync(path.join(NOTES, safe(name) + '.json'), JSON.stringify(list, null, 1));

// the newest earlier version of the same video that has notes
function prevVersion(name) {
  const me = parse(name);
  const cands = listVideos().filter((v) => v.base === me.base && v.key < me.key && v.notes > 0).sort((a, b) => b.key - a.key);
  return cands.length ? {name: cands[0].name, ver: cands[0].ver, notes: notesOf(cands[0].name)} : null;
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (u.pathname === '/' ) return send(res, 200, fs.readFileSync(path.join(ROOT, 'index.html')), 'text/html; charset=utf-8');
    if (u.pathname === '/api/videos') return send(res, 200, listVideos());
    if (u.pathname === '/api/config') return send(res, 200, {reviewer: CFG.reviewer, editor: CFG.editor, fps: CFG.fps});
    if (u.pathname === '/video') {
      const p = videoPath(u.searchParams.get('id') || '');
      if (p && u.searchParams.get('dl')) {  // Download button: the phone copy if there is one (small, plays on a phone), else the master
        const phone = p.replace(/\.mp4$/i, ' (phone).mp4'), f = fs.existsSync(phone) ? phone : p;
        res.writeHead(200, {'Content-Type': 'video/mp4', 'Content-Length': fs.statSync(f).size, 'Content-Disposition': `attachment; filename="${path.basename(f).replace(/"/g, '')}"`});
        return fs.createReadStream(f).pipe(res);
      }
      return p ? streamVideo(req, res, p) : send(res, 404, {error: 'no video'});
    }
    // optional notes/<file>.timemap.json: {prev, map: [[from_s, offset_s]]} = how this cut's clock maps onto the previous version's
    if (u.pathname === '/api/timemap') {
      const f = path.join(NOTES, safe(u.searchParams.get('name') || '') + '.timemap.json');
      return send(res, 200, fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {});
    }
    if (u.pathname === '/api/prev') return send(res, 200, prevVersion(u.searchParams.get('name') || '') || {});
    // Frame.io-style review status per file: 'none' | 'review' (Needs Review) | 'progress' (In Progress) | 'approved'
    if (u.pathname === '/api/status') {
      const f = path.join(NOTES, safe(u.searchParams.get('name') || '') + '.status');
      if (req.method === 'POST') fs.writeFileSync(f, String(JSON.parse(await readBody(req)).status || 'none'));
      return send(res, 200, {status: fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : 'none'});
    }
    if (u.pathname === '/api/notes' && req.method === 'GET') return send(res, 200, notesOf(u.searchParams.get('name') || ''));
    if (u.pathname === '/api/notes' && req.method === 'POST') {
      const b = JSON.parse(await readBody(req));
      const list = notesOf(b.name);
      const id = Date.now().toString(36);
      let drawing = null;
      if (b.drawing && b.drawing.startsWith('data:image/png;base64,')) {
        drawing = `${safe(b.name)}__${id}.png`;
        fs.writeFileSync(path.join(NOTES, drawing), Buffer.from(b.drawing.split(',')[1], 'base64'));
      }
      let audio = null;
      const am = /^data:audio\/([a-z0-9]+)[^,]*;base64,/i.exec(b.audio || '');
      if (am) {
        const ext = {mp4: 'm4a', aac: 'm4a', x_m4a: 'm4a'}[am[1].toLowerCase()] || (AUDIO_TYPES[am[1].toLowerCase()] ? am[1].toLowerCase() : 'webm');
        audio = `${safe(b.name)}__${id}.${ext}`;
        fs.writeFileSync(path.join(NOTES, audio), Buffer.from(b.audio.slice(b.audio.indexOf(',') + 1), 'base64'));
      }
      list.push({id, t: Number(b.t), ...(b.t_end != null ? {t_end: Number(b.t_end)} : {}), text: String(b.text || ''), drawing, ...(audio ? {audio, transcribing: true} : {}), done: false, at: new Date().toISOString()});
      list.sort((x, y) => x.t - y.t);
      saveNotes(b.name, list);
      if (audio) transcribe(b.name, id, audio);
      return send(res, 200, list);
    }
    if (u.pathname === '/api/notes' && req.method === 'PATCH') {
      const b = JSON.parse(await readBody(req));
      const list = notesOf(b.name).map((n) => (n.id === b.id ? {...n, ...b.patch} : n));
      saveNotes(b.name, list);
      return send(res, 200, list);
    }
    if (u.pathname === '/api/notes' && req.method === 'DELETE') {
      const b = JSON.parse(await readBody(req));
      const gone = notesOf(b.name).find((n) => n.id === b.id);
      if (gone && gone.audio) fs.rm(path.join(NOTES, safe(gone.audio)), {force: true}, () => {});
      const list = notesOf(b.name).filter((n) => n.id !== b.id);
      saveNotes(b.name, list);
      return send(res, 200, list);
    }
    if (u.pathname === '/api/submit' && req.method === 'POST') {
      const b = JSON.parse(await readBody(req));
      fs.writeFileSync(path.join(NOTES, safe(b.name) + '.submitted'), new Date().toISOString());
      return send(res, 200, {ok: true});
    }
    if (u.pathname.startsWith('/audio/')) {
      const name = safe(decodeURIComponent(u.pathname.slice(7))), f = path.join(NOTES, name);
      return fs.existsSync(f) ? send(res, 200, fs.readFileSync(f), AUDIO_TYPES[name.split('.').pop()] || 'application/octet-stream') : send(res, 404, {error: 'none'});
    }
    if (u.pathname.startsWith('/drawing/')) {
      const f = path.join(NOTES, safe(decodeURIComponent(u.pathname.slice(9))));
      return fs.existsSync(f) ? send(res, 200, fs.readFileSync(f), 'image/png') : send(res, 404, {error: 'none'});
    }
    send(res, 404, {error: 'not found'});
  } catch (e) {
    send(res, 500, {error: String(e)});
  }
}).listen(PORT, CFG.host, () => console.log(`Review Desk on http://localhost:${PORT}`));
