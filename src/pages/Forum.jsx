import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { CATEGORIES } from '../constants/categories'
import { useAuth } from '../auth/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import CategoryRequestModal from '../components/CategoryRequestModal'
import '../styles/Categories.css'


export default function Forum() {
    const { user } = useAuth()
    const { settings } = useSettings()
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [dynamicCategories, setDynamicCategories] = useState([])

    // Charger les catégories approuvées depuis MySQL
    useEffect(() => {
        api.categories.getAll().then(cats => {
            setDynamicCategories(cats)
        }).catch(err => console.error("Error fetching categories:", err));
    }, [])

    // Combiner les catégories statiques et dynamiques SANS DOUBLONS
    // Ne garder les catégories dynamiques QUE si leur slug n'existe pas dans les statiques
    const staticSlugs = CATEGORIES.map(c => c.slug);
    const uniqueDynamicCategories = dynamicCategories.filter(c => !staticSlugs.includes(c.slug));

    const allCategories = [
        ...CATEGORIES.map(c => ({ ...c, type: 'static' })),
        ...uniqueDynamicCategories.map(c => ({ ...c, type: 'dynamic' }))
    ]

    return (
        <div className="container">
            <div className="forum-header">
                <h1>{settings?.forum_title || 'Forum'}</h1>
                <p>{settings?.forum_description || 'Explorez les catégories et rejoignez les discussions'}</p>
            </div>

            {/* Bouton pour proposer une catégorie */}
            {user && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "2rem"
                }}>
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="btn"
                        style={{
                            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                            color: "white",
                            padding: "0.75rem 1.5rem",
                            fontSize: "1rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                    >
                        ➕ Proposer une nouvelle catégorie
                    </button>
                </div>
            )}

            <div className="categories-grid">
                {allCategories.map((c, index) => (
                    <Link
                        key={c.type === 'static' ? c.slug : c.id}
                        to={`/forum/${c.slug}`}
                        className="cat-card"
                    >
                        <div className="cat-title">
                            {c.name}
                        </div>
                        {c.description && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-text-secondary)',
                                margin: '0.5rem 0 1rem 0'
                            }}>
                                {c.description}
                            </p>
                        )}
                        <div className="cat-cta">Voir les posts →</div>
                    </Link>
                ))}
            </div>

            {/* Modal de demande de catégorie */}
            {showRequestModal && (
                <CategoryRequestModal onClose={() => setShowRequestModal(false)} />
            )}
        </div>
    )
}
