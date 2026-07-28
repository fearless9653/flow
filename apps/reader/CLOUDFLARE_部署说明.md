# Flow EPUB Reader - Cloudflare Pages 部署说明

## 可行性分析结论

### ✅ **完全可行** - Reader 应用可以成功部署到 Cloudflare Pages

经过全面的代码分析，Flow Reader 应用完全适合部署到 Cloudflare Pages，因为：

1. **纯客户端应用** - 所有功能都在浏览器中运行
2. **无服务端依赖** - 没有 API 路由或服务端渲染
3. **使用浏览器存储** - IndexedDB 存储所有数据
4. **静态资源** - 所有页面都可以静态导出

⚠️ **重要提示：Next.js 12.x 版本说明**

当前项目使用 **Next.js 12.3.4**，该版本不支持 `output: 'export'` 配置（该功能在 Next.js 13.3+ 引入）。
因此，我们使用 **`next build && next export`** 两步命令来实现静态导出。

## 已完成的改造

### 1. 修改的文件

#### [next.config.js](file:///d:/Intellij/webstormProjects/flow/apps/reader/next.config.js)

- ✅ 添加 `IS_CLOUDFLARE` 环境变量检测
- ✅ 禁用 i18n（静态导出不支持）
- ✅ 针对 Cloudflare 构建跳过 PWA 和 Sentry 包装器
- ✅ 启用图片优化绕过 (`images.unoptimized: true`)
- ✅ 启用尾部斜杠 (`trailingSlash: true`)
- ⚠️ **注意：** Next.js 12.x 不支持 `output: 'export'`，使用 `next export` 命令代替

#### [package.json](file:///d:/Intellij/webstormProjects/flow/apps/reader/package.json)

- ✅ 添加 `build:cloudflare` 构建脚本
- ✅ 使用两步命令：`next build && next export`（Next.js 12.x 兼容方式）
- ✅ 两步命令均通过 `cross-env` 设置 `CLOUDFLARE_PAGES=true`（`&&` 分隔的命令不会继承前一段 cross-env 设置的变量，`next export` 必须单独设置，否则会因 i18n 配置报错）

### 2. 新增的文件

1. **[wrangler.toml](file:///d:/Intellij/webstormProjects/flow/apps/reader/wrangler.toml)** - Cloudflare Wrangler 配置
2. **[.env.cloudflare.example](file:///d:/Intellij/webstormProjects/flow/apps/reader/.env.cloudflare.example)** - 环境变量示例

## 部署前验证

在部署到 Cloudflare Pages 之前，**必须**先本地验证构建能正确生成 `out/` 文件夹。

### 构建步骤（Windows PowerShell）

```powershell
# 1. 进入 reader 目录
cd d:\Intellij\webstormProjects\flow\apps\reader

# 2. 使用构建脚本（推荐）
npm run build:cloudflare

# 或者手动执行两步
$env:CLOUDFLARE_PAGES='true'
npx cross-env CLOUDFLARE_PAGES=true next build
npx next export
```

### ✅ 验证构建成功

**检查 1：构建日志**

成功的构建应该显示：

```
# 第一步：next build
info  - Creating an optimized production build
info  - Compiled successfully
info  - Collecting page data
info  - Generating static pages (x/x)
info  - Finalizing page optimization

Page                                       Size     First Load JS
┌ ○ /                                      xxx kB         xxx kB
├ ○ /_                                     xxx kB         xxx kB
└ ○ /404                                   xxx kB         xxx kB

# 第二步：next export
info  - using build directory: D:\...\flow\apps\reader\.next
info  - Copying "static" directory
info  - Copying "public" directory
info  - Launching 3 workers
Exporting (x/x)
Export successful. Files written to D:\...\flow\apps\reader\out
```

**关键信息：**看到 `Export successful. Files written to ...\out` 表示成功！

**检查 2：out/ 文件夹结构**

```
apps/reader/out/
├── index.html          ✅ 必须存在
├── 404.html            ✅ 404 页
├── _/
│   └── index.html      ✅ 因 trailingSlash: true，页面以目录形式导出
├── _next/
│   ├── static/         ✅ 静态资源
│   └── ...
├── icons/              ✅ 图标文件
├── manifest.json       ✅ PWA 清单
└── ...
```

### ❌ 常见问题和解决方案

#### 问题 1：没有生成 out/ 文件夹

**症状：** 构建完成但找不到 `out/` 目录

**原因：**

- ❌ `CLOUDFLARE_PAGES` 环境变量未正确设置
- ❌ Next.js 没有使用 `output: 'export'` 配置

**解决：**

```powershell
# 验证环境变量
$env:CLOUDFLARE_PAGES
# 应该输出: true

# 如果为空，重新设置并构建
$env:CLOUDFLARE_PAGES='true'
npm run build:cloudflare

# 检查 next.config.js 是否正确加载
node -e "process.env.CLOUDFLARE_PAGES='true'; console.log(require('./next.config.js'));"
```

#### 问题 2：构建错误 "i18n is not compatible with output: export"

**症状：** 构建失败，提示 i18n 不兼容

**原因：** 环境变量没有传递到 Next.js 配置

**解决：**

```powershell
# 确保使用 cross-env（已在 package.json 配置）
npm run build:cloudflare

# 或手动设置后立即构建
$env:CLOUDFLARE_PAGES='true'; npm run build
```

#### 问题 3：构建时仍加载 next-pwa 或 Sentry

**症状：** 构建日志显示 PWA 相关错误

**原因：** 配置文件在 Cloudflare 模式下应跳过这些依赖

**解决：** 检查 `next.config.js` 第 17-22 行，确保有条件加载：

```javascript
let withSentryConfig, withPWA
if (!IS_CLOUDFLARE) {
  withSentryConfig = require('@sentry/nextjs').withSentryConfig
  withPWA = require('next-pwa')({ dest: 'public' })
}
```

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
- 文件导入/导出
- 拖放功能

### ⚠️ 有限制的功能

1. **i18n / 多语言**

   - 静态导出不支持 Next.js i18n 路由，已禁用
   - 界面语言锁定为简体中文（`useTranslation` 默认 `zh-CN`），设置页中的语言选择器已移除

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

### 错误跟踪

Cloudflare 构建跳过了 `withSentryConfig`，`sentry.client.config.js` 不会被注入，因此 Sentry 错误跟踪在 Cloudflare Pages 部署中**不可用**（设置 `NEXT_PUBLIC_SENTRY_DSN` 无效）。如需错误跟踪，需在 `_app.tsx` 中手动调用 `Sentry.init`。

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
- [ ] 在移动设备上测试
- [ ] 配置自定义域名（可选）
- [ ] 设置监控和分析（可选）

## 技术支持

- Cloudflare Pages 相关问题: [Cloudflare 社区](https://community.cloudflare.com/)
- Next.js 静态导出: [Next.js 文档](https://nextjs.org/docs/advanced-features/static-html-export)
- Flow Reader: [GitHub Issues](https://github.com/pacexy/flow/issues)

## 总结

Flow EPUB Reader 应用已经完全适配 Cloudflare Pages 部署。所有核心功能都能正常工作，且部署后将获得显著的性能提升。主要限制：i18n 路由被禁用、界面语言锁定为简体中文，PWA 离线能力和 Sentry 错误跟踪在此部署方式下不可用，但这些不影响应用的核心阅读功能。
