import * as params from '@params';

// Override PaperMod's keyup-only search: support paste, IME and input before fetch.
const input = document.getElementById('searchInput');
const list = document.getElementById('searchResults');
let fuse;
list.setAttribute('aria-live', 'polite');
function message(text) {
  const item = document.createElement('li');
  item.className = 'search-status';
  item.textContent = text;
  list.replaceChildren(item);
}
function render() {
  if (!fuse) return;
  const query = input.value.trim();
  list.replaceChildren();
  if (!query) return;
  const matches = fuse.search(query, { limit: 100 });
  if (!matches.length) { message('没有找到匹配的文章，试试更短的关键词。'); return; }
  for (const { item } of matches) {
    const li = document.createElement('li');
    li.className = 'post-entry';
    const header = document.createElement('header');
    header.className = 'entry-header';
    header.textContent = item.title + ' »';
    const link = document.createElement('a');
    const url = new URL(item.permalink, location.href);
    if (url.origin !== location.origin) continue;
    link.href = url.href;
    link.setAttribute('aria-label', item.title);
    li.append(header, link);
    list.append(li);
  }
}
input.addEventListener('input', render);
input.addEventListener('search', render);
fetch(new URL('../index.json', location.href))
  .then(response => { if (!response.ok) throw new Error('Search index unavailable'); return response.json(); })
  .then(data => {
    fuse = new Fuse(data, {
      threshold: params.fuseOpts?.threshold ?? .3,
      ignoreLocation: true,
      minMatchCharLength: 1,
      keys: ['title', 'summary', 'content'],
    });
    render();
  })
  .catch(() => message('搜索索引载入失败，请刷新页面或从「文章」浏览。'));
document.getElementById('searchbox').addEventListener('keydown', event => {
  const links = [...list.querySelectorAll('a')];
  const current = links.indexOf(document.activeElement);
  if (event.key === 'Escape') { input.value = ''; render(); input.focus(); }
  if (event.key === 'ArrowDown' && links.length) {
    event.preventDefault(); links[Math.min(current + 1, links.length - 1)].focus();
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault(); (current > 0 ? links[current - 1] : input).focus();
  }
  if (event.key === 'Enter' && document.activeElement === input) links[0]?.click();
});
