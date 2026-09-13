# E_Power 博客维护手册

## 1. 从哪里开始

| 要做的事 | 文件 / 入口 |
| --- | --- |
| 新增文章 | `pnpm new slug "标题" "专栏/子专栏"` |
| 改旧文章 | 在 `docs/migration-manifest.json` 搜标题，编辑对应 `target` |
| 改站名、描述、导航、域名 | `hugo.toml` |
| 改个人简介 | `content/about.md` |
| 改首页介绍 | `hugo.toml` 的 `homeInfoParams` |
| 改 EP 标志 | `static/favicon.svg` |
| 三维首页和动画品牌 | `knowledge/src/shell.html`、`rhine/brand.ts`、`rhine/boot-motion.ts`、`rhine/scene.ts`、`boot-controller.ts` |
| 经典首页结构 | `layouts/_default/list.html` |
| 经典样式、旧公式样式 | `assets/css/extended/` |
| 三维样式 | `knowledge/src/styles.css`、`mobile.css`、`workspace.css` |
| 自动部署 | `.github/workflows/pages.yml` |
| 来源、许可与更新原型 | [UPSTREAM.md](UPSTREAM.md) |

`public/`、`resources/`、`static/knowledge/`、`data/knowledge.json` 和 `node_modules/` 都是生成物，不手动维护、不提交。主题通过 submodule 固定，不能只下载 GitHub ZIP 而漏掉主题。

## 2. 安装与预览

固定环境：Node.js 24、pnpm 11.19.0、Hugo **Extended** 0.165.0。Hugo 从官方 release 下载对应操作系统版本；pnpm 可通过 `npm install -g pnpm@11.19.0` 安装。检查：

```sh
node --version
pnpm --version
hugo version
git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm build
hugo server -D
```

访问 `http://localhost:1313/` 或 `/classic/`。`-D` 包含草稿；未来日期文章预览还需要 `-F`。日常只写内容时 Hugo 自动刷新；改三维源码另开终端 `pnpm watch`。

当前工作机 Hugo 已下载到 `/home/epower/.local/opt/hugo-0.165.0/hugo`，尚未修改全局 PATH；可使用绝对路径，或临时 `export PATH="$HOME/.local/opt/hugo-0.165.0:$PATH"`。

## 3. 写一篇新文章

```sh
pnpm new probability-review "概率复习" "数学/概率论"
```

输出：`content/posts/notes/probability-review.md`；同名文件存在时拒绝覆盖，文件名仅接受英文小写、数字和短横线。

```toml
+++
title = "概率复习"
date = "2026-09-13T12:00:00+08:00"
draft = true
description = "事件、条件概率和独立性的关系。"
columns = ["数学", "数学/概率论"]
tags = ["概率论", "复习"]
math = true
comments = false
article_status = "permanent"
applicable_versions = ["all"]
+++
```

日期填写实际写作时间，示例不要照搬。元数据之后正常写 Markdown：

```markdown
## 条件概率

当 $P(B)>0$ 时：

$$
P(A\mid B)=\frac{P(AB)}{P(B)}.
$$

![图示](/images/probability-review/example.png)
```

图片放在 `static/images/probability-review/example.png`；引用中不带 `static`。代码块使用三个反引号和语言名。块公式前后留空行，代码块内不会渲染公式。公式渲染使用 MathJax CDN，网络失败时定界符可能直接显示，正文不会因此不可读。

发布前：补摘要、检查专栏/标签、把 `draft = false`，确认日期不是未来。永久链接默认 `/posts/probability-review/`，发布后不要随意改文件名。不得提交密码、访问令牌或私有图片。

## 4. 改旧文章与保留地址

旧文为 `.html`，并非 Markdown。先在迁移清单找标题：

```sh
rg -n '协方差' docs/migration-manifest.json
```

编辑对应 `content/posts/migrated/note-....html`：

