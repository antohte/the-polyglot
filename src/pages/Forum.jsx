import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES } from '../constants/categories'
import { useAuth } from '../auth/AuthContext'
import CategoryRequestModal from '../components/CategoryRequestModal'
import '../styles/Categories.css'


export default function Forum() {
    const { user } = useAuth()
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [dynamicCategories, setDynamicCategories] = useState([])

    // Charger les catégories approuvées depuis Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            const cats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setDynamicCategories(cats)
        })

        return () => unsubscribe()
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
                <h1>Forum</h1>
                <p>Explorez les catégories et rejoignez les discussions</p>
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
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
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
                        style={{
                            position: 'relative',
                            ...(c.type === 'dynamic' && {
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                borderColor: 'rgba(102, 126, 234, 0.3)'
                            })
                        }}
                    >
                        <div className="cat-title">
                            {c.name}
                            {c.type === 'dynamic' && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#667eea',
                                    marginLeft: '0.5rem',
                                    fontWeight: '500'
                                }}>
                                    ✨ Nouvelle
                                </span>
                            )}
                        </div>
                        {c.description && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#64748b',
                                margin: '0.5rem 0 1rem 0'
                            }}>
                                {c.description}
                            </p>
                        )}
                        {c.subcategories && c.subcategories.length > 0 && (
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#94a3b8',
                                marginTop: '0.5rem',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.25rem'
                            }}>
                                {c.subcategories.slice(0, 3).map((sub, idx) => (
                                    <span key={idx} style={{
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        color: '#c4b5fd'
                                    }}>
                                        {sub.name}
                                    </span>
                                ))}
                                {c.subcategories.length > 3 && (
                                    <span style={{ color: '#64748b' }}>
                                        +{c.subcategories.length - 3}
                                    </span>
                                )}
                            </div>
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
