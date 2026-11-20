import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ALMA (el workshop) también se comparte como conexionteam.app/alma. Next conserva la query (UTMs) al redirigir.
  async redirects() {
    return [{ source: "/alma", destination: "/workshop", permanent: false }];
  },
};

export default nextConfig;
