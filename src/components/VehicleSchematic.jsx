import { useState } from 'react';
import { C } from '../constants';

const ZONES = {
  z1: {
    label: "Z1 — Front Cab",
    sublabel: "Control & IT Stack",
    x: 30, y: 55, w: 230, h: 200,
    devices: [
      { id: "fx5uc", label: "FX5UC PLC", domain: "OT", x: 40, y: 75, w: 100, h: 28 },
      { id: "click", label: "Click PLC", domain: "OT", x: 150, y: 75, w: 100, h: 28 },
      { id: "dell1", label: "Dell Apera S1", domain: "IT", x: 40, y: 113, w: 100, h: 28 },
      { id: "dell2", label: "Dell Apera S2", domain: "IT", x: 150, y: 113, w: 100, h: 28 },
      { id: "netgear", label: "Netgear Switch", domain: "IT", x: 40, y: 151, w: 100, h: 28 },
      { id: "stride", label: "Stride Linx VPN", domain: "IT", x: 150, y: 151, w: 100, h: 28 },
      { id: "rhino", label: "Rhino PSR 24V", domain: "OT", x: 40, y: 189, w: 100, h: 28 },
      { id: "ziplink", label: "ZipLink Breakout", domain: "OT", x: 150, y: 189, w: 100, h: 28 },
      { id: "pi", label: "Raspberry Pi", domain: "IT", x: 40, y: 227, w: 100, h: 28 },
    ],
  },
  z2: {
    label: "Z2 — Middle",
    sublabel: "Power Distribution",
    x: 30, y: 280, w: 230, h: 110,
    devices: [
      { id: "gen", label: "Generator", domain: "OT", x: 40, y: 300, w: 100, h: 28 },
      { id: "battery", label: "Battery Bank", domain: "OT", x: 150, y: 300, w: 100, h: 28 },
      { id: "inverter", label: "3000W Inverter", domain: "OT", x: 40, y: 338, w: 100, h: 28 },
    ],
  },
  z3: {
    label: "Z3 — Rear",
    sublabel: "Robot & Actuators",
    x: 30, y: 415, w: 230, h: 220,
    devices: [
      { id: "staubli", label: "Stäubli Robot", domain: "OT", x: 40, y: 435, w: 100, h: 28 },
      { id: "schunk", label: "Schunk UXB", domain: "OT", x: 150, y: 435, w: 100, h: 28 },
      { id: "conveyor", label: "Conveyor Belt", domain: "OT", x: 40, y: 473, w: 210, h: 28 },
      { id: "trendnet", label: "TRENDnet PoE", domain: "IT", x: 40, y: 511, w: 100, h: 28 },
      { id: "fuji", label: "Fuji HMI", domain: "OT", x: 150, y: 511, w: 100, h: 28 },
      { id: "murr", label: "Murrelektronik", domain: "OT", x: 40, y: 549, w: 100, h: 28 },
      { id: "cameras", label: "PoE Cameras", domain: "IT", x: 150, y: 549, w: 100, h: 28 },
      { id: "saginaw", label: "Saginaw Panel", domain: "OT", x: 40, y: 587, w: 100, h: 28 },
    ],
  },
};

// Wire routes from Z3 bulkhead to Z1 PLC (passenger side)
const TRUNK_PATH = "M 270,560 C 290,560 295,540 295,500 L 295,200 C 295,160 290,140 270,130";

const getDeviceStatus = (deviceId, scenario) => {
  const faults = {
    estop: { fx5uc: "error", click: "error", staubli: "error", schunk: "error" },
    wire_fault: { murr: "error", conveyor: "error", ziplink: "error" },
    apera_crash: { dell1: "error", netgear: "warn" },
    apera_memory: { dell1: "warn" },
    apera_drift: { cameras: "warn" },
    servo_fault: { staubli: "error", schunk: "warn" },
    router_freeze: { stride: "error" },
    gripper_stuck: { schunk: "warn" },
    maintenance: { fx5uc: "warn", staubli: "warn", conveyor: "warn" },
    state_conflict: { fuji: "error", fx5uc: "error" },
  };
  return faults[scenario]?.[deviceId] || "ok";
};

