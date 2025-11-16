// src/components/HeroSection.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FloatingShapes } from './Decorations';
import '../styles/HeroSection.css';

const promoImages = [
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
  'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
  'https://images.unsplash.com/photo-1496307653780-42ee777d4833'
];

export default function HeroSection() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % promoImages.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero">
      <FloatingShapes />
      <div className="carousel" style={{ backgroundImage: `url(${promoImages[i]})` }} />
      <div className="hero-overlay"></div>
      <div className="hero-text">
        <h1>Le Forum — Licence</h1>
        <p>Posts, actus, projets. Un espace pour la promo.</p>
        <Link to="/forum" className="btn btn-cta">
          Accéder au Forum →
        </Link>
      </div>
    </section>
  );
}
