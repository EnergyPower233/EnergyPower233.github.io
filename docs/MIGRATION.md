# Hexo → Hugo / 三维知识档案迁移记录

## 基线和恢复策略

旧站提交：`b97e4b6`（完整 SHA 见 `migration-manifest.json`）。备份标签：`backup/pre-knowledge-archive`。

旧仓库只有 Hexo 生成页面，无 `_config.yml`、Markdown 或文章附件源目录。没有伪称恢复出原始 Markdown：

- 从 31 个日期路径页面中提取 `article#article-container` 内部 HTML。
- 每篇保存到 `content/posts/migrated/note-<路径哈希>.html`；顶部添加 Hugo TOML front matter。
- 正文按 UTF-8 原样保存，迁移时 SHA-256 校验 31/31 一致，包括公式、SVG、标题 ID 与文章内链接。
- 原 `Created` / `Updated` UTC 时间保留到 `date` / `lastmod`。界面按 Hugo 日期展示，不重新推算作者时区。
- front matter 的 `url` 显式使用旧地址；不改成 `/posts/note-.../`。
- 15 个旧 `/archives/…/`、`/page/…/` 列表入口通过 Hugo aliases 转到 `/posts/`，不是保留原分页顺序。
- 原 `img/` 资源完整迁至 `static/img/`；本批正文没有 `<img>` 引用，图形主要为内联 SVG。
- 旧 CSS/JS 不再发布；它们仍可从 Git 历史或备份标签取回。

原型文章未被导入。当前 7 个顶级专栏为：事件与概率、一维随机变量、二维随机变量、大数定律与中心极限定理、数字特征、统计初步、综合复习。部分一维章节保留子专栏。

## 为什么保留 HTML

旧站公式同时包含已转换的 `<span class="math">` 和残留的 TeX 定界符。盲目反向转换 Markdown 容易损坏数学语义，因此优先保真：

- HTML 数学内容保留，补充块公式横向滚动样式。
- 剩余 `$...$` / `$$...$$` 等由 MathJax 渲染（沿用外部 CDN）。
- HTML 文章无 Hugo Markdown fragments：新增从既有 h2–h4 的 ID 生成经典目录的兼容逻辑；三维阅读器仍读取真实正文标题。
- Hugo 0.165 默认拒绝 HTML 内容，本站显式只允许 text/html、text/markdown、text/plain；仓库作者必须可信，不接收未经审核的 HTML。

**未做内容校订**：原文的 `[TOC]`、Obsidian 提示标记、符号/公式错误、重复标题和长篇汇总仍保留。任何缺失的原始 LaTeX 无法凭 HTML 无损恢复。数学正确性、逐条内部锚点及真实手机性能仍需人工复核。

## 可复现与检查

一次性迁移脚本：`python3 scripts/migrate-hexo.py`，仅用 Python 标准库。它从本仓库旧提交读取内容；目标目录存在会拒绝执行，避免覆盖后续修改。无需也不应日常重复运行。

```sh
pnpm test
pnpm build
hugo --gc --minify
pnpm check:site
# 只在确认初次迁移正文原样时运行；后续正常编辑旧文不要求此项通过：
node scripts/check-migration.mjs --pristine
```

常规检查要求所有迁移文件、旧文章 URL、搜索索引、目录、公式脚本和旧列表入口存在，同时报告仍与初始正文一致的数量。`--pristine` 额外强制全部初始哈希一致。清单记录的是历史基线，不要在每次文章编辑后重写历史哈希。

## 验证范围

- TypeScript 检查、Vite 与 Hugo 生产构建。
- 38 项单元测试（原型 36 项，加新文生成与减少动态效果回归）。
- 31 个文章地址、15 个旧列表入口、索引、主题资源和两个 GLB 完整性。
- Playwright 浏览器回归源码见 `knowledge/e2e/site.spec.ts`，覆盖经典搜索、旧文、移动端默认入口、无 JS 阅读、重定向及三维阅读流程。浏览器测试使用软件 WebGL 与低像素比，不等于真实设备帧率保证。
- 本地 5 项浏览器回归通过；三维浏览器用减少动态效果模式，普通拆解时间轴由单元测试覆盖。云端首次检查暴露减少动态效果仍等待 GPU 编译的问题，已增加真正跳过模型编译的阅读路径；该模式不再等待详情镜头后才开放按钮。
- 原型历史文档的浏览器验证属于原作者记录，**不是**本站验收结果。

唯一已知构建警告为 PaperMod 的 `.Language.LanguageCode` 弃用提示；目前不影响构建，升级主题时处理。