const DeviceBox = ({ device, status, isSelectedZone, onHover, onLeave, hovered }) => {
  const domainColor = device.domain === "IT" ? C.cyan : C.orange;
  const statusColor = status === "error" ? C.red : status === "warn" ? C.amber : C.green;
  const isFault = status === "error" || status === "warn";
  const opacity = isSelectedZone ? 1 : 0.5;

  return (
    <g
      onMouseEnter={() => onHover(device)}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={device.x} y={device.y} width={device.w} height={device.h}
        rx={4} ry={4}
        fill={isFault ? (status === "error" ? C.redDim : C.amberDim) : C.bg}
        stroke={isFault ? statusColor : domainColor}
        strokeWidth={hovered ? 2 : 1}
        opacity={opacity}
        strokeOpacity={isFault ? 0.8 : 0.4}
      >
        {isFault && (
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur={status === "error" ? "1s" : "2.5s"} repeatCount="indefinite" />
        )}
      </rect>
      {/* Status indicator dot */}
      <circle
        cx={device.x + 10} cy={device.y + device.h / 2} r={3.5}
        fill={statusColor}
        opacity={opacity}
      >
        <animate attributeName="opacity" values={`${opacity};${opacity * 0.4};${opacity}`} dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Device label */}
      <text
        x={device.x + 20} y={device.y + device.h / 2 + 1}
        fill={isFault ? statusColor : C.text}
        fontSize={9} fontWeight={600} dominantBaseline="middle"
        opacity={opacity}
        fontFamily="'Segoe UI', -apple-system, sans-serif"
      >{device.label}</text>
      {/* Domain tag */}
      <rect
        x={device.x + device.w - 24} y={device.y + device.h / 2 - 7}
        width={18} height={14} rx={2} ry={2}
        fill={domainColor} fillOpacity={0.15}
        stroke={domainColor} strokeOpacity={0.3} strokeWidth={0.5}
        opacity={opacity}
      />
      <text
        x={device.x + device.w - 15} y={device.y + device.h / 2 + 1}
        fill={domainColor} fontSize={7} fontWeight={700}
        textAnchor="middle" dominantBaseline="middle"
        opacity={opacity}
        fontFamily="'JetBrains Mono', 'Consolas', monospace"
      >{device.domain}</text>
    </g>
  );
};

