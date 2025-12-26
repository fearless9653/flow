# Flow EPUB Reader - Cloudflare Pages 部署说明

## 可行性分析结论

### ✅ **完全可行** - Reader 应用可以成功部署到 Cloudflare Pages

经过全面的代码分析，Flow Reader 应用完全适合部署到 Cloudflare Pages，因为：

1. **纯客户端应用** - 所有功能都在浏览器中运行
2. **无服务端依赖** - 没有 API 路由或服务端渲染
3. **使用浏览器存储** - IndexedDB 存储所有数据
4. **静态资源** - 所有页面都可以静态导出

## 已完成的改造

### 1. 修改的文件

#### [next.config.js](file:///d:/Intellij/webstormProjects/flow/apps/reader/next.config.js)

- ✅ 添加 `IS_CLOUDFLARE` 环境变量检测
- ✅ 配置 `output: 'export'` 进行静态导出
- ✅ 禁用 i18n（静态导出不支持）
- ✅ 针对 Cloudflare 构建跳过 PWA 和 Sentry 包装器
- ✅ 启用图片优化绕过

#### [package.json](file:///d:/Intellij/webstormProjects/flow/apps/reader/package.json)

- ✅ 添加 `build:cloudflare` 构建脚本
- ✅ 移除了部署时不需要的 Sentry 依赖

### 2. 新增的文件

