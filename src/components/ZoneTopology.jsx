import { C, IT, OT } from '../constants';
import { Dot } from './Dot';
import { DomainTag } from './DomainTag';

const ZoneBox = ({ zone, title, color, status, children }) => (
  <div style={{
    flex: 1, minWidth: 280, backgroundColor: C.panel, borderRadius: 12,
    border: `1px solid ${C.border}`, borderTop: `3px solid ${color}60`,
    padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4,
          backgroundColor: `${color}20`, color, letterSpacing: 1,
        }}>{zone}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{title}</span>
      </div>
      <Dot status={status} pulse />
    </div>
    {children}
  </div>
);

const Device = ({ name, domain, status, detail }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
    borderRadius: 4, backgroundColor: status === "error" ? C.redDim : C.bg,
    border: `1px solid ${status === "error" ? C.red + "30" : C.border}`,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
      backgroundColor: status === "error" ? C.red : status === "warn" ? C.amber : C.green,
      boxShadow: `0 0 4px ${status === "error" ? C.red : status === "warn" ? C.amber : C.green}30`,
    }} />
    <span style={{ fontSize: 10, color: status === "error" ? C.red : C.text, flex: 1 }}>{name}</span>
    {domain && <DomainTag domain={domain} />}
    {detail && <span className="mono" style={{ fontSize: 9, color: status === "error" ? C.red : C.muted }}>{detail}</span>}
  </div>
);

export const ZoneTopology = ({ scenario }) => {
  const isAperaCrash = scenario === "apera_crash";
  const isServoFault = scenario === "servo_fault";
  const isRouterFreeze = scenario === "router_freeze";

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <ZoneBox zone="ZONE 1" title="Front Cab — Command Center" color={C.accent} status={isAperaCrash || isRouterFreeze ? "error" : "ok"}>
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>Compute & Control</div>
        <Device name="Dell Apera Server 1 (Front)" domain={IT} status={isAperaCrash ? "error" : "ok"} detail={isAperaCrash ? "NOT RESPONDING" : "RUN"} />
        <Device name="Dell Apera Server 2 (Rear)" domain={IT} status="ok" detail="RUN" />
        <Device name="Mitsubishi FX5UC PLC" domain={OT} status="ok" detail="SCAN OK" />
        <Device name="Click PLC (Aux/Safety)" domain={OT} status="ok" detail="RUN" />
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 }}>Networking</div>
        <Device name="Netgear GS108 Switch" domain={IT} status="ok" detail="ALL PORTS" />
        <Device name="Stride Linx VPN Router" domain={IT} status={isRouterFreeze ? "error" : "ok"} detail={isRouterFreeze ? "FROZEN" : "ONLINE"} />
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 }}>Power & I/O</div>
        <Device name="Rhino PSR 24-480 (AC→24V DC)" domain={OT} status="ok" detail="24.1V" />
        <Device name="ZipLink Breakout Boards" domain={OT} status="ok" detail="TERMINATED" />
      </ZoneBox>

      <ZoneBox zone="ZONE 2" title="Middle — Power Generation" color={C.amber} status="ok">
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>Prime Power</div>
        <Device name="Engine Generator" status="ok" detail="RUNNING" />
        <Device name="Battery Bank" status="ok" detail="98% SOC" />
        <Device name="3000W Inverter" status="ok" detail="120V AC OUT" />
        <div style={{
          marginTop: 6, padding: "8px 10px", borderRadius: 6,
          backgroundColor: C.bg, border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>POWER OUTPUT</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <span style={{ fontSize: 9, color: C.cyan }}>120V AC → </span>
              <span style={{ fontSize: 9, color: C.dim }}>Zone 1 IT Stack</span>
            </div>
            <div>
              <span style={{ fontSize: 9, color: C.orange }}>→ Rhino PSR → </span>
              <span style={{ fontSize: 9, color: C.dim }}>24V DC OT</span>
            </div>
          </div>
        </div>
      </ZoneBox>

      <ZoneBox zone="ZONE 3" title="Rear — Robot & Distribution" color={C.purple} status={isServoFault ? "error" : "ok"}>
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>Actuation</div>
        <Device name="Stäubli Robot Arm" domain={OT} status={isServoFault ? "error" : "ok"} detail={isServoFault ? "AXIS 3 FAULT" : "NOMINAL"} />
        <Device name="Conveyor Belt Assembly" domain={OT} status="ok" detail="FWD" />
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 }}>Control Box</div>
        <Device name="Schunk UXB 24V Controller" domain={OT} status="ok" detail="POWERED" />
        <Device name="TRENDnet PoE Switch (Cameras)" domain={IT} status="ok" detail="4 PORTS" />
        <Device name="Distribution Terminal Blocks" domain={OT} status="ok" />
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 }}>HMI</div>
        <Device name="Saginaw Enclosure / Fuji Buttons" domain={OT} status="ok" detail="OP + MAINT + SERVO" />
        <Device name="Murrelektronik Bulkhead" domain={OT} status="ok" detail="25-PIN ORIGIN" />
      </ZoneBox>
    </div>
  );
};
