import React, { useState, useEffect, useCallback, useRef } from 'react';
import { C, IT, OT } from './constants';
import { Dot } from './components/Dot';
import { DomainTag } from './components/DomainTag';
import { Panel } from './components/Panel';
import { Metric } from './components/Metric';
import { IOPin } from './components/IOPin';
import { Bar } from './components/Bar';
import { Toast } from './components/Toast';
import { DiagnosisPanel } from './components/DiagnosisPanel';
import { SCENARIO_BUTTONS, SCENARIO_LOGS, SCENARIO_TOASTS, DIAGNOSIS_MAP } from './data/scenarios';

export default function App() {
  const [tick, setTick] = useState(0);
  const [scenario, setScenario] = useState("healthy");

  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const toastTimer = useRef(null);
  const [cmdLog, setCmdLog] = useState([]);

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 5000);
  };

  const addLog = (cmd, type) => {
    const time = new Date().toLocaleTimeString();
    setCmdLog(prev => [{ time, cmd, type: type || "info" }, ...prev].slice(0, 15));
  };

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const j = useCallback((b, r) => +(b + (Math.random() - 0.5) * r).toFixed(1), []);

  // Scenario effects
  useEffect(() => {
    setCmdLog([]);
    if (scenario === "healthy") return;

    const logs = SCENARIO_LOGS[scenario];
    if (logs) {
      logs.forEach(entry => addLog(entry.cmd, entry.type));
    }

    const toastData = SCENARIO_TOASTS[scenario];
    if (toastData) {
      showToast(toastData.message, toastData.type);
    }
  }, [scenario]);

  // Derived states
  const isHealthy = scenario === "healthy";
  const isWireFault = scenario === "wire_fault";
  const isAperaCrash = scenario === "apera_crash";
  const isServoFault = scenario === "servo_fault";
  const isRouterFreeze = scenario === "router_freeze";
  const isGripperStuck = scenario === "gripper_stuck";
  const isAperaDrift = scenario === "apera_drift";
  const overallStatus = isHealthy ? "ok" : "error";

  const currentDiagnosis = DIAGNOSIS_MAP[scenario] || null;

  return (
    <div style={{ padding: 24, maxWidth: 1520, margin: "0 auto" }}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent + "15", border: `1px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🚛</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: -0.5 }}>RAIV #3 <span style={{ color: C.dim, fontWeight: 400, fontSize: 15 }}>Digital Twin</span></h1>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Louisville, KY → Field Site &bull; Nervous System: <span style={{ color: C.green }}>Online</span> &bull; Last update: {tick % 2 === 0 ? "just now" : "1s ago"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <DomainTag domain={IT} />
            <DomainTag domain={OT} />
          </div>
          <Dot status={overallStatus} size={10} pulse />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: overallStatus === "ok" ? C.green : C.red }}>
            {overallStatus === "ok" ? "ALL SYSTEMS NOMINAL" : "FAULT DETECTED \u2014 SEE DIAGNOSIS"}
          </span>
        </div>
      </div>

      {/* Scenario buttons */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", padding: "10px 14px", backgroundColor: C.panel, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.muted, alignSelf: "center", marginRight: 6 }}>SCENARIO:</span>
        {SCENARIO_BUTTONS.map(s =>
          <button key={s.id} onClick={() => { setScenario("healthy"); setTimeout(() => setScenario(s.id), 50); }} style={{
            padding: "7px 14px", borderRadius: 6,
            border: `1px solid ${scenario === s.id ? (s.id === "healthy" ? C.green : C.red) : C.border}`,
            backgroundColor: scenario === s.id ? (s.id === "healthy" ? C.greenDim : C.redDim) : "transparent",
            color: scenario === s.id ? (s.id === "healthy" ? C.green : C.red) : C.dim,
            fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
          }}>{s.e} {s.label}</button>
        )}
      </div>

      {/* Diagnosis Panel */}
      {currentDiagnosis && <DiagnosisPanel
        diagnosis={currentDiagnosis.diagnosis}
        operatorAction={currentDiagnosis.operatorAction}
        remoteFix={currentDiagnosis.remoteFix}
        traceSteps={currentDiagnosis.traceSteps}
      />}

      {/* Main system panels grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>

        {/* STÄUBLI — The Brain */}
        <Panel title="Stäubli Robot Arm" bodyPart="Brain" icon="🧠" status={isServoFault ? "error" : "ok"} zone="Z3 REAR" domain={OT}>
          <Metric label="EtherCAT Link" value="HEALTHY" status="ok" />
          <Metric label="Schunk UXB 24V (Zone 3)" value="POWERED" status="ok" />
          <Metric label="Servo Status" value={isServoFault ? "FAULT \u2014 AXIS 3" : "ALL NOMINAL"} status={isServoFault ? "error" : "ok"} />
          {isServoFault && <div className="diagnosis-box" style={{ backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.amber, fontSize: 11 }}>
            Axis 3: following error (recoverable). EtherCAT bus healthy, Schunk UXB powered on 24V DC from Rhino PSR. Software fault, not mechanical.
          </div>}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Joint Positions (°)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
              {[j(12.3, 2), j(-45.7, 3), j(88.1, 2), j(0.5, 1), j(-22.4, 2), j(178.9, 3)].map((v, i) => <div key={i} style={{ textAlign: "center", padding: "4px 0", borderRadius: 4, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.muted }}>J{i + 1}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: isServoFault && i === 2 ? C.red : isServoFault ? C.dim : C.text }}>{isServoFault && i === 2 ? "ERR" : isServoFault ? "\u2014" : v.toFixed(1)}</div>
              </div>)}
            </div>
          </div>
        </Panel>

        {/* APERA — The Eyes */}
        <Panel title="Apera AI Vision" bodyPart="Eyes" icon="👁" status={isAperaCrash ? "error" : isAperaDrift ? "warn" : "ok"} zone="Z1 CAB" domain={IT}>
          <Metric label="Server 1 (Front Dell)" value={isAperaCrash ? "NOT RESPONDING" : "RUNNING"} status={isAperaCrash ? "error" : "ok"} />
          <Metric label="Server 2 (Rear Dell)" value="RUNNING" status="ok" />
          <Metric label="Last Inference" value={isAperaCrash ? "12 min ago" : "< 1 sec"} status={isAperaCrash ? "error" : "ok"} />
          {isAperaCrash && <div className="diagnosis-box" style={{ backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.amber, fontSize: 11 }}>
            Server 1 process crashed. 120V AC plane healthy (Generator → Inverter → Cab). Netgear link up. Software issue — power cycle or remote restart.
          </div>}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <Bar label="Pick Confidence" value={isAperaCrash ? 0 : isAperaDrift ? j(62, 3) : j(96.4, 2)} unit="%" status={isAperaCrash ? "error" : isAperaDrift ? "warn" : "ok"} />
            <div style={{ height: 8 }} />
            <Bar label="Vision FPS" value={isAperaCrash ? 0 : j(28, 3)} max={30} unit=" fps" status={isAperaCrash ? "error" : "ok"} />
          </div>
          {isAperaDrift && <div className="diagnosis-box" style={{ backgroundColor: C.amberDim, border: `1px solid ${C.amber}30`, color: C.amber, fontSize: 11 }}>
            Confidence 95% → 62% this shift. Camera path (TRENDnet PoE → Netgear → Dell) healthy. Camera 2 auto-adjusted exposure — ambient light changed.
          </div>}
          <div style={{ height: 60, borderRadius: 6, backgroundColor: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18 }}>📷</div><span style={{ fontSize: 10, color: C.muted }}>PoE Camera Feed — via TRENDnet (Z3) → Netgear (Z1)</span></div>
          </div>
        </Panel>

        {/* PLC — The Spine */}
        <Panel title="Mitsubishi FX5UC PLC" bodyPart="Spine" icon="🦴" status="ok" zone="Z1 CAB" domain={OT}>
          <Metric label="PLC Status" value="RUN" status="ok" />
          <Metric label="Scan Cycle" value={j(4.2, 0.5)} unit="ms" status="ok" />
          <Metric label="24V DC (Rhino PSR)" value="NOMINAL" status="ok" />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Digital I/O (ZipLink → PLC Terminals)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <IOPin pin="03" label='doBelt["FWD"]' commanded={true} actual={!isWireFault} />
              <IOPin pin="07" label='doGripper_EGM["MAG"]' commanded={false} actual={false} />
              <IOPin pin="11" label='diServo["Enable"]' commanded={true} actual={true} />
              <IOPin pin="14" label='doConveyor["Enable"]' commanded={true} actual={!isWireFault} />
              <IOPin pin="19" label='doSafteyStop' commanded={false} actual={false} />
            </div>
          </div>
        </Panel>

        {/* BELT & GRIPPER — The Muscles */}
        <Panel title="Belt & Gripper" bodyPart="Muscles" icon="💪" status={isWireFault ? "error" : isGripperStuck ? "warn" : "ok"} zone="Z3 REAR" domain={OT}>
          <Bar label="Belt Speed" value={isWireFault ? 0 : j(92, 4)} unit="%" status={isWireFault ? "error" : "ok"} />
          <Metric label="Belt Current" value={isWireFault ? "0.0" : j(4.2, 0.5)} unit="A" status={isWireFault ? "error" : "ok"} />
          <Metric label="Belt Direction" value={isWireFault ? "STOPPED" : "FORWARD"} status={isWireFault ? "error" : "ok"} />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <Metric label="Gripper State" value={isGripperStuck ? "STUCK \u2014 PART DETECTED" : "RELEASED"} status={isGripperStuck ? "warn" : "ok"} />
            <Metric label='doGripper_EGM["MAG"]' value={isGripperStuck ? "OFF (part stuck)" : "OFF"} status={isGripperStuck ? "warn" : "ok"} />
            <Metric label="Schunk UXB 24V" value="HEALTHY" status="ok" />
            <Metric label="Gripper Cycles Today" value="847" unit="" />
          </div>
          {isGripperStuck && <div className="diagnosis-box" style={{ backgroundColor: C.amberDim, border: `1px solid ${C.amber}30`, color: C.amber, fontSize: 11 }}>
            doGripper_EGM["MAG"] = OFF but part sensor reads present. Schunk UXB healthy on 24V DC. Residual magnetism — not software. Operator clears manually.
          </div>}
        </Panel>

        {/* NETWORK & POWER */}
        <Panel title="Network & Power" icon="📡" status={isRouterFreeze ? "error" : "ok"} zone="Z1+Z2+Z3">
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>Communication Networks</div>
          <Metric label="Vision/IT (Ethernet/PoE)" value={isAperaCrash || isAperaDrift ? "DEGRADED" : "HEALTHY"} status={isAperaCrash ? "error" : isAperaDrift ? "warn" : "ok"} small />
          <Metric label="Motion/OT (EtherCAT)" value="HEALTHY" status="ok" small />
          <Metric label="Telemetry (Stride Linx VPN)" value={isRouterFreeze ? "UNRESPONSIVE" : "CONNECTED"} status={isRouterFreeze ? "error" : "ok"} small />
          <Metric label="Pi Cellular (Independent)" value="CONNECTED" status="ok" small />
          {isRouterFreeze && <div className="diagnosis-box" style={{ backgroundColor: C.cyanDim, border: `1px solid ${C.cyan}30`, color: C.cyan, fontSize: 11 }}>
            Stride Linx frozen — telemetry VPN only. Vision/IT and Motion/OT networks unaffected. Pi reporting via independent cellular backhaul.
          </div>}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>Power Distribution</div>
            <Metric label="120V AC Plane (IT stack)" value="NOMINAL" status="ok" small />
            <Metric label="24V DC Plane (Rhino PSR → OT)" value="NOMINAL" status="ok" small />
            <Metric label="Generator/Inverter (Zone 2)" value="RUNNING" status="ok" small />
            <Metric label="Netgear Switch (Z1)" value="ALL PORTS UP" status="ok" small />
            <Metric label="TRENDnet PoE (Z3)" value="ONLINE" status="ok" small />
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <Metric label="Latency (VPN)" value={isRouterFreeze ? "\u2014" : j(34, 8)} unit={isRouterFreeze ? "" : "ms"} status={isRouterFreeze ? "error" : "ok"} small />
            <Metric label="Latency (Pi Cellular)" value={j(120, 20)} unit="ms" status="ok" small />
          </div>
        </Panel>

        {/* NERVOUS SYSTEM */}
        <Panel title="Nervous System" icon="🧬" status="ok" zone="Z1 CAB">
          <Metric label="Raspberry Pi" value="ONLINE" status="ok" />
          <Metric label="Cellular Backhaul" value="CONNECTED" status="ok" />
          <Metric label="Location" value="IT Rack, next to Netgear" status="ok" />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Monitoring Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "FX5UC PLC Signals (OT)", val: "Active", ok: true },
                { label: "Click PLC Aux/Safety (OT)", val: "Active", ok: true },
                { label: "Apera Dell Servers (IT)", val: isAperaCrash ? "FAULT" : "Healthy", ok: !isAperaCrash },
                { label: "Schunk/Stäubli via EtherCAT", val: isServoFault ? "FAULT" : "Healthy", ok: !isServoFault },
                { label: "Camera Feeds (PoE)", val: "Streaming", ok: true },
                { label: "Network Devices (IT)", val: isRouterFreeze ? "Stride Linx DOWN" : "All Up", ok: !isRouterFreeze },
                { label: "24V DC Bus (OT)", val: "Nominal", ok: true },
                { label: "120V AC Plane (IT)", val: "Nominal", ok: true },
              ].map((r, i) => <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "4px 10px", borderRadius: 6,
                backgroundColor: r.ok ? C.bg : C.redDim, border: `1px solid ${r.ok ? C.border : C.red + "40"}`,
              }}>
                <span style={{ fontSize: 10, color: r.ok ? C.dim : C.red }}>{r.label}</span>
                <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: r.ok ? C.green : C.red }}>{r.val}</span>
              </div>)}
            </div>
          </div>
        </Panel>
      </div>

      {/* I/O SIGNAL PATH */}
      <div style={{ marginTop: 14 }}>
        <Panel title="I/O Signal Path — Physical to Logical Bridge" icon="⚡" status={isWireFault ? "error" : "ok"}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Signal Route: Fuji Button → M12 → Murrelektronik → 25-Pin Trunk → ZipLink → PLC</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", padding: "8px 0" }}>
            {[
              { label: "Fuji Button", detail: "Saginaw enclosure (Z3)", zone: "Z3", status: "ok" },
              { label: "M12 Cables", detail: "to Murrelektronik", zone: "Z3", status: "ok" },
              { label: "Murrelektronik Bulkhead", detail: "Signal consolidation", zone: "Z3→", status: "ok" },
              { label: "25-Pin Trunk Cable", detail: "Passenger side run", zone: "Z3→Z1", status: isWireFault ? "fault" : "ok" },
              { label: "ZipLink Breakout", detail: "Wire to PLC input", zone: "Z1", status: isWireFault ? "fault" : "ok" },
              { label: "FX5UC PLC Terminal", detail: "di/do variable set", zone: "Z1", status: isWireFault ? "fault" : "ok" },
            ].map((step, i, arr) => <React.Fragment key={i}>
              <div style={{
                padding: "8px 12px", borderRadius: 6, flex: "1 1 auto", minWidth: 140,
                backgroundColor: step.status === "fault" ? C.redDim : C.bg,
                border: `1px solid ${step.status === "fault" ? C.red + "40" : C.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: step.status === "fault" ? C.red : C.text }}>{step.label}</span>
                  <span style={{ fontSize: 9, color: C.muted }}>{step.zone}</span>
                </div>
                <div style={{ fontSize: 10, color: step.status === "fault" ? C.red : C.muted, marginTop: 2 }}>{step.detail}</div>
                {step.status === "fault" && <div style={{ fontSize: 9, color: C.red, fontWeight: 700, marginTop: 2, animation: "blink 1s step-end infinite" }}>FAULT</div>}
              </div>
              {i < arr.length - 1 && <span className="signal-arrow">→</span>}
            </React.Fragment>)}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
            <span style={{ fontWeight: 600 }}>Variable convention:</span>
            <span className="mono" style={{ marginLeft: 8, color: C.dim }}>di</span><span style={{ color: C.muted }}> = digital input</span>
            <span className="mono" style={{ marginLeft: 12, color: C.dim }}>do</span><span style={{ color: C.muted }}> = digital output</span>
            <span style={{ marginLeft: 12, color: C.muted }}>e.g.</span>
            <span className="mono" style={{ marginLeft: 4, color: C.accent }}>diServo["Enable"]</span>
            <span className="mono" style={{ marginLeft: 8, color: C.accent }}>doBelt["FWD"]</span>
            <span className="mono" style={{ marginLeft: 8, color: C.accent }}>doGripper_EGM["MAG"]</span>
            <span className="mono" style={{ marginLeft: 8, color: C.accent }}>doSafteyStop</span>
          </div>
        </Panel>
      </div>

      {/* 25-PIN UMBILICAL */}
      <div style={{ marginTop: 14 }}>
        <Panel title="25-Pin Umbilical Health" icon="🔌" status={isWireFault ? "error" : "ok"}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Murrelektronik Bulkhead (Z3) → 25-Pin Trunk (Passenger Side) → ZipLink Breakout (Z1 Cab)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(13,1fr)", gap: 3 }}>
                {Array.from({ length: 25 }, (_, i) => {
                  const n = i + 1;
                  const faulted = isWireFault && n === 14;
                  return <div key={i} style={{
                    textAlign: "center", padding: "5px 0", borderRadius: 4,
                    backgroundColor: faulted ? C.redDim : C.bg,
                    border: `1px solid ${faulted ? C.red + "60" : C.border}`,
                    animation: faulted ? "blink 1s step-end infinite" : "none",
                  }}>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: faulted ? C.red : C.green }}>{n}</div>
                    {faulted && <div style={{ fontSize: 7, color: C.red, fontWeight: 700 }}>OPEN</div>}
                  </div>;
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: C.muted }}>
                  {isWireFault ? "24/25 healthy \u2014 1 open circuit" : "25/25 healthy"}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: isWireFault ? C.red : C.green }}>
                  {isWireFault ? 'PIN 14 \u2014 OPEN CIRCUIT (doConveyor["Enable"])' : "ALL CLEAR"}
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Event Log */}
      <div style={{ marginTop: 14, padding: "14px 18px", backgroundColor: C.panel, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📜</span>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.dim }}>Nervous System Event Log</span>
          </div>
          <button className="cmd-btn" onClick={() => setCmdLog([])} style={{ padding: "4px 10px", fontSize: 10 }}>Clear</button>
        </div>
        <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {cmdLog.length === 0 && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", padding: "8px 0" }}>No events recorded.</div>}
          {cmdLog.map((entry, i) => {
            const color = entry.type === "fault" ? C.red : entry.type === "diagnosis" ? C.cyan : entry.type === "warn" ? C.amber : entry.type === "trace" ? C.purple : entry.type === "info" ? C.accent : C.dim;
            const icon = entry.type === "fault" ? "\u26A0" : entry.type === "diagnosis" ? "\uD83D\uDD0D" : entry.type === "warn" ? "\uD83D\uDCC9" : entry.type === "trace" ? "\u26A1" : entry.type === "info" ? "\u2139" : "\u2022";
            return <div key={i} style={{
              display: "flex", gap: 10, padding: "5px 8px", borderRadius: 4,
              backgroundColor: i === 0 ? `${color}10` : "transparent", animation: i === 0 ? "slideIn 0.3s ease" : "none",
            }}>
              <span style={{ fontSize: 11, flexShrink: 0 }}>{icon}</span>
              <span className="mono" style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{entry.time}</span>
              <span className="mono" style={{ fontSize: 11, color: i < 3 ? color : C.dim }}>{entry.cmd}</span>
            </div>;
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 14, padding: "12px 16px", backgroundColor: C.panel, borderRadius: 10, border: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontSize: 11, color: C.muted }}>B&B Enterprises &bull; RAIV #3 Digital Twin &bull; Nervous System Dashboard</div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 11, color: C.green }}>🧬 Nervous System: Online</span>
          <span style={{ fontSize: 11, color: C.green }}>📡 Cellular Backhaul: Connected</span>
          <span style={{ fontSize: 11, color: C.muted }}>v1.0</span>
        </div>
      </div>
    </div>
  );
}
