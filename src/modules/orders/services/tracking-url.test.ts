import { describe, expect, it } from "vitest";

import { buildTrackingUrl } from "@/modules/orders/services/tracking-url";

describe("buildTrackingUrl", () => {
  it("replaces the {codigo} placeholder with the URI-encoded tracking code", () => {
    expect(buildTrackingUrl("https://rastreio.com/{codigo}", "BR 123456789")).toBe(
      "https://rastreio.com/BR%20123456789",
    );
  });

  it("returns null when the template is missing", () => {
    expect(buildTrackingUrl(null, "BR123456789")).toBeNull();
    expect(buildTrackingUrl(undefined, "BR123456789")).toBeNull();
    expect(buildTrackingUrl("", "BR123456789")).toBeNull();
  });

  it("returns null when the tracking code is missing", () => {
    expect(buildTrackingUrl("https://rastreio.com/{codigo}", null)).toBeNull();
    expect(buildTrackingUrl("https://rastreio.com/{codigo}", undefined)).toBeNull();
    expect(buildTrackingUrl("https://rastreio.com/{codigo}", "")).toBeNull();
  });
});
