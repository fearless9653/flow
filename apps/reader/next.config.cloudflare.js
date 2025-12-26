const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
// Note: next-pwa is disabled for static export
// PWA functionality can be manually configured if needed
const withTM = require('next-transpile-modules')([
  '@flow/internal',
  '@flow/epubjs',
  '@material/material-color-utilities',
])
const IS_DEV = process.env.NODE_ENV === 'development'
const IS_CLOUDFLARE = process.env.CLOUDFLARE_PAGES === 'true'
/**
 * @type {import('next').NextConfig}
 **/
const config = {
  pageExtensions: ['ts', 'tsx'],
  env: {
    // Explicitly disable Dropbox functionality after removal
    NEXT_PUBLIC_ENABLE_DROPBOX: 'false',
  },
  webpack(config) {
    return config
  },
  // For Cloudflare Pages: Use static export
  ...(IS_CLOUDFLARE && {
    output: 'export',
    // Disable image optimization for static export
    images: {
      unoptimized: true,
    },
    // Remove trailing slashes for better routing
    trailingSlash: true,
  }),
  // i18n configuration is not supported with static export
  // For i18n in static export, you need to manually handle locale routing
  // or use a different approach like subpath-based routing
  ...(!IS_CLOUDFLARE && {
    i18n: {
      locales: ['en-US', 'zh-CN', 'ja-JP'],
      defaultLocale: 'en-US',
    },
  }),
}

// For Cloudflare deployment, we don't wrap with PWA or Sentry
if (IS_CLOUDFLARE) {
  module.exports = withTM(withBundleAnalyzer(config))
} else {
  // Original configuration for other deployments
  const withPWA = require('next-pwa')({
    dest: 'public',
  })
  const { withSentryConfig } = require('@sentry/nextjs')

  const sentryWebpackPluginOptions = {
    silent: true,
  }

  const base = withPWA(withTM(withBundleAnalyzer(config)))
  const dev = base
  const prod = withSentryConfig(base, sentryWebpackPluginOptions)

  module.exports = IS_DEV ? dev : prod
}
