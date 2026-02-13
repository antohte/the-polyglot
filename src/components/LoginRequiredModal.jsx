import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRequiredModal.css';

export default function LoginRequiredModal() {
    const navigate = useNavigate();

    return (
        <div className="login-modal-backdrop">
            <div className="login-modal-card">
                <button className="btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={() => navigate('/')}>✕</button>
                <div className="login-modal-icon">🔒</div>
                <h2>Connexion requise</h2>
                <p>
                    Vous devez être connecté pour voir les membres de la communauté et interagir avec eux.
                </p>
                <div className="login-modal-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        Se connecter
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
}
