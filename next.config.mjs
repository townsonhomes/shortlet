/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // for Google profile images
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // for Cloudinary shortlet images
      },
    ],
  },
};

export default nextConfig;