export const VehicleSchematic = ({ scenario }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [hoveredDevice, setHoveredDevice] = useState(null);

  const isEstop = scenario === "estop";
  const isConflict = scenario === "state_conflict";
  const vehicleOutlineColor = isEstop || isConflict ? C.red : C.dim;

  return (
    <div style={{
      backgroundColor: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "16px 20px", marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🚛</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: C.dim }}>
            RAIV #3 — Top-Down Vehicle Schematic
          </span>
          <span style={{ fontSize: 9, color: C.muted }}>&mdash; Click a zone to focus</span>
        </div>
        {selectedZone && (
          <button
            onClick={() => setSelectedZone(null)}
            style={{
              background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.muted, fontSize: 10, cursor: "pointer", padding: "3px 10px",
              fontWeight: 600,
            }}
          >Show All</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* SVG Vehicle */}
        <svg viewBox="0 0 320 670" width="320" height="670" style={{ flexShrink: 0 }}>
          <defs>
            {/* Glow filter for faults */}
            <filter id="fault-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Animated dash for trunk line */}
            <linearGradient id="trunk-grad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={C.orange} stopOpacity="0.8" />
              <stop offset="50%" stopColor={C.purple} stopOpacity="0.6" />
              <stop offset="100%" stopColor={C.cyan} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Vehicle body outline */}
          <rect
            x={15} y={30} width={260} height={620} rx={20} ry={20}
            fill="none" stroke={vehicleOutlineColor} strokeWidth={2} strokeOpacity={0.3}
          >
            {(isEstop || isConflict) && (
              <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
            )}
          </rect>

          {/* Cab cutout (front) */}
          <path
            d="M 35,30 L 35,42 Q 35,50 43,50 L 247,50 Q 255,50 255,42 L 255,30"
            fill="none" stroke={vehicleOutlineColor} strokeWidth={1.5} strokeOpacity={0.2}
          />
          {/* Windshield */}
          <rect x={50} y={33} width={190} height={12} rx={3} fill={C.cyan} fillOpacity={0.06} stroke={C.cyan} strokeWidth={0.5} strokeOpacity={0.2} />
          <text x={145} y={42} fill={C.cyan} fontSize={7} fontWeight={600} textAnchor="middle" dominantBaseline="middle" opacity={0.4}
            fontFamily="'Segoe UI', -apple-system, sans-serif"
          >FRONT</text>

          {/* Rear bumper */}
          <rect x={50} y={637} width={190} height={8} rx={3} fill={C.muted} fillOpacity={0.06} stroke={C.muted} strokeWidth={0.5} strokeOpacity={0.2} />
          <text x={145} y={642} fill={C.muted} fontSize={7} fontWeight={600} textAnchor="middle" dominantBaseline="middle" opacity={0.4}
            fontFamily="'Segoe UI', -apple-system, sans-serif"
          >REAR</text>

          {/* Wheels */}
          {[{x: 10, y: 80}, {x: 265, y: 80}, {x: 10, y: 230}, {x: 265, y: 230},
            {x: 10, y: 520}, {x: 265, y: 520}, {x: 10, y: 600}, {x: 265, y: 600}].map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width={16} height={36} rx={4}
              fill={C.muted} fillOpacity={0.15} stroke={C.muted} strokeWidth={1} strokeOpacity={0.2}
            />
          ))}

          {/* Side labels */}
          <text x={5} y={380} fill={C.muted} fontSize={8} fontWeight={600} opacity={0.3}
            transform="rotate(-90, 5, 380)" textAnchor="middle"
            fontFamily="'Segoe UI', -apple-system, sans-serif"
          >DRIVER SIDE</text>
          <text x={310} y={380} fill={C.muted} fontSize={8} fontWeight={600} opacity={0.3}
            transform="rotate(90, 310, 380)" textAnchor="middle"
            fontFamily="'Segoe UI', -apple-system, sans-serif"
          >PASSENGER SIDE</text>

          {/* 25-Pin Trunk cable (passenger side) */}
          <path
            d={TRUNK_PATH} fill="none"
            stroke="url(#trunk-grad)" strokeWidth={3} strokeLinecap="round"
            strokeDasharray="8 4" opacity={0.6}
          >
            <animate attributeName="stroke-dashoffset" values="0;-24" dur="2s" repeatCount="indefinite" />
          </path>
          <text x={302} y={360} fill={C.purple} fontSize={7} fontWeight={700} opacity={0.5}
            transform="rotate(90, 302, 360)" textAnchor="middle"
            fontFamily="'JetBrains Mono', 'Consolas', monospace"
          >25-PIN TRUNK</text>

          {/* Zone backgrounds + labels */}
          {Object.entries(ZONES).map(([zoneId, zone]) => {
            const isSelected = !selectedZone || selectedZone === zoneId;
            const zoneColor = zoneId === "z1" ? C.cyan : zoneId === "z2" ? C.amber : C.orange;
            return (
              <g key={zoneId}
                onClick={() => setSelectedZone(selectedZone === zoneId ? null : zoneId)}
                style={{ cursor: "pointer" }}
              >
                {/* Zone background */}
                <rect
                  x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                  rx={8} ry={8}
                  fill={zoneColor} fillOpacity={isSelected ? 0.06 : 0.02}
                  stroke={zoneColor} strokeWidth={isSelected ? 1.5 : 1}
                  strokeOpacity={isSelected ? 0.4 : 0.15}
                  strokeDasharray={isSelected ? "none" : "4 2"}
                />
                {/* Zone label */}
                <text
                  x={zone.x + zone.w / 2} y={zone.y + 14}
                  fill={zoneColor} fontSize={10} fontWeight={800}
                  textAnchor="middle" dominantBaseline="middle"
                  opacity={isSelected ? 0.8 : 0.4}
                  letterSpacing={1.5}
                  fontFamily="'Segoe UI', -apple-system, sans-serif"
                >{zone.label}</text>

                {/* Devices */}
                {zone.devices.map(device => (
                  <DeviceBox
                    key={device.id}
                    device={device}
                    status={getDeviceStatus(device.id, scenario)}
                    isSelectedZone={isSelected}
                    onHover={setHoveredDevice}
                    onLeave={() => setHoveredDevice(null)}
                    hovered={hoveredDevice?.id === device.id}
                  />
                ))}
              </g>
            );
          })}

          {/* Connection lines between zones */}
          {/* Z1 → Z2 power bus */}
          <line x1={145} y1={255} x2={145} y2={280} stroke={C.amber} strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 2">
            <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
          </line>
          {/* Z2 → Z3 power bus */}
          <line x1={145} y1={390} x2={145} y2={415} stroke={C.amber} strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 2">
            <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Detail panel (right side) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Hovered device detail */}
          {hoveredDevice && (
            <div style={{
              padding: "12px 14px", borderRadius: 8,
              backgroundColor: C.bg, border: `1px solid ${C.border}`,
              animation: "slideIn 0.15s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: getDeviceStatus(hoveredDevice.id, scenario) === "error" ? C.red
                    : getDeviceStatus(hoveredDevice.id, scenario) === "warn" ? C.amber : C.green,
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{hoveredDevice.label}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                  backgroundColor: hoveredDevice.domain === "IT" ? C.cyanDim : C.orangeDim,
                  color: hoveredDevice.domain === "IT" ? C.cyan : C.orange,
                  border: `1px solid ${hoveredDevice.domain === "IT" ? C.cyan : C.orange}25`,
                }}>{hoveredDevice.domain}</span>
              </div>
              <DeviceDetail deviceId={hoveredDevice.id} scenario={scenario} />
            </div>
          )}

          {/* Zone legend */}
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            backgroundColor: C.bg, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Zones</div>
            {Object.entries(ZONES).map(([zoneId, zone]) => {
              const zoneColor = zoneId === "z1" ? C.cyan : zoneId === "z2" ? C.amber : C.orange;
              const isActive = !selectedZone || selectedZone === zoneId;
              return (
                <div key={zoneId}
                  onClick={() => setSelectedZone(selectedZone === zoneId ? null : zoneId)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px", borderRadius: 6, cursor: "pointer",
                    backgroundColor: isActive ? `${zoneColor}10` : "transparent",
                    border: `1px solid ${isActive ? zoneColor + "30" : "transparent"}`,
                    marginBottom: 4, transition: "all 0.2s",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: zoneColor, opacity: isActive ? 1 : 0.3 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? C.text : C.dim }}>{zone.label}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{zone.sublabel} &mdash; {zone.devices.length} devices</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            backgroundColor: C.bg, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Legend</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { color: C.cyan, label: "IT Domain", desc: "Ethernet, PoE, vision" },
                { color: C.orange, label: "OT Domain", desc: "EtherCAT, PLC, 24V DC" },
                { color: C.purple, label: "25-Pin Trunk", desc: "Passenger side cable run" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 3, borderRadius: 1, backgroundColor: item.color, opacity: 0.7 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.dim }}>{item.label}</span>
                  <span style={{ fontSize: 9, color: C.muted }}>{item.desc}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 2 }}>
                {[
                  { color: C.green, label: "Healthy" },
                  { color: C.amber, label: "Warning" },
                  { color: C.red, label: "Fault" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
                    <span style={{ fontSize: 10, color: C.dim }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail info for each device when hovered
const DEVICE_INFO = {
  fx5uc: { desc: "Mitsubishi FX5UC PLC — primary OT controller", details: ["Scan: ~4.2ms", "24V DC powered via Rhino PSR", "Controls all digital I/O"] },
  click: { desc: "Click PLC — auxiliary safety controller", details: ["Redundant safety monitoring", "Independent of FX5UC"] },
  dell1: { desc: "Dell Apera Server 1 (Front-facing)", details: ["RTX GPU for inference", "Runs Apera vision process", "Connected via Netgear switch"] },
  dell2: { desc: "Dell Apera Server 2 (Rear-facing)", details: ["Secondary vision processing", "Backup inference pipeline"] },
  netgear: { desc: "Netgear Ethernet Switch", details: ["IT backbone for Z1 cab", "Connects Dell servers + cameras"] },
  stride: { desc: "Stride Linx VPN Router", details: ["Remote access gateway", "Cellular WAN uplink", "VPN tunnel to HQ"] },
  rhino: { desc: "Rhino PSR 24-480 Power Supply", details: ["120V AC → 24V DC conversion", "Powers all OT devices"] },
  ziplink: { desc: "ZipLink Breakout Terminal", details: ["25-pin trunk termination", "Screw terminals to PLC I/O"] },
  pi: { desc: "Raspberry Pi — Nervous System", details: ["Independent cellular backhaul", "Dashboard telemetry relay", "Separate from Stride Linx"] },
  gen: { desc: "Onboard Generator", details: ["Primary 120V AC source", "Powers inverter + IT stack"] },
  battery: { desc: "Battery Bank", details: ["Backup power reserve", "UPS for critical systems"] },
  inverter: { desc: "3000W Power Inverter", details: ["Generator → clean 120V AC", "Feeds Dell servers, Netgear, monitors"] },
  staubli: { desc: "Stäubli 6-axis Robot Arm", details: ["Sub-ms kinematics on EtherCAT", "PLC sends permissive only", "6 axes: J1-J6"] },
  schunk: { desc: "Schunk UXB Gripper Controller", details: ["24V DC powered", "MAG/DEMAG control", "EGM magnetic end-effector"] },
  conveyor: { desc: "Conveyor Belt System", details: ["FWD/REV via PLC outputs", "Part-present optical sensor", "Belt speed ~92%"] },
  trendnet: { desc: "TRENDnet PoE Switch (Z3)", details: ["Powers PoE cameras", "Links to Netgear via trunk"] },
  fuji: { desc: "Fuji HMI Buttons (Saginaw Panel)", details: ["Physical mode selection", "Start / Maintenance / E-Stop", "Hardwired to PLC via trunk"] },
  murr: { desc: "Murrelektronik M12 Bulkhead", details: ["Z3 field wiring junction", "M12 → 25-pin trunk adapter", "Passenger side mount"] },
  cameras: { desc: "PoE Cameras (2x)", details: ["Vision input for Apera", "Powered by TRENDnet PoE", "Streaming to Dell servers"] },
  saginaw: { desc: "Saginaw Enclosure Panel", details: ["Houses Fuji buttons", "E-Stop mushroom switch", "Mode selection switches"] },
};

const DeviceDetail = ({ deviceId, scenario }) => {
  const info = DEVICE_INFO[deviceId];
  if (!info) return null;
  const status = getDeviceStatus(deviceId, scenario);
  const statusLabel = status === "error" ? "FAULT" : status === "warn" ? "WARNING" : "NOMINAL";
  const statusColor = status === "error" ? C.red : status === "warn" ? C.amber : C.green;

  return (
    <div>
      <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>{info.desc}</div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
        backgroundColor: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}25`,
        marginBottom: 6,
      }}>{statusLabel}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {info.details.map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: C.dim, flexShrink: 0 }} />
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};
