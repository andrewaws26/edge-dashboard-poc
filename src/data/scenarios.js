import { C } from '../constants';

// Scenario button definitions for the UI
export const SCENARIO_BUTTONS = [
  { id: "healthy", label: "Production Running", e: "✅" },
  { id: "estop", label: "E-Stop Triggered", e: "🛑" },
  { id: "maintenance", label: "Maintenance Mode", e: "🔧" },
  { id: "state_conflict", label: "State Conflict", e: "⚠️" },
  { id: "wire_fault", label: "Broken Wire (Pin 14)", e: "🔌" },
  { id: "apera_crash", label: "Apera Server Crash", e: "👁" },
  { id: "servo_fault", label: "Servo Fault (Axis 3)", e: "🧠" },
  { id: "router_freeze", label: "VPN Router Freeze", e: "📡" },
  { id: "gripper_stuck", label: "Gripper Won't Release", e: "🧲" },
  { id: "apera_drift", label: "Vision Accuracy Drop", e: "📉" },
];

// Global state machine per scenario
// eStop: true = circuit closed (safe), false = E-Stop active (halted)
export const SCENARIO_STATE_MACHINE = {
  healthy:       { eStop: true,  operationMode: true,  maintenanceMode: false },
  estop:         { eStop: false, operationMode: false, maintenanceMode: false },
  maintenance:   { eStop: true,  operationMode: false, maintenanceMode: true },
  state_conflict:{ eStop: true,  operationMode: true,  maintenanceMode: true },
  wire_fault:    { eStop: true,  operationMode: true,  maintenanceMode: false },
  apera_crash:   { eStop: true,  operationMode: true,  maintenanceMode: false },
  servo_fault:   { eStop: true,  operationMode: true,  maintenanceMode: false },
  router_freeze: { eStop: true,  operationMode: true,  maintenanceMode: false },
  gripper_stuck: { eStop: true,  operationMode: true,  maintenanceMode: false },
  apera_drift:   { eStop: true,  operationMode: true,  maintenanceMode: false },
};

// Pin states per scenario (pin number → boolean)
// Only overrides from "healthy" defaults are listed
const HEALTHY_PINS = {
  1: true, 2: false, 3: true, 4: true, 5: false, 6: true,
  7: false, 8: false, 9: true, 10: false, 11: true, 12: false,
  13: true, 14: true, 15: false, 16: false, 17: false, 18: false,
  19: true, 20: false, 21: false, 22: false, 23: false, 24: false, 25: true,
};

export const SCENARIO_PIN_STATES = {
  healthy: { ...HEALTHY_PINS },
  estop: { ...HEALTHY_PINS, 1: false, 2: false, 3: false, 4: false, 6: false, 9: false, 11: false, 13: false, 14: false },
  maintenance: { ...HEALTHY_PINS, 4: false, 5: true, 11: false, 12: true, 14: false },
  state_conflict: { ...HEALTHY_PINS, 4: true, 5: true, 11: true, 12: true },
  wire_fault: { ...HEALTHY_PINS, 14: false },
  apera_crash: { ...HEALTHY_PINS },
  servo_fault: { ...HEALTHY_PINS, 6: false, 13: false },
  router_freeze: { ...HEALTHY_PINS },
  gripper_stuck: { ...HEALTHY_PINS, 8: true, 16: false, 17: true, 20: true, 21: true },
  apera_drift: { ...HEALTHY_PINS },
};

// Faulted pins per scenario
export const SCENARIO_FAULTED_PINS = {
  healthy: [],
  estop: [3],
  maintenance: [],
  state_conflict: [4, 5],
  wire_fault: [14],
  apera_crash: [],
  servo_fault: [],
  router_freeze: [],
  gripper_stuck: [21],
  apera_drift: [],
};

