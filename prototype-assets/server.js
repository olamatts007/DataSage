#!/usr/bin/env node
/**
 * TaxSage Prototype — zero-dependency static server.
 * Run:  node server.js   (then open http://localhost:4173)
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 4173

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
}

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    if (urlPath === '/') urlPath = '/index.html'
    // path traversal guard
    const file = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''))
    const target = file.startsWith(ROOT) ? file : path.join(ROOT, 'index.html')
    fs.readFile(target, (err, data) => {
      if (err) {
        // SPA fallback — hash routing means we always serve index.html
        fs.readFile(path.join(ROOT, 'index.html'), (e2, html) => {
          if (e2) { res.writeHead(404); return res.end('Not found — run this script from the prototype folder.') }
          res.writeHead(200, { 'Content-Type': MIME['.html'] })
          res.end(html)
        })
        return
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': 'no-store', // fresh codes/builds on every test run
      })
      res.end(data)
    })
  })
  .listen(PORT, () => {
    console.log(`\n  TaxSage prototype running →  http://localhost:${PORT}\n`)
    console.log('  Press Ctrl+C to stop.\n')
  })
