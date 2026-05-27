# 博客发布与 Routine 操作手册

本手册面向日常使用，覆盖你最常用的 3 件事：

1. 从写博客到发布更新（已配置好 GitHub Workflow 的前提）
2. 更新每日 Routine
3. 按日期查看 Routine 统计（现有能力 + 可选增强）

---

## 0. 仓库与路径

- Hexo 博客仓库：`D:\Hexo-Blog\blog`
- 主页仓库（Jekyll）：`D:\pkuhub\CarlYuHQ.github.io`
- 博客线上地址：`https://carlyuhq.github.io/Blogs/`
- 主页线上地址：`https://carlyuhq.github.io/`

---

## 1) 从写博客到发布更新（Workflow 已配置）

> 目标：文章发布到 `/Blogs/`，并自动出现在主页“最新动态”。

### Step 1. 新建并编辑文章（Hexo）

```bash
cd D:\Hexo-Blog\blog
npx hexo new "你的文章标题"
```

生成的 Markdown 文件通常在 `source/_posts/` 下，编辑内容后保存。

### Step 2. 本地预览（建议）

```bash
cd D:\Hexo-Blog\blog
npx hexo clean
npx hexo generate
npx hexo server
```

浏览器打开 `http://localhost:4000/Blogs/` 预览，确认无误后 `Ctrl + C` 停止服务。

### Step 3. 发布博客（Hexo deploy）

```bash
cd D:\Hexo-Blog\blog
npx hexo clean
npx hexo generate
npx hexo deploy
```

### Step 4. 等待自动同步主页动态（Workflow）

你已经配置好 workflow，正常情况会自动触发主页同步。检查方式：

- 打开博客 Feed：`https://carlyuhq.github.io/Blogs/atom.xml`
- 打开主页：`https://carlyuhq.github.io/`
- 看“最新动态”是否出现新文章

### Step 5. 自动同步失败时，手动兜底

```bash
cd D:\pkuhub\CarlYuHQ.github.io
npm run sync-feed
git add _data/hexo_latest.json _data/latest_updates.json
git commit -m "chore: sync Hexo feed"
git push
```

---

## 2) 更新每日 Routine（主页）

Routine 数据文件：`_data/routine.yml`  
更新命令入口：`npm run routine -- ...`

### 常用命令

```bash
cd D:\pkuhub\CarlYuHQ.github.io

# 看今天状态
npm run routine -- status

# 看指定日期状态
npm run routine -- status 2026-05-22

# 标记 LeetCode 完成，且今天做了 2 题
npm run routine -- leetcode done 2

# 标记阅读完成
npm run routine -- reading done

# 撤销运动完成（改回待完成）
npm run routine -- exercise undo
```

### 提交发布

```bash
cd D:\pkuhub\CarlYuHQ.github.io
git add _data/routine.yml
git commit -m "routine: update"
git push
```

---

## 3) 按日期统计怎么看？现在有哪些功能？

### 现有内置功能（已支持）

当前 `scripts/routine.js` 内置了：

- `status YYYY-MM-DD`：查看某一天三项任务状态
- `meta.leetcode_streak`：自动计算并维护 LeetCode 连续天数

示例：

```bash
cd D:\pkuhub\CarlYuHQ.github.io
npm run routine -- status 2026-05-20
```

### 目前还不具备的功能（未内置）

目前没有内置“日期区间汇总”命令，例如：

- 本月完成率（xx%）
- 近 30 天每项完成次数
- 每日趋势图/热力图

### 临时查看方式（手动）

可以直接看日志段：

```bash
cd D:\pkuhub\CarlYuHQ.github.io
rg "\"2026-05" _data/routine.yml
```

---

## 4) 你最常用的极简流程（可复制）

### A. 发博客

```bash
cd D:\Hexo-Blog\blog
npx hexo new "标题"
npx hexo clean && npx hexo generate && npx hexo deploy
```

### B. 更新 Routine

```bash
cd D:\pkuhub\CarlYuHQ.github.io
npm run routine -- leetcode done 2
git add _data/routine.yml
git commit -m "routine: update"
git push
```

---

## 5) 可选增强（如果你要我做）

如果你希望“按日期统计”更直观，我可以继续加一个命令：

- `npm run routine -- report 30`（最近 30 天汇总）

输出包括：

- 每项任务完成次数与完成率
- LeetCode 总题数、日均题数
- 缺卡日期列表

