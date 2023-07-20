const {basePath} = require("./config")
const {i18n} = require("./next-i18next.config")

/** @type {import("next").NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  distDir: "_static",
  images: {
    unoptimized: true
  },
  basePath: basePath,
  assetPrefix: basePath,

  webpack(config, {isServer, dev}) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true
    }

    // For packages that depend on `fs` module; fs doesn't exist in browser
    // needed for adm-zip
    config.resolve.fallback = {fs: false, "original-fs": false}

    return config
  }
}

module.exports = nextConfig
