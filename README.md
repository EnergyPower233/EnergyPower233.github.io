# E_Power · 知识档案

个人博客：<https://energypower233.github.io/>。基于 [Caelestis-Lumina 的博客](https://github.com/Caelestis-Lumina/Caelestis-Lumina.github.io) 直接改造，使用 Hugo + PaperMod + Three.js。保留三维档案首页、启动动画、全文搜索、专栏导航、抽取阅读和经典视图。

**本次重构位于 `refactor/knowledge-archive` 分支；合并及切换 Pages 发布源之前，线上仍为旧站。**

- 31 篇旧文章：保留原 HTML 正文、日期及原 URL。
- 7 个顶级专栏：按原概率论笔记章节组织；首页和搜索由 Hugo 自动生成。
- 新文章使用 Markdown；不再仅维护 Hexo 构建产物。
- 手机默认经典视图；JavaScript / WebGL 不可用时仍可阅读文章。
- 评论默认关闭，未沿用原型作者的 Giscus 配置。

## 本地预览

安装 **Node.js 24、pnpm 11.19.0、Hugo Extended 0.165.0**：

```sh
git clone --recurse-submodules https://github.com/EnergyPower233/EnergyPower233.github.io.git
cd EnergyPower233.github.io
# 重构合并前：git switch refactor/knowledge-archive
git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm build
hugo server -D
```

打开 <http://localhost:1313/>；经典入口为 `/classic/`。若修改三维 TypeScript / CSS，另开终端运行 `pnpm watch`。

```sh
pnpm new my-first-note "我的第一篇笔记" "学习随记/编程"
pnpm test
pnpm build
hugo --gc --minify
pnpm check:site
```

新增文件默认 `draft = true`；正式发布改为 `false`。浏览器回归：安装 Python 3 后执行 `pnpm exec playwright install chromium && pnpm test:e2e`。

## 文档

- **[维护手册](docs/maintenance.md)**：写文章、改专栏、改外观、评论、部署、回滚及故障排查。
- [迁移记录](docs/MIGRATION.md) 与 [逐篇迁移清单](docs/migration-manifest.json)。
- **[上游来源与授权待确认项](docs/UPSTREAM.md)**：部署前请确认。
- [原型历史文档](docs/upstream/)：仅供架构参考，不是本站的验证记录。

首次发布需把仓库 **Settings → Pages → Source** 从 `Deploy from a branch` 改为 **GitHub Actions**，再合并重构 PR。PR 只构建不部署；`main` 构建通过后自动上线。详见维护手册。

## 来源

原型基线：`42994cdd089b33d97f1d838de1d66e2d890e560b`。未转载原型的博文，保留了其自有界面与第三方资源。原型没有自有代码总许可证，其记载的模型许可不能视为已授权本站；本仓库不将这些内容重新声明为 MIT。原有第三方许可位于 `static/rhine/`，详细来源保留在 [knowledge/SOURCES.md](knowledge/SOURCES.md)。
