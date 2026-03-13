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
  { id: "apera_memory", label: "Apera Memory Leak", e: "🧠" },
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
  apera_memory:  { eStop: true,  operationMode: true,  maintenanceMode: false },
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
  apera_memory: { ...HEALTHY_PINS },
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
  apera_memory: [],
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
    { cmd: 'SERVER 1 → CPU: 0% (idle). RAM: 2.1/32 GB (OS only). GPU: 0/8 GB VRAM. Process: DEAD.', type: 'fault' },
    { cmd: 'SERVER 1 → Apera PID not found in process table. Exit code: SEGFAULT (signal 11).', type: 'fault' },
    { cmd: 'SERVER 1 → Disk: 47/512 GB used (healthy). Last log: "CUDA out of memory" at 14:32:07.', type: 'trace' },
    { cmd: 'TRACE → 120V AC power plane (Zone 2 inverter → Zone 1 cab): OK', type: 'trace' },
    { cmd: 'TRACE → Netgear switch port: LINK UP. Path: TRENDnet PoE (Z3) → Netgear (Z1) → Dell.', type: 'trace' },
    { cmd: 'TRACE → Server 1 hardware: CPU 42°C, PSU 120V AC stable, fans normal. Hardware healthy.', type: 'trace' },
    { cmd: 'DIAGNOSIS → Apera process crashed with CUDA OOM. GPU VRAM exhausted before segfault. Restart process or power-cycle Dell.', type: 'diagnosis' },
  ],
  servo_fault: [
    { cmd: 'PLC → diServo["Enable"] = FALSE. Servo power circuit opened.', type: 'fault' },
    { cmd: 'NERVOUS SYSTEM → Stäubli servo fault: Axis 3 following error. Arm stopped.', type: 'fault' },
    { cmd: 'ROBOT → Axis 3 (elbow): following error 0.47° exceeds threshold 0.10°. Torque: 87% (spike).', type: 'fault' },
    { cmd: 'ROBOT → Axis 3 motor temp: 68°C (limit: 85°C). Not thermal. Collision or payload shift.', type: 'trace' },
    { cmd: 'ROBOT → Axes 1,2,4,5,6: all nominal. Motor temps 38-52°C. Torques 12-34%.', type: 'trace' },
    { cmd: 'ROBOT → Fault code: E4031 "Following error axis 3". Cycle #12,847. Last home: 06:15.', type: 'fault' },
    { cmd: 'TRACE → EtherCAT link (OT domain, dedicated bus): HEALTHY. 4000 pkt/s, 0 errors.', type: 'trace' },
    { cmd: 'TRACE → Schunk UXB 24V controller (Zone 3): POWERED, 24V DC from Rhino PSR OK', type: 'trace' },
    { cmd: 'DIAGNOSIS → Recoverable software fault on Axis 3. Torque spike suggests unexpected load or collision. EtherCAT intact. Not mechanical. Re-home and clear fault remotely.', type: 'diagnosis' },
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
    { cmd: 'SERVER 1 → CPU: 34%. RAM: 18.2/32 GB. GPU: 5.1/8 GB VRAM. Process: RUNNING (PID 4821).', type: 'trace' },
    { cmd: 'SERVER 1 → Inference latency: 89ms (baseline: 45ms). Model loaded: pick_v3.2.onnx.', type: 'warn' },
    { cmd: 'SERVER 2 → CPU: 28%. RAM: 14.7/32 GB. GPU: 4.2/8 GB VRAM. Process: RUNNING (PID 3190).', type: 'trace' },
    { cmd: 'TRACE → Camera network: TRENDnet PoE (Z3) → Netgear (Z1) → Dell: ALL HEALTHY', type: 'trace' },
    { cmd: 'TRACE → Camera 2 exposure: auto-adjusted +1.4 EV. Frame delta: 12ms jitter.', type: 'trace' },
    { cmd: 'DIAGNOSIS → Servers healthy but Camera 2 exposure compensating for ambient light change. Confidence drop is environmental, not system.', type: 'diagnosis' },
  ],
  apera_memory: [
    { cmd: 'NERVOUS SYSTEM → Apera Server 1 inference latency: 340ms (baseline: 45ms). 7.5x slower.', type: 'fault' },
    { cmd: 'SERVER 1 → CPU: 98% (thrashing). RAM: 31.4/32 GB (98.1%). SWAP: 6.2 GB active.', type: 'fault' },
    { cmd: 'SERVER 1 → GPU: 7.8/8 GB VRAM (97.5%). Inference queue depth: 47 (normal: 1-3).', type: 'fault' },
    { cmd: 'SERVER 1 → Process uptime: 14d 6h. RSS growing ~200MB/day. Memory leak confirmed.', type: 'fault' },
    { cmd: 'SERVER 1 → Disk: 89/512 GB. /tmp/apera_cache: 41 GB (stale tensor caches not freed).', type: 'warn' },
    { cmd: 'SERVER 1 → Model: pick_v3.2.onnx. Last reload: 14 days ago. GC pressure: CRITICAL.', type: 'fault' },
    { cmd: 'SERVER 2 → CPU: 28%. RAM: 14.7/32 GB (46%). GPU: 4.2/8 GB VRAM. HEALTHY.', type: 'trace' },
    { cmd: 'TRACE → 120V AC plane: OK. Netgear switch: UP. Network healthy — this is a software resource issue.', type: 'trace' },
    { cmd: 'DIAGNOSIS → Server 1 memory leak. Process has been running 14 days without restart. RAM and GPU VRAM nearly exhausted, OS swapping to disk causing 7.5x inference slowdown. Restart Apera process to reclaim memory.', type: 'diagnosis' },
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
  apera_memory: { message: "Apera Server 1 critically slow — RAM 98%, VRAM 97%, inference 7.5x slower. Memory leak after 14 days uptime.", type: "error" },
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

// Per-server system metrics for VisionStatus component
export const SCENARIO_VISION_METRICS = {
  healthy: {
    server1: { process: "RUNNING", pid: 4821, uptime: "2d 4h", cpu: 32, ram: 16.8, ramMax: 32, gpu: 4.8, gpuMax: 8, disk: 47, diskMax: 512, inferenceMs: 44, model: "pick_v3.2.onnx", modelLoaded: "2d ago", temp: 52, queueDepth: 1 },
    server2: { process: "RUNNING", pid: 3190, uptime: "2d 4h", cpu: 28, ram: 14.7, ramMax: 32, gpu: 4.2, gpuMax: 8, disk: 38, diskMax: 512, inferenceMs: 41, model: "pick_v3.2.onnx", modelLoaded: "2d ago", temp: 48, queueDepth: 1 },
  },
  apera_crash: {
    server1: { process: "DEAD", pid: null, uptime: "—", cpu: 0, ram: 2.1, ramMax: 32, gpu: 0, gpuMax: 8, disk: 47, diskMax: 512, inferenceMs: null, model: "—", modelLoaded: "—", temp: 42, queueDepth: 0, exitCode: "SEGFAULT (signal 11)", lastLog: "CUDA out of memory" },
    server2: { process: "RUNNING", pid: 3190, uptime: "2d 4h", cpu: 28, ram: 14.7, ramMax: 32, gpu: 4.2, gpuMax: 8, disk: 38, diskMax: 512, inferenceMs: 41, model: "pick_v3.2.onnx", modelLoaded: "2d ago", temp: 48, queueDepth: 1 },
  },
  apera_drift: {
    server1: { process: "RUNNING", pid: 4821, uptime: "2d 4h", cpu: 34, ram: 18.2, ramMax: 32, gpu: 5.1, gpuMax: 8, disk: 49, diskMax: 512, inferenceMs: 89, model: "pick_v3.2.onnx", modelLoaded: "2d ago", temp: 54, queueDepth: 2 },
    server2: { process: "RUNNING", pid: 3190, uptime: "2d 4h", cpu: 28, ram: 14.7, ramMax: 32, gpu: 4.2, gpuMax: 8, disk: 38, diskMax: 512, inferenceMs: 43, model: "pick_v3.2.onnx", modelLoaded: "2d ago", temp: 48, queueDepth: 1 },
  },
  apera_memory: {
    server1: { process: "RUNNING", pid: 4821, uptime: "14d 6h", cpu: 98, ram: 31.4, ramMax: 32, gpu: 7.8, gpuMax: 8, disk: 89, diskMax: 512, inferenceMs: 340, model: "pick_v3.2.onnx", modelLoaded: "14d ago", temp: 71, queueDepth: 47, swap: 6.2, cacheSize: 41 },
    server2: { process: "RUNNING", pid: 3190, uptime: "14d 6h", cpu: 28, ram: 14.7, ramMax: 32, gpu: 4.2, gpuMax: 8, disk: 38, diskMax: 512, inferenceMs: 43, model: "pick_v3.2.onnx", modelLoaded: "14d ago", temp: 48, queueDepth: 1 },
  },
};

// Per-axis robot diagnostics for Robot Arm panel
export const SCENARIO_ROBOT_METRICS = {
  healthy: {
    axes: [
      { id: 1, name: "Base", temp: 41, torque: 18, status: "ok", position: 12.3 },
      { id: 2, name: "Shoulder", temp: 45, torque: 28, status: "ok", position: -45.7 },
      { id: 3, name: "Elbow", temp: 42, torque: 22, status: "ok", position: 88.1 },
      { id: 4, name: "Wrist 1", temp: 38, torque: 12, status: "ok", position: 0.5 },
      { id: 5, name: "Wrist 2", temp: 39, torque: 15, status: "ok", position: -22.4 },
      { id: 6, name: "Wrist 3", temp: 40, torque: 14, status: "ok", position: 178.9 },
    ],
    ethercat: { packetRate: 4000, errors: 0, uptime: "14d 6h" },
    totalCycles: 12847, cycleTime: 8.4, lastHome: "06:15", faultCode: null,
  },
  servo_fault: {
    axes: [
      { id: 1, name: "Base", temp: 43, torque: 18, status: "ok", position: 12.3 },
      { id: 2, name: "Shoulder", temp: 47, torque: 31, status: "ok", position: -45.7 },
      { id: 3, name: "Elbow", temp: 68, torque: 87, status: "fault", position: null, error: "Following error 0.47°", faultCode: "E4031" },
      { id: 4, name: "Wrist 1", temp: 39, torque: 0, status: "stopped", position: 0.5 },
      { id: 5, name: "Wrist 2", temp: 40, torque: 0, status: "stopped", position: -22.4 },
      { id: 6, name: "Wrist 3", temp: 41, torque: 0, status: "stopped", position: 178.9 },
    ],
    ethercat: { packetRate: 4000, errors: 0, uptime: "14d 6h" },
    totalCycles: 12847, cycleTime: null, lastHome: "06:15", faultCode: "E4031",
  },
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
    diagnosis: "Apera Server 1 (Front Dell, Zone 1): process DEAD. Last log entry: \"CUDA out of memory\" at 14:32:07. Exit code: SEGFAULT (signal 11). GPU VRAM was exhausted before crash. CPU temp: 42°C (normal). RAM: 2.1/32 GB (OS only — process released memory on death). Disk: 47/512 GB (healthy).",
    operatorAction: '"Open the cab, press the power button on the left Dell server for 3 seconds." On the 120V AC plane — the server itself is fine, the Apera process segfaulted after a CUDA OOM.',
    remoteFix: "SSH via Stride Linx VPN: `systemctl restart apera-vision`. Check /var/log/apera/crash.log for CUDA OOM root cause. If model too large for 8GB VRAM, switch to pick_v3.2_lite.onnx. If process restart fails, guide operator to power-cycle the Dell.",
    traceSteps: [
      { label: "120V AC plane (Generator → Inverter → Cab)", detail: "VOLTAGE OK", status: "ok" },
      { label: "Netgear switch port (Zone 1)", detail: "LINK UP", status: "ok" },
      { label: "TRENDnet PoE → Netgear trunk", detail: "CONNECTED", status: "ok" },
      { label: "Dell Server 1 hardware", detail: "CPU 42°C, PSU stable, fans normal", status: "ok" },
      { label: "Dell Server 1 RAM", detail: "2.1/32 GB (process dead, OS only)", status: "ok" },
      { label: "Dell Server 1 GPU", detail: "0/8 GB VRAM (released on crash)", status: "ok" },
      { label: "Apera process", detail: "DEAD — SEGFAULT (CUDA OOM)", status: "fault" },
    ],
  },
  servo_fault: {
    diagnosis: "Stäubli servo fault: Axis 3 (elbow) — following error 0.47° (threshold: 0.10°). Fault code: E4031. Torque spiked to 87% at failure. Motor temp: 68°C (limit: 85°C, not thermal). Axes 1,2,4,5,6 all nominal (temps 38-52°C, torques 12-34%). EtherCAT: 4000 pkt/s, 0 errors. Cycle #12,847 since last home at 06:15. Likely cause: unexpected payload shift or minor collision.",
    operatorAction: "Check the work area around Axis 3 (elbow joint) for obstructions or shifted payload. If clear, we can re-home remotely. If physical contact occurred, inspect the arm visually before clearing.",
    remoteFix: "Via EtherCAT: read fault register, clear E4031, send re-home command. Monitor Axis 3 torque on next cycle — if spike recurs, payload calibration needed. Schunk controller is on the EtherCAT bus — we can read every register from Louisville.",
    traceSteps: [
      { label: "24V DC plane (Rhino PSR → Schunk)", detail: "VOLTAGE OK", status: "ok" },
      { label: "EtherCAT bus (dedicated OT)", detail: "4000 pkt/s, 0 errors", status: "ok" },
      { label: "Schunk UXB 24V controller (Z3)", detail: "POWERED", status: "ok" },
      { label: "Axes 1,2,4,5,6 servos", detail: "NOMINAL (38-52°C, 12-34%)", status: "ok" },
      { label: "Axis 3 servo (elbow)", detail: "FOLLOWING ERROR 0.47° — E4031", status: "fault" },
      { label: "Axis 3 torque", detail: "87% SPIKE (normal: 20-35%)", status: "fault" },
      { label: "Axis 3 motor temp", detail: "68°C (limit 85°C — not thermal)", status: "warn" },
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
    diagnosis: "Apera pick confidence: 62% (normal: 95%). Server 1: CPU 34%, RAM 18.2/32 GB, GPU 5.1/8 GB VRAM — resources healthy. Inference latency: 89ms (baseline 45ms, slightly elevated). Camera 2 auto-exposure adjusted +1.4 EV. Root cause: ambient lighting change on site, not system degradation.",
    operatorAction: "Reposition the work light that the site crew moved. Cameras adjusted exposure but angle degraded pick confidence.",
    remoteFix: "Pull up the camera feed through the Stride Linx VPN and adjust Apera vision parameters remotely. If confidence doesn't recover above 90%, retrain the pick model with new lighting conditions.",
    traceSteps: [
      { label: "TRENDnet PoE switch (Z3, cameras)", detail: "ALL PORTS UP", status: "ok" },
      { label: "Netgear trunk (Z1, IT backbone)", detail: "LINK HEALTHY", status: "ok" },
      { label: "Dell Server 1 resources", detail: "CPU 34%, RAM 57%, GPU 64%", status: "ok" },
      { label: "Dell Server 2 resources", detail: "CPU 28%, RAM 46%, GPU 53%", status: "ok" },
      { label: "Inference latency", detail: "89ms (baseline 45ms, +98%)", status: "warn" },
      { label: "Apera pick confidence", detail: "62% (↓33%)", status: "fault" },
      { label: "Camera 2 auto-exposure", detail: "+1.4 EV COMPENSATING", status: "warn" },
      { label: "Root cause", detail: "AMBIENT LIGHT CHANGE", status: "warn" },
    ],
  },
  apera_memory: {
    diagnosis: "Apera Server 1 critically degraded. RAM: 31.4/32 GB (98.1%), actively swapping 6.2 GB to disk. GPU VRAM: 7.8/8 GB (97.5%). Inference latency: 340ms (baseline 45ms — 7.5x slower). Process uptime: 14 days 6 hours without restart. RSS growing ~200MB/day — confirmed memory leak. /tmp/apera_cache has 41 GB of stale tensor caches never freed. Server 2 is healthy (RAM 46%, GPU 53%). Network and power are fine — this is purely a software resource exhaustion issue.",
    operatorAction: "No physical action needed. This is a software issue. If remote access is down, operator can restart by pressing the power button on the left Dell server for 3 seconds, wait 30 seconds, press again.",
    remoteFix: "SSH via Stride Linx VPN: `systemctl restart apera-vision && rm -rf /tmp/apera_cache/*`. This will reclaim ~35 GB disk and reset RAM/VRAM to baseline. Long-term: file bug report on Apera's tensor cache — it never invalidates stale entries. Consider a weekly cron restart as a stopgap.",
    traceSteps: [
      { label: "120V AC plane (power)", detail: "VOLTAGE OK", status: "ok" },
      { label: "Netgear switch (network)", detail: "LINK UP", status: "ok" },
      { label: "Dell Server 1 CPU", detail: "98% (THRASHING — OS swapping)", status: "fault" },
      { label: "Dell Server 1 RAM", detail: "31.4/32 GB (98.1%) — SWAP 6.2 GB", status: "fault" },
      { label: "Dell Server 1 GPU VRAM", detail: "7.8/8 GB (97.5%) — NEAR LIMIT", status: "fault" },
      { label: "Dell Server 1 disk", detail: "/tmp/apera_cache: 41 GB stale", status: "warn" },
      { label: "Inference latency", detail: "340ms (baseline 45ms — 7.5x)", status: "fault" },
      { label: "Process uptime", detail: "14d 6h — RSS +200MB/day leak", status: "fault" },
      { label: "Dell Server 2", detail: "HEALTHY (RAM 46%, GPU 53%)", status: "ok" },
    ],
  },
};
