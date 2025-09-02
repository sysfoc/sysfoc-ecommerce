// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: true,
//     images: {
//       remotePatterns: [
//         {
//           protocol: 'https',
//           hostname: 'flowbite.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'images.pexels.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'www.akbaraslam.com',
//         },
//       ],
//     },
//   };
// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  }
};

export default nextConfig;