// Log entries generated when a scenario is activated
export const SCENARIO_LOGS = {
  estop: [
    { cmd: 'SAFETY → diSafteyStop = FALSE. Emergency stop circuit OPEN.', type: 'fault' },
    { cmd: 'PLC → All digital outputs forced LOW. Motion locked out.', type: 'fault' },
    { cmd: 'TRACE → Physical E-Stop loop must be reset at Saginaw enclosure (Zone 3).', type: 'trace' },
  ],
  maintenance: [
    { cmd: 'MODE → diMaintenance["Mode"] = TRUE. Entering maintenance lockout.', type: 'info' },
    { cmd: 'PLC → Automated kinematic routines locked out. doBelt["FWD"] = FALSE.', type: 'info' },
    { cmd: 'PLC → doMaintenance["LED"] = TRUE. Indicator lit on Saginaw enclosure.', type: 'trace' },
  ],
  state_conflict: [
    { cmd: 'CONFLICT → diOperation["Start"] AND diMaintenance["Mode"] both TRUE!', type: 'fault' },
    { cmd: 'DIAGNOSIS → Mutually exclusive modes active simultaneously. Physical switch failure likely.', type: 'diagnosis' },
    { cmd: 'TRACE → Check Fuji button contacts in Saginaw enclosure (Zone 3). Pin 4 and Pin 5 both HIGH.', type: 'fault' },
  ],
  wire_fault: [
    { cmd: 'TRACE → 1. Fuji button (Saginaw enclosure, Z3): PRESSED', type: 'trace' },
    { cmd: 'TRACE → 2. M12 cable to Murrelektronik bulkhead: OK', type: 'trace' },
    { cmd: 'TRACE → 3. 25-pin trunk (passenger side): Pin 14 — OPEN CIRCUIT', type: 'fault' },
    { cmd: 'TRACE → 4. ZipLink breakout (Cab, Z1): No signal on Pin 14', type: 'fault' },
    { cmd: 'TRACE → 5. FX5UC PLC: doBelt["FWD"] = TRUE but no actuation at motor', type: 'fault' },
    { cmd: 'DIAGNOSIS → Fault isolated to Pin 14 (Green/Black wire) in 25-pin trunk. Physical break between Murrelektronik bulkhead and ZipLink.', type: 'diagnosis' },
  ],
  apera_crash: [
    { cmd: 'NERVOUS SYSTEM → Apera Server 1 (Front Dell, Zone 1): last inference 12 min ago.', type: 'fault' },
    { cmd: 'TRACE → 120V AC power plane (Zone 2 inverter → Zone 1 cab): OK', type: 'trace' },
    { cmd: 'TRACE → Netgear switch port: LINK UP. Path: TRENDnet PoE (Z3) → Netgear (Z1) → Dell.', type: 'trace' },
    { cmd: 'DIAGNOSIS → CPU temp normal. Network connected. Apera process not responding — software crash.', type: 'diagnosis' },
  ],
  servo_fault: [
    { cmd: 'PLC → diServo["Enable"] = FALSE. Servo power circuit opened.', type: 'fault' },
    { cmd: 'NERVOUS SYSTEM → Stäubli servo fault: Axis 3 following error. Arm stopped.', type: 'fault' },
    { cmd: 'TRACE → EtherCAT link (OT domain, dedicated bus): HEALTHY', type: 'trace' },
    { cmd: 'TRACE → Schunk UXB 24V controller (Zone 3): POWERED, 24V DC from Rhino PSR OK', type: 'trace' },
    { cmd: 'DIAGNOSIS → Recoverable software fault on Axis 3. EtherCAT intact. Not mechanical.', type: 'diagnosis' },
  ],
  router_freeze: [
    { cmd: 'NERVOUS SYSTEM → Stride Linx VPN router (Zone 1): unresponsive. 6 pings failed.', type: 'fault' },
    { cmd: 'NERVOUS SYSTEM → Pi cellular backhaul independent of Stride Linx. Twin still reporting.', type: 'info' },
    { cmd: 'TRACE → Netgear switch: UP. Dell servers: reachable. EtherCAT: healthy. Telemetry only.', type: 'trace' },
  ],
  gripper_stuck: [
    { cmd: 'PLC → doGripper_EGM["DEMAG"] = TRUE but diEGM["Part_Detect"] still HIGH.', type: 'fault' },
    { cmd: 'TRACE → Schunk UXB 24V controller (Zone 3): HEALTHY', type: 'trace' },
    { cmd: 'TRACE → 24V DC plane (Rhino PSR → Schunk): Voltage nominal', type: 'trace' },
    { cmd: 'DIAGNOSIS → Magnetic gripper residual magnetism. Electrical path healthy. Operator clears manually.', type: 'diagnosis' },
  ],
  apera_drift: [
    { cmd: 'NERVOUS SYSTEM → Apera pick confidence: 62% (baseline 95%). Dropping over shift.', type: 'warn' },
    { cmd: 'TRACE → Camera network: TRENDnet PoE (Z3) → Netgear (Z1) → Dell: ALL HEALTHY', type: 'trace' },
    { cmd: 'TRACE → Camera 2 exposure auto-adjusted. Ambient light change detected.', type: 'trace' },
    { cmd: 'DIAGNOSIS → IT domain healthy. Environmental change — site crew moved a light.', type: 'diagnosis' },
  ],
};

