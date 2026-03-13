import { C } from '../constants';

export const Toast = ({ message, type, visible }) => {
  if (!visible) return null;

  const bg = type === "success" ? C.greenDim
    : type === "warning" ? C.amberDim
    : type === "info" ? C.cyanDim
    : type === "error" ? C.redDim
    : C.accentDim;
  const borderC = type === "success" ? C.green
    : type === "warning" ? C.amber
    : type === "info" ? C.cyan
    : type === "error" ? C.red
    : C.accent;
  const color = type === "success" ? C.green
    : type === "warning" ? C.amber
    : type === "info" ? C.cyan
    : type === "error" ? C.red
    : C.accent;
  const icon = type === "success" ? "✓"
    : type === "warning" ? "⚠"
    : type === "info" ? "ℹ"
    : type === "error" ? "✗"
    : "↑";

  return (
    <div className="toast" style={{ backgroundColor: bg, border: `1px solid ${borderC}40`, color }}>
      {icon} {message}
    </div>
  );
};
