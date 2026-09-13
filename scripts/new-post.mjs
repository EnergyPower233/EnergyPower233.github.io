import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const [slug, title = slug, column = '学习随记'] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('用法：pnpm new <英文小写短横线文件名> "文章标题" "专栏/子专栏"');
  process.exit(1);
}
const quote = value => JSON.stringify(value);
const columns = column.split('/').map((_, i, all) => all.slice(0, i + 1).join('/'));
const dir = resolve('content/posts/notes');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${slug}.md`);
const text = `+++\ntitle = ${quote(title)}\ndate = ${quote(new Date().toISOString())}\ndraft = true\ndescription = "请填写一两句摘要。"\ncolumns = ${JSON.stringify(columns)}\ntags = []\nmath = true\ncomments = false\narticle_status = "permanent"\napplicable_versions = ["all"]\n+++\n\n## 开始记录\n\n在这里撰写正文。\n`;
try {
  writeFileSync(file, text, { flag: 'wx' });
  console.log(`已创建草稿 ${file}\n预览：hugo server -D；发布前改为 draft = false。`);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.error(`文件已存在，未覆盖：${file}`);
  process.exit(1);
}