// Toast messages shown when a scenario is activated
export const SCENARIO_TOASTS = {
  estop: { message: "EMERGENCY STOP — diSafteyStop circuit OPEN. All motion locked out.", type: "error" },
  maintenance: { message: "Maintenance mode active — automated routines locked out.", type: "warning" },
  state_conflict: { message: "STATE CONFLICT — Operation and Maintenance both active. Check Fuji switches.", type: "error" },
  wire_fault: { message: "Pin 14 open circuit — doBelt[\"FWD\"] cannot actuate. Green/Black wire break in 25-pin trunk.", type: "error" },
  apera_crash: { message: "Apera Server 1 not responding — IT domain, Zone 1. Software crash.", type: "error" },
  servo_fault: { message: "Stäubli servo fault Axis 3 — OT domain, EtherCAT healthy. Recoverable.", type: "error" },
  router_freeze: { message: "Stride Linx VPN frozen — telemetry down, Pi reporting via cellular.", type: "error" },
  gripper_stuck: { message: "Gripper won't release — Schunk UXB healthy, residual magnetism detected.", type: "warning" },
  apera_drift: { message: "Vision accuracy degrading — cameras healthy, ambient lighting changed.", type: "warning" },
};

// Signal trace steps for the I/O signal path visualization
export const SCENARIO_SIGNAL_TRACE = {
  healthy: [
    { label: "Fuji Button", detail: "Saginaw enclosure", zone: "Z3", status: "ok" },
    { label: "M12 Cables", detail: "to Murrelektronik", zone: "Z3", status: "ok" },
    { label: "Murrelektronik Bulkhead", detail: "Signal consolidation", zone: "Z3", status: "ok" },
    { label: "25-Pin Trunk Cable", detail: "Passenger side run", zone: "Z3→Z1", status: "ok" },
    { label: "ZipLink Breakout", detail: "Wire to PLC terminal", zone: "Z1", status: "ok" },
    { label: "FX5UC PLC", detail: "di/do variable mapping", zone: "Z1", status: "ok" },
  ],
  wire_fault: [
    { label: "Fuji Button", detail: "Saginaw enclosure", zone: "Z3", status: "ok" },
    { label: "M12 Cables", detail: "to Murrelektronik", zone: "Z3", status: "ok" },
    { label: "Murrelektronik Bulkhead", detail: "Signal OK to this point", zone: "Z3", status: "ok" },
    { label: "25-Pin Trunk Cable", detail: "PIN 14 OPEN — Green/Black wire", zone: "Z3→Z1", status: "fault" },
    { label: "ZipLink Breakout", detail: "No signal on Pin 14", zone: "Z1", status: "fault" },
    { label: "FX5UC PLC", detail: 'doBelt["FWD"]=TRUE, no actuation', zone: "Z1", status: "fault" },
  ],
};

