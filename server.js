// Lightweight Standalone HTTP Server for Raven & Llama Learning (Proxmox / Docker / Local)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { LocalAccountStore } = require('./lib/local-account-store');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const accountStore = new LocalAccountStore(DATA_DIR);
const accountHandler = import('./lib/account-api.mjs').then(module => module.handleAccountRequest);
const MAX_REQUEST_BYTES = 65536;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_RATE_LIMIT_BUCKETS = 10000;
const rateLimitBuckets = new Map();
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

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

async function toFetchRequest(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }

  const options = { method: req.method, headers };
  if (!['GET', 'HEAD'].includes(req.method)) {
    const declaredLength = Number(req.headers['content-length'] || 0);
    if (declaredLength > MAX_REQUEST_BYTES) {
      const error = new Error('Request is too large');
      error.statusCode = 413;
      throw error;
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_REQUEST_BYTES) {
        const error = new Error('Request is too large');
        error.statusCode = 413;
        throw error;
      }
      chunks.push(chunk);
    }
    if (chunks.length) {
      options.body = Buffer.concat(chunks);
      options.duplex = 'half';
    }
  }

  return new Request(new URL(req.url, `http://${req.headers.host || 'localhost'}`), options);
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function allowAuthAttempt(action, username, remoteAddress) {
  const limits = action === 'register'
    ? [[`register:${remoteAddress}`, 30]]
    : [[`login:source:${remoteAddress}`, 60], [`login:account:${remoteAddress}:${username}`, 10]];
  const now = Date.now();

  for (const [key, limit] of limits) {
    let bucket = rateLimitBuckets.get(key);
    if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
      if (!bucket && rateLimitBuckets.size >= MAX_RATE_LIMIT_BUCKETS) {
        for (const [oldKey, oldBucket] of rateLimitBuckets) {
          if (now - oldBucket.startedAt >= RATE_LIMIT_WINDOW_MS) rateLimitBuckets.delete(oldKey);
        }
        if (rateLimitBuckets.size >= MAX_RATE_LIMIT_BUCKETS) return false;
      }
      bucket = { startedAt: now, count: 0 };
      rateLimitBuckets.set(key, bucket);
    }
    if (bucket.count >= limit) return false;
    bucket.count++;
  }

  return true;
}

const server = http.createServer(async (req, res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  } catch {
    sendJson(res, 400, { error: 'Invalid URL' });
    return;
  }

  if (pathname.startsWith('/api/')) {
    try {
      const request = await toFetchRequest(req);
      const handler = await accountHandler;
      const response = await handler(request, accountStore, {
        rateLimit: ({ action, username }) => allowAuthAttempt(action, username, req.socket.remoteAddress || 'unknown')
      });
      const headers = Object.fromEntries(response.headers.entries());
      res.writeHead(response.status, headers);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error('Account API request failed:', error);
      sendJson(res, error.statusCode || 500, { error: error.statusCode === 413 ? 'Request is too large' : 'Request failed' });
    }
    return;
  }

  const relativePath = pathname.replace(/^\/+/, '') || 'index.html';
  const safePath = path.resolve(PUBLIC_DIR, relativePath);
  const relativeSafePath = path.relative(PUBLIC_DIR, safePath);
  if (relativeSafePath.startsWith('..') || path.isAbsolute(relativeSafePath)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }
  if (relativeSafePath === 'data' || relativeSafePath.startsWith(`data${path.sep}`)) {
    res.writeHead(404);
    res.end('404 Not Found');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
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
      headers.Pragma = 'no-cache';
      headers.Expires = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
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
