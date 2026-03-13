import { C } from '../constants';
import { PIN_MAP, PIN_GROUPS } from '../data/pinMap';

export const PinTable = ({ pinStates, faultedPins }) => {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
        Murrelektronik Bulkhead (Z3) → 25-Pin Trunk (Passenger Side) → ZipLink Breakout (Z1 Cab) → FX5UC PLC
      </div>

      {/* Group legend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.entries(PIN_GROUPS).map(([key, g]) => (
          <span key={key} style={{
            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            backgroundColor: `${g.color}15`, color: g.color, border: `1px solid ${g.color}25`,
            letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4,
          }}>{g.icon} {g.label}</span>
        ))}
      </div>

      {/* Table header */}
      <div style={{
        display: "grid", gridTemplateColumns: "40px 36px 70px 1fr 180px 60px 60px",
        gap: 1, padding: "6px 10px", backgroundColor: C.bg, borderRadius: "6px 6px 0 0",
        border: `1px solid ${C.border}`, borderBottom: "none",
      }}>
        {["PIN", "WIRE", "TYPE", "PLC VARIABLE", "DESCRIPTION", "STATE", "HEALTH"].map(h => (
          <span key={h} style={{ fontSize: 8, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{h}</span>
        ))}
      </div>

      {/* Pin rows */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
        {PIN_MAP.map((pin) => {
          const state = pinStates[pin.pin];
          const faulted = faultedPins.includes(pin.pin);
          const group = PIN_GROUPS[pin.group];
          const isSafety = pin.group === "safety";
          const safetyFault = isSafety && state === false;
          const isInput = pin.type.includes("In") || pin.type === "Safety Input";

          return (
            <div key={pin.pin} style={{
              display: "grid", gridTemplateColumns: "40px 36px 70px 1fr 180px 60px 60px",
              gap: 1, padding: "5px 10px", alignItems: "center",
              backgroundColor: safetyFault ? C.redDim : faulted ? `${C.red}10` : "transparent",
              borderBottom: `1px solid ${C.border}`,
              animation: safetyFault ? "blink 2s step-end infinite" : faulted ? "none" : "none",
            }}>
              {/* Pin number */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="mono" style={{
                  fontSize: 12, fontWeight: 700,
                  color: faulted ? C.red : safetyFault ? C.red : group?.color || C.text,
                }}>{pin.pin}</span>
              </div>

              {/* Wire color swatch */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  backgroundColor: pin.wireColorHex, border: `1px solid ${C.border}`,
                  boxShadow: `0 0 4px ${pin.wireColorHex}40`,
                }} />
              </div>

              {/* Type badge */}
              <span style={{
                fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                backgroundColor: isSafety ? C.redDim : isInput ? C.cyanDim : C.purpleDim,
                color: isSafety ? C.red : isInput ? C.cyan : C.purple,
                border: `1px solid ${isSafety ? C.red : isInput ? C.cyan : C.purple}25`,
                letterSpacing: 0.5, textTransform: "uppercase", width: "fit-content",
              }}>{pin.type.replace("Digital ", "").replace("Safety ", "S-")}</span>

              {/* Variable name */}
              <span className="mono" style={{
                fontSize: 11, fontWeight: 600,
                color: faulted ? C.red : safetyFault ? C.red : C.text,
              }}>{pin.variable}</span>

              {/* Description */}
              <span style={{ fontSize: 10, color: C.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pin.description}
              </span>

              {/* State */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: state === undefined ? C.muted : state ? C.green : (isSafety ? C.red : C.muted),
                  boxShadow: state ? `0 0 6px ${C.green}40` : safetyFault ? `0 0 6px ${C.red}40` : "none",
                }} />
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 700,
                  color: state === undefined ? C.muted : state ? C.green : (isSafety ? C.red : C.muted),
                }}>{state === undefined ? "\u2014" : state ? "HIGH" : "LOW"}</span>
              </div>

              {/* Health */}
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: faulted ? C.red : safetyFault ? C.red : C.green,
              }}>{faulted ? "FAULT" : safetyFault ? "ALARM" : "\u2713 OK"}</span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "0 4px" }}>
        <span style={{ fontSize: 10, color: C.muted }}>
          {faultedPins.length === 0 ? "25/25 pins healthy" : `${25 - faultedPins.length}/25 healthy \u2014 ${faultedPins.length} fault${faultedPins.length > 1 ? "s" : ""}`}
        </span>
        {faultedPins.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: C.red }}>
            FAULT: PIN{faultedPins.length > 1 ? "S" : ""} {faultedPins.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
};
