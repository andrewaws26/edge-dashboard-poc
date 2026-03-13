import { C } from '../constants';

export const Dot = ({ status, size = 8, pulse = false }) => {
  const color = status === "ok" ? C.green
    : status === "warn" ? C.amber
    : status === "error" ? C.red
    : status === "info" ? C.cyan
    : C.dim;

  const shouldPulse = pulse && (status === "ok" || status === "warn" || status === "error");
  const pulseSpeed = status === "error" ? "1s" : status === "warn" ? "2.5s" : "2s";

  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center",
      justifyContent: "center", width: size + 8, height: size + 8,
    }}>
      {shouldPulse && (
        <span style={{
          position: "absolute", width: size + 6, height: size + 6,
          borderRadius: "50%", backgroundColor: color, opacity: 0.3,
          animation: `pulse ${pulseSpeed} ease-in-out infinite`,
        }} />
      )}
      <span style={{
        width: size, height: size, borderRadius: "50%",
        backgroundColor: color, boxShadow: `0 0 ${size}px ${color}40`,
        transition: "background-color 0.4s ease, box-shadow 0.4s ease",
      }} />
    </span>
  );
};
