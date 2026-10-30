/**
 * LA ESVASTICA PRIVATE LIMITED - Development Web Server
 * Zero dependencies, built with native Node.js http and fs modules.
 * Run with: node server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize root and index
  if (pathname === '/' || pathname === '/index') {
    pathname = '/index.html';
  } else if (!path.extname(pathname)) {
    // If request has no extension (e.g. /about), check if .html exists
    const candidatePath = path.join(ROOT, pathname + '.html');
    if (fs.existsSync(candidatePath)) {
      pathname = pathname + '.html';
    }
  }

  const filePath = path.join(ROOT, pathname);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>404 - Page Not Found</h2><p>Cannot find ${pathname}</p><p><a href="/index.html">Return to Home</a></p></body></html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n===============================================================`);
  console.log(`  LA ESVASTICA PRIVATE LIMITED - Corporate Web Server`);
  console.log(`  Serving at: http://127.0.0.1:${PORT}/index.html`);
  console.log(`  Both .html and extensionless URLs are supported simultaneously.`);
  console.log(`===============================================================\n`);
});
