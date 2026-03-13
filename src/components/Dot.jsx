import { C } from '../constants';

export const Dot = ({ status, size = 8, pulse = false }) => {
  const color = status === "ok" ? C.green
    : status === "warn" ? C.amber
    : status === "error" ? C.red
    : status === "info" ? C.cyan
    : C.dim;

  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center",
      justifyContent: "center", width: size + 8, height: size + 8,
    }}>
      {pulse && status === "ok" && (
        <span style={{
          position: "absolute", width: size + 6, height: size + 6,
          borderRadius: "50%", backgroundColor: color, opacity: 0.3,
          animation: "pulse 2s ease-in-out infinite",
        }} />
      )}
      <span style={{
        width: size, height: size, borderRadius: "50%",
        backgroundColor: color, boxShadow: `0 0 ${size}px ${color}40`,
      }} />
    </span>
  );
};
