import type { NextConfig } from "next";

// Hardening headers applied to every response.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" }, // no embedding → clickjacking
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera allowed only for our own origin (photo capture); mic/geo off.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // HSTS (harmless on http localhost; enforced once served over https).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
