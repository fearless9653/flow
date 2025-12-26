# Cloudflare Pages Deployment Guide for Flow Reader

This guide explains how to deploy the Flow EPUB Reader to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Access to Cloudflare Pages
- Git repository connected to Cloudflare Pages

## Deployment Methods

### Method 1: Direct Git Integration (Recommended)

#### 1. Connect Your Repository to Cloudflare Pages

1. Log in to Cloudflare Dashboard
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository
4. Select the repository and branch

#### 2. Configure Build Settings

In the Cloudflare Pages project settings:

**Build configuration:**

- **Framework preset:** None (or Next.js - Static HTML Export)
- **Build command:** `pnpm install --frozen-lockfile && pnpm --filter @flow/reader build:cloudflare`
- **Build output directory:** `apps/reader/out`
- **Root directory:** `/` (leave as repository root)
- **Node version:** `18.17.0` or higher

**Environment variables:**

```
CLOUDFLARE_PAGES=true
NEXT_PUBLIC_WEBSITE_URL=https://your-project.pages.dev
NODE_VERSION=18.17.0
```

Optional environment variables:

```
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
NEXT_PUBLIC_GTM_ID=your-gtm-id-here
```

#### 3. Deploy

- Click **Save and Deploy**
- Cloudflare Pages will automatically build and deploy your project
- Your site will be available at `https://your-project.pages.dev`

### Method 2: CLI Deployment

#### 1. Install Wrangler

```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

#### 2. Authenticate

```bash
wrangler login
```

#### 3. Build Locally

```bash
# From repository root
pnpm install
cd apps/reader
pnpm build:cloudflare
```

#### 4. Deploy

```bash
# Deploy the out directory
wrangler pages deploy out --project-name=flow-reader
```

## Configuration Details

### Modified Files

1. **next.config.js**

   - Added `IS_CLOUDFLARE` environment check
   - Configured `output: 'export'` for static generation
   - Disabled i18n (not supported in static export)
   - Disabled PWA and Sentry wrappers for Cloudflare builds
   - Enabled image optimization bypass

2. **package.json**
   - Added `build:cloudflare` script

### What Works

✅ **Full Client-Side Functionality:**

- EPUB file reading and rendering
- Local storage (IndexedDB via Dexie)
- Annotations and highlights
- Typography customization
- Theme switching
- Multi-language UI (manual selection)
- File import/export
- Drag and drop

✅ **Performance Benefits:**

- Static files served from Cloudflare's global CDN
- Fast initial page load
- Excellent caching
- No cold starts

### Limitations

⚠️ **Static Export Limitations:**

1. **No Dynamic i18n Routing**

   - Next.js i18n automatic routing is disabled
   - Users must manually select language from UI
   - Alternative: Implement client-side language detection

2. **No PWA Service Worker**

   - `next-pwa` is disabled for static export
   - Alternative: Manually configure service worker if needed

3. **No Server-Side Features**

   - No API routes (not needed for this app)
   - No server-side rendering
   - No incremental static regeneration

4. **No Image Optimization**
   - Next.js Image Optimization API is disabled
   - Images are served as-is

## Troubleshooting

### Build Fails

**Error: "i18n config is not compatible with output: export"**

- Solution: Ensure `CLOUDFLARE_PAGES=true` is set in environment variables

**Error: "Module not found"**

- Solution: Make sure monorepo dependencies are installed
- Run `pnpm install` in the repository root first

### Runtime Issues

**App doesn't load**

- Check browser console for errors
- Verify all static assets are correctly deployed
- Check `_next` folder exists in deployment

**IndexedDB not working**

- Ensure site is served over HTTPS (Cloudflare Pages always uses HTTPS)
- Check browser privacy settings

**Missing translations**

- Verify locale files are included in build output
- Check `apps/reader/locales/` directory is exported

## Performance Optimization

### Recommended Cloudflare Pages Settings

1. **Enable Auto-Minify**

   - Go to Cloudflare Dashboard → Speed → Optimization
   - Enable JavaScript, CSS, and HTML minification

2. **Enable Brotli Compression**

   - Already enabled by default on Cloudflare Pages

3. **Configure Cache Rules**

   - Set aggressive caching for static assets
   - Example: Cache `/_next/static/*` for 1 year

4. **Enable Early Hints**
   - Improves performance by preloading resources
   - Available in Cloudflare Pages settings

## Custom Domain Setup

1. Go to Cloudflare Pages project settings
2. Click **Custom domains**
3. Add your domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (automatic)

## Monitoring

### Client-Side Error Tracking

Sentry is configured for client-side error tracking:

1. Set `NEXT_PUBLIC_SENTRY_DSN` environment variable
2. Errors will be reported to Sentry dashboard
3. Server-side Sentry is disabled for static export

### Analytics

Configure Google Tag Manager:

1. Set `NEXT_PUBLIC_GTM_ID` environment variable
2. Analytics will be automatically tracked

## Rollback

Cloudflare Pages keeps all previous deployments:

1. Go to Cloudflare Pages project
2. Navigate to **Deployments**
3. Click on any previous deployment
4. Click **Rollback to this deployment**

## Advanced Configuration

### Custom Headers

Create a `_headers` file in `apps/reader/public/`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Custom Redirects

Create a `_redirects` file in `apps/reader/public/`:

```
/old-path/* /new-path/:splat 301
/api/* https://api.example.com/:splat 200
```

## Migration Checklist

- [ ] Configure Cloudflare Pages project
- [ ] Set environment variables
- [ ] Test build locally with `pnpm build:cloudflare`
- [ ] Verify static export output in `out/` directory
- [ ] Deploy to Cloudflare Pages
- [ ] Test all functionality on deployed site
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and analytics
- [ ] Configure caching rules
- [ ] Test on multiple devices and browsers

## Support

For issues specific to:

- **Cloudflare Pages:** [Cloudflare Community](https://community.cloudflare.com/)
- **Next.js Static Export:** [Next.js Documentation](https://nextjs.org/docs/advanced-features/static-html-export)
- **Flow Reader:** [GitHub Issues](https://github.com/pacexy/flow/issues)