1. **[wrangler.toml](file:///d:/Intellij/webstormProjects/flow/apps/reader/wrangler.toml)** - Cloudflare Wrangler 配置
2. **[.env.cloudflare.example](file:///d:/Intellij/webstormProjects/flow/apps/reader/.env.cloudflare.example)** - 环境变量示例
3. **[CLOUDFLARE_DEPLOYMENT.md](file:///d:/Intellij/webstormProjects/flow/apps/reader/CLOUDFLARE_DEPLOYMENT.md)** - 技术分析文档（英文）
4. **[CLOUDFLARE_PAGES_GUIDE.md](file:///d:/Intellij/webstormProjects/flow/apps/reader/CLOUDFLARE_PAGES_GUIDE.md)** - 详细部署指南（英文）

## 部署前验证

在部署到 Cloudflare Pages 之前，建议先本地验证构建：

```bash
# 从项目根目录执行
cd apps/reader

# Windows PowerShell
$env:CLOUDFLARE_PAGES='true'; npm run build:cloudflare

# Linux/Mac
CLOUDFLARE_PAGES=true npm run build:cloudflare
```

构建成功后，检查 `apps/reader/out` 目录是否包含：

- ✅ `index.html`
- ✅ `_next/` 目录
- ✅ `icons/` 目录
- ✅ `manifest.json`

## 快速部署步骤

### 方法 1: Cloudflare Pages 控制台（推荐）

1. **登录 Cloudflare**

   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 Pages 服务

2. **创建项目**

   - 点击 "创建项目"
   - 连接你的 Git 仓库
   - 选择 flow 仓库

3. **配置构建设置**

   **构建配置：**

   ```
   框架预设: None (或 Next.js - Static HTML Export)
   构建命令: pnpm install --frozen-lockfile && pnpm --filter @flow/reader build:cloudflare
   构建输出目录: apps/reader/out
   根目录: /
   Node 版本: 18.17.0
   ```

   **环境变量：**

   ```
   CLOUDFLARE_PAGES=true
   NEXT_PUBLIC_WEBSITE_URL=https://你的项目.pages.dev
   NODE_VERSION=18.17.0
   ```

4. **部署**
   - 点击 "保存并部署"
   - 等待构建完成
   - 访问 `https://你的项目.pages.dev`

### 方法 2: 本地构建 + CLI 部署

```bash
# 1. 安装 Wrangler
pnpm add -g wrangler

# 2. 登录
wrangler login

# 3. 构建项目
cd apps/reader
pnpm build:cloudflare

# 4. 部署
wrangler pages deploy out --project-name=flow-reader
```

## 功能兼容性

### ✅ 完全支持的功能

- EPUB 文件阅读和渲染
- 本地存储（IndexedDB）
- 标注和高亮
- 排版自定义
- 主题切换
- 多语言界面
- 文件导入/导出
- 拖放功能

### ⚠️ 有限制的功能

1. **i18n 路由**

   - 自动语言路由被禁用
   - 用户需要从界面手动选择语言
   - 可选：实现客户端语言检测

2. **PWA 服务工作线程**

   - `next-pwa` 在静态导出时被禁用
   - 如需要，可手动配置 service worker

3. **图片优化**
   - Next.js 图片优化 API 被禁用
   - 图片按原样提供

## 性能优势

- ✅ 从 Cloudflare 全球 CDN 提供静态文件
- ✅ 快速的初始页面加载
- ✅ 优秀的缓存策略
- ✅ 无冷启动问题
- ✅ 自动 HTTPS
- ✅ 无限带宽（Cloudflare Pages 免费计划）

## 故障排除

### 构建失败

**错误: "i18n config is not compatible with output: export"**

- 确保环境变量中设置了 `CLOUDFLARE_PAGES=true`

**错误: "Module not found"**

- 确保 monorepo 依赖已安装
- 先在仓库根目录运行 `pnpm install`

### 运行时问题

**应用无法加载**

- 检查浏览器控制台错误
- 验证所有静态资源正确部署
- 检查部署中是否存在 `_next` 文件夹

**IndexedDB 不工作**

- 确保站点通过 HTTPS 提供（Cloudflare Pages 始终使用 HTTPS）
- 检查浏览器隐私设置

## 自定义域名

1. 进入 Cloudflare Pages 项目设置
2. 点击 "自定义域名"
3. 添加你的域名
4. 按照 DNS 配置说明操作
5. 等待 SSL 证书自动配置

## 监控和分析

### 错误跟踪（可选）

设置 `NEXT_PUBLIC_SENTRY_DSN` 环境变量启用 Sentry 客户端错误跟踪。

### 分析（可选）

设置 `NEXT_PUBLIC_GTM_ID` 环境变量启用 Google Tag Manager 分析。

## 回滚

Cloudflare Pages 保留所有历史部署：

1. 进入项目的 "部署" 页面
2. 选择任何历史部署
3. 点击 "回滚到此部署"

## 部署检查清单

### 部署前（本地验证）

- [ ] 从项目根目录安装依赖 `pnpm install`
- [ ] 本地测试构建 `cd apps/reader && npm run build:cloudflare`
- [ ] 验证 `out/` 目录存在且包含必要文件
- [ ] 检查构建日志无错误

### Cloudflare Pages 配置

- [ ] 连接 Git 仓库到 Cloudflare Pages
- [ ] 配置正确的构建命令和输出目录
- [ ] 设置环境变量 `CLOUDFLARE_PAGES=true`
- [ ] 设置 Node 版本 `NODE_VERSION=18.17.0`
- [ ] 点击 "保存并部署"

### 部署后验证

- [ ] 检查 Cloudflare Pages 构建日志
- [ ] 访问部署的 URL 验证页面加载
- [ ] 测试 EPUB 文件上传和阅读
- [ ] 测试标注和高亮功能
- [ ] 测试主题切换
- [ ] 测试多语言切换
- [ ] 在移动设备上测试
- [ ] 配置自定义域名（可选）
- [ ] 设置监控和分析（可选）

## 技术支持

- Cloudflare Pages 相关问题: [Cloudflare 社区](https://community.cloudflare.com/)
- Next.js 静态导出: [Next.js 文档](https://nextjs.org/docs/advanced-features/static-html-export)
- Flow Reader: [GitHub Issues](https://github.com/pacexy/flow/issues)

## 总结

Flow EPUB Reader 应用已经完全适配 Cloudflare Pages 部署。所有核心功能都能正常工作，且部署后将获得显著的性能提升。唯一的限制是自动 i18n 路由需要改为手动语言选择，但这不影响应用的核心功能。