- 顶部 TOML 与新文章相同；**保留 `url` 字段**，它是旧链接兼容的关键。
- 正文使用 HTML 标签；勿把整段 HTML 自动转换为 Markdown 后直接覆盖。
- 修改后更新 `lastmod`；日期尽量写带时区的字符串。
- 保留标题 `id`，避免既有锚点失效；注意 HTML 中 `&`、`<`、`>` 的实体。
- 已转换成 HTML 的数学公式不必强行恢复 TeX；若获得原始笔记，再逐篇校订。
- 正常编辑后，检查会报告“subsequently edited”，不报错；`--pristine` 是仅供初次迁移的严格审计。

确实要改成 Markdown：先另建分支，把该篇 `.html` 改为 `.md`，恢复正文；复制原 `url`，移除 `legacy_import`，更新迁移清单中的 `target`（保留原始 `bodySHA256` 作为历史记录），构建并人工比对公式、SVG、目录与链接。不要让两个文件同时发布同一 URL。

不建议删除迁移文章，因为旧链接检查会阻止遗失。若确需撤稿，可保留同 URL 的简短说明页；有意改变检查基线需单独审查，而不是为消除错误随意删除清单条目。

## 5. 专栏与标签

本站直接在每篇 front matter 声明 `columns`，与原型历史文档的目录 cascade 方案不同：

```toml
columns = ["计算机系统", "计算机系统/CSAPP", "计算机系统/CSAPP/内存"]
tags = ["C", "CSAPP", "内存"]
```

从父到子填写完整路径；第一层生成三维阵列的一列。标签没有层级。添加内容后 Hugo 自动生成首页、`/columns/`、`/tags/` 和搜索索引，无需改前端数组。重命名专栏需同步相关所有文章；原型支持 cascade，但本站不混用以避免隐式覆盖。

## 6. 外观、性能与评论

- 模型、启动动画与抽取流程保持原型实现，修改后务必跑单元和浏览器测试。
- `favicon.svg` 的 `data-mark="c"`、`"l"`、`"signal"` 是品牌动画读取接口；名称为兼容接口，不是仍使用 C/L 品牌，图形已改为 EP。
- `cl-knowledge:*` localStorage 键和阅读器 `cl-knowledge-reader-ready` 消息同样保留兼容命名，无跨站共享数据。
- 设置内可降低画质、减少动态效果；系统减少动态效果偏好优先。手机默认经典，可手动切回三维。
- 两个 MiSans 字重约 9.94 MB、两份 GLB 约 6.91 MB；初次三维载入较重，第二个模型在需要时加载。经典页不执行 Three.js，但可能空闲预热缓存。不要向读者承诺低端机流畅度。
- 已移除首页不蒜子脚本与空访问计数，不捏造访问量。

评论默认关闭。开启步骤：在自己的 GitHub 仓库启用 Discussions → 打开 <https://giscus.app/zh-CN> 配置自己的仓库和分类 → 把生成的 `repoId`、`categoryId` 写入 `hugo.toml` → 设置 `params.giscus.enabled = true` → 在需要评论的文章设置 `comments = true`。仓库 ID 不是访问令牌；任何 Token 都不能写进前端。启用后需相应调整 `scripts/check-migration.mjs` 中默认关闭评论的验收断言。

## 7. 发布前验证

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
hugo --gc --minify
pnpm check:site
git diff --check
```

浏览器回归（额外需要 Python 3）：

```sh
pnpm exec playwright install chromium
# Linux CI 若缺少浏览器系统库：pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

Playwright 用 `public/` 在 127.0.0.1:4173 启动临时服务，必须先构建；结果和截图位于忽略的 `test-results/`、`.verification/`。软件 WebGL 测试降低像素比以减少 CI 负担，不能替代真实手机及 GPU 验证。

至少人工检查：首页进场、切专栏、中文搜索、抽取/展开/返回、浏览器前进后退、公式、旧 URL、手机排版、暗色与无 JS 阅读。不要直接编辑 `public/` 来修问题。

## 8. 首次上线与日常发布

首次从旧站切换：

