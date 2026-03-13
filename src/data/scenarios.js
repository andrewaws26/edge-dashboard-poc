import { C } from '../constants';

// Scenario button definitions for the UI
export const SCENARIO_BUTTONS = [
  { id: "healthy", label: "All Healthy", e: "\u2705" },
  { id: "wire_fault", label: "Broken Wire (Pin 14)", e: "\uD83D\uDD0C" },
  { id: "apera_crash", label: "Apera Server Crash", e: "\uD83D\uDC41" },
  { id: "servo_fault", label: "St\u00E4ubli Servo Fault", e: "\uD83E\uDDE0" },
  { id: "router_freeze", label: "Router Freeze", e: "\uD83D\uDCE1" },
  { id: "gripper_stuck", label: "Gripper Won't Release", e: "\uD83E\uDDF2" },
  { id: "apera_drift", label: "Vision Accuracy Drop", e: "\uD83D\uDCC9" },
];

// Log entries generated when a scenario is activated
export const SCENARIO_LOGS = {
  wire_fault: [
    { cmd: 'TRACE \u2192 1. Fuji button (Saginaw enclosure): PRESSED', type: 'trace' },
    { cmd: 'TRACE \u2192 2. M12 cable to Murrelektronik bulkhead: OK', type: 'trace' },
    { cmd: 'TRACE \u2192 3. 25-pin trunk (passenger side): Pin 14 \u2014 OPEN CIRCUIT', type: 'fault' },
    { cmd: 'TRACE \u2192 4. ZipLink breakout (Cab): No signal received', type: 'fault' },
    { cmd: 'TRACE \u2192 5. FX5UC PLC: doBelt["FWD"] = TRUE but no actuation', type: 'fault' },
    { cmd: 'DIAGNOSIS \u2192 Fault isolated to Pin 14 in 25-pin trunk cable, passenger side. Physical break between Murrelektronik bulkhead and ZipLink termination.', type: 'diagnosis' },
  ],
  apera_crash: [
    { cmd: 'NERVOUS SYSTEM \u2192 Apera Server 1 (Front Dell, Zone 1): last inference 12 min ago.', type: 'fault' },
    { cmd: 'TRACE \u2192 AC power plane (120V from Zone 2 inverter): OK', type: 'trace' },
    { cmd: 'TRACE \u2192 Netgear switch port: LINK UP. Network path: TRENDnet PoE \u2192 Netgear \u2192 Dell Server 1.', type: 'trace' },
    { cmd: 'DIAGNOSIS \u2192 CPU temp normal. Network connected. Apera process not responding \u2014 software crash, not hardware.', type: 'diagnosis' },
  ],
  servo_fault: [
    { cmd: 'NERVOUS SYSTEM \u2192 St\u00E4ubli servo fault: Axis 3 following error. Arm stopped.', type: 'fault' },
    { cmd: 'TRACE \u2192 EtherCAT link (OT domain, dedicated bus): HEALTHY', type: 'trace' },
    { cmd: 'TRACE \u2192 Schunk UXB 24V controller (Zone 3 control box): POWERED, 24V DC from Rhino PSR OK', type: 'trace' },
    { cmd: 'DIAGNOSIS \u2192 Recoverable software fault on Axis 3. EtherCAT deterministic link intact. Not mechanical failure.', type: 'diagnosis' },
  ],
  router_freeze: [
    { cmd: 'NERVOUS SYSTEM \u2192 Stride Linx VPN router (Zone 1): unresponsive. 6 pings failed.', type: 'fault' },
    { cmd: 'NERVOUS SYSTEM \u2192 Pi cellular backhaul independent of Stride Linx. Twin still reporting.', type: 'info' },
    { cmd: 'TRACE \u2192 Netgear switch: UP. Dell servers: reachable. EtherCAT: healthy. Telemetry network only.', type: 'trace' },
  ],
  gripper_stuck: [
    { cmd: 'NERVOUS SYSTEM \u2192 doGripper_EGM["MAG"] = OFF but part sensor reads PRESENT.', type: 'fault' },
    { cmd: 'TRACE \u2192 Schunk UXB 24V controller (Zone 3 control box): HEALTHY', type: 'trace' },
    { cmd: 'TRACE \u2192 24V DC plane (Rhino PSR \u2192 Schunk): Voltage nominal', type: 'trace' },
    { cmd: 'DIAGNOSIS \u2192 Magnetic gripper residual magnetism. Not a software or electrical fault. Operator clears part manually.', type: 'diagnosis' },
  ],
  apera_drift: [
    { cmd: 'NERVOUS SYSTEM \u2192 Apera pick confidence: 62% (baseline 95%). Dropping over last shift.', type: 'warn' },
    { cmd: 'TRACE \u2192 Vision network: TRENDnet PoE (Zone 3) \u2192 Netgear (Zone 1) \u2192 Dell servers: ALL HEALTHY', type: 'trace' },
    { cmd: 'TRACE \u2192 Camera 2 exposure auto-adjusted. Ambient light change detected on site.', type: 'trace' },
    { cmd: 'DIAGNOSIS \u2192 IT domain healthy. Environmental change \u2014 site crew likely moved a light.', type: 'diagnosis' },
  ],
};