// Diagnosis details shown in the DiagnosisPanel for each fault scenario
export const DIAGNOSIS_MAP = {
  estop: {
    diagnosis: 'diSafteyStop = FALSE (0V). Emergency stop loop is OPEN. All PLC outputs forced LOW. The physical E-Stop button has been pressed or the NC loop has broken.',
    operatorAction: 'Reset the E-Stop button on the Saginaw enclosure (Zone 3 Rear). Twist-release the mushroom head, then verify diSafteyStop returns HIGH on the dashboard.',
    remoteFix: null,
    traceSteps: [
      { label: "E-Stop button (Saginaw enclosure, Z3)", detail: "PRESSED / OPEN", status: "fault" },
      { label: "NC safety loop wiring", detail: "CIRCUIT OPEN", status: "fault" },
      { label: "FX5UC PLC safety input (Pin 3)", detail: "diSafteyStop = FALSE", status: "fault" },
      { label: "All PLC digital outputs", detail: "FORCED LOW", status: "fault" },
    ],
  },
  state_conflict: {
    diagnosis: 'diOperation["Start"] = TRUE AND diMaintenance["Mode"] = TRUE simultaneously. These modes are mutually exclusive. Physical switch failure suspected.',
    operatorAction: 'Inspect both Fuji push buttons in the Saginaw enclosure (Zone 3). One switch contact may be welded closed. Toggle both switches and verify state changes on the dashboard.',
    remoteFix: null,
    traceSteps: [
      { label: "Operation Fuji button (Z3)", detail: "diOperation[\"Start\"] = TRUE", status: "fault" },
      { label: "Maintenance Fuji button (Z3)", detail: "diMaintenance[\"Mode\"] = TRUE", status: "fault" },
      { label: "PLC state evaluation", detail: "CONFLICT — BOTH ACTIVE", status: "fault" },
    ],
  },
  wire_fault: {
    diagnosis: 'doBelt["FWD"] = TRUE at PLC. Belt motion: none. Fault isolated to Pin 14 (Green/Black wire) — open circuit in 25-pin trunk cable (passenger side).',
    operatorAction: '"Tighten Pin 14 on the passenger-side bulkhead connector where the 25-pin trunk meets the ZipLink breakout in the cab." Fixed in 5 minutes.',
    remoteFix: null,
    traceSteps: [
      { label: "Fuji button in Saginaw enclosure (Z3)", detail: "PRESSED", status: "ok" },
      { label: "M12 cable → Murrelektronik bulkhead", detail: "CONTINUITY", status: "ok" },
      { label: "25-pin trunk cable (passenger side)", detail: "PIN 14 OPEN — Green/Black wire", status: "fault" },
      { label: "ZipLink breakout board (Z1 cab)", detail: "NO SIGNAL", status: "fault" },
      { label: "FX5UC PLC terminal", detail: 'doBelt["FWD"]=TRUE, no actuation', status: "fault" },
      { label: "Motor contactor (24V DC)", detail: "NOT ENERGIZED", status: "fault" },
    ],
  },
  apera_crash: {
    diagnosis: "Apera Server 1 (Front Dell, Zone 1): last inference 12 min ago. CPU temp: normal. Network: connected via Netgear trunk. Status: process not responding.",
    operatorAction: '"Open the cab, press the power button on the left Dell server for 3 seconds." On the 120V AC plane — the server itself is fine, just the Apera process crashed.',
    remoteFix: "Restart the Apera service remotely via Stride Linx VPN tunnel. If process restart fails, guide operator to power-cycle the Dell.",
    traceSteps: [
      { label: "120V AC plane (Generator → Inverter → Cab)", detail: "VOLTAGE OK", status: "ok" },
      { label: "Netgear switch port (Zone 1)", detail: "LINK UP", status: "ok" },
      { label: "TRENDnet PoE → Netgear trunk", detail: "CONNECTED", status: "ok" },
      { label: "Dell Server 1 hardware", detail: "CPU NORMAL, POWERED", status: "ok" },
      { label: "Apera vision process", detail: "NOT RESPONDING", status: "fault" },
    ],
  },
  servo_fault: {
    diagnosis: "Stäubli servo fault: Axis 3 — following error. EtherCAT bus (dedicated OT line): healthy. Schunk UXB 24V controller (Zone 3): powered. diServo[\"Enable\"] dropped FALSE.",
    operatorAction: "If mechanical: operator describes the issue from the Saginaw HMI panel. We read the exact fault code from the Schunk controller via EtherCAT.",
    remoteFix: "Clear the recoverable fault remotely and re-home the arm. Schunk controller is on the EtherCAT bus — we can read every register from Louisville.",
    traceSteps: [
      { label: "24V DC plane (Rhino PSR → Schunk)", detail: "VOLTAGE OK", status: "ok" },
      { label: "EtherCAT bus (dedicated OT)", detail: "LINK HEALTHY", status: "ok" },
      { label: "Schunk UXB 24V controller (Z3)", detail: "POWERED", status: "ok" },
      { label: "Stäubli Axis 3 servo", detail: "FOLLOWING ERROR", status: "fault" },
      { label: "diServo[\"Enable\"]", detail: "DROPPED FALSE", status: "fault" },
    ],
  },
  router_freeze: {
    diagnosis: "Stride Linx VPN router (Zone 1): unresponsive. Twin still alive on Pi cellular backhaul. Vision/IT and Motion/OT networks unaffected — only telemetry is down.",
    operatorAction: '"Flip the labeled switch on the IT rack in the cab to reboot the Stride Linx." Back online in 90 seconds.',
    remoteFix: "Power-cycle the Stride Linx via Pi GPIO relay through the cellular backhaul. The Pi is independent of the Stride Linx.",
    traceSteps: [
      { label: "Vision/IT network (Netgear → Dell)", detail: "HEALTHY", status: "ok" },
      { label: "Motion/OT network (EtherCAT)", detail: "HEALTHY", status: "ok" },
      { label: "Stride Linx VPN (telemetry)", detail: "UNRESPONSIVE", status: "fault" },
      { label: "Pi cellular backhaul", detail: "CONNECTED (INDEPENDENT)", status: "ok" },
    ],
  },
  gripper_stuck: {
    diagnosis: 'doGripper_EGM["DEMAG"] = TRUE. diEGM["Part_Detect"] still HIGH. Schunk UXB controller healthy. 24V DC plane nominal. Residual magnetism.',
    operatorAction: "Clear the part manually from the gripper. The electrical system is healthy — this is residual magnetism, not a software or electrical fault.",
    remoteFix: null,
    traceSteps: [
      { label: "FX5UC PLC output", detail: 'doGripper_EGM["DEMAG"]=TRUE', status: "ok" },
      { label: "24V DC plane (Rhino PSR → Schunk UXB)", detail: "VOLTAGE OK", status: "ok" },
      { label: "Schunk UXB 24V controller (Z3)", detail: "HEALTHY", status: "ok" },
      { label: "Gripper magnet", detail: "DE-ENERGIZED", status: "ok" },
      { label: "Part presence sensor (diEGM[\"Part_Detect\"])", detail: "STILL HIGH", status: "fault" },
      { label: "Root cause", detail: "RESIDUAL MAGNETISM", status: "warn" },
    ],
  },
  apera_drift: {
    diagnosis: "Apera pick confidence: 62% (normal: 95%). Camera 2 exposure auto-adjusted. Vision network (TRENDnet PoE → Netgear → Dell): all healthy. Environmental lighting change.",
    operatorAction: "Reposition the work light that the site crew moved. Cameras adjusted exposure but angle degraded pick confidence.",
    remoteFix: "Pull up the camera feed through the Stride Linx VPN and adjust Apera vision parameters remotely. Or guide operator to reposition the light.",
    traceSteps: [
      { label: "TRENDnet PoE switch (Z3, cameras)", detail: "ALL PORTS UP", status: "ok" },
      { label: "Netgear trunk (Z1, IT backbone)", detail: "LINK HEALTHY", status: "ok" },
      { label: "Dell Apera servers (Z1)", detail: "RUNNING", status: "ok" },
      { label: "Apera pick confidence", detail: "62% (↓33%)", status: "fault" },
      { label: "Camera 2 auto-exposure", detail: "COMPENSATING", status: "warn" },
      { label: "Root cause", detail: "AMBIENT LIGHT CHANGE", status: "warn" },
    ],
  },
};
