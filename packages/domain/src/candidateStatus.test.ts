import { describe, expect, it } from "vitest";
import { appearsInMoreExpressions, isCandidateStatus } from "./candidateStatus";

describe("candidate statuses", () => {
  it("recognizes only the five V1 statuses", () => {
    expect(isCandidateStatus("selected")).toBe(true);
    expect(isCandidateStatus("backup_candidate")).toBe(true);
    expect(isCandidateStatus("ignored_too_easy")).toBe(true);
    expect(isCandidateStatus("ignored_duplicate")).toBe(true);
    expect(isCandidateStatus("ignored_over_limit")).toBe(true);
    expect(isCandidateStatus("low_value")).toBe(false);
  });

  it("shows only backup and over-limit candidates in more expressions", () => {
    expect(appearsInMoreExpressions("backup_candidate")).toBe(true);
    expect(appearsInMoreExpressions("ignored_over_limit")).toBe(true);
    expect(appearsInMoreExpressions("selected")).toBe(false);
    expect(appearsInMoreExpressions("ignored_too_easy")).toBe(false);
    expect(appearsInMoreExpressions("ignored_duplicate")).toBe(false);
  });
});
