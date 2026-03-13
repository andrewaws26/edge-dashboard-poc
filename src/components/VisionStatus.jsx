import { C, IT } from '../constants';
import { DomainTag } from './DomainTag';
import { Dot } from './Dot';
import { Metric } from './Metric';
import { Bar } from './Bar';

export const VisionStatus = ({ status, serverStatus, confidence, fps }) => {
  const isDown = status === "error";
  const isDegraded = status === "warn";

  return (
    <div style={{
      backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "16px 20px", borderTop: `2px solid ${isDown ? C.red + "60" : isDegraded ? C.amber + "40" : C.green + "40"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>👁</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: C.dim }}>Vision Subsystem</span>
          <DomainTag domain={IT} />
          <span style={{
            fontSize: 8, padding: "2px 6px", borderRadius: 3,
            backgroundColor: C.cyanDim, color: C.cyan, border: `1px solid ${C.cyan}25`,
            fontWeight: 700, letterSpacing: 0.5,
          }}>IT DOMAIN</span>
        </div>
        <Dot status={status} pulse />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Dell Apera Servers (Zone 1 Cab)</div>
          <Metric label="Server 1 (Front Dell)" value={serverStatus.front} status={serverStatus.front === "RUNNING" ? "ok" : "error"} small />
          <Metric label="Server 2 (Rear Dell)" value={serverStatus.rear} status={serverStatus.rear === "RUNNING" ? "ok" : "error"} small />
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>Camera Network Path</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              {["PoE Cameras (Z3)", "TRENDnet PoE (Z3)", "Netgear Switch (Z1)", "Dell Servers (Z1)"].map((step, i, arr) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{
                    fontSize: 9, padding: "3px 6px", borderRadius: 4,
                    backgroundColor: isDown && i === 3 ? C.redDim : C.bg,
                    border: `1px solid ${isDown && i === 3 ? C.red + "40" : C.border}`,
                    color: isDown && i === 3 ? C.red : C.dim,
                  }}>{step}</span>
                  {i < arr.length - 1 && <span style={{ color: C.muted, fontSize: 10 }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Inference Performance</div>
          <Bar label="Pick Confidence" value={confidence} unit="%" status={isDown ? "error" : isDegraded ? "warn" : "ok"} />
          <div style={{ height: 6 }} />
          <Bar label="Vision FPS" value={fps} max={30} unit=" fps" status={isDown ? "error" : "ok"} />
          <div style={{
            marginTop: 10, padding: "8px 10px", borderRadius: 6,
            backgroundColor: C.bg, border: `1px solid ${C.border}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Future: Live Vision Feed via Stride Linx VPN
            </div>
          </div>
        </div>
      </div>

      {isDown && (
        <div className="diagnosis-box" style={{ backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.amber, fontSize: 11, marginTop: 10 }}>
          Server 1 process not responding. 120V AC plane healthy (Generator → Inverter → Cab). Netgear link up. Software issue — power cycle or remote restart via Stride Linx VPN.
        </div>
      )}
      {isDegraded && (
        <div className="diagnosis-box" style={{ backgroundColor: C.amberDim, border: `1px solid ${C.amber}30`, color: C.amber, fontSize: 11, marginTop: 10 }}>
          Pick confidence degraded: 95% → {confidence}% this shift. Camera network path healthy. Camera 2 auto-adjusted exposure — ambient light change on site.
        </div>
      )}
    </div>
  );
};
