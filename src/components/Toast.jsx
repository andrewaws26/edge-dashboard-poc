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
  const icon = type === "success" ? "\u2713"
    : type === "warning" ? "\u26A0"
    : type === "info" ? "\u2139"
    : type === "error" ? "\u2717"
    : "\u2191";

  return (
    <div className="toast" style={{ backgroundColor: bg, border: `1px solid ${borderC}40`, color }}>
      {icon} {message}
    </div>
  );
};
