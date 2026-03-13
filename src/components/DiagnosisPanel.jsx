import { useState } from 'react';
import { C } from '../constants';

export const DiagnosisPanel = ({ diagnosis, operatorAction, remoteFix, traceSteps }) => {
  const [expanded, setExpanded] = useState(false);

  if (!diagnosis) return null;

  const content = (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 10,
        animation: "slideIn 0.3s ease",
        ...(expanded ? { maxWidth: 960, width: "90vw", maxHeight: "85vh", overflowY: "auto" } : { marginBottom: 16 }),
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{
        padding: expanded ? "20px 28px" : "16px 20px", backgroundColor: C.panel, borderRadius: 12,
        border: `1px solid ${C.red}30`, borderTop: `2px solid ${C.red}60`, cursor: "pointer",
      }} onClick={() => setExpanded(x => !x)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.red }}>What the Twin Shows Us</span>
          <span style={{
            marginLeft: "auto", fontSize: 11, color: C.muted, padding: "2px 8px",
            borderRadius: 4, backgroundColor: C.bg, border: `1px solid ${C.border}`,
          }}>Click to {expanded ? "collapse" : "expand"}</span>
        </div>
        <div className="diagnosis-box" style={{
          backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.text,
          fontSize: expanded ? 15 : 14, lineHeight: expanded ? 1.8 : 1.6,
        }}>
          <span className="mono" style={{ color: C.red, fontWeight: 700 }}>{diagnosis}</span>
        </div>
        {traceSteps && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Diagnostic Trace (Physical → Logical)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: expanded ? 4 : 2 }}>
              {traceSteps.map((s, i) => (
                <div key={i} className="signal-step" style={{
                  backgroundColor: s.status === "fault" ? C.redDim : s.status === "ok" ? C.greenDim : s.status === "warn" ? C.amberDim : C.bg,
                  border: `1px solid ${s.status === "fault" ? C.red + "30" : s.status === "ok" ? C.green + "20" : s.status === "warn" ? C.amber + "20" : C.border}`,
                  padding: expanded ? "8px 12px" : "6px 10px",
                }}>
                  <span style={{ fontSize: expanded ? 14 : 12, width: 16, textAlign: "center" }}>
                    {s.status === "fault" ? "✗" : s.status === "ok" ? "✓" : s.status === "warn" ? "⚠" : "—"}
                  </span>
                  <span style={{
                    color: s.status === "fault" ? C.red : s.status === "ok" ? C.green : s.status === "warn" ? C.amber : C.dim,
                    fontSize: expanded ? 14 : 13,
                  }}>{s.label}</span>
                  {s.detail && (
                    <span className="mono" style={{
                      marginLeft: "auto", fontSize: expanded ? 13 : 12,
                      color: s.status === "fault" ? C.red : s.status === "warn" ? C.amber : C.muted,
                    }}>
                      {s.detail}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: remoteFix ? "1fr 1fr" : "1fr", gap: 10 }}>
        <div style={{
          padding: expanded ? "20px 28px" : "16px 20px", backgroundColor: C.panel, borderRadius: 12,
          border: `1px solid ${C.green}30`, borderTop: `2px solid ${C.green}60`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>📞</span>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.green }}>What the Operator Does</span>
          </div>
          <div className="operator-action" style={{
            backgroundColor: C.greenDim, border: `1px solid ${C.green}30`, color: C.green,
            fontSize: expanded ? 15 : 14, lineHeight: expanded ? 1.7 : 1.5,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>👷</span>
            <span>{operatorAction}</span>
          </div>
        </div>
        {remoteFix && (
          <div style={{
            padding: expanded ? "20px 28px" : "16px 20px", backgroundColor: C.panel, borderRadius: 12,
            border: `1px solid ${C.cyan}30`, borderTop: `2px solid ${C.cyan}60`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>💻</span>
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.cyan }}>What We Do from Louisville</span>
            </div>
            <div className="operator-action" style={{
              backgroundColor: C.cyanDim, border: `1px solid ${C.cyan}30`, color: C.cyan,
              fontSize: expanded ? 15 : 14, lineHeight: expanded ? 1.7 : 1.5,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🖥</span>
              <span>{remoteFix}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!expanded) return content;

  return (
    <div
      onClick={() => setExpanded(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      {content}
    </div>
  );
};
