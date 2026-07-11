"use client";

import { useState } from "react";

const INK = "#0B1B33";
const BODY = "#5B6675";
const BORDER = "#E6E8EC";
const NAVY = "#0B1D3A";
const ACCENT = "#2F5C8F";
const GREEN = "#1E7B44";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Field({ label, suffix, value, min, max, step, onChange, zeroLabel, hint }: {
  label: string; suffix?: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; zeroLabel?: string; hint?: string;
}) {
  const display = value === 0 && zeroLabel ? zeroLabel : suffix === "$" ? usd(value) : `${value}${suffix ?? ""}`;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: INK }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: ACCENT }}
      />
      {hint && <div style={{ fontSize: 12, color: BODY, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// Bear Team cap: you start at 60/40; the brokerage side of the split (company
// dollar) stops at the $16,000 cap — every dollar after that is the agent's,
// minus the flat $150 per closing. Cap runs on the agent's anniversary year.
// Hitting the cap advances you a tier (70/30, then 80/20, 90/10) for the NEXT year.
const BT_START_SPLIT = 0.6;
const CAP = 16000;
function bearTeamCompanyDollar(deals: number, grossPerDeal: number): { company: number; capped: boolean } {
  const company = Math.min(deals * grossPerDeal * (1 - BT_START_SPLIT), CAP);
  return { company, capped: company >= CAP };
}

export default function Calculator() {
  const [deals, setDeals] = useState(8);
  const [price, setPrice] = useState(415000);
  const [rate, setRate] = useState(3);
  const [split, setSplit] = useState(70);
  const [monthlyFee, setMonthlyFee] = useState(100);
  const [techFee, setTechFee] = useState(85);
  const [dealFee, setDealFee] = useState(300);
  const [royaltyPct, setRoyaltyPct] = useState(0);
  const [royaltyCap, setRoyaltyCap] = useState(3000);
  const [eoFee, setEoFee] = useState(40);
  const [annualDues, setAnnualDues] = useState(0);
  const [splitCap, setSplitCap] = useState(0);
  const [refDeals, setRefDeals] = useState(0);
  const [refPct, setRefPct] = useState(35);

  const grossPerDeal = price * (rate / 100);
  const gci = deals * grossPerDeal;

  // --- current brokerage ---
  // Corporate-lead referral fees (REO / relocation / company leads) come off
  // the top; the split then applies to what's left.
  const refDealsClamped = Math.min(refDeals, deals);
  const referralCost = refDealsClamped * grossPerDeal * (refPct / 100);
  const rawSplitCost = (gci - referralCost) * (1 - split / 100);
  const currentSplitCost = splitCap > 0 ? Math.min(rawSplitCost, splitCap) : rawSplitCost;
  const currentMonthly = monthlyFee * 12;
  const currentTech = techFee * 12;
  const currentDealFees = dealFee * deals;
  const rawRoyalty = gci * (royaltyPct / 100);
  const currentRoyalty = royaltyPct > 0 ? (royaltyCap > 0 ? Math.min(rawRoyalty, royaltyCap) : rawRoyalty) : 0;
  const currentEo = eoFee * 12;
  const currentToBrokerage = currentSplitCost + currentMonthly + currentTech + currentDealFees + currentRoyalty + currentEo + annualDues + referralCost;

  // --- Bear Team ---
  const bt = bearTeamCompanyDollar(deals, grossPerDeal);
  const btFixed = 150 * deals;
  const btTotal = bt.company + btFixed;
  const diff = currentToBrokerage - btTotal;
  const currentNet = gci - currentToBrokerage;
  const btNet = gci - btTotal;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,1fr) minmax(280px,1fr)", gap: 28, alignItems: "start" }}>
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
        <div style={{ fontWeight: 800, color: INK, fontSize: 16, marginBottom: 16 }}>Your production today</div>
        <Field label="Closings per year" value={deals} min={1} max={40} step={1} onChange={setDeals} />
        <Field label="Average sale price" suffix="$" value={price} min={100000} max={1500000} step={5000} onChange={setPrice} />
        <Field label="Your commission per side" suffix="%" value={rate} min={1} max={4} step={0.1} onChange={setRate} />

        <div style={{ fontWeight: 800, color: INK, fontSize: 16, margin: "22px 0 16px" }}>What you pay today</div>
        <Field label="Your current split (what you keep)" suffix="%" value={split} min={50} max={100} step={1} onChange={setSplit} />
        <Field label="Split cap (company dollar cap, if any)" suffix="$" value={splitCap} min={0} max={50000} step={1000} onChange={setSplitCap} zeroLabel="No cap" hint="If your brokerage caps what it keeps each year, set it here. Watch the reset date: many big-box caps run on a fixed year \u2014 join or produce late in that year and you can pay toward two caps in your first 12 months." />
        <Field label="Monthly brokerage fees" suffix="$" value={monthlyFee} min={0} max={1500} step={10} onChange={setMonthlyFee} hint="Desk / office fees billed monthly (not tech — that's next)." />
        <Field label="Technology fee (monthly)" suffix="$" value={techFee} min={0} max={300} step={5} onChange={setTechFee} zeroLabel="None" hint="CRM / platform fee — commonly billed separately (e.g. ~$85/mo at big-box brands)." />
        <Field label="Per-transaction fee" suffix="$" value={dealFee} min={0} max={800} step={25} onChange={setDealFee} hint="Charged on each closing on top of your split. Check your ICA." />
        <Field label="Franchise / royalty fee" suffix="%" value={royaltyPct} min={0} max={8} step={0.5} onChange={setRoyaltyPct} zeroLabel="None" hint="Off the top of GCI at franchise brands. Typical 5–8% — check your ICA." />
        {royaltyPct > 0 && (
          <Field label="Royalty capped at" suffix="$" value={royaltyCap} min={0} max={6000} step={250} onChange={setRoyaltyCap} zeroLabel="No cap" />
        )}
        <Field label="Closings from corporate / relo / REO leads" value={refDeals} min={0} max={40} step={1} onChange={setRefDeals} zeroLabel="None" hint="Company-sourced leads usually carry a referral fee off the top." />
        {refDeals > 0 && (
          <Field label="Referral fee on those leads" suffix="%" value={refPct} min={10} max={45} step={1} onChange={setRefPct} hint="Typical 25\u201340% on REO / relocation programs \u2014 check your program agreement." />
        )}
        <Field label="E&O / risk fee (monthly)" suffix="$" value={eoFee} min={0} max={150} step={5} onChange={setEoFee} hint="Bear Team covers E&O — enter what you pay now." />
        <Field label="Annual dues / renewals to brokerage" suffix="$" value={annualDues} min={0} max={2000} step={50} onChange={setAnnualDues} zeroLabel="None" />
      </div>

      <div>
        <div style={{ background: "#F7F8FA", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: BODY, fontWeight: 600 }}>Your annual gross commission (GCI)</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{usd(gci)}</div>
        </div>

        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: INK, marginBottom: 10 }}>What your current brokerage keeps</div>
          <Row label="Split given up" value={usd(currentSplitCost)} />
          <Row label="Monthly fees (×12)" value={usd(currentMonthly)} highlight />
          {currentTech > 0 && <Row label="Technology fee (×12)" value={usd(currentTech)} highlight />}
          <Row label={`Transaction fees (${usd(dealFee)} × ${deals})`} value={usd(currentDealFees)} highlight />
          {currentRoyalty > 0 && <Row label="Franchise / royalty" value={usd(currentRoyalty)} highlight />}
          {referralCost > 0 && <Row label={`Corporate-lead referral fees (${refDealsClamped} deal${refDealsClamped === 1 ? "" : "s"} @ ${refPct}%)`} value={usd(referralCost)} highlight />}
          {currentEo > 0 && <Row label="E&O / risk fees (×12)" value={usd(currentEo)} highlight />}
          {annualDues > 0 && <Row label="Annual dues / renewals" value={usd(annualDues)} highlight />}
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 8, paddingTop: 8 }}>
            <Row label="Total to brokerage / year" value={usd(currentToBrokerage)} bold />
            <Row label="NET TO YOU" value={usd(currentNet)} bold />
          </div>
        </div>

        <div style={{ border: `2px solid ${ACCENT}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontWeight: 800, color: INK, marginBottom: 10 }}>At Bear Team — same year, full math</div>
          <Row label={bt.capped ? "Split given up — CAPPED at $16,000" : "Split given up (60/40 start)"} value={usd(bt.company)} />
          <Row label={`Per closing (${usd(150)} × ${deals})`} value={usd(btFixed)} />
          <Row label="Monthly fees" value="$0 — always" />
          <Row label="Technology fee" value="$0" />
          <Row label="Franchise / royalty" value="$0" />
          <Row label="Referral fee on office leads" value="$0" />
          <Row label="E&O insurance" value="Covered*" />
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 8, paddingTop: 8 }}>
            <Row label="Total to Bear Team / year (est.)" value={usd(btTotal)} bold />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 2px", fontSize: 17 }}>
              <span style={{ color: INK, fontWeight: 800 }}>NET TO YOU</span>
              <span style={{ color: GREEN, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{usd(btNet)}</span>
            </div>
            {bt.capped && (
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 600, marginTop: 2 }}>
                You hit the $16,000 cap — every closing after that is 100% yours, minus the $150.
              </div>
            )}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 10, paddingTop: 10, fontSize: 15, color: INK }}>
            {diff > 0 ? (
              <>Bottom line: <strong style={{ color: GREEN }}>+{usd(diff)} more in your pocket</strong> in year one
              {bt.capped ? <> — and hitting the cap advances you to 70/30 for your next anniversary year.</> : <>.</>}</>
            ) : (
              <>At these numbers it&apos;s close — book a call and we&apos;ll run your exact ladder position.</>
            )}
            </div>
          <div style={{ background: "#F4F8FC", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", marginTop: 12, fontSize: 13.5, color: INK, lineHeight: 1.6 }}>
            <strong>Why the anniversary cap is huge:</strong> at brokerages where the cap resets on a fixed date,
            switching mid-year can mean paying toward two cap cycles in your first twelve months. Bear Team&apos;s
            $16,000 cap follows <em>your</em> twelve months from day one — no reset penalty for switching in June,
            September, or the week before Christmas.
          </div>
          <p style={{ fontSize: 12.5, color: BODY, lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
            Estimate models your first 12 months: 60/40 split with company dollar capped at $16,000 — after the cap,
            closings are 100% yours minus the $150 flat fee. Hitting the cap advances your tier (70/30 → 80/20 → 90/10)
            for the following year. <strong>Bear Team&apos;s cap runs on your personal anniversary year</strong> — it starts the day you
            join, not January 1, so every dollar counts toward the same climb no matter when you switch.
            Competitor fees vary by office and agreement; use your ICA&apos;s real numbers. MLS and board dues, license
            renewals, and lockbox fees are the same at any brokerage and excluded on both sides.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 15 }}>
      <span style={{ color: highlight ? "#B23B3B" : BODY, fontWeight: bold ? 800 : 500 }}>{label}</span>
      <span style={{ color: bold ? INK : highlight ? "#B23B3B" : INK, fontWeight: bold ? 800 : 700, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
