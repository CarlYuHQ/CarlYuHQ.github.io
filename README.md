<p align="center">
  <img src="images/readme-avatar.png" alt="CarlYuHQ" width="180" />
</p>

# CarlYuHQ's site

个人主页源码，基于 [academicpages](https://github.com/academicpages/academicpages.github.io) / [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) 3.4.2 的 Jekyll 站点，经 GitHub Actions 部署到 GitHub Pages。站点主体为自定义 **Animal Island** 主题，首页展示「最新动态」与「每日 Routine」。

| 站点 | 地址 | 仓库 |
| --- | --- | --- |
| 个人主页 | https://carlyuhq.github.io/ | 本仓库 `CarlYuHQ/CarlYuHQ.github.io` |
| 随笔博客（Hexo） | https://carlyuhq.github.io/Blogs/ | [CarlYuHQ/Blogs](https://github.com/CarlYuHQ/Blogs) |
| 博客 Feed | https://carlyuhq.github.io/Blogs/atom.xml | 由 Hexo 生成 |

**分工**：本仓库只生成主页；博客正文在 `Blogs` 仓库（Hexo 生成的静态产物：`index.html`、按日期的文章页、`tags/`、`categories/`、`atom.xml`），顶栏 **Blogs** 是外链（`_data/navigation.yml`）。主页不生成 `/Blogs/` 页面，而是通过 Feed 把最新文章标题同步到首页动态。

## 技术栈

| 层 | 实现 |
| --- | --- |
| 站点生成 | Jekyll + `github-pages` gem（`Gemfile`）；kramdown / Rouge / Liquid |
| 样式与交互 | `assets/css/animal-island.scss`、`_sass/_animal-island-*.scss`、`assets/js/ac-interactions.js`、`assets/js/theme.js`（含日夜切换） |
| 首页数据 | `_data/latest_updates.json`、`_data/routine.yml` → `_includes/ac-updates.html`、`_includes/ac-routine.html` → `_pages/about.md` |
| 自动化 | Node.js 脚本 `scripts/sync-hexo-feed.js`、`scripts/routine.js`（仅用 Node 内置模块，无需 `npm install`） |
| 部署 | `.github/workflows/pages-deploy.yml`：`actions/jekyll-build-pages` → `actions/deploy-pages` |

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `_config.yml` / `_config.dev.yml` | 站点配置（站名、作者、collections、插件）/ 本地预览覆盖（`url: http://localhost:4000`、关闭 analytics、SCSS 不压缩） |
| `_data/navigation.yml` | 顶栏：Notes、Repositories、Blogs（外链）、CV、Links |
| `_pages/about.md` | 首页（`permalink: /`）：自我介绍、最新动态、每日打卡、访问地图、联系方式 |
| `_Notes/`、`_Repositories/` | 课程笔记、项目条目（当前有内容的自定义集合） |
| `_posts/`、`_drafts/`、`_publications/`、`_talks/`、`_teaching/`、`_portfolio/` | 上游 academicpages 的内容集合，各放一个 Markdown 文件 |
| `_data/site_updates.yml` | 本站更新记录，手工维护 |
| `_data/routine.yml` | 每日打卡（leetcode / reading / exercise），由脚本维护 |
| `_data/hexo_latest.json`、`_data/latest_updates.json` | **脚本生成，不要手改**；后者为首页展示的数据源 |
| `_includes/`、`_layouts/`、`_sass/`、`assets/` | 模板、布局、样式、JS 与字体 |
| `images/`、`files/`、`images for how to use it/` | 图片、PDF、DIY 笔记截图 |
| `scripts/`、`docs/` | 维护脚本、操作手册；`docs/` 已在 `_config.yml` 的 `exclude` 中排除，不会发布到站点 |
| `CHANGELOG.md`、`CONTRIBUTING.md` | 上游 Minimal Mistakes / academicpages 模板自带的文档，不是本站变更记录 |

`_config.yml` 共声明 9 个 collections；其中 `Blogs` 已设为 `output: false`（随笔迁至 Hexo 后废弃），`Links`、`additions` 已声明但当前无对应目录。

## 与博客仓库的联动

```
Blogs（Hexo） → atom.xml
        → scripts/sync-hexo-feed.js（取前 8 条 entry）
        → _data/hexo_latest.json
        → 与 _data/site_updates.yml 合并、按日期倒序去重、取前 3 条
        → _data/latest_updates.json
        → _includes/ac-updates.html → _pages/about.md
```

| Workflow | 触发条件 | 行为 |
| --- | --- | --- |
| `pages-deploy.yml` | push `main`、`workflow_dispatch` | 构建 Jekyll 并发布 GitHub Pages |
| `sync-feed.yml` | 每小时整点（`0 * * * *`）、`workflow_dispatch` | 运行同步脚本；JSON 有变化则自动 commit 并 push |
| `on-blog-deploy.yml` | `repository_dispatch: blog-deployed`、`workflow_dispatch` | 同上，额外用 `--strict`：Feed 拉取失败即失败，不回落缓存 |

两个同步工作流共用 `concurrency: hexo-feed-sync`，并在 push 前执行 `git pull --rebase origin main`，避免并发提交导致 non-fast-forward。`repository_dispatch` 需要 `Blogs` 仓库侧保留触发 workflow 与 Secret `HOME_SYNC_TOKEN`；`hexo deploy` 推送的是 `public/` 静态产物，会覆盖该仓库内容，可能冲掉 `.github/workflows`。配置步骤见 [docs/setup-home-sync-token.md](docs/setup-home-sync-token.md)。未配置时，每小时的定时同步仍会更新首页动态。

## 本地开发

```bash
# 依赖 Ruby + Bundler（macOS / Linux；Windows 建议用 WSL）
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# 打开 http://localhost:4000/

# 若 Ruby 3.x 提示 webrick / faraday 缺失
bundle add webrick faraday-retry
```

`package.json` 的脚本无需安装 npm 依赖即可使用（`sync-feed`、`routine`）；`build:css` / `build:js` 需要本机的 `sass` / `uglifyjs` 命令。

```bash
npm run sync-feed                        # 手动同步博客 Feed
npm run routine -- status               # 查看今日打卡
npm run routine -- status 2026-05-22    # 查看指定日期
npm run routine -- leetcode done 2      # 标记完成 + 题数
npm run routine -- exercise undo        # 撤销
```

## 日常维护

| 任务 | 改哪里 | 收尾 |
| --- | --- | --- |
| 站名、作者、社交账号 | `_config.yml` 的 Site Settings / `author` | `git push origin main` |
| 导航项 | `_data/navigation.yml` | 同上 |
| 新增笔记 / 项目 | `_Notes/` / `_Repositories/` 下加 `.md` | 同上 |
| 新增论文 / 报告 / 课程 | `_publications/` / `_talks/` / `_teaching/` / `_portfolio/` | 同上 |
| 记一条本站动态 | `_data/site_updates.yml` 顶部加条目 | `npm run sync-feed` 后 push 两个 JSON |
| 每日打卡 | `npm run routine -- ...`（写 `_data/routine.yml`） | `git add _data/routine.yml && git commit -m "routine: update" && git push` |
| 发一篇博客 | 在 Hexo 源码仓库发文并 `hexo deploy` | Feed 同步自动完成；兜底 `npm run sync-feed` |

新条目的 Front Matter 直接照抄现有文件（例：`_Repositories/Snakegame.md`）：

```yaml
---
title: "Snakegame"
collection: Repositories
type: "Repositories"
permalink: /Repositories/Snakegame
venue: "Peking University"
date: 2025-06-01
location: "Beijing, China"
---
```

`_data/site_updates.yml` 的单条格式：`date / type / title / label / excerpt / url / source`（`scripts/sync-hexo-feed.js` 用正则解析，字段顺序和缩进需与现有条目一致）。

## 部署

push 到 `main` 即触发 **Deploy Pages** workflow；也可在 Actions 里手动 `Run workflow`。GitHub Pages 的 Build and deployment 来源需设为 **GitHub Actions**。站点地址由 `_config.yml` 的 `url: https://carlyuhq.github.io` 与 workflow 共同决定，仓库无 `CNAME`。

## 文档与上游

- [docs/home-updates-routine.md](docs/home-updates-routine.md) — 首页动态与打卡维护说明
- [docs/blog-and-routine-playbook.md](docs/blog-and-routine-playbook.md) — 发博客 / 打卡操作手册（含 Windows 路径示例）
- [docs/setup-home-sync-token.md](docs/setup-home-sync-token.md) — 配置博客部署后自动触发主页同步
- [docs/academicpages-diy-notes.md](docs/academicpages-diy-notes.md) — 旧版 README 原文归档：模板 DIY、Ruby 环境、导航栏扩展笔记
- 上游：[academicpages](https://github.com/academicpages/academicpages.github.io)、[Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes)；许可证为 [MIT](LICENSE)（Copyright (c) 2016 Michael Rose）
