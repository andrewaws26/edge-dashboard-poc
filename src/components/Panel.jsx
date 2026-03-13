import { useState, useRef, useEffect } from 'react';
import { C } from '../constants';
import { Dot } from './Dot';
import { DomainTag } from './DomainTag';

export const Panel = ({ title, bodyPart, icon, status, zone, domain, children, span = 1, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("auto");

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  });

  const borderColor = status === "ok" ? C.green + "40"
    : status === "warn" ? C.amber + "40"
    : status === "error" ? C.red + "60"
    : status === "info" ? C.cyan + "40"
    : C.border;

  return (
    <div style={{
      backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "16px 20px", gridColumn: `span ${span}`, display: "flex",
      flexDirection: "column", borderTop: `2px solid ${borderColor}`,
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", userSelect: "none",
        }}
      >
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
          <span style={{
            fontSize: 10, color: C.muted, transition: "transform 0.3s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            marginLeft: 4,
          }}>▼</span>
        </div>
      </div>
      <div
        ref={contentRef}
        style={{
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.3s ease",
          maxHeight: expanded ? contentHeight : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
