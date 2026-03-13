import { C } from '../constants';
import { Dot } from './Dot';
import { DomainTag } from './DomainTag';

export const Panel = ({ title, bodyPart, icon, status, zone, domain, children, span = 1 }) => {
  const borderColor = status === "ok" ? C.green + "40"
    : status === "warn" ? C.amber + "40"
    : status === "error" ? C.red + "60"
    : status === "info" ? C.cyan + "40"
    : C.border;

  return (
    <div style={{
      backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "16px 20px", gridColumn: `span ${span}`, display: "flex",
      flexDirection: "column", gap: 10, borderTop: `2px solid ${borderColor}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: C.dim }}>{title}</span>
            {bodyPart && <span style={{ fontSize: 10, color: C.muted }}>The {bodyPart}</span>}
            {domain && <DomainTag domain={domain} />}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {zone && <span style={{ fontSize: 9, color: C.muted, fontWeight: 600, letterSpacing: 0.5 }}>{zone}</span>}
          <Dot status={status} pulse />
        </div>
      </div>
      {children}
    </div>
  );
};
