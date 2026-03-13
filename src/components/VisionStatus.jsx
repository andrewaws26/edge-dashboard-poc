import { C, IT } from '../constants';
import { DomainTag } from './DomainTag';
import { Dot } from './Dot';
import { Metric } from './Metric';
import { Bar } from './Bar';

const ResourceBar = ({ label, value, max, unit, warnAt, critAt }) => {
  const pct = max ? (value / max) * 100 : value;
  const isCrit = critAt && pct >= critAt;
  const isWarn = warnAt && pct >= warnAt;
  const color = isCrit ? C.red : isWarn ? C.amber : C.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
      <span style={{ fontSize: 9, color: C.dim, width: 56, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, backgroundColor: C.bg, borderRadius: 3, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", backgroundColor: color, borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <span className="mono" style={{ fontSize: 9, fontWeight: 700, color, width: 64, textAlign: "right", flexShrink: 0 }}>
        {value !== null ? `${value}${unit ? unit : ""}${max ? `/${max}` : ""}` : "—"}
      </span>
    </div>
  );
};

const ServerCard = ({ label, server, isAlert }) => {
  const processColor = server.process === "RUNNING" ? C.green : server.process === "DEAD" ? C.red : C.amber;
  const ramPct = (server.ram / server.ramMax) * 100;
  const gpuPct = (server.gpu / server.gpuMax) * 100;
  const isCritical = ramPct > 90 || gpuPct > 90 || server.cpu > 90;
  const borderColor = server.process === "DEAD" ? C.red : isCritical ? C.red : isAlert ? C.amber : C.border;

  return (
    <div style={{
      backgroundColor: C.bg, borderRadius: 8, padding: "10px 12px",
      border: `1px solid ${borderColor}${server.process === "DEAD" || isCritical ? "60" : ""}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: processColor, boxShadow: `0 0 4px ${processColor}40` }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{label}</span>
        </div>
        <span className="mono" style={{ fontSize: 8, fontWeight: 700, color: processColor, padding: "1px 5px", borderRadius: 3, backgroundColor: `${processColor}15`, border: `1px solid ${processColor}25` }}>
          {server.process}{server.pid ? ` (PID ${server.pid})` : ""}
        </span>
      </div>

      {/* Resource bars */}
      <ResourceBar label="CPU" value={server.cpu} unit="%" warnAt={70} critAt={90} />
      <ResourceBar label="RAM" value={server.ram} max={server.ramMax} unit=" GB" warnAt={75} critAt={90} />
      <ResourceBar label="GPU VRAM" value={server.gpu} max={server.gpuMax} unit=" GB" warnAt={75} critAt={90} />
      <ResourceBar label="Disk" value={server.disk} max={server.diskMax} unit=" GB" warnAt={70} critAt={85} />

      {/* Detail metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", marginTop: 6 }}>
        {[
          { l: "Inference", v: server.inferenceMs !== null ? `${server.inferenceMs}ms` : "—", warn: server.inferenceMs > 100, crit: server.inferenceMs > 200 },
          { l: "Queue", v: server.queueDepth !== undefined ? server.queueDepth : "—", warn: server.queueDepth > 5, crit: server.queueDepth > 20 },
          { l: "Temp", v: `${server.temp}°C`, warn: server.temp > 65, crit: server.temp > 80 },
          { l: "Uptime", v: server.uptime },
          { l: "Model", v: server.model, span: true },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...(m.span ? { gridColumn: "span 2" } : {}) }}>
            <span style={{ fontSize: 8, color: C.muted }}>{m.l}</span>
            <span className="mono" style={{ fontSize: 8, fontWeight: 600, color: m.crit ? C.red : m.warn ? C.amber : C.dim }}>{m.v}</span>
          </div>
        ))}
      </div>

      {/* Swap warning */}
      {server.swap && (
        <div style={{ marginTop: 4, padding: "3px 6px", borderRadius: 4, backgroundColor: C.redDim, border: `1px solid ${C.red}30`, fontSize: 9, color: C.red, fontWeight: 600 }}>
          SWAP ACTIVE: {server.swap} GB — OS paging to disk, severe performance impact
        </div>
      )}

      {/* Cache warning */}
      {server.cacheSize && (
        <div style={{ marginTop: 3, padding: "3px 6px", borderRadius: 4, backgroundColor: C.amberDim, border: `1px solid ${C.amber}30`, fontSize: 9, color: C.amber, fontWeight: 600 }}>
          /tmp/apera_cache: {server.cacheSize} GB stale tensor caches (never freed)
        </div>
      )}

      {/* Exit code / last log for crashed process */}
      {server.exitCode && (
        <div style={{ marginTop: 3, padding: "3px 6px", borderRadius: 4, backgroundColor: C.redDim, border: `1px solid ${C.red}30`, fontSize: 9, color: C.red, fontWeight: 600 }}>
          Exit: {server.exitCode} — Last log: "{server.lastLog}"
        </div>
      )}
    </div>
  );
};

export const VisionStatus = ({ status, serverMetrics, confidence, fps }) => {
  const isDown = status === "error";
  const isDegraded = status === "warn";
  const isSlow = status === "slow";
  const hasIssue = isDown || isDegraded || isSlow;

  return (
    <div style={{
      backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "16px 20px", borderTop: `2px solid ${isDown ? C.red + "60" : isDegraded || isSlow ? C.amber + "40" : C.green + "40"}`,
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
        <Dot status={isDown ? "error" : isDegraded || isSlow ? "warn" : "ok"} pulse />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
        {/* Server 1 */}
        <ServerCard
          label="Dell Apera Server 1 (Front)"
          server={serverMetrics.server1}
          isAlert={hasIssue}
        />
        {/* Server 2 */}
        <ServerCard
          label="Dell Apera Server 2 (Rear)"
          server={serverMetrics.server2}
        />
      </div>

      {/* Inference performance + camera path */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>Inference Performance</div>
          <Bar label="Pick Confidence" value={confidence} unit="%" status={isDown ? "error" : isDegraded || isSlow ? "warn" : "ok"} />
          <div style={{ height: 4 }} />
          <Bar label="Vision FPS" value={fps} max={30} unit=" fps" status={isDown ? "error" : "ok"} />
        </div>
        <div>
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
          <div style={{
            marginTop: 8, padding: "6px 10px", borderRadius: 6,
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
          Server 1 process DEAD. Last log: "{serverMetrics.server1.lastLog || "unknown"}". Hardware healthy (CPU {serverMetrics.server1.temp}°C). 120V AC plane OK. Network OK. Restart process via VPN or power-cycle Dell.
        </div>
      )}
      {isDegraded && (
        <div className="diagnosis-box" style={{ backgroundColor: C.amberDim, border: `1px solid ${C.amber}30`, color: C.amber, fontSize: 11, marginTop: 10 }}>
          Pick confidence degraded: 95% → {confidence}% this shift. Server resources healthy. Camera 2 auto-adjusted exposure — ambient light change on site.
        </div>
      )}
      {isSlow && (
        <div className="diagnosis-box" style={{ backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.amber, fontSize: 11, marginTop: 10 }}>
          Server 1 critically slow — RAM {serverMetrics.server1.ram}/{serverMetrics.server1.ramMax} GB ({((serverMetrics.server1.ram / serverMetrics.server1.ramMax) * 100).toFixed(0)}%), GPU {serverMetrics.server1.gpu}/{serverMetrics.server1.gpuMax} GB VRAM. Inference {serverMetrics.server1.inferenceMs}ms (baseline 45ms). Process running {serverMetrics.server1.uptime} without restart — memory leak. Restart process to reclaim resources.
        </div>
      )}
    </div>
  );
};
