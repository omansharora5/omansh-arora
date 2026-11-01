const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'tests') return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

for (const file of htmlFiles(root)) {
  test(path.relative(root, file) + ' has valid local resources and fragment links', () => {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, attribute] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|mailto:|data:)/.test(attribute)) continue;
      const url = new URL(attribute, 'https://portfolio.test/' + path.relative(root, file).replaceAll('\\', '/'));
      const destination = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      assert(!path.relative(root, destination).startsWith('..'), attribute + ' escapes the site');
      assert(fs.existsSync(destination), attribute + ' is missing');
      if (url.hash) {
        const target = fs.readFileSync(destination, 'utf8');
        assert(target.includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"'), attribute + ' has no target');
      }
    }
  });
  test(path.relative(root, file) + ' isolates links that open a new tab', () => {
    const html = fs.readFileSync(file, 'utf8');
    for (const [anchor] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert(/rel="[^"]*\bnoopener\b/.test(anchor), 'Missing noopener: ' + anchor);
    }
  });
}
