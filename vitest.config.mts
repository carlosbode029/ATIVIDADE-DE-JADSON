import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Os testes de integração compartilham o mesmo Postgres (e algumas
    // fixtures de seed, como a primeira ProductVariant) entre arquivos —
    // rodar arquivos em paralelo causa corrida de escrita na mesma linha.
    fileParallelism: false,
  },
});
