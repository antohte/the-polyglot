// src/components/EmptyState.jsx
import '../styles/EmptyState.css';

export function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="empty-state-svg">
      <defs>
        <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      
      {/* Envelope background */}
      <g transform="translate(75, 75)">
        {/* Envelope */}
        <rect x="10" y="40" width="130" height="85" fill="white" stroke="url(#emptyGradient)" strokeWidth="2" rx="8" />
        {/* Envelope flap */}
        <path d="M 10 40 L 75 85 L 140 40" fill="none" stroke="url(#emptyGradient)" strokeWidth="2" />
        {/* Lines */}
        <line x1="20" y1="55" x2="130" y2="55" stroke="url(#emptyGradient)" strokeWidth="1.5" opacity="0.5" />
        <line x1="20" y1="70" x2="130" y2="70" stroke="url(#emptyGradient)" strokeWidth="1.5" opacity="0.5" />
        <line x1="20" y1="85" x2="100" y2="85" stroke="url(#emptyGradient)" strokeWidth="1.5" opacity="0.5" />
      </g>
    </svg>
  );
}

export function EmptyState({ title = "Aucun contenu", message = "Il n'y a rien à afficher pour le moment." }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <EmptyStateIllustration />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
