const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
test('original projects and their resource destinations remain available', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const projects = html.split('<section id="projects">')[1].split('</section>')[0];
  for (const title of ['AI Realtime CCTV Crime Detector', 'RL Environment for Semiconductor Yield', 'AI Judge', 'AI-Based ATS Checker', 'AI Content Detector', 'E-Commerce Website']) {
    assert(projects.includes(title), 'Missing original project: ' + title);
  }
  assert(!projects.includes('<details'), 'Original projects should not require expanding a disclosure');
  assert(projects.includes('href="projects/fab-yield-agent.html"'));
  assert(projects.includes('href="projects/ai-judge.html"'));
  assert(fs.readFileSync(path.join(root, 'projects/fab-yield-agent.html'), 'utf8').includes('href="../meta-open-env.html"'));
  assert(fs.readFileSync(path.join(root, 'projects/ai-judge.html'), 'utf8').includes('href="https://landing-page3-liard.vercel.app/"'));
});

test('every hackathon has a new-tab story with the same result-badge markup', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const events = html.split('<div class="achievement-list">')[1].split('</section>')[0];
  assert.equal([...events.matchAll(/<a class="achievement"[^>]*target="_blank"/g)].length, 6);
  assert(!events.includes('<article'));
  assert(!events.includes('badge muted'));
  assert(events.includes('href="eightfold-hackathon.html"'));
});
test('existing portfolio section bookmarks remain available', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const id of ['about', 'achievements', 'experience', 'projects', 'skills', 'certifications', 'education']) {
    assert(html.includes('id="' + id + '"'), 'Missing existing section #' + id);
  }
});
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
