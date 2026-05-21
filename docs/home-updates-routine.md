# 主页「最新动态 + 每日 Routine」维护说明

## 最新动态

### Hexo 博客（自动）

- 随笔博客仓库：`CarlYuHQ/Blogs`（本地 `D:\Hexo-Blog\blog`）
- 线上地址：https://carlyuhq.github.io/Blogs/
- Feed：https://carlyuhq.github.io/Blogs/atom.xml

发布 Hexo 文章后：

1. 在 Hexo 项目执行 `hexo deploy`
2. 主页会通过 GitHub Actions 每日同步 feed，或手动运行：

```bash
npm run sync-feed
git add _data/hexo_latest.json _data/latest_updates.json
git commit -m "chore: sync feed"
git push
```

### 本站更新（手动）

编辑 [`_data/site_updates.yml`](../_data/site_updates.yml)，在顶部新增一条：

```yaml
- date: 2026-05-21
  type: notes
  title: 更新了 Notes 页面
  url: /Notes/
  source: site
```

然后运行 `npm run sync-feed` 合并到 `_data/latest_updates.json` 并 push。

## 每日 Routine

编辑 [`_data/routine.yml`](../_data/routine.yml)，或使用快捷命令：

```bash
# 查看今日状态
npm run routine -- status

# LeetCode 打卡 +2 题
npm run routine -- leetcode done 2

# 标记阅读完成
npm run routine -- reading done

# 取消某项
npm run routine -- exercise undo
```

更新后提交：

```bash
git add _data/routine.yml
git commit -m "routine: update"
git push
```

## Blogs 导航说明

- 顶栏 **Blogs** 指向 Hexo 外链：https://carlyuhq.github.io/Blogs/
- Jekyll 内 [`_pages/Blogs.md`](../_pages/Blogs.md) 保留作兼容，不作为主入口
