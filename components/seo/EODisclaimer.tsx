import React from "react";

export const EO_DISCLAIMER_TEXT =
  "E&O insurance is provided under Bear Team Real Estate's office policy. Agents specializing in commercial or vacant-land transactions are required to carry individual E&O coverage for those transactions. Coverage is subject to policy terms, limits, and exclusions.";

/**
 * Standard E&O coverage disclaimer. Place on any page that discusses
 * E&O fees or states that Bear Team covers E&O.
 */
export default function EODisclaimer({ style }: { style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: 13,
        color: "#8A94A3",
        lineHeight: 1.6,
        maxWidth: 760,
        margin: "18px 0 0",
        ...style,
      }}
    >
      E&amp;O insurance is provided under Bear Team Real Estate&apos;s office
      policy. Agents specializing in commercial or vacant-land transactions are
      required to carry individual E&amp;O coverage for those transactions.
      Coverage is subject to policy terms, limits, and exclusions.
    </p>
  );
}
