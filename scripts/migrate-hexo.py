#!/usr/bin/env python3
"""One-time, standard-library-only recovery from the original Git commit.
Never overwrite edited sources. Run from the repository root.
"""
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess

REV = 'b97e4b6'
OUT = Path('content/posts/migrated')

def git(*args):
    return subprocess.check_output(['git', *args])

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

class Inspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.images = []
    def handle_data(self, data):
        self.text.append(data)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img':
            self.images.append(attrs.get('src', ''))

if OUT.exists():
    raise SystemExit('Refusing to overwrite existing migrated content.')
files = git('ls-tree', '-r', '--name-only', '-z', REV).decode().split('\0')
records = []
for path in sorted(files):
    if not re.match(r'^\d{4}/\d{2}/\d{2}/.*index\.html$', path):
        continue
    source = git('show', f'{REV}:{path}').decode()
    match = re.search(r'<article\b[^>]*\bid="article-container"[^>]*>([\s\S]*?)</article>', source)
    if not match:
        raise ValueError(f'Missing article body: {path}')
    body = match[1]  # Intentionally unchanged: preserve math, SVG, heading IDs and links.
    title = html.unescape(re.search(r'<h1 class="post-title">(.*?)</h1>', source).group(1))
    created = re.search(r'class="post-meta-date-created" datetime="([^"]+)"', source).group(1)
    updated = re.search(r'class="post-meta-date-updated" datetime="([^"]+)"', source).group(1)
    parts = path.split('/')
    chapter = re.sub(r'^\d+\.\s*', '', parts[4]) if len(parts) > 6 else '综合复习'
    columns = [chapter]
    if len(parts) > 7:
        columns.append(chapter + '/' + parts[5])
    slug = 'note-' + digest(path)[:12]
    url = '/' + path.removesuffix('index.html')
    inspector = Inspector()
    inspector.feed(body)
    plain = re.sub(r'\s+', ' ', ''.join(inspector.text)).strip()
    description = f'概率论与数理统计学习笔记 · {chapter} · {title}'
    meta = {
        'title': title, 'date': created, 'lastmod': updated, 'url': url,
        'description': description, 'columns': columns, 'tags': ['概率论', '数理统计'],
        'draft': False, 'math': True, 'comments': False, 'article_status': 'permanent',
        'applicable_versions': ['all'], 'legacy_import': True,
    }
    front = '\n'.join(f'{key} = {json.dumps(value, ensure_ascii=False)}' for key, value in meta.items())
    target = OUT / (slug + '.html')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text('+++\n' + front + '\n+++\n' + body)
    records.append({'source': path, 'target': str(target), 'url': url, 'title': title,
                    'bodySHA256': digest(body), 'textLength': len(plain), 'images': inspector.images})
# Retain old list entry points, redirecting only navigation pages, never articles.
aliases = ['/' + p.removesuffix('index.html') for p in files
           if p.endswith('index.html') and (p.startswith('archives/') or p.startswith('page/'))]
Path('content/posts/_index.md').write_text('+++\ntitle = "全部文章"\naliases = ' + json.dumps(sorted(aliases), ensure_ascii=False) + '\n+++\n')
# Preserve all original static images, even currently unreferenced ones.
for path in files:
    if path.startswith('img/'):
        target = Path('static') / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(git('show', f'{REV}:{path}'))
Path('docs/migration-manifest.json').write_text(json.dumps({
    'sourceCommit': git('rev-parse', REV).decode().strip(),
    'strategy': 'Original article HTML retained byte-for-byte after TOML front matter.',
    'articles': records, 'listAliases': sorted(aliases),
}, ensure_ascii=False, indent=2) + '\n')
print(f'Recovered {len(records)} article bodies and {len(aliases)} list aliases.')
print('Original image references:', sorted({image for record in records for image in record['images']}))
