import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';

const output = resolve(process.env.SITE_OUTPUT || 'public');
const manifest = JSON.parse(readFileSync('docs/migration-manifest.json', 'utf8'));
const catalog = JSON.parse(readFileSync(join(output, 'knowledge-index.json'), 'utf8'));
const articles = new Map(catalog.articles.map(article => [decodeURI(article.url), article]));
assert.equal(articles.size, catalog.articles.length, 'Duplicate article URLs');
let unchanged = 0;
for (const record of manifest.articles) {
  const source = readFileSync(record.target, 'utf8');
  const body = source.split('\n+++\n').slice(1).join('\n+++\n');
  assert.ok(body.trim(), `Empty recovered body: ${record.target}`);
  const hash = createHash('sha256').update(body).digest('hex');
  if (hash === record.bodySHA256) unchanged++;
  if (process.argv.includes('--pristine')) assert.equal(hash, record.bodySHA256, record.target);
  assert.ok(articles.has(decodeURI(record.url)), `Missing legacy article in search: ${record.url}`);
  const target = resolve(output, '.' + record.url, 'index.html');
  assert.ok(target.startsWith(output + sep));
  const rendered = readFileSync(target, 'utf8');
  assert.ok(rendered.includes('post-content'), `Missing rendered body: ${record.url}`);
  assert.ok(rendered.includes('MathJax-script'), `Missing math renderer: ${record.url}`);
  assert.ok(rendered.includes('TableOfContents'), `Missing legacy TOC: ${record.url}`);
  assert.ok(!rendered.includes('http://example.com'), `Placeholder domain: ${record.url}`);
}
for (const alias of manifest.listAliases) {
  assert.ok(existsSync(join(output, alias, 'index.html')), `Missing list alias: ${alias}`);
}
for (const route of ['index.html', 'classic/index.html', 'about/index.html']) {
  const page = readFileSync(join(output, route), 'utf8');
  assert.ok(!page.includes('John Doe') && !page.includes('http://example.com'), `Old identity: ${route}`);
  assert.ok(!page.includes('giscus.app/client.js'), 'Comments must remain disabled until configured');
}
console.log(`Migration verified: ${manifest.articles.length} legacy URLs, ${manifest.listAliases.length} list aliases, ${unchanged} byte-identical bodies (${manifest.articles.length - unchanged} subsequently edited).`);
