import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src/", import.meta.url));
const serverOnlyStub = fileURLToPath(
  new URL("./tests/stubs/server-only.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: srcDir },
      { find: /^server-only$/, replacement: serverOnlyStub },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
  },
});
