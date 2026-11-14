import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  /* schema.sql is read at runtime rather than imported, so nothing
     traces it and a hosted build would ship without it and fail on the
     first query. Naming it here puts it in the bundle. */
  outputFileTracingIncludes: {
    "/**/*": ["./lib/db/schema.sql", "./lib/db/columns.json"],
  },
};

export default nextConfig;
