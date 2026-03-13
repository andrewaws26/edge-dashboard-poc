import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { C } from '../constants';
import { Dot } from './Dot';
import { DomainTag } from './DomainTag';

export const Panel = ({ title, bodyPart, icon, status, zone, domain, children, span = 1 }) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      const handler = (e) => { if (e.key === "Escape") setModalOpen(false); };
      window.addEventListener("keydown", handler);
      return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
    }
  }, [modalOpen]);

  const borderColor = status === "ok" ? C.green + "40"
    : status === "warn" ? C.amber + "40"
    : status === "error" ? C.red + "60"
    : status === "info" ? C.cyan + "40"
    : C.border;

  const header = (isModal) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: isModal ? 22 : 16 }}>{icon}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: isModal ? 16 : 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: C.dim }}>{title}</span>
          {bodyPart && <span style={{ fontSize: isModal ? 12 : 10, color: C.muted }}>The {bodyPart}</span>}
          {domain && <DomainTag domain={domain} />}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {zone && <span style={{ fontSize: isModal ? 11 : 9, color: C.muted, fontWeight: 600, letterSpacing: 0.5 }}>{zone}</span>}
        <Dot status={status} pulse />
        {isModal ? (
          <button onClick={(e) => { e.stopPropagation(); setModalOpen(false); }} style={{
            background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.muted, fontSize: 14, cursor: "pointer", padding: "4px 10px",
            marginLeft: 8, transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = C.dim; e.target.style.color = C.text; }}
          onMouseLeave={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
          >ESC</button>
        ) : (
          <span style={{ fontSize: 12, color: C.muted, marginLeft: 4, opacity: 0.5 }} title="Click to expand">⛶</span>
        )}
      </div>
    </div>
  );

  const modal = modalOpen && createPortal(
    <div
      className="panel-modal-overlay"
      onClick={() => setModalOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 32, animation: "panelModalFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "24px 28px", borderTop: `3px solid ${borderColor}`,
          width: "100%", maxWidth: 900, maxHeight: "85vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 14,
          animation: "panelModalScaleIn 0.2s ease",
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 1px ${borderColor}`,
        }}
      >
        {header(true)}
        {children}
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        style={{
          backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: "16px 20px", gridColumn: `span ${span}`, display: "flex",
          flexDirection: "column", gap: 10, borderTop: `2px solid ${borderColor}`,
          cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.boxShadow = `0 0 12px ${borderColor}40`; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
      >
        {header(false)}
        {children}
      </div>
      {modal}
    </>
  );
};
