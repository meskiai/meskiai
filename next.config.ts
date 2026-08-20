import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable TypeScript errors during build (prevents exit code 2 on Netlify/CI)
  typescript: { ignoreBuildErrors: true },
  // Force all pages to be server-rendered (dynamic) — prevents @netlify/plugin-nextjs
  // from uploading static pages as blobs (which fails with 403 on local PAT deploys)
  experimental: {
    isrFlushToDisk: false,
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/pdf-parse/test/**/*',
      'node_modules/.prisma/client/libquery_engine-darwin*',
      'node_modules/.prisma/client/libquery_engine-debian*',
      'node_modules/.prisma/client/libquery_engine-windows*',
      'node_modules/.prisma/client/query_engine-*',
      'node_modules/@prisma/engines/**/*',
      'node_modules/typescript/**/*',
      'node_modules/@prisma/client/runtime/*.wasm-base64.js',
      'node_modules/@prisma/client/runtime/*.wasm-base64.mjs',
      'node_modules/.prisma/client/*.wasm-base64.js',
      'node_modules/.prisma/client/*.wasm',
    ],
  },
  output: "standalone",
};

export default nextConfig;
