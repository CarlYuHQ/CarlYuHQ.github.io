# 主页「最新动态 + 每日 Routine」维护说明

## 架构概览

| 仓库 | 本地路径 | 线上 |
|------|----------|------|
| `CarlYuHQ.github.io` | `D:\pkuhub\CarlYuHQ.github.io` | https://carlyuhq.github.io/ |
| `CarlYuHQ/Blogs` (Hexo) | `D:\Hexo-Blog\blog` | https://carlyuhq.github.io/Blogs/ |

- 顶栏 **Blogs** → Hexo 外链（Jekyll 不再生成 `/Blogs/` 页面）
- 主页「最新动态」数据：`atom.xml` → `npm run sync-feed` → `_data/latest_updates.json`

---

## 发一篇博客（完整清单）

1. **写稿并部署 Hexo**

```bash
cd D:\Hexo-Blog\blog
npx hexo clean && npx hexo generate && npx hexo deploy
```

2. **确认 Feed 已更新**

浏览器打开：https://carlyuhq.github.io/Blogs/atom.xml  
确认最新文章出现在 `<entry>` 中。

3. **同步到主页「最新动态」**

**自动（推荐）**：`hexo deploy` 推送 `CarlYuHQ/Blogs` 的 `main` 后，GitHub Actions 会触发主页仓库同步。首次使用请按 [setup-home-sync-token.md](./setup-home-sync-token.md) 配置 `HOME_SYNC_TOKEN`。

**手动**：

```bash
cd D:\pkuhub\CarlYuHQ.github.io
npm run sync-feed
git add _data/hexo_latest.json _data/latest_updates.json
git commit -m "chore: sync Hexo feed"
git push
```

4. **验收**

- 打开 https://carlyuhq.github.io/ ，「最新动态」第一条应为刚发文章（或合并后的最新条目）
- 点击「去看看 →」应跳到 `/Blogs/yyyy/mm/dd/标题/`

---

## 最新动态

### Hexo 博客（自动）

- Feed：https://carlyuhq.github.io/Blogs/atom.xml
- 脚本：[`scripts/sync-hexo-feed.js`](../scripts/sync-hexo-feed.js)
- 合并结果：[`_data/latest_updates.json`](../_data/latest_updates.json)
- 定时同步：[`.github/workflows/sync-feed.yml`](../.github/workflows/sync-feed.yml)（每日 UTC 8:00）
- 博客部署触发：[`.github/workflows/on-blog-deploy.yml`](../.github/workflows/on-blog-deploy.yml)

### 本站更新（手动）

编辑 [`_data/site_updates.yml`](../_data/site_updates.yml)，在顶部新增一条：

```yaml
- date: 2026-05-21
  type: notes
  title: 更新了 Notes 页面
  url: /Notes/
  source: site
```

然后运行 `npm run sync-feed` 并 push。

---

## 每日 Routine

编辑 [`_data/routine.yml`](../_data/routine.yml)，或使用：

```bash
npm run routine -- status
npm run routine -- leetcode done 2
npm run routine -- reading done
npm run routine -- exercise undo
```

更新后：

```bash
git add _data/routine.yml
git commit -m "routine: update"
git push
```

---

## Blogs 导航说明

- 顶栏 **Blogs** → https://carlyuhq.github.io/Blogs/（Hexo）
- 旧 Jekyll 文集 `PKUtimes` 已迁至 [`_Notes/PKUtimes.md`](../_Notes/PKUtimes.md)（`/Notes/PKUtimes`，旧链 `/hiddenBlogs/PKUtimes` 自动跳转）

---

## 本地一键（Hexo 部署 + 主页同步）

在 Hexo 仓库运行（需本机已 clone 主页仓库）：

```powershell
.\scripts\deploy-and-sync.ps1
```

详见 `D:\Hexo-Blog\blog\scripts\deploy-and-sync.ps1`。
