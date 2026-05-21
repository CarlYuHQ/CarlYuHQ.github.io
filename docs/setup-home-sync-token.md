# 配置博客部署后自动同步主页动态

## 1. 创建 Personal Access Token

GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained** 或 **Classic**

权限（Classic）：勾选 `repo`（或至少能向 `CarlYuHQ/CarlYuHQ.github.io` 发 `repository_dispatch`）

## 2. 添加到 Blogs 仓库

仓库 `CarlYuHQ/Blogs` → Settings → Secrets and variables → Actions → New secret

- Name: `HOME_SYNC_TOKEN`
- Value: 上一步的 token

## 3. 启用主页 workflow

仓库 `CarlYuHQ/CarlYuHQ.github.io` 已包含 `.github/workflows/on-blog-deploy.yml`。

推送 Blogs 的 `main` 后，`trigger-home-sync.yml` 会 dispatch `blog-deployed` 事件，主页 Actions 运行 `sync-hexo-feed.js` 并 commit `_data/*.json`。

## 4. 手动触发

- 主页仓库：Actions → **Sync feed on blog deploy** → Run workflow
- 或本地：`npm run sync-feed` 后 push
