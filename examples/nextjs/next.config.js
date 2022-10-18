const { MasterCSSWebpackPlugin } = require('../../src')

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config) => {
        config.plugins.push(new MasterCSSWebpackPlugin({
            debug: ['accepts']
        }))
        return config
    }
}

module.exports = nextConfig
