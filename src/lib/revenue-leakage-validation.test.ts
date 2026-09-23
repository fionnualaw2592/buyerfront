import { describe, expect, test } from "bun:test";

import {
  emptyRevenueLeakageFields,
  validateRevenueLeakage,
} from "./revenue-leakage-validation";

const valid = {
  name: "Aoife Byrne",
  email: "aoife@gmail.com",
  company: "Example Ltd",
  website: "example.com",
  sells: "Recruitment and account management services",
  enquiryProcess: "The account manager hands over the signed brief to the delivery team.",
  stuckPoints: "",
};

describe("revenue leakage validation", () => {
  test("accepts a complete submission with a personal email domain", () => {
    expect(validateRevenueLeakage(valid)).toEqual({});
  });

  test("requires every mandatory field", () => {
    const errors = validateRevenueLeakage(emptyRevenueLeakageFields);
    expect(Object.keys(errors).sort()).toEqual([
      "company",
      "email",
      "enquiryProcess",
      "name",
      "sells",
      "website",
    ]);
  });

  test("rejects malformed email and website values", () => {
    const errors = validateRevenueLeakage({ ...valid, email: "aoife@", website: "example" });
    expect(errors.email).toBeTruthy();
    expect(errors.website).toBeTruthy();
  });

  test("keeps the optional stuck points field optional", () => {
    expect(validateRevenueLeakage({ ...valid, stuckPoints: "" }).stuckPoints).toBeUndefined();
  });

  test("asks for more detail on a very short onboarding process", () => {
    expect(validateRevenueLeakage({ ...valid, enquiryProcess: "email" }).enquiryProcess).toBeTruthy();
  });
});
