import { C } from '../constants';

export const IOPin = ({ pin, label, commanded, actual }) => {
  const hasFault = commanded && !actual;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 6,
      backgroundColor: hasFault ? C.redDim : commanded && actual ? C.greenDim : "transparent",
      border: `1px solid ${hasFault ? C.red + "40" : "transparent"}`,
    }}>
      <span className="mono" style={{ fontSize: 10, color: C.muted, width: 32 }}>P{pin}</span>
      <span className="mono" style={{ fontSize: 11, color: C.dim, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {hasFault && <span style={{ fontSize: 9, fontWeight: 700, color: C.red, animation: "blink 1s step-end infinite" }}>FAULT</span>}
        {!hasFault && <>
          <span style={{ fontSize: 9, color: C.muted }}>CMD</span>
          <span className="mono" style={{
            width: 14, height: 14, borderRadius: 3, fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: commanded ? C.green + "20" : C.panel,
            color: commanded ? C.green : C.muted,
            border: `1px solid ${commanded ? C.green + "40" : C.border}`,
          }}>{commanded ? "1" : "0"}</span>
          <span style={{ fontSize: 9, color: C.muted }}>ACT</span>
          <span className="mono" style={{
            width: 14, height: 14, borderRadius: 3, fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: actual ? C.green + "20" : C.panel,
            color: actual ? C.green : C.muted,
            border: `1px solid ${actual ? C.green + "40" : C.border}`,
          }}>{actual ? "1" : "0"}</span>
        </>}
      </div>
    </div>
  );
};
