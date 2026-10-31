// Lightweight Standalone HTTP Server for Raven & Llama Learning (Proxmox / Docker / Local)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const DATA_FILE = path.join(DATA_DIR, 'profiles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Endpoints for Profiles Persistence & Cross-Device Sync
  if (pathname === '/api/profiles') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (req.method === 'GET') {
      try {
        if (fs.existsSync(DATA_FILE)) {
          const content = fs.readFileSync(DATA_FILE, 'utf8');
          res.writeHead(200);
          res.end(content || '{"profiles":[]}');
        } else {
          res.writeHead(200);
          res.end('{"profiles":[]}');
        }
      } catch (err) {
        console.error('Error reading profiles:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to read profiles' }));
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);

          // Support single profile merge to avoid race conditions across devices
          if (parsed.profile) {
            let existing = { profiles: [] };
            if (fs.existsSync(DATA_FILE)) {
              try {
                existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
              } catch (e) {}
            }
            if (!Array.isArray(existing.profiles)) existing.profiles = [];

            const idx = existing.profiles.findIndex(p => p.id === parsed.profile.id);
            if (idx !== -1) {
              existing.profiles[idx] = parsed.profile;
            } else {
              existing.profiles.push(parsed.profile);
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), 'utf8');
          } else if (parsed.deleteProfileId) {
            let existing = { profiles: [] };
            if (fs.existsSync(DATA_FILE)) {
              try { existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) {}
            }
            if (Array.isArray(existing.profiles)) {
              existing.profiles = existing.profiles.filter(p => p.id !== parsed.deleteProfileId);
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), 'utf8');
          } else {
            // Full state update
            fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8');
          }

          res.writeHead(200);
          res.end(JSON.stringify({ status: 'saved' }));
        } catch (err) {
          console.error('Error saving profiles:', err);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // Static File Serving
  let relativePath = pathname.replace(/^\/+/, '');
  if (!relativePath || relativePath === '') {
    relativePath = 'index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(path.join(PUBLIC_DIR, relativePath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, indexData) => {
        if (readErr) {
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          });
          res.end(indexData);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = { 'Content-Type': contentType };
    if (['.html', '.js', '.css'].includes(ext)) {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=86400';
    }

    fs.readFile(safePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, headers);
        res.end(data);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🪶 Raven & Llama Learning Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Persistence Data directory: ${DATA_DIR}`);
});
