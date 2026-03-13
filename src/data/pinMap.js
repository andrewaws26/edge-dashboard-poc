// Authoritative 25-pin trunk line I/O data map
// Source: Physical wiring diagram + PLC variable mapping
// Route: Fuji Button (Z3) → M12 → Murrelektronik → 25-Pin Trunk → ZipLink (Z1) → FX5UC PLC

export const PIN_MAP = [
  { pin: 1, type: "Digital Out", variable: 'doServo["Power_ON"]', description: "Servo/Power ON Signal", wireColor: "Blue", wireColorHex: "#3b82f6", connector: "Female 8 Pin", group: "servo" },
  { pin: 2, type: "Digital Out", variable: 'doServo["Disable"]', description: "Servo Disable/OFF Signal", wireColor: "Blue/Red", wireColorHex: "#6366f1", connector: "Female 8 Pin", group: "servo" },
  { pin: 3, type: "Safety Input", variable: 'diSafteyStop', description: "Hardwired Emergency Stop Loop (NC)", wireColor: "Blue/White", wireColorHex: "#818cf8", connector: "Male 8 Pin", expectedActiveState: true, group: "safety" },
  { pin: 4, type: "Digital In", variable: 'diOperation["Start"]', description: "Operation mode trigger (NO)", wireColor: "Blue/Black", wireColorHex: "#4f46e5", connector: "Male 8 Pin", group: "mode" },
  { pin: 5, type: "Digital In", variable: 'diMaintenance["Mode"]', description: "Maintenance mode toggle (NO)", wireColor: "Red", wireColorHex: "#ef4444", connector: "Female 12 Pin", group: "mode" },
  { pin: 6, type: "Digital In", variable: 'diServo["Enable"]', description: "Servo power enable request (NO)", wireColor: "Red/Black", wireColorHex: "#dc2626", connector: "Female 12 Pin", group: "servo" },
  { pin: 7, type: "Digital In", variable: 'diBelt["Part_Present"]', description: "Optical sensor for part detection", wireColor: "Red/White", wireColorHex: "#f87171", connector: "Female 12 Pin", group: "belt" },
  { pin: 8, type: "Digital In", variable: 'diGripper["State"]', description: "Magnetic gripper engaged confirmation", wireColor: "Red/Grey", wireColorHex: "#b91c1c", connector: "Female 8 Pin", group: "gripper" },
  { pin: 9, type: "Digital In", variable: 'diBelt["FWD_Signal"]', description: "Belt forward signal feedback", wireColor: "White", wireColorHex: "#e2e8f0", connector: "Female 8 Pin", group: "belt" },
  { pin: 10, type: "Digital In", variable: 'diBelt["REV_Signal"]', description: "Belt reverse signal feedback", wireColor: "White/Black", wireColorHex: "#cbd5e1", connector: "Female 8 Pin", group: "belt" },
  { pin: 11, type: "Digital Out", variable: 'doOperation["LED"]', description: "Operation mode indicator lamp", wireColor: "White/Red", wireColorHex: "#fca5a5", connector: "Male 8 Pin", group: "mode" },
  { pin: 12, type: "Digital Out", variable: 'doMaintenance["LED"]', description: "Maintenance mode indicator lamp", wireColor: "Green", wireColorHex: "#22c55e", connector: "Male 8 Pin", group: "mode" },
  { pin: 13, type: "Digital Out", variable: 'doServo["LED"]', description: "Servo enabled indicator lamp", wireColor: "Green/White", wireColorHex: "#4ade80", connector: "Male 8 Pin", group: "servo" },
  { pin: 14, type: "Digital Out", variable: 'doBelt["FWD"]', description: "Drives conveyor belt forward", wireColor: "Green/Black", wireColorHex: "#16a34a", connector: "Female 12 Pin", group: "belt" },
  { pin: 15, type: "Digital Out", variable: 'doBelt["REV"]', description: "Drives conveyor belt reverse", wireColor: "Green/White/Black", wireColorHex: "#15803d", connector: "Female 12 Pin", group: "belt" },
  { pin: 16, type: "Digital Out", variable: 'doGripper_EGM["MAG"]', description: "Triggers UXB to magnetize end-effector", wireColor: "Black", wireColorHex: "#334155", connector: "Female 12 Pin", group: "gripper" },
  { pin: 17, type: "Digital Out", variable: 'doGripper_EGM["DEMAG"]', description: "Triggers UXB to demagnetize (drop part)", wireColor: "Brown/Green", wireColorHex: "#a16207", connector: "Female 19 Pin", group: "gripper" },
  { pin: 18, type: "Digital Out", variable: 'doBelt["Status"]', description: "Belt Reverse Lamp", wireColor: "Pink", wireColorHex: "#f472b6", connector: "Female 19 Pin", group: "belt" },
  { pin: 19, type: "Digital In", variable: 'diEGM["Mag_OFF"]', description: "EMH Mag Status / Mag OFF confirm", wireColor: "Black/White", wireColorHex: "#475569", connector: "Female 19 Pin", group: "gripper" },
  { pin: 20, type: "Digital In", variable: 'diEGM["Mag_ON"]', description: "Mag ON confirmation", wireColor: "Black/White/Red", wireColorHex: "#64748b", connector: "Female 19 Pin", group: "gripper" },
  { pin: 21, type: "Digital In", variable: 'diEGM["Part_Detect"]', description: "Mag Part Detection sensor", wireColor: "Orange", wireColorHex: "#f97316", connector: "Female 19 Pin", group: "gripper" },
  { pin: 22, type: "Digital In", variable: 'diEGM["Malfunction"]', description: "EMI Mag Malfunction alarm", wireColor: "Orange/Black", wireColorHex: "#ea580c", connector: "Female 19 Pin", group: "gripper" },
  { pin: 23, type: "Analog", variable: 'aiEGM["POF_Volt"]', description: "EMI H / POF voltage level", wireColor: "Orange/Red", wireColorHex: "#c2410c", connector: "Female 5 Pin", group: "gripper" },
  { pin: 24, type: "Digital Out", variable: 'doEGM["POF_Out"]', description: "POF output signal", wireColor: "Orange/Green", wireColorHex: "#d97706", connector: "Female 5 Pin", group: "gripper" },
  { pin: 25, type: "Power", variable: 'PoE_Out', description: "PoE / Power output", wireColor: "Brown/White", wireColorHex: "#78716c", connector: "Female 5 Pin", group: "power" },
];

// Pin groups for visual organization
export const PIN_GROUPS = {
  safety: { label: "Safety", color: "#ef4444", icon: "🛑" },
  mode: { label: "Operating Mode", color: "#f59e0b", icon: "⚙" },
  servo: { label: "Servo / Robot", color: "#a855f7", icon: "🤖" },
  belt: { label: "Conveyor Belt", color: "#3b82f6", icon: "🏭" },
  gripper: { label: "Gripper / EGM", color: "#f97316", icon: "🧲" },
  power: { label: "Power", color: "#22c55e", icon: "⚡" },
};