1. 确认 [上游授权](UPSTREAM.md)，审阅重构 PR 和构建结果。
2. 仓库 **Settings → Pages → Build and deployment → Source → GitHub Actions**。原来是 main 根目录直接发布，必须切换，否则会把源码当成静态站发布。
3. 合并 `refactor/knowledge-archive` 到 `main`。
4. 在 Actions 等待 `Build and deploy knowledge archive` 的 build/deploy 成功，打开 <https://energypower233.github.io/> 强制刷新验证。

本次交付不自动合并、不修改当前 Pages 发布源；旧站维持上线。PR 只进行构建并上传 `site-preview` 工件，不发布预览网址。可以下载工件并在本地 HTTP 服务中检查，不能通过双击 HTML 使用三维模块。

日常推荐分支 + PR：

```sh
git switch main
git pull --ff-only
git switch -c content/my-note
# 编辑并完成验证
git add content docs
git commit -m "content: add my note"
git push -u origin content/my-note
gh pr create --base main
```

合并到 main 后自动部署；失败的构建不会发布。自动工作流无需私人 Token，使用 GitHub 内置的最小 Pages 权限。不要启用自动合并未审查的外部 HTML 投稿。

自定义域名：更新 `hugo.toml` 的 `baseURL`，在 `static/CNAME` 写域名，在 Pages 设置配置域名和 DNS、等待证书并开启 HTTPS。当前配置仅针对用户站根路径，项目子目录迁移检查还需适配 `scripts/check-migration.mjs`，不能只改 URL 就宣称支持。

## 9. 回滚

### 撤回普通文章或界面改动

优先用 GitHub PR 的 Revert，或新分支 `git revert <出错提交>` 后 PR 合并。禁止用 `git push --force` 覆盖 main 历史。源码回退会触发重新构建。

### 完整恢复旧 Hexo 网站

在 GitHub Pages 选择 **Deploy from a branch**，并将来源指向由备份标签创建的恢复分支：

```sh
git fetch origin --tags
git switch -c rollback/legacy-site backup/pre-knowledge-archive
git push -u origin rollback/legacy-site
```

Pages 分支选择 `rollback/legacy-site`、目录 `/ (root)`。这保留 main 的新源码而恢复旧版生成页，不需要强推。恢复期间暂停新站部署工作流，避免另一个 main 推送又触发发布；重新启用新站时把 Pages 改回 GitHub Actions 并手动运行工作流。

## 10. 常见故障

| 症状 | 处理 |
| --- | --- |
| `Knowledge UI is not built` | 先 `pnpm build`，再 Hugo |
| 找不到 PaperMod | `git submodule update --init --recursive` |
| 锁文件不匹配 | 使用固定 pnpm；有意升级时本地更新锁文件，不能在 CI 临时关闭 frozen-lockfile |
| `text/html is not whitelisted` | 保留 `hugo.toml` 的限定 `security.allowContent`；不要关闭全部安全策略 |
| 文章不显示 | 检查 draft、未来日期、路径是否在 content/posts、是否意外 hiddenInHomeList |
| 点击旧链接 404 | 检查旧文 url 与迁移清单，确认先构建再部署 public |
| 三维加载失败/慢 | 经典入口仍可用；检查 WebGL、网络、GLB 请求、设置画质与省流量模式 |
| 公式显示原始美元符 | 检查 MathJax CDN 网络、定界符和 TeX 语法，旧 HTML 公式不等于原始 LaTeX |
| 搜索空白 | 检查 /index.json 或 /knowledge-index.json 返回 200；使用 HTTP 预览，不用 file:// |
| Pages deploy 失败 | 确认 Source=GitHub Actions、环境允许 main 部署及 pages/id-token 权限 |
| 页面仍旧 | 等待工作流完成，强制刷新，检查自己是否仍看旧部署或旧缓存 |

原型历史材料在 `docs/upstream/`；其中的身份、专栏结构、验证次数、分支和命令可能不适用于本站。维护以本文件及当前源码为准。
