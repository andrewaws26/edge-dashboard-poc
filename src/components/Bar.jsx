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
        <span style={{ fontSize: 11, color: C.dim }}>{label}</span>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color }}>{value}{unit}</span>
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: C.border }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          backgroundColor: color, boxShadow: `0 0 8px ${color}30`,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
};
