import { C } from '../constants';

export const GlobalStateBanner = ({ eStop, operationMode, maintenanceMode }) => {
  const halted = !eStop;
  const conflict = operationMode && maintenanceMode;
  const production = operationMode && !maintenanceMode && eStop;
  const maintenance = maintenanceMode && !operationMode && eStop;
  const idle = !operationMode && !maintenanceMode && eStop;

  let state, color, bg, border, icon, detail;
  if (halted) {
    state = "SYSTEM HALTED";
    color = C.red; bg = C.redDim; border = C.red;
    icon = "🛑";
    detail = "Emergency Stop circuit OPEN \u2014 diSafteyStop = FALSE. All motion locked out. Physical E-Stop must be reset.";
  } else if (conflict) {
    state = "STATE CONFLICT";
    color = C.red; bg = C.redDim; border = C.red;
    icon = "\u26A0";
    detail = "diOperation[\"Start\"] and diMaintenance[\"Mode\"] both TRUE simultaneously. Possible physical switch failure. Investigate immediately.";
  } else if (maintenance) {
    state = "MAINTENANCE LOCKOUT";
    color = C.amber; bg = C.amberDim; border = C.amber;
    icon = "🔧";
    detail = "Manual override active. Automated kinematic routines locked out. Production paused.";
  } else if (production) {
    state = "PRODUCTION RUNNING";
    color = C.green; bg = C.greenDim; border = C.green;
    icon = "🏭";
    detail = "Normal operation. PLC allowing conveyor motion and vision-triggered robot cycles.";
  } else {
    state = "IDLE \u2014 AWAITING MODE";
    color = C.dim; bg = C.bg; border = C.border;
    icon = "\u23F8";
    detail = "Safety circuit closed. No operating mode selected. Waiting for operator input.";
  }

  return (
    <div style={{
      padding: "14px 20px", borderRadius: 12, marginBottom: 16,
      backgroundColor: bg, border: `2px solid ${border}60`,
      display: "flex", alignItems: "center", gap: 16,
      animation: halted || conflict ? "blink 2s step-end infinite" : "none",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, backgroundColor: `${color}15`, border: `1px solid ${color}30`, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: 1 }}>{state}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
            backgroundColor: `${color}20`, color, border: `1px solid ${color}30`,
            letterSpacing: 0.8, textTransform: "uppercase",
          }}>GLOBAL STATE</span>
        </div>
        <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{detail}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {[
          { label: "E-STOP", val: eStop, critical: true },
          { label: "OP", val: operationMode },
          { label: "MAINT", val: maintenanceMode },
        ].map(s => (
          <div key={s.label} style={{
            textAlign: "center", padding: "6px 10px", borderRadius: 6, minWidth: 52,
            backgroundColor: s.critical && !s.val ? C.redDim : s.val ? `${C.green}15` : C.bg,
            border: `1px solid ${s.critical && !s.val ? C.red + "60" : s.val ? C.green + "30" : C.border}`,
          }}>
            <div style={{ fontSize: 8, color: C.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>{s.label}</div>
            <div className="mono" style={{
              fontSize: 14, fontWeight: 800,
              color: s.critical && !s.val ? C.red : s.val ? C.green : C.muted,
            }}>{s.val ? "1" : "0"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
