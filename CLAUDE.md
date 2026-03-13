# RAIV #3 Digital Twin — Nervous System Dashboard

## What This Is
A proof-of-concept digital twin dashboard for an industrial autonomous vehicle (RAIV #3 — Robotic Autonomous Inspection Vehicle). It visualizes the health of distributed physical systems across IT and OT domains, with interactive fault scenario demonstrations.

## Quick Start
```bash
npm install
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure
```
index.html                  # Vite entry point
src/
  main.jsx                  # React root render
  App.jsx                   # Main App component (dashboard layout, state, scenario logic)
  constants.js              # Color palette (C), domain tags (IT, OT)
  index.css                 # Global styles and animations
  components/
    Bar.jsx                 # Progress/metric bar with color status
    DiagnosisPanel.jsx      # Fault diagnosis display with trace steps
    Dot.jsx                 # Status indicator dot (ok/warn/error/info)
    DomainTag.jsx           # IT/OT domain label badge
    IOPin.jsx               # Digital I/O pin state (commanded vs actual)
    Metric.jsx              # Label-value metric display
    Panel.jsx               # Reusable dashboard panel container
    Toast.jsx               # Notification toast
  data/
    scenarios.js            # Fault scenario definitions (logs, toasts, diagnosis data)
```

## Architecture
- **Framework**: React 18 with Vite (JSX, ES modules)
- **Styling**: CSS file (`index.css`) + inline styles. Color constants in `constants.js`.
- **State**: React hooks only (useState, useEffect, useCallback, useRef). No external state library.
- **No backend**: Pure client-side dashboard. No API calls.

## Key Concepts

### Domains
- **IT** (cyan): Information Technology — Ethernet, servers, vision processing
- **OT** (orange): Operational Technology — EtherCAT, PLC, robot arm, gripper

### Physical Zones
- **Zone 1 (Cab)**: IT rack, Netgear switch, PLC, Dell servers, Stride Linx VPN
- **Zone 2**: Generator/inverter
- **Zone 3 (Rear)**: Saginaw enclosure, Stäubli robot arm, Schunk gripper, cameras

### Fault Scenarios
Interactive buttons in the UI activate fault scenarios. Each scenario has:
- Log entries (`SCENARIO_LOGS` in `data/scenarios.js`)
- Toast notification (`SCENARIO_TOASTS`)
- Diagnosis details with trace steps (`DIAGNOSIS_MAP`)

Available scenarios: `healthy`, `wire_fault`, `apera_crash`, `servo_fault`, `router_freeze`, `gripper_stuck`, `apera_drift`

## Conventions
- All components are named exports except `App` (default export)
- Color constants use short key `C` (e.g., `C.green`, `C.redDim`)
- Status values: `"ok"`, `"warn"`, `"error"`, `"info"`
- PLC variable naming: `di` = digital input, `do` = digital output (e.g., `doBelt["FWD"]`)
