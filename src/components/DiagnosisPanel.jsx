import { C } from '../constants';

export const DiagnosisPanel = ({ diagnosis, operatorAction, remoteFix, traceSteps }) => {
  if (!diagnosis) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, animation: "slideIn 0.3s ease" }}>
      <div style={{ padding: "16px 20px", backgroundColor: C.panel, borderRadius: 12, border: `1px solid ${C.red}30`, borderTop: `2px solid ${C.red}60` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.red }}>What the Twin Shows Us</span>
        </div>
        <div className="diagnosis-box" style={{ backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.text }}>
          <span className="mono" style={{ color: C.red, fontWeight: 700 }}>{diagnosis}</span>
        </div>
        {traceSteps && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Diagnostic Trace (Physical → Logical)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {traceSteps.map((s, i) => (
                <div key={i} className="signal-step" style={{
                  backgroundColor: s.status === "fault" ? C.redDim : s.status === "ok" ? C.greenDim : C.bg,
                  border: `1px solid ${s.status === "fault" ? C.red + "30" : s.status === "ok" ? C.green + "20" : C.border}`,
                }}>
                  <span style={{ fontSize: 10, width: 16, textAlign: "center" }}>
                    {s.status === "fault" ? "\u2717" : s.status === "ok" ? "\u2713" : "\u2014"}
                  </span>
                  <span style={{ color: s.status === "fault" ? C.red : s.status === "ok" ? C.green : C.dim }}>{s.label}</span>
                  {s.detail && (
                    <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: s.status === "fault" ? C.red : C.muted }}>
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
        <div style={{ padding: "16px 20px", backgroundColor: C.panel, borderRadius: 12, border: `1px solid ${C.green}30`, borderTop: `2px solid ${C.green}60` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>📞</span>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.green }}>What the Operator Does</span>
          </div>
          <div className="operator-action" style={{ backgroundColor: C.greenDim, border: `1px solid ${C.green}30`, color: C.green }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>👷</span>
            <span>{operatorAction}</span>
          </div>
        </div>
        {remoteFix && (
          <div style={{ padding: "16px 20px", backgroundColor: C.panel, borderRadius: 12, border: `1px solid ${C.cyan}30`, borderTop: `2px solid ${C.cyan}60` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>💻</span>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.cyan }}>What We Do from Louisville</span>
            </div>
            <div className="operator-action" style={{ backgroundColor: C.cyanDim, border: `1px solid ${C.cyan}30`, color: C.cyan }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🖥</span>
              <span>{remoteFix}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
