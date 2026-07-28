const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')([
  '@flow/internal',
  '@flow/epubjs',
  '@material/material-color-utilities',
])

const IS_DEV = process.env.NODE_ENV === 'development'
const IS_DOCKER = process.env.DOCKER
const IS_CLOUDFLARE = process.env.CLOUDFLARE_PAGES === 'true'

// Only load these in non-Cloudflare environments
let withSentryConfig, withPWA
if (!IS_CLOUDFLARE) {
  withSentryConfig = require('@sentry/nextjs').withSentryConfig
  withPWA = require('next-pwa')({
    dest: 'public',
  })
}

/**
 * @type {import('@sentry/nextjs').SentryWebpackPluginOptions}
 **/
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  pageExtensions: ['ts', 'tsx'],
  webpack(config) {
    return config
  },
  // For Cloudflare Pages: Disable i18n for static export compatibility
  ...(!IS_CLOUDFLARE && {
    i18n: {
      locales: ['en-US', 'zh-CN', 'ja-JP'],
      defaultLocale: 'zh-CN',
    },
  }),
  // Note: Next.js 12.x doesn't support output: 'export'
  // Static export is handled via 'next export' command in package.json
  // Cloudflare Pages configuration
  ...(IS_CLOUDFLARE && {
    // Disable image optimization for static export
    images: {
      unoptimized: true,
    },
    // Add trailing slash for better routing
    trailingSlash: true,
  }),
  // Docker standalone configuration
  ...(IS_DOCKER &&
    !IS_CLOUDFLARE && {
      output: 'standalone',
      experimental: {
        outputFileTracingRoot: path.join(__dirname, '../../'),
      },
    }),
}

// For Cloudflare Pages: Simple export without PWA and Sentry
if (IS_CLOUDFLARE) {
  module.exports = withTM(withBundleAnalyzer(config))
} else {
  const base = withPWA(withTM(withBundleAnalyzer(config)))

  const dev = base
  const docker = base
  const prod = withSentryConfig(
    base,
    // Make sure adding Sentry options is the last code to run before exporting, to
    // ensure that your source maps include changes from all other Webpack plugins
    sentryWebpackPluginOptions,
  )

  module.exports = IS_DEV ? dev : IS_DOCKER ? docker : prod
}
