import React from 'react';
import '../styles/Admin.css';

export default function AdminModal({ isOpen, onClose, title, children, actions }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b',
                backgroundImage: 'linear-gradient(145deg, rgba(30, 41, 59, 1), rgba(15, 23, 42, 1))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                minWidth: '400px',
                maxWidth: '600px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ marginBottom: actions ? '2rem' : 0 }}>
                    {children}
                </div>

                {actions && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
