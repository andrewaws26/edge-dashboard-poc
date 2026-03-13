export const DomainTag = ({ domain }) => (
  <span className="domain-tag" style={{
    backgroundColor: domain.bg, color: domain.color,
    border: `1px solid ${domain.color}30`,
  }}>
    {domain.label}
  </span>
);
