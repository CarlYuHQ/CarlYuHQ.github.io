# 配置「发博客后自动更新主页最新动态」

## 这是在干什么？

你有 **两个仓库**：

| 仓库 | 网址 | 作用 |
|------|------|------|
| `CarlYuHQ/Blogs` | https://carlyuhq.github.io/Blogs/ | Hexo 博客正文 |
| `CarlYuHQ/CarlYuHQ.github.io` | https://carlyuhq.github.io/ | 个人主页（含「最新动态」） |

发一篇 Hexo 文章并 `hexo deploy` 后，**博客立刻上线**，但主页「最新动态」的数据在另一个仓库的 `_data/latest_updates.json` 里，**不会自动变**。

配置 `HOME_SYNC_TOKEN` 后，流程变成：

```
你 push Blogs 的 main
    → Blogs 仓库 Actions 用 Token 发信号
    → 主页仓库 Actions 拉取 atom.xml、更新 JSON、自动 commit
    → 几分钟后主页显示新文章
```

不配 Token 也可以：每次发博后自己在主页仓库跑 `npm run sync-feed` 并 push（见 [home-updates-routine.md](./home-updates-routine.md)）。

---

## 第一步：创建 GitHub Token（钥匙）

Token 相当于一把**只给自动化脚本用的钥匙**，让 Blogs 仓库的 Actions 有权去「叫醒」主页仓库。

### 用 Classic Token（推荐，步骤少）

1. 浏览器打开（需登录你的 GitHub 账号）：  
   https://github.com/settings/tokens  
2. 点击 **Generate new token** → **Generate new token (classic)**  
3. **Note** 随便写，例如：`blogs-home-sync`  
4. **Expiration** 建议选 90 天或 No expiration（到期后要重新配 Secret）  
5. **勾选权限**：至少勾选 **`repo`**（整项勾选即可）  
   - 含义：允许读写你有权限的私有/公开仓库，才能向 `CarlYuHQ.github.io` 发送 `repository_dispatch` 信号  
6. 页面底部 **Generate token**  
7. **立刻复制** 以 `ghp_` 或 `github_pat_` 开头的一串字符  
   - **只显示一次**，关掉页面就看不到了；丢了只能重新生成  

### 用 Fine-grained Token（可选，权限更细）

1. https://github.com/settings/tokens?type=beta → **Generate new token**  
2. Repository access 选 **Only select repositories**，勾选：  
   - `CarlYuHQ/CarlYuHQ.github.io`  
3. Permissions → Repository permissions：  
   - **Contents**: Read and write（或至少能触发 Actions）  
   - **Metadata**: Read-only（默认）  
4. 生成后同样复制 token 字符串  

---

## 第二步：把 Token 放进 Blogs 仓库的 Secrets

Secret 是**加密存放**的，Actions 运行时能读，网页和日志里不会明文显示。

1. 打开博客仓库（注意是 **Blogs**，不是 github.io）：  
   https://github.com/CarlYuHQ/Blogs  
2. 顶部 **Settings**（仓库设置，不是个人 Settings）  
3. 左侧 **Secrets and variables** → **Actions**  
4. 点击 **New repository secret**  
5. 填写：  
   - **Name**（必须一字不差）：`HOME_SYNC_TOKEN`  
   - **Secret**：粘贴第一步复制的整段 token  
6. **Add secret**  

配好后，列表里应出现一行 `HOME_SYNC_TOKEN`，值显示为 `***`。

---

## 第三步：确认主页仓库已有接收端（一般不用改）

仓库 `CarlYuHQ/CarlYuHQ.github.io` 里应有文件：

`.github/workflows/on-blog-deploy.yml`

作用：收到 `blog-deployed` 信号后执行 `node scripts/sync-hexo-feed.js`，更新 `_data/hexo_latest.json` 和 `_data/latest_updates.json` 并 push。

可在主页仓库 **Actions** 里看到工作流：**Sync feed on blog deploy**。

---

## 第四步：怎么验证配置成功？

### 方法 A：随便推一次 Blogs（或重新 deploy）

```bash
cd D:\Hexo-Blog\blog
npx hexo deploy
# 若 deploy 后 workflow 被覆盖，需保留 .github/workflows（见 Blogs README）
```

然后打开：

1. https://github.com/CarlYuHQ/Blogs/actions  
   - 最新 **Trigger homepage feed sync** 应为 **绿色**  
   - 日志里应有：`Homepage feed sync triggered successfully.`  
2. 等 1～2 分钟，打开：  
   https://github.com/CarlYuHQ/CarlYuHQ.github.io/actions  
   - 应出现新的 **Sync feed on blog deploy**，成功后会多一个 commit：`chore: sync Hexo feed after blog deploy`  
3. 打开 https://carlyuhq.github.io/ 强刷，看「最新动态」是否含最新博客条目  

### 方法 B：手动触发（不重新 deploy）

- Blogs 仓库 → **Actions** → **Trigger homepage feed sync** → **Run workflow**  

---

## 常见问题

### Q1：没配 Token 时 Actions 算失败吗？

不会。当前 workflow 会 **跳过** 并显示 notice，状态为 **成功（绿色）**，只是不会同步主页。

### Q2：Token 配了还是失败？

- 检查 Name 是否为 `HOME_SYNC_TOKEN`（全大写、无空格）  
- 检查 Token 是否过期、是否仍有 `repo` 权限  
- 检查主页仓库 Actions 是否开启（Settings → Actions → General）  
- 看失败日志里的 HTTP 状态码（401/403 多为权限问题）  

### Q3：`hexo deploy` 之后 workflow 没了？

`hexo deploy` 只推送 `public/` 静态站，**会覆盖** 远程仓库内容，可能冲掉 `.github/workflows/`。  
解决：从本地再 push 一次 workflow（见 `D:\Hexo-Blog\blog\.github\workflows\trigger-home-sync.yml`），或使用 `tools/push-workflow.ps1`（若有）。

### Q4：和「pages build and deployment」什么关系？

| 工作流 | 作用 |
|--------|------|
| pages build and deployment | GitHub 官方发布 `/Blogs/` 网站 |
| Trigger homepage feed sync | 可选，通知主页更新「最新动态」 |

两个互不影响；前者失败才影响博客打不开。

---

## 安全提醒

- Token 相当于密码，不要发到聊天、不要 commit 进代码  
- 只放在 GitHub Secrets 里  
- 泄露后立刻到 https://github.com/settings/tokens 删除该 token，并重新生成、更新 Secret  
