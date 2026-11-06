import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel에서 NEXT_PUBLIC_ 접두사 없이 저장된 SUPABASE_URL, SUPABASE_ANON_KEY를
  // 클라이언트 브라우저 코드에서도 정상적으로 읽을 수 있도록 자동 주입
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
};

export default nextConfig;
