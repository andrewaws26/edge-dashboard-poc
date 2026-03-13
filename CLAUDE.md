# RAIV #3 Digital Twin — Nervous System Observability Dashboard

## What This Is
A read-only observability dashboard for a mobile robotic autonomous vehicle (RAIV #3). It monitors the OT logic layer (24V DC, Mitsubishi FX5UC PLC) and IT vision subsystem across 3 physical zones. Interactive fault scenarios demonstrate granular diagnostic tracing from physical wire to PLC variable.

## Quick Start
```bash
npm install
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure
```
index.html                          # Vite entry point
src/
  main.jsx                          # React root render
  App.jsx                           # Main dashboard layout, state machine, scenario logic
  constants.js                      # Color palette (C), domain tags (IT, OT)
  index.css                         # Global styles and animations
  components/
    Bar.jsx                         # Progress/metric bar with color status
    DiagnosisPanel.jsx              # Fault diagnosis with trace steps + operator action
    Dot.jsx                         # Status indicator dot (ok/warn/error/info)
    DomainTag.jsx                   # IT/OT domain label badge
    GlobalStateBanner.jsx           # System state: PRODUCTION / MAINTENANCE / HALTED / CONFLICT
    IOPin.jsx                       # Single I/O pin display (legacy, kept for compatibility)
    Metric.jsx                      # Label-value metric display
    Panel.jsx                       # Reusable dashboard panel container
    PinTable.jsx                    # Full 25-pin I/O table with wire colors + fault highlighting
    SignalTrace.jsx                 # Visual signal path (Fuji → M12 → Trunk → ZipLink → PLC)
    Toast.jsx                       # Notification toast
    VisionStatus.jsx                # IT domain vision subsystem (Dell Apera servers, cameras)
    ZoneTopology.jsx                # Physical zone layout (Z1 Cab, Z2 Power, Z3 Rear)
  data/
    pinMap.js                       # Authoritative 25-pin trunk I/O map with wire colors
    scenarios.js                    # Fault scenarios: state machine, pin states, logs, diagnosis
```

## Architecture
- **Framework**: React 18 with Vite (JSX, ES modules)
- **Styling**: CSS file (`index.css`) + inline styles. Colors in `constants.js`.
- **State**: React hooks only. No external state library.
- **No backend**: Pure client-side. Designed for future WebSocket feed from PLC/Stride Linx VPN.

## Domain Model

### IT vs OT
- **IT** (cyan): Information Technology — Ethernet/PoE, Dell servers, vision processing, Netgear switch
- **OT** (orange): Operational Technology — EtherCAT, PLC, robot arm, gripper, 24V DC logic

### Physical Zones
- **Zone 1 (Front Cab)**: FX5UC PLC, Click PLC, Dell Apera servers, Netgear switch, Stride Linx VPN, Rhino PSR, ZipLink breakouts
- **Zone 2 (Middle)**: Generator, battery bank, 3000W inverter
- **Zone 3 (Rear)**: Stäubli robot arm, conveyor, Schunk UXB controller, TRENDnet PoE, Saginaw/Fuji HMI, Murrelektronik bulkhead

### Power Distribution
- **120V AC Plane**: Generator → Inverter → IT stack (Dell, Netgear, monitors)
- **24V DC Plane**: Rhino PSR → OT stack (PLCs, Schunk, relays, sensors, Fuji buttons)

### Global State Machine
Mutually exclusive operating modes from Fuji buttons (Zone 3):
- **PRODUCTION RUNNING**: `diOperation["Start"]` = TRUE, normal automated operation
- **MAINTENANCE LOCKOUT**: `diMaintenance["Mode"]` = TRUE, automated routines locked out
- **SYSTEM HALTED**: `diSafteyStop` = FALSE, E-Stop circuit open, all outputs forced LOW
- **STATE CONFLICT**: Both Operation and Maintenance TRUE simultaneously (switch failure)
- **IDLE**: Safety closed, no mode selected

### I/O Signal Path
Physical button → M12 cable → Murrelektronik bulkhead → 25-pin trunk (passenger side) → ZipLink breakout → FX5UC PLC terminal

### 25-Pin Trunk I/O Map
Authoritative mapping in `src/data/pinMap.js`. Includes:
- All 25 pins with PLC variable names, types, wire colors, connector types
- Grouped by function: safety, mode, servo, belt, gripper, power
- Wire colors match physical wiring diagram

### Variable Naming
- `di` = digital input (e.g., `diServo["Enable"]`, `diSafteyStop`)
- `do` = digital output (e.g., `doBelt["FWD"]`, `doGripper_EGM["MAG"]`)
- `ai` = analog input (e.g., `aiEGM["POF_Volt"]`)

### Kinematic Boundary
The PLC does NOT control robot kinematics. Sub-ms motion runs on isolated EtherCAT. PLC only provides permissive signals (`diServo["Enable"]`).

## Fault Scenarios
Interactive buttons simulate faults. Each scenario defines:
- **State machine** (`SCENARIO_STATE_MACHINE`): eStop, operationMode, maintenanceMode
- **Pin states** (`SCENARIO_PIN_STATES`): per-pin HIGH/LOW values
- **Faulted pins** (`SCENARIO_FAULTED_PINS`): pins with detected faults
- **Log entries** (`SCENARIO_LOGS`): diagnostic trace messages
- **Toast** (`SCENARIO_TOASTS`): notification message
- **Diagnosis** (`DIAGNOSIS_MAP`): root cause, operator action, remote fix, trace steps
- **Signal trace** (`SCENARIO_SIGNAL_TRACE`): visual path with fault location

Available: `healthy`, `estop`, `maintenance`, `state_conflict`, `wire_fault`, `apera_crash`, `servo_fault`, `router_freeze`, `gripper_stuck`, `apera_drift`

## Design Principles
1. **Read-only**: No control buttons. Motion is strictly physical Fuji buttons + PLC logic.
2. **Safety first**: `diSafteyStop` is the most critical variable. E-Stop = red blinking, all outputs LOW.
3. **Trace linearly**: Always trace from physical origin → wire → PLC terminal → software variable.
4. **Granular visibility**: Every pin, every wire color, every zone visible in one view.
5. **Domain separation**: IT (cyan) and OT (orange) are visually distinct throughout.
