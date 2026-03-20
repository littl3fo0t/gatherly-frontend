import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid picking a parent folder that has another lockfile as Turbopack root.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