// Toast messages shown when a scenario is activated
export const SCENARIO_TOASTS = {
  wire_fault: { message: "Twin detected: Pin 14 open circuit \u2014 traced from Fuji switch through 25-pin trunk to ZipLink", type: "error" },
  apera_crash: { message: "Twin detected: Apera Server 1 process not responding \u2014 IT domain, Zone 1", type: "error" },
  servo_fault: { message: "Twin detected: St\u00E4ubli servo fault on Axis 3 \u2014 OT domain, EtherCAT healthy", type: "error" },
  router_freeze: { message: "Twin detected: Stride Linx frozen \u2014 telemetry VPN down, Pi reporting via cellular", type: "error" },
  gripper_stuck: { message: "Twin detected: Gripper won't release \u2014 Schunk UXB healthy, residual magnetism", type: "warning" },
  apera_drift: { message: "Twin detected: Vision accuracy degrading \u2014 cameras healthy, lighting changed on site", type: "warning" },
};

// Diagnosis details shown in the DiagnosisPanel for each fault scenario
export const DIAGNOSIS_MAP = {
  wire_fault: {
    diagnosis: 'doBelt["FWD"] = TRUE. Belt motion: none. Fault isolated to Pin 14 \u2014 open circuit in 25-pin trunk cable (passenger side).',
    operatorAction: '"Tighten Pin 14 on the passenger-side bulkhead connector where the 25-pin trunk meets the ZipLink breakout in the cab." Fixed in 5 minutes.',
    remoteFix: null,
    traceSteps: [
      { label: "Fuji button in Saginaw enclosure (Zone 3)", detail: "PRESSED", status: "ok" },
      { label: "M12 cable \u2192 Murrelektronik bulkhead", detail: "CONTINUITY", status: "ok" },
      { label: "25-pin trunk cable (passenger side run)", detail: "PIN 14 OPEN", status: "fault" },
      { label: "ZipLink breakout board (Zone 1 cab)", detail: "NO SIGNAL", status: "fault" },
      { label: "FX5UC PLC terminal input", detail: 'doBelt["FWD"]=TRUE, no actuation', status: "fault" },
      { label: "Motor contactor (24V DC)", detail: "NOT ENERGIZED", status: "fault" },
    ],
  },
  apera_crash: {
    diagnosis: "Apera Server 1 (Front Dell, Zone 1): last inference 12 min ago. CPU temp: normal. Network: connected via Netgear trunk. Status: process not responding.",
    operatorAction: '"Open the cab, press the power button on the left Dell server for 3 seconds." It\'s on the 120V AC plane \u2014 the server itself is fine, just the Apera process crashed.',
    remoteFix: "Restart the Apera service remotely via Stride Linx VPN tunnel. If process restart fails, guide operator to power-cycle the Dell.",
    traceSteps: [
      { label: "120V AC plane (Generator \u2192 Inverter \u2192 Cab)", detail: "VOLTAGE OK", status: "ok" },
      { label: "Netgear switch port (Zone 1)", detail: "LINK UP", status: "ok" },
      { label: "TRENDnet PoE \u2192 Netgear trunk (camera path)", detail: "CONNECTED", status: "ok" },
      { label: "Dell Server 1 hardware", detail: "CPU NORMAL, POWERED", status: "ok" },
      { label: "Apera vision process", detail: "NOT RESPONDING", status: "fault" },
    ],
  },
  servo_fault: {
    diagnosis: "St\u00E4ubli servo fault: Axis 3 \u2014 following error. EtherCAT bus (dedicated OT line): healthy. Schunk UXB 24V controller (Zone 3): powered.",
    operatorAction: "If mechanical: operator describes the issue from the Saginaw HMI panel or swaps the part with our guidance. We read the exact fault code from the Schunk controller.",
    remoteFix: "Clear the recoverable fault remotely and re-home the arm. Schunk controller is on the EtherCAT bus \u2014 we can read every register from Louisville.",
    traceSteps: [
      { label: "24V DC plane (Rhino PSR \u2192 Schunk)", detail: "VOLTAGE OK", status: "ok" },
      { label: "EtherCAT bus (dedicated OT, hard real-time)", detail: "LINK HEALTHY", status: "ok" },
      { label: "Schunk UXB 24V controller (Zone 3)", detail: "POWERED", status: "ok" },
      { label: "St\u00E4ubli Axis 3 servo", detail: "FOLLOWING ERROR", status: "fault" },
      { label: "Fault classification", detail: "RECOVERABLE (SW)", status: "ok" },
    ],
  },
  router_freeze: {
    diagnosis: "Stride Linx VPN router (Zone 1): unresponsive. Twin still alive on Pi cellular backhaul. Vision/IT and Motion/OT networks unaffected \u2014 only telemetry is down.",
    operatorAction: '"Flip the labeled switch on the IT rack in the cab to reboot the Stride Linx." Back online in 90 seconds. All other systems still running.',
    remoteFix: "Power-cycle the Stride Linx via Pi GPIO relay through the cellular backhaul. The Pi's connection is independent of the Stride Linx.",
    traceSteps: [
      { label: "Vision/IT network (Netgear \u2192 Dell servers)", detail: "HEALTHY", status: "ok" },
      { label: "Motion/OT network (EtherCAT bus)", detail: "HEALTHY", status: "ok" },
      { label: "Stride Linx VPN (telemetry network)", detail: "UNRESPONSIVE", status: "fault" },
      { label: "Pi cellular backhaul (independent)", detail: "CONNECTED", status: "ok" },
    ],
  },
  gripper_stuck: {
    diagnosis: 'doGripper_EGM["MAG"] = OFF. Part sensor: PRESENT. Schunk UXB 24V controller (Zone 3): healthy. 24V DC plane nominal. Likely residual magnetism.',
    operatorAction: "Clear the part manually from the gripper. The system is healthy \u2014 this is residual magnetism in the magnetic gripper, not a software or electrical fault.",
    remoteFix: null,
    traceSteps: [
      { label: 'FX5UC PLC output: doGripper_EGM["MAG"]', detail: "OFF (CORRECT)", status: "ok" },
      { label: "24V DC plane (Rhino PSR \u2192 Schunk UXB)", detail: "VOLTAGE OK", status: "ok" },
      { label: "Schunk UXB 24V controller (Zone 3)", detail: "HEALTHY", status: "ok" },
      { label: "Gripper magnet", detail: "DE-ENERGIZED", status: "ok" },
      { label: "Part presence sensor", detail: "STILL DETECTED", status: "fault" },
      { label: "Root cause", detail: "RESIDUAL MAGNETISM", status: "warn" },
    ],
  },
  apera_drift: {
    diagnosis: "Apera pick confidence: 62% (normal: 95%). Camera 2 exposure auto-adjusted. Vision network (TRENDnet PoE \u2192 Netgear \u2192 Dell): all healthy. Environmental lighting change.",
    operatorAction: "Reposition the work light that the site crew moved. The cameras adjusted exposure automatically but the angle changed enough to degrade pick confidence.",
    remoteFix: "Pull up the camera feed through the Stride Linx VPN and adjust Apera vision parameters from our laptops. Or guide operator to reposition the light. Truck never stops.",
    traceSteps: [
      { label: "TRENDnet PoE switch (Zone 3, cameras)", detail: "ALL PORTS UP", status: "ok" },
      { label: "Netgear trunk (Zone 1, IT backbone)", detail: "LINK HEALTHY", status: "ok" },
      { label: "Dell Apera servers (Zone 1)", detail: "RUNNING", status: "ok" },
      { label: "Apera pick confidence", detail: "62% (\u221933%)", status: "fault" },
      { label: "Camera 2 auto-exposure", detail: "COMPENSATING", status: "warn" },
      { label: "Root cause", detail: "AMBIENT LIGHT CHANGE", status: "warn" },
    ],
  },
};
