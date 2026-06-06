/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    qualities: [75, 80, 95, 100],
  },
  allowedDevOrigins: ['192.168.55.106'],
};

export default nextConfig;
