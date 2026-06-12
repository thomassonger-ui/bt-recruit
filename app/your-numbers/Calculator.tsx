"use client";

import { useState } from "react";

const INK = "#0B1B33";
const BODY = "#5B6675";
const BORDER = "#E6E8EC";
const NAVY = "#0B1D3A";
const ACCENT = "#2F5C8F";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Field({ label, suffix, value, min, max, step, onChange }: {
  label: string; suffix?: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: INK }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
          {suffix === "$" ? usd(value) : `${value}${suffix ?? ""}`}
        </span>
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
    </div>
  );
}

export default function Calculator() {
  const [deals, setDeals] = useState(8);
  const [price, setPrice] = useState(415000);
  const [rate, setRate] = useState(3);
  const [split, setSplit] = useState(70);
  const [monthlyFee, setMonthlyFee] = useState(100);

  const gci = deals * price * (rate / 100);
  const currentSplitCost = gci * (1 - split / 100);
  const currentMonthly = monthlyFee * 12;
  const currentToBrokerage = currentSplitCost + currentMonthly;
  const btFixed = 150 * deals;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,1fr) minmax(280px,1fr)", gap: 28, alignItems: "start" }}>
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
        <div style={{ fontWeight: 800, color: INK, fontSize: 16, marginBottom: 16 }}>Your production today</div>
        <Field label="Closings per year" value={deals} min={1} max={40} step={1} onChange={setDeals} />
        <Field label="Average sale price" suffix="$" value={price} min={100000} max={1500000} step={5000} onChange={setPrice} />
        <Field label="Your commission per side" suffix="%" value={rate} min={1} max={4} step={0.1} onChange={setRate} />
        <Field label="Your current split (what you keep)" suffix="%" value={split} min={50} max={100} step={1} onChange={setSplit} />
        <Field label="Current monthly brokerage fees" suffix="$" value={monthlyFee} min={0} max={1500} step={10} onChange={setMonthlyFee} />
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
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 8, paddingTop: 8 }}>
            <Row label="Total to brokerage / year" value={usd(currentToBrokerage)} bold />
          </div>
        </div>

        <div style={{ border: `2px solid ${ACCENT}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontWeight: 800, color: INK, marginBottom: 10 }}>At Bear Team — fixed costs</div>
          <Row label="Monthly fees" value="$0 — always" />
          <Row label="Per closing" value={`${usd(150)} × ${deals} = ${usd(btFixed)}`} />
          <Row label="E&O insurance" value="Covered" />
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 10, paddingTop: 10, fontSize: 15, color: INK }}>
            You'd stop paying <strong style={{ color: ACCENT }}>{usd(currentMonthly)}/year</strong> in monthly fees alone.
          </div>
          <p style={{ fontSize: 13.5, color: BODY, lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
            Your Bear Team split starts at 60/40 and graduates to 90/10 through the company-dollar cap, so your exact
            take-home is personalized. Scout calculates it across the tiers in about a minute.
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
