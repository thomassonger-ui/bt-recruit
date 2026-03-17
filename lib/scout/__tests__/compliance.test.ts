/**
 * Scout Guardrail Compliance Tests
 *
 * Validates that Fair Housing violations are caught, neighborhood
 * questions are deflected with neutral language, and every response
 * includes a conversion CTA.
 */

import { describe, test, expect } from "vitest";
import { checkCompliance, checkInboundCompliance } from "../guardrails/complianceRules";
import { enforceConversion } from "../guardrails/conversionRules";
import { validateResponse } from "../guardrails/responseValidator";
import { FALLBACKS } from "../config/scoutConfig";

/* ── Test: "Is this a good neighborhood for families?" ── */
describe("Neighborhood family question", () => {
  const input = "Is this a good neighborhood for families?";

  test("inbound compliance catches the question before LLM", () => {
    const result = checkInboundCompliance(input);
    expect(result.requiresDeflection).toBe(true);
    expect(result.deflectionReason).toBe("neighborhood_family");
    expect(result.fallbackOverride).toBe(FALLBACKS.neighborhood);
  });

  test("fallback response contains no Fair Housing violations", () => {
    const compliance = checkCompliance(FALLBACKS.neighborhood);
    expect(compliance.passed).toBe(true);
    expect(compliance.violations).toHaveLength(0);
  });

  test("fallback response is neutral — no steering language", () => {
    const text = FALLBACKS.neighborhood.toLowerCase();
    expect(text).not.toContain("family-friendly");
    expect(text).not.toContain("safe");
    expect(text).not.toContain("community feel");
    expect(text).not.toContain("good area for kids");
  });

  test("fallback response includes CTA after conversion enforcement", () => {
    const conversion = enforceConversion(FALLBACKS.neighborhood);
    // The neighborhood fallback ends with "...matters most to you."
    // which does not contain a question mark — so closer is appended
    expect(
      conversion.enhancedResponse.includes("?") ||
      conversion.enhancedResponse.includes("reach out") ||
      conversion.enhancedResponse.includes("set up")
    ).toBe(true);
  });
});

/* ── Test: Steering phrases in LLM output are blocked ── */
describe("Steering phrase detection in LLM output", () => {
  const steeringResponses = [
    "This is a family-friendly neighborhood with great parks.",
    "The area has a nice community feel and is very safe.",
    "It's a safe neighborhood with good schools nearby.",
    "This is a great area for kids and families.",
    "The community feel here is wonderful.",
  ];

  test.each(steeringResponses)(
    'blocks: "%s"',
    (response) => {
      const result = checkCompliance(response);
      expect(result.severity).toBe("block");
      expect(result.rewrittenResponse).toBeTruthy();
      expect(result.rewrittenResponse).toBe(FALLBACKS.neighborhood);
    }
  );
});

/* ── Test: Clean responses pass through ── */
describe("Clean responses are not blocked", () => {
  const cleanResponses = [
    "The property is a 3-bedroom home with 2 bathrooms and a 2-car garage.",
    "I can share details about nearby parks, schools, and local amenities.",
    "Your agent can help guide you based on what matters most to you.",
    "This listing was recently updated with new flooring and appliances.",
  ];

  test.each(cleanResponses)(
    'passes: "%s"',
    (response) => {
      const result = checkCompliance(response);
      expect(result.passed).toBe(true);
    }
  );
});

/* ── Test: Compliance-blocked responses get CTA via validator ── */
describe("Validator applies CTA to compliance rewrites", () => {
  test("steering phrase response gets rewritten with CTA", () => {
    const badResponse = "This is a family-friendly area with a great community feel.";
    const result = validateResponse(badResponse, "web");

    // Must be blocked
    expect(result.checks.compliance).toBe(false);

    // Final response must have forward motion (CTA)
    expect(
      result.finalResponse.includes("?") ||
      result.finalResponse.includes("reach out") ||
      result.finalResponse.includes("set up")
    ).toBe(true);

    // Must not contain original steering language
    expect(result.finalResponse.toLowerCase()).not.toContain("family-friendly");
    expect(result.finalResponse.toLowerCase()).not.toContain("community feel");
  });
});

/* ── Test: Inbound neighborhood variants are caught ── */
describe("Inbound neighborhood question variants", () => {
  const variants = [
    "Is this a good neighborhood for families?",
    "Is the area safe for kids?",
    "What are the best neighborhoods for children?",
    "Is this a nice area for families with kids?",
    "What's the neighborhood like?",
    "Is this a good part of town?",
    "Are the schools good around here?",
  ];

  test.each(variants)(
    'deflects: "%s"',
    (question) => {
      const result = checkInboundCompliance(question);
      expect(result.requiresDeflection).toBe(true);
      expect(result.fallbackOverride).toBeTruthy();
    }
  );
});
