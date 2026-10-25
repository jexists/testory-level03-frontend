import type { NextConfig } from 'next';

/**
 * 브라우저는 같은 오리진의 /api/* 만 호출하고, Next 가 NestJS 백엔드로 전달한다.
 * 그래서 로그인 쿠키가 항상 이 사이트의 1st-party 쿠키가 되어 브라우저의 타사 쿠키 차단에 걸리지 않는다.
 */
const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  // dev 서버가 AGENTS.md 를 자동으로 만들지 않게 한다.
  agentRules: false,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
