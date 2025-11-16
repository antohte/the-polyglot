// src/components/Decorations.jsx
// Éléments graphiques et décoratifs

export function FloatingShapes() {
  return (
    <div className="floating-shapes">
      <div className="shape shape-circle shape-1"></div>
      <div className="shape shape-circle shape-2"></div>
      <div className="shape shape-square shape-3"></div>
      <div className="shape shape-triangle shape-4"></div>
    </div>
  );
}

export function GradientBorder() {
  return <div className="gradient-border"></div>;
}

export function AnimatedDots() {
  return (
    <div className="animated-dots">
      <div className="dot dot-1"></div>
      <div className="dot dot-2"></div>
      <div className="dot dot-3"></div>
    </div>
  );
}

export function SectionDivider() {
  return (
    <svg className="section-divider" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#764ba2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#667eea" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z"
        fill="url(#waveGradient)"
      />
    </svg>
  );
}

export function CardBadge({ label, color = "blue" }) {
  const colors = {
    blue: "badge-blue",
    purple: "badge-purple",
    pink: "badge-pink",
    green: "badge-green",
  };

  return <span className={`card-badge ${colors[color]}`}>{label}</span>;
}
