import React, { useState, useEffect, useCallback, useRef } from 'react';
import { C, IT, OT } from './constants';
import { DomainTag } from './components/DomainTag';
import { Panel } from './components/Panel';
import { Metric } from './components/Metric';
import { Bar } from './components/Bar';
import { Toast } from './components/Toast';
import { DiagnosisPanel } from './components/DiagnosisPanel';
import { GlobalStateBanner } from './components/GlobalStateBanner';
import { PinTable } from './components/PinTable';
import { ZoneTopology } from './components/ZoneTopology';
import { VisionStatus } from './components/VisionStatus';
import { SignalTrace } from './components/SignalTrace';
import {
  SCENARIO_BUTTONS, SCENARIO_LOGS, SCENARIO_TOASTS, DIAGNOSIS_MAP,
  SCENARIO_STATE_MACHINE, SCENARIO_PIN_STATES, SCENARIO_FAULTED_PINS,
  SCENARIO_SIGNAL_TRACE,
} from './data/scenarios';

export default function App() {
  const [tick, setTick] = useState(0);
  const [scenario, setScenario] = useState("healthy");

  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const toastTimer = useRef(null);
  const [cmdLog, setCmdLog] = useState([]);

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 6000);
  };

  const addLog = (cmd, type) => {
    const time = new Date().toLocaleTimeString();
    setCmdLog(prev => [{ time, cmd, type: type || "info" }, ...prev].slice(0, 20));
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
    if (logs) logs.forEach(entry => addLog(entry.cmd, entry.type));
    const toastData = SCENARIO_TOASTS[scenario];
    if (toastData) showToast(toastData.message, toastData.type);
  }, [scenario]);

  // State machine
  const stateMachine = SCENARIO_STATE_MACHINE[scenario] || SCENARIO_STATE_MACHINE.healthy;
  const pinStates = SCENARIO_PIN_STATES[scenario] || SCENARIO_PIN_STATES.healthy;
  const faultedPins = SCENARIO_FAULTED_PINS[scenario] || [];
  const currentDiagnosis = DIAGNOSIS_MAP[scenario] || null;
  const signalTrace = SCENARIO_SIGNAL_TRACE[scenario] || SCENARIO_SIGNAL_TRACE.healthy;

  // Derived
  const isHealthy = scenario === "healthy";
  const isWireFault = scenario === "wire_fault";
  const isAperaCrash = scenario === "apera_crash";
  const isServoFault = scenario === "servo_fault";
  const isRouterFreeze = scenario === "router_freeze";
  const isGripperStuck = scenario === "gripper_stuck";
  const isAperaDrift = scenario === "apera_drift";
  const isEstop = scenario === "estop";
  const isMaintenance = scenario === "maintenance";
  const isConflict = scenario === "state_conflict";

  // Overall border color for maintenance/halt modes
  const pageBorderColor = isEstop || isConflict ? C.red : isMaintenance ? C.amber : "transparent";

  return (
    <div style={{
      padding: 24, maxWidth: 1600, margin: "0 auto",
      borderLeft: pageBorderColor !== "transparent" ? `3px solid ${pageBorderColor}40` : "none",
      borderRight: pageBorderColor !== "transparent" ? `3px solid ${pageBorderColor}40` : "none",
    }}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: C.accent + "15", border: `1px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚛</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, letterSpacing: -0.5 }}>
              RAIV #3 <span style={{ color: C.dim, fontWeight: 400, fontSize: 15 }}>Digital Twin — Nervous System</span>
            </h1>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              B&B Enterprises &bull; Louisville, KY → Field Site &bull;
              Telemetry: <span style={{ color: isRouterFreeze ? C.red : C.green }}>{isRouterFreeze ? "VPN Down" : "Stride Linx VPN"}</span>
              {" "}&bull; Backhaul: <span style={{ color: C.green }}>Pi Cellular</span>
              {" "}&bull; <span className="mono" style={{ color: C.dim }}>t={tick}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 4 }}>
            <DomainTag domain={IT} />
            <DomainTag domain={OT} />
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`,
            letterSpacing: 0.5,
          }}>READ-ONLY OBSERVABILITY</span>
        </div>
      </div>

      {/* Global State Banner */}
      <GlobalStateBanner
        eStop={stateMachine.eStop}
        operationMode={stateMachine.operationMode}
        maintenanceMode={stateMachine.maintenanceMode}
      />

      {/* Scenario buttons */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap", padding: "10px 14px", backgroundColor: C.panel, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, color: C.muted, alignSelf: "center", marginRight: 6, fontWeight: 700 }}>SIMULATE:</span>
        {SCENARIO_BUTTONS.map(s => {
          const active = scenario === s.id;
          const isOk = s.id === "healthy" || s.id === "maintenance";
          return (
            <button key={s.id} onClick={() => { setScenario("healthy"); setTimeout(() => setScenario(s.id), 50); }} style={{
              padding: "6px 12px", borderRadius: 6,
              border: `1px solid ${active ? (isOk ? C.green : C.red) : C.border}`,
              backgroundColor: active ? (isOk ? C.greenDim : C.redDim) : "transparent",
              color: active ? (isOk ? C.green : C.red) : C.dim,
              fontSize: 10, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>{s.e} {s.label}</button>
          );
        })}
      </div>

      {/* Diagnosis Panel (when fault active) */}
      {currentDiagnosis && <DiagnosisPanel
        diagnosis={currentDiagnosis.diagnosis}
        operatorAction={currentDiagnosis.operatorAction}
        remoteFix={currentDiagnosis.remoteFix}
        traceSteps={currentDiagnosis.traceSteps}
      />}

      {/* === ZONE TOPOLOGY === */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>🏗</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: C.dim }}>Physical Zone Topology</span>
          <span style={{ fontSize: 9, color: C.muted }}>&mdash; Every device, every zone, at a glance</span>
        </div>
        <ZoneTopology scenario={scenario} />
      </div>

      {/* === I/O SIGNAL TRACE === */}
      <div style={{ marginBottom: 14 }}>
        <SignalTrace
          steps={signalTrace}
          title="I/O Signal Path &mdash; Physical to Logical Bridge"
          subtitle="Signal Route: Fuji Button (Z3) → M12 → Murrelektronik → 25-Pin Trunk (Passenger Side) → ZipLink (Z1) → FX5UC PLC"
        />
      </div>

      {/* === 25-PIN TABLE + SUBSYSTEM STATUS === */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14, marginBottom: 14 }}>
        {/* Full 25-Pin I/O Table */}
        <Panel title="25-Pin Trunk Line &mdash; Complete I/O Map" icon="🔌" status={faultedPins.length > 0 ? "error" : "ok"}>
          <PinTable pinStates={pinStates} faultedPins={faultedPins} />
        </Panel>

        {/* Right column: subsystem status stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* PLC Status */}
          <Panel title="FX5UC PLC" bodyPart="Spine" icon="🦴" status={isEstop ? "error" : "ok"} zone="Z1 CAB" domain={OT}>
            <Metric label="PLC Status" value={isEstop ? "SAFETY STOP" : "RUN"} status={isEstop ? "error" : "ok"} />
            <Metric label="Scan Cycle" value={j(4.2, 0.5)} unit="ms" status="ok" />
            <Metric label="24V DC (Rhino PSR)" value="NOMINAL" status="ok" />
            <Metric label="Click PLC (Aux/Safety)" value="RUN" status="ok" small />
          </Panel>

          {/* Network Status */}
          <Panel title="Network Topology" icon="📡" status={isRouterFreeze ? "error" : "ok"} zone="ALL ZONES">
            <Metric label="Vision/IT (Ethernet/PoE)" value={isAperaCrash ? "DEGRADED" : "HEALTHY"} status={isAperaCrash ? "error" : isAperaDrift ? "warn" : "ok"} small />
            <Metric label="Motion/OT (EtherCAT)" value="HEALTHY" status="ok" small />
            <Metric label="Telemetry (Stride Linx VPN)" value={isRouterFreeze ? "UNRESPONSIVE" : "CONNECTED"} status={isRouterFreeze ? "error" : "ok"} small />
            <Metric label="Pi Cellular Backhaul" value="CONNECTED" status="ok" small />
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>
              <Metric label="Latency (VPN)" value={isRouterFreeze ? "\u2014" : j(34, 8)} unit={isRouterFreeze ? "" : "ms"} status={isRouterFreeze ? "error" : "ok"} small />
              <Metric label="Latency (Cellular)" value={j(120, 20)} unit="ms" status="ok" small />
            </div>
          </Panel>

          {/* Power */}
          <Panel title="Power Distribution" icon="⚡" status="ok" zone="Z1+Z2">
            <div style={{ fontSize: 9, color: C.cyan, fontWeight: 700, letterSpacing: 0.5 }}>AC PLANE (120V)</div>
            <Metric label="Generator/Inverter (Z2)" value="RUNNING" status="ok" small />
            <Metric label="→ IT Stack (Dell, Netgear)" value="NOMINAL" status="ok" small />
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4, marginTop: 4 }}>
              <div style={{ fontSize: 9, color: C.orange, fontWeight: 700, letterSpacing: 0.5 }}>DC PLANE (24V)</div>
              <Metric label="Rhino PSR 24-480 (Z1)" value="24.1V" status="ok" small />
              <Metric label="→ OT Stack (PLC, Schunk, Relays)" value="NOMINAL" status="ok" small />
            </div>
          </Panel>
        </div>
      </div>

      {/* === SUBSYSTEM DETAIL PANELS === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>

        {/* STÄUBLI — Robot Arm */}
        <Panel title="St&auml;ubli Robot Arm" bodyPart="Kinematic Boundary" icon="🤖" status={isServoFault || isEstop ? "error" : "ok"} zone="Z3 REAR" domain={OT}>
          <Metric label="EtherCAT Link (dedicated)" value="HEALTHY" status="ok" />
          <Metric label="Schunk UXB 24V (Z3)" value="POWERED" status="ok" />
          <Metric label='diServo["Enable"]' value={pinStates[6] ? "HIGH" : "LOW"} status={pinStates[6] ? "ok" : "error"} />
          <Metric label="Servo Status" value={isServoFault ? "FAULT \u2014 AXIS 3" : isEstop ? "LOCKED OUT" : "NOMINAL"} status={isServoFault || isEstop ? "error" : "ok"} />
          {isServoFault && <div className="diagnosis-box" style={{ backgroundColor: C.redDim, border: `1px solid ${C.red}30`, color: C.amber, fontSize: 11 }}>
            Axis 3 following error (recoverable). EtherCAT bus healthy. Software fault, not mechanical. Note: XYZ kinematics run on isolated EtherCAT &mdash; PLC only sends permissive signals.
          </div>}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>Kinematic Boundary</div>
            <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.5 }}>
              PLC provides <em>permissive</em> signals only. Sub-ms motion data runs on isolated EtherCAT between Robot Controller and servos.
            </div>
          </div>
        </Panel>

        {/* Belt & Gripper */}
        <Panel title="Belt &amp; Gripper" bodyPart="Actuators" icon="🏭" status={isWireFault ? "error" : isGripperStuck ? "warn" : isEstop ? "error" : "ok"} zone="Z3 REAR" domain={OT}>
          <Bar label="Belt Speed" value={isWireFault || isEstop || isMaintenance ? 0 : j(92, 4)} unit="%" status={isWireFault || isEstop ? "error" : isMaintenance ? "warn" : "ok"} />
          <Metric label='doBelt["FWD"]' value={pinStates[14] ? "HIGH" : "LOW"} status={isWireFault ? "error" : pinStates[14] ? "ok" : "warn"} />
          <Metric label='doBelt["REV"]' value={pinStates[15] ? "HIGH" : "LOW"} status="ok" />
          <Metric label='diBelt["Part_Present"]' value={pinStates[7] ? "DETECTED" : "CLEAR"} status="ok" />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>
            <Metric label='doGripper_EGM["MAG"]' value={pinStates[16] ? "ENERGIZED" : "OFF"} status={isGripperStuck ? "warn" : "ok"} />
            <Metric label='doGripper_EGM["DEMAG"]' value={pinStates[17] ? "ACTIVE" : "OFF"} status="ok" />
            <Metric label='diGripper["State"]' value={pinStates[8] ? "ENGAGED" : "RELEASED"} status={isGripperStuck ? "warn" : "ok"} />
            <Metric label='diEGM["Part_Detect"]' value={pinStates[21] ? "PRESENT" : "CLEAR"} status={isGripperStuck ? "error" : "ok"} />
            <Metric label="Schunk UXB 24V" value="HEALTHY" status="ok" small />
          </div>
          {isGripperStuck && <div className="diagnosis-box" style={{ backgroundColor: C.amberDim, border: `1px solid ${C.amber}30`, color: C.amber, fontSize: 11 }}>
            DEMAG active but part sensor still reads PRESENT. Schunk UXB healthy on 24V DC. Residual magnetism &mdash; not software. Operator clears manually.
          </div>}
        </Panel>

        {/* Nervous System Monitor */}
        <Panel title="Nervous System" icon="🧬" status="ok" zone="Z1 CAB">
          <Metric label="Raspberry Pi" value="ONLINE" status="ok" />
          <Metric label="Cellular Backhaul" value="CONNECTED" status="ok" />
          <Metric label="Independence" value="Separate from Stride Linx" status="info" small />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>Subsystem Health</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { label: "FX5UC PLC (OT)", val: isEstop ? "E-STOP" : "Active", ok: !isEstop },
                { label: "Click PLC Aux (OT)", val: "Active", ok: true },
                { label: "Apera Servers (IT)", val: isAperaCrash ? "FAULT" : "Healthy", ok: !isAperaCrash },
                { label: "EtherCAT / St\u00E4ubli", val: isServoFault ? "FAULT" : "Healthy", ok: !isServoFault },
                { label: "PoE Cameras (IT)", val: "Streaming", ok: true },
                { label: "Stride Linx VPN", val: isRouterFreeze ? "DOWN" : "Up", ok: !isRouterFreeze },
                { label: "24V DC Bus (OT)", val: "Nominal", ok: true },
                { label: "120V AC Plane (IT)", val: "Nominal", ok: true },
                { label: "25-Pin Trunk", val: isWireFault ? "FAULT" : "Healthy", ok: !isWireFault },
              ].map((r, i) => <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "3px 8px", borderRadius: 4,
                backgroundColor: r.ok ? C.bg : C.redDim,
                border: `1px solid ${r.ok ? C.border : C.red + "40"}`,
              }}>
                <span style={{ fontSize: 9, color: r.ok ? C.dim : C.red }}>{r.label}</span>
                <span className="mono" style={{ fontSize: 8, fontWeight: 700, color: r.ok ? C.green : C.red }}>{r.val}</span>
              </div>)}
            </div>
          </div>
        </Panel>
      </div>

      {/* === VISION SUBSYSTEM (IT DOMAIN) === */}
      <div style={{ marginBottom: 14 }}>
        <VisionStatus
          status={isAperaCrash ? "error" : isAperaDrift ? "warn" : "ok"}
          serverStatus={{
            front: isAperaCrash ? "NOT RESPONDING" : "RUNNING",
            rear: "RUNNING",
          }}
          confidence={isAperaCrash ? 0 : isAperaDrift ? j(62, 3) : j(96.4, 2)}
          fps={isAperaCrash ? 0 : j(28, 3)}
        />
      </div>

      {/* === EVENT LOG === */}
      <div style={{ padding: "14px 18px", backgroundColor: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📜</span>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.dim }}>Diagnostic Event Log</span>
            <span style={{ fontSize: 9, color: C.muted }}>&mdash; Linear trace from physical origin to software execution</span>
          </div>
          <button className="cmd-btn" onClick={() => setCmdLog([])} style={{ padding: "4px 10px", fontSize: 10 }}>Clear</button>
        </div>
        <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {cmdLog.length === 0 && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", padding: "8px 0" }}>No events. Select a fault scenario to see diagnostic trace.</div>}
          {cmdLog.map((entry, i) => {
            const color = entry.type === "fault" ? C.red : entry.type === "diagnosis" ? C.cyan : entry.type === "warn" ? C.amber : entry.type === "trace" ? C.purple : entry.type === "info" ? C.accent : C.dim;
            const badge = entry.type === "fault" ? "FAULT" : entry.type === "diagnosis" ? "DIAG" : entry.type === "warn" ? "WARN" : entry.type === "trace" ? "TRACE" : entry.type === "info" ? "INFO" : "LOG";
            return <div key={i} style={{
              display: "flex", gap: 8, padding: "4px 8px", borderRadius: 4, alignItems: "flex-start",
              backgroundColor: i === 0 ? `${color}10` : "transparent",
              animation: i === 0 ? "slideIn 0.3s ease" : "none",
            }}>
              <span style={{
                fontSize: 7, fontWeight: 800, padding: "2px 5px", borderRadius: 3, flexShrink: 0, marginTop: 1,
                backgroundColor: `${color}20`, color, border: `1px solid ${color}30`, letterSpacing: 0.5,
              }}>{badge}</span>
              <span className="mono" style={{ fontSize: 9, color: C.muted, whiteSpace: "nowrap", flexShrink: 0, marginTop: 1 }}>{entry.time}</span>
              <span className="mono" style={{ fontSize: 10, color: i < 3 ? color : C.dim, lineHeight: 1.4 }}>{entry.cmd}</span>
            </div>;
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 16px", backgroundColor: C.panel, borderRadius: 10, border: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontSize: 10, color: C.muted }}>
          B&amp;B Enterprises &bull; RAIV #3 Digital Twin &bull; Nervous System Observability Dashboard &bull; <span style={{ color: C.dim }}>Read-Only Telemetry</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 10, color: C.green }}>🧬 Nervous System: Online</span>
          <span style={{ fontSize: 10, color: C.green }}>📡 Cellular: Connected</span>
          <span style={{ fontSize: 10, color: C.muted }}>v2.0</span>
        </div>
      </div>
    </div>
  );
}
