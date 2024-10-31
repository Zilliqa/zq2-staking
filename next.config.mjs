/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: [
    "antd",
    "@ant-design",
    "rc-pagination",
    "rc-util",
    "rc-picker",
    "rc-tree",
    "rc-table",
  ],
};

export default nextConfig;
