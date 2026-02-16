// src/components/HeroSection.jsx
import { Link } from 'react-router-dom';
import { FloatingShapes } from './Decorations';
import '../styles/HeroSection.css';

const heroImage = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2673&auto=format&fit=crop';

export default function HeroSection() {
  return (
    <section className="hero">
      <FloatingShapes />
      <div className="carousel" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="hero-overlay"></div>
      <div className="hero-text">
        <h1>The Polyglot</h1>
        <p>Posts, actus, projets. Un espace pour la promo.</p>
        <Link to="/forum" className="btn btn-cta">
          Accéder au Forum →
        </Link>
      </div>
    </section>
  );
}
