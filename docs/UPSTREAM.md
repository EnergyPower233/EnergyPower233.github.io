# 上游来源与授权

## 直接导入的原型

- 仓库：https://github.com/Caelestis-Lumina/Caelestis-Lumina.github.io
- 分支：main
- 基线提交：`42994cdd089b33d97f1d838de1d66e2d890e560b`
- 导入方式：克隆原仓库后，将该提交的源码快照导入本仓库；保留本站既有 Git 历史，并非 GitHub Fork，也未合并两个无关历史。
- 保留：Hugo 模板、CSS/JS、三维应用、模型、字体、测试、锁文件、主题子模块及许可说明。
- 排除：原型的 `content/posts/` 全部博文；原型站主的简介及评论讨论区配置。
- 本站修改：E_Power 品牌与 EP 图标、中文站点配置、旧文导入、HTML 内容兼容与目录、粘贴/中文输入搜索修复、相对路径搜索和重定向、维护脚本、PR 构建与迁移回归。
- PaperMod 固定提交：`3bb0ca281fd17eff8e3489011a444f326d7c4c72`。

## 不应混淆的授权范围

1. **原型自有代码**：检查时未发现仓库总 LICENSE；公开可见不等于给予任意复制、修改、再发布许可。本次按站主要求直接导入，正式公开部署前需向 Caelestis-Lumina 确认使用、修改与公开发布的许可。
2. **RhineLabUI 代码**：上游 MIT 声明保留在 `static/rhine/licenses/RhineLabUI-MIT.txt`。
3. **GLB 模型与第三方相关资产**：原型 `knowledge/SOURCES.md` 记载原型站主获得作者许可，不能推定该许可自动转授 EnergyPower233。需向 LBEILC / 相应权利人确认本站使用范围；代码 MIT 不自动覆盖模型、游戏相关标识或第三方素材。
4. **MiSans、Three.js、Rolling Number、PaperMod**：保留各自许可证与 NOTICE，不更改权利人。
5. **本站旧文**：来自本站原有提交；迁移不改变原文章内已有的引用与权利状态。

未取得确认时，可继续本地评估，不应将本文件视为已获得授权的证明。建议在获得许可后记录授权日期、范围、链接或邮件摘要；不要把私人联系方式或完整私信公开提交。

## 如何跟进原型更新

不要直接用其 main 覆盖本站，否则可能覆盖个人信息、文章及评论设置。

```sh
git remote add prototype https://github.com/Caelestis-Lumina/Caelestis-Lumina.github.io.git
git fetch prototype main
git switch -c chore/review-prototype-update
# 在 GitHub 比较基线提交与最新 main，选择需要的文件/补丁。
```

本仓库未包含原型祖先提交，不能假定 `git merge prototype/main` 能安全工作。逐项移植后运行全部构建与回归；核对 `content/`、`hugo.toml`、`static/favicon.svg`、品牌文案和第三方许可。升级模型或字体时同步审查许可并更新本文件与 `knowledge/SOURCES.md`。
