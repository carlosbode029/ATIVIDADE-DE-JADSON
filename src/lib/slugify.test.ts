import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Camisa Flamengo I 2024")).toBe("camisa-flamengo-i-2024");
  });

  it("strips accents", () => {
    expect(slugify("Seleção Brasileira")).toBe("selecao-brasileira");
  });

  it("removes non-alphanumeric characters", () => {
    expect(slugify("Camisa (Edição Retrô) — 1994")).toBe(
      "camisa-edicao-retro-1994",
    );
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Time X  ")).toBe("time-x");
  });
});
