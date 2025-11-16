// src/components/Illustrations.jsx
// SVG Illustrations réutilisables

export function ChatBubbleIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="illustration">
      <defs>
        <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#chatGradient)" opacity="0.1" />
      <path d="M 50 60 Q 40 60 40 70 L 40 120 Q 40 130 50 130 L 110 130 L 130 150 L 110 130 L 110 130 Q 120 130 130 120 L 130 70 Q 130 60 120 60 Z" fill="url(#chatGradient)" />
      <circle cx="60" cy="95" r="5" fill="white" />
      <circle cx="85" cy="95" r="5" fill="white" />
      <circle cx="110" cy="95" r="5" fill="white" />
    </svg>
  );
}

export function BookIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="illustration">
      <defs>
        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f093fb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f5576c', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#bookGradient)" opacity="0.1" />
      <path d="M 70 50 L 70 150 Q 70 160 80 160 L 130 160 Q 140 160 140 150 L 140 50 Z" fill="url(#bookGradient)" />
      <line x1="100" y1="50" x2="100" y2="160" stroke="white" strokeWidth="2" />
      <line x1="80" y1="70" x2="130" y2="70" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="80" y1="90" x2="130" y2="90" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="80" y1="110" x2="130" y2="110" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="80" y1="130" x2="130" y2="130" stroke="white" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export function PeopleIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="illustration">
      <defs>
        <linearGradient id="peopleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4facfe', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00f2fe', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#peopleGradient)" opacity="0.1" />
      
      {/* Personne 1 */}
      <circle cx="70" cy="65" r="12" fill="url(#peopleGradient)" />
      <path d="M 58 80 Q 58 75 70 75 Q 82 75 82 80 L 82 95 Q 82 102 75 102 L 65 102 Q 58 102 58 95 Z" fill="url(#peopleGradient)" />
      
      {/* Personne 2 */}
      <circle cx="130" cy="60" r="12" fill="url(#peopleGradient)" />
      <path d="M 118 75 Q 118 70 130 70 Q 142 70 142 75 L 142 90 Q 142 97 135 97 L 125 97 Q 118 97 118 90 Z" fill="url(#peopleGradient)" />
      
      {/* Personne 3 */}
      <circle cx="100" cy="90" r="13" fill="url(#peopleGradient)" />
      <path d="M 87 108 Q 87 102 100 102 Q 113 102 113 108 L 113 125 Q 113 133 106 133 L 94 133 Q 87 133 87 125 Z" fill="url(#peopleGradient)" />
    </svg>
  );
}

export function ForumIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="illustration">
      <defs>
        <linearGradient id="forumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fa709a', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fee140', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#forumGradient)" opacity="0.1" />
      
      {/* Post 1 */}
      <rect x="50" y="55" width="100" height="35" rx="8" fill="url(#forumGradient)" />
      <line x1="60" y1="65" x2="130" y2="65" stroke="white" strokeWidth="1.5" />
      <line x1="60" y1="72" x2="100" y2="72" stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1="60" y1="78" x2="115" y2="78" stroke="white" strokeWidth="1" opacity="0.7" />
      
      {/* Post 2 */}
      <rect x="50" y="110" width="100" height="35" rx="8" fill="url(#forumGradient)" opacity="0.7" />
      <line x1="60" y1="120" x2="130" y2="120" stroke="white" strokeWidth="1.5" />
      <line x1="60" y1="127" x2="100" y2="127" stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1="60" y1="133" x2="115" y2="133" stroke="white" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

export function SearchIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="illustration">
      <defs>
        <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#a8edea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fed6e3', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#searchGradient)" opacity="0.1" />
      
      {/* Search circle */}
      <circle cx="80" cy="80" r="35" fill="none" stroke="url(#searchGradient)" strokeWidth="8" />
      
      {/* Search handle */}
      <line x1="110" y1="110" x2="145" y2="145" stroke="url(#searchGradient)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

// CSS pour les illustrations
export const illustrationStyles = `
  .illustration {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
`;
