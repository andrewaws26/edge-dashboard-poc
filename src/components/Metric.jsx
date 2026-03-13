import { C } from '../constants';

export const Metric = ({ label, value, unit, status, small }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
    <span style={{ fontSize: small ? 11 : 12, color: C.dim }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span className="mono" style={{
        fontSize: small ? 14 : 18, fontWeight: 700,
        color: status === "ok" ? C.green
          : status === "warn" ? C.amber
          : status === "error" ? C.red
          : status === "info" ? C.cyan
          : C.text,
      }}>{value}</span>
      {unit && <span style={{ fontSize: 10, color: C.dim }}>{unit}</span>}
    </div>
  </div>
);
