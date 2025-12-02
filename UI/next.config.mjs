/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  distDir: 'build',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
