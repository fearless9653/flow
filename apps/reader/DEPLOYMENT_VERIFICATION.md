# Cloudflare Pages Deployment Verification Guide

## Pre-Deployment Local Testing

### Step 1: Install Dependencies

```bash
# From repository root
cd d:\Intellij\webstormProjects\flow
pnpm install
```

### Step 2: Build for Cloudflare

```bash
# Navigate to reader app
cd apps/reader

# Windows PowerShell
$env:CLOUDFLARE_PAGES='true'; npm run build:cloudflare

# Linux/Mac/Git Bash
CLOUDFLARE_PAGES=true npm run build:cloudflare
```

### Step 3: Verify Build Output

Check that `apps/reader/out/` directory contains:

- ✅ `index.html` - Main entry point
- ✅ `_next/static/` - Next.js static assets
- ✅ `_next/` - Next.js build files
- ✅ `icons/` - PWA icons
- ✅ `manifest.json` - Web manifest
- ✅ `*.html` - Other static pages

### Step 4: Check Build Configuration

Verify in `next.config.js`:

```javascript
IS_CLOUDFLARE = process.env.CLOUDFLARE_PAGES === 'true'
output: 'export' // When IS_CLOUDFLARE is true
images: {
  unoptimized: true
}
trailingSlash: true
```

## Cloudflare Pages Configuration

### Build Settings

```
Framework preset: None (or Next.js - Static HTML Export)
Build command: pnpm install --frozen-lockfile && pnpm --filter @flow/reader build:cloudflare
Build output directory: apps/reader/out
Root directory: / (repository root)
```

### Environment Variables

```bash
# Required
CLOUDFLARE_PAGES=true
NODE_VERSION=18.17.0

# Optional
NEXT_PUBLIC_WEBSITE_URL=https://your-project.pages.dev
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GTM_ID=your-gtm-id
```

## Post-Deployment Verification

### 1. Check Build Logs

- ✅ No build errors
- ✅ Static export completed
- ✅ All pages generated successfully

### 2. Test Core Functionality

**File Operations:**

- [ ] Upload EPUB file via file picker
- [ ] Drag and drop EPUB file
- [ ] Open remote EPUB via URL
- [ ] Export/backup data

**Reading Features:**

- [ ] EPUB renders correctly
- [ ] Page navigation (prev/next)
- [ ] Table of contents navigation
- [ ] Search within book
- [ ] Image preview

**Annotations:**

- [ ] Create highlight
- [ ] Add note
- [ ] Delete annotation
- [ ] Annotations persist after reload

**Settings:**

- [ ] Theme switching (light/dark)
- [ ] Language switching
- [ ] Typography customization
- [ ] Layout configuration

**Storage:**

- [ ] Data persists in IndexedDB
- [ ] Multiple books in library
- [ ] Reading progress saved
- [ ] Settings saved

### 3. Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

### 4. Performance Check

- [ ] First page load < 3s
- [ ] EPUB rendering smooth
- [ ] No console errors
- [ ] Service worker (if enabled)

## Common Issues & Solutions

### Build Fails

**Issue:** "i18n config is not compatible with output: export"
**Solution:** Ensure `CLOUDFLARE_PAGES=true` is set

**Issue:** "Module not found"
**Solution:** Run `pnpm install` from repository root

**Issue:** Workspace dependencies not found
**Solution:** Ensure monorepo structure is preserved, build from root

### Runtime Issues

**Issue:** Blank page after deployment
**Solution:** Check browser console, verify build output structure

**Issue:** IndexedDB not working
**Solution:** Ensure site uses HTTPS (Cloudflare Pages default)

**Issue:** Assets not loading (404)
**Solution:** Check `trailingSlash: true` in config, verify `_next/` folder

## Testing Checklist

### Critical Path Testing

1. [ ] Visit homepage
2. [ ] Upload sample EPUB
3. [ ] Open book and navigate
4. [ ] Create annotation
5. [ ] Refresh page - verify data persists
6. [ ] Switch theme
7. [ ] Close and reopen book
8. [ ] Check library view

### Edge Cases

- [ ] Very large EPUB file (>50MB)
- [ ] EPUB with special characters
- [ ] Multiple books open
- [ ] Long annotation text
- [ ] Rapid page navigation

### Mobile Testing

- [ ] Touch navigation
- [ ] Pinch zoom disabled
- [ ] Swipe gestures
- [ ] Landscape/portrait rotation
- [ ] Mobile browser compatibility

## Success Criteria

✅ All core functionality works
✅ No console errors
✅ Data persists correctly
✅ Performance is acceptable
✅ Mobile experience is smooth
✅ All browsers supported

## Next Steps After Successful Deployment

1. Configure custom domain (optional)
2. Set up monitoring (Sentry)
3. Configure analytics (GTM)
4. Set up CDN caching rules
5. Enable Cloudflare optimizations
6. Monitor error rates
7. Gather user feedback

## Rollback Procedure

If issues are found:

1. Go to Cloudflare Pages project
2. Navigate to "Deployments"
3. Select previous working deployment
4. Click "Rollback to this deployment"

## Support Resources

- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Project GitHub Issues](https://github.com/pacexy/flow/issues)
