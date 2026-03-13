import React from 'react';
import { C } from '../constants';

const TraceStep = ({ label, detail, zone, status, isLast }) => (
  <React.Fragment>
    <div style={{
      padding: "10px 14px", borderRadius: 8, flex: "1 1 auto", minWidth: 160,
      backgroundColor: status === "fault" ? C.redDim : status === "warn" ? C.amberDim : C.bg,
      border: `1px solid ${status === "fault" ? C.red + "50" : status === "warn" ? C.amber + "40" : C.border}`,
      position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: status === "fault" ? C.red : C.text }}>{label}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
          backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`,
        }}>{zone}</span>
      </div>
      <div style={{ fontSize: 12, color: status === "fault" ? C.red : C.muted, marginTop: 3 }}>{detail}</div>
      {status === "fault" && (
        <div style={{
          fontSize: 11, color: C.red, fontWeight: 800, marginTop: 4,
          animation: "blink 1s step-end infinite", letterSpacing: 0.5,
        }}>✗ FAULT ISOLATED HERE</div>
      )}
      {status === "ok" && (
        <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 3 }}>✓ PASS</div>
      )}
    </div>
    {!isLast && (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 2px", flexShrink: 0,
      }}>
        <span style={{ color: status === "fault" ? C.red : C.green, fontSize: 18, fontWeight: 700 }}>→</span>
        <span style={{
          fontSize: 9, color: status === "fault" ? C.red : C.muted,
          fontWeight: 600, whiteSpace: "nowrap",
        }}>{status === "fault" ? "BREAK" : "OK"}</span>
      </div>
    )}
  </React.Fragment>
);

export const SignalTrace = ({ steps, title, subtitle }) => (
  <div style={{
    backgroundColor: C.panel, borderRadius: 12, border: `1px solid ${C.border}`,
    borderTop: `2px solid ${steps.some(s => s.status === "fault") ? C.red + "60" : C.green + "40"}`,
    padding: "16px 20px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 18 }}>⚡</span>
      <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: C.dim }}>{title}</span>
    </div>
    {subtitle && <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>{subtitle}</div>}
    <div style={{ display: "flex", alignItems: "stretch", gap: 4, flexWrap: "wrap", padding: "4px 0" }}>
      {steps.map((step, i) => (
        <TraceStep key={i} {...step} isLast={i === steps.length - 1} />
      ))}
    </div>
  </div>
);
