import { C } from '../constants';

export const Metric = ({ label, value, unit, status, small }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0" }}>
    <span style={{ fontSize: small ? 14 : 15, color: C.dim }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <span className="mono" style={{
        fontSize: small ? 18 : 24, fontWeight: 700,
        transition: "color 0.4s ease",
        color: status === "ok" ? C.green
          : status === "warn" ? C.amber
          : status === "error" ? C.red
          : status === "info" ? C.cyan
          : C.text,
      }}>{value}</span>
      {unit && <span style={{ fontSize: 14, color: C.dim }}>{unit}</span>}
    </div>
  </div>
);
