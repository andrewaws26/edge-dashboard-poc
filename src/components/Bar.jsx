import { C } from '../constants';

export const Bar = ({ value, max = 100, label, unit = "%", status }) => {
  const pct = Math.min((value / max) * 100, 100);
  const color = status === "ok" ? C.green
    : status === "warn" ? C.amber
    : status === "error" ? C.red
    : status === "info" ? C.cyan
    : C.accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, color: C.dim }}>{label}</span>
        <span className="mono" style={{ fontSize: 20, fontWeight: 700, color, transition: "color 0.4s ease" }}>{value}{unit}</span>
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: C.border, overflow: "hidden", position: "relative" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          backgroundColor: color, boxShadow: `0 0 8px ${color}30`,
          transition: "width 0.8s ease, background-color 0.4s ease",
          position: "relative", overflow: "hidden",
        }}>
          {pct > 0 && status === "ok" && (
            <div style={{
              position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
              background: `linear-gradient(90deg, transparent, ${C.white}20, transparent)`,
              animation: "barShimmer 2.5s ease-in-out infinite",
            }} />
          )}
        </div>
      </div>
    </div>
  );
};
