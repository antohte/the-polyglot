import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { CATEGORIES } from "../constants/categories";
import PostCard from "../components/PostCard";
import NewPostForm from "../components/NewPostForm";
import { useAuth } from "../auth/AuthContext";
import SubcategoryModal from "../components/SubcategoryModal";

function Category() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]); // Store all posts for counts
    const [postsLoading, setPostsLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [category, setCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [searchSubcategory, setSearchSubcategory] = useState("");
    const [subcategoryCounts, setSubcategoryCounts] = useState({});

    // Charger la catégorie et ses sous-catégories
    useEffect(() => {
        let mounted = true;

        async function loadCategory() {
            setCategoryLoading(true);
            try {
                // Fetch all categories (flat list)
                const allCats = await api.categories.getAll();

                // Find current category
                const foundCat = allCats.find(c => c.slug === slug);
                const staticCategory = CATEGORIES.find((cat) => cat.slug === slug);

                if (foundCat) {
                    // Find children (subcategories)
                    const children = allCats.filter(c => c.parent_id === foundCat.id);

                    // Merge with static subcategories if any (avoid dupes by name/slug?)
                    // Assuming API is source of truth, but if static has extra...
                    // For now, let's rely on API children + static children if needed.
                    // But if migrated, API children should cover it.

                    // Construct category object
                    const catObj = {
                        ...foundCat,
                        type: staticCategory ? 'static' : 'dynamic',
                        subcategories: children.map(child => ({
                            name: child.name,
                            slug: child.slug,
                            createdByName: child.created_by_name || "Admin", // If joined
                            description: child.description
                        })),
                        icon: staticCategory?.icon || "📁"
                    };

                    // If no DB children found, but static has some? 
                    // Migration should have handled it. If not, fallback to static.
                    if (children.length === 0 && staticCategory?.subcategories) {
                        catObj.subcategories = staticCategory.subcategories;
                    }

                    if (mounted) {
                        setCategory(catObj);
                        if (catObj.subcategories.length > 0) {
                            setSelectedSubcategory(catObj.subcategories[0].name);
                        } else {
                            setSelectedSubcategory("");
                        }
                    }
                } else if (staticCategory) {
                    // Only static exists (no DB record yet?)
                    if (mounted) {
                        setCategory({
                            ...staticCategory,
                            type: 'static',
                            subcategories: staticCategory.subcategories || []
                        });
                        if (staticCategory.subcategories?.length > 0) {
                            setSelectedSubcategory(staticCategory.subcategories[0].name);
                        } else {
                            setSelectedSubcategory("");
                        }
                    }
                } else {
                    if (mounted) setCategory(null);
                }
            } catch (err) {
                console.error("Error loading categories:", err);
            } finally {
                if (mounted) setCategoryLoading(false);
            }
        }

        loadCategory();
        return () => { mounted = false; };
    }, [slug]);

    // Charger les posts
    useEffect(() => {
        let mounted = true;
        if (!category) return;

        async function loadPosts() {
            setPostsLoading(true);
            try {
                const data = await api.posts.getAll({ category: slug });
                if (mounted) {
                    setAllPosts(data);

                    // Calculate counts
                    const counts = {};
                    data.forEach(p => {
                        if (p.subcategory) {
                            counts[p.subcategory] = (counts[p.subcategory] || 0) + 1;
                        }
                    });
                    setSubcategoryCounts(counts);

                    // Filter for selected subcategory
                    if (selectedSubcategory) {
                        setPosts(data.filter(p => p.subcategory === selectedSubcategory));
                    } else {
                        setPosts([]);
                    }
                }
            } catch (err) {
                console.error("Error loading posts:", err);
            } finally {
                if (mounted) setPostsLoading(false);
            }
        }

        loadPosts();
        return () => { mounted = false; };
    }, [category, slug]); // Reload if category or slug changes

    // Re-filter when selectedSubcategory changes without re-fetching
    useEffect(() => {
        if (!selectedSubcategory) {
            setPosts([]);
            return;
        }
        if (allPosts.length > 0) {
            setPosts(allPosts.filter(p => p.subcategory === selectedSubcategory));
        }
    }, [selectedSubcategory, allPosts]);


    if (categoryLoading) {
        return (
            <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Chargement...</p>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Catégorie introuvable</h2>
                <p>La catégorie "{slug}" n'existe pas.</p>
            </div>
        );
    }

    const subcategories = category.subcategories || [];

    // Filtrer les sous-catégories par la recherche
    const filteredSubcategories = subcategories.filter(sub =>
        sub.name.toLowerCase().includes(searchSubcategory.toLowerCase())
    );

    return (
        <div className="container" style={{ padding: "2rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {category.icon} {category.name}
                </h1>
                {category.description && (
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                        {category.description}
                    </p>
                )}
            </div>

            {/* Sous-catégories */}
            {subcategories.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            margin: 0
                        }}>
                            📁 Sous-catégories
                        </h3>
                        {user && (
                            <button
                                onClick={() => setShowSubcategoryModal(true)}
                                className="btn btn-primary"
                                style={{
                                    fontSize: "0.9rem",
                                    padding: "0.75rem 1.25rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontWeight: "600"
                                }}
                            >
                                <span style={{ fontSize: "1.1rem" }}>✨</span>
                                Nouvelle sous-catégorie
                            </button>
                        )}
                    </div>

                    {/* Barre de recherche améliorée */}
                    <div style={{
                        position: "relative",
                        marginBottom: "1.5rem"
                    }}>
                        <div style={{
                            position: "absolute",
                            left: "1rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "1.2rem",
                            pointerEvents: "none",
                            opacity: 0.6
                        }}>
                            🔍
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une sous-catégorie..."
                            value={searchSubcategory}
                            onChange={(e) => setSearchSubcategory(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "1rem 1rem 1rem 3rem",
                                fontSize: "1rem",
                                borderRadius: "12px",
                                border: "2px solid #334155",
                                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                                color: "#f1f5f9",
                                transition: "all 0.3s ease",
                                outline: "none",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "#667eea";
                                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "#334155";
                                e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                            }}
                        />
                        {searchSubcategory && (
                            <button
                                onClick={() => setSearchSubcategory("")}
                                style={{
                                    position: "absolute",
                                    right: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "rgba(239, 68, 68, 0.2)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "28px",
                                    height: "28px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    color: "#ef4444",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.3)"}
                                onMouseLeave={(e) => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {filteredSubcategories.length > 0 ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "1rem"
                        }}>
                            {filteredSubcategories.map((sub) => {
                                const postCount = subcategoryCounts[sub.name] || 0;
                                const isSelected = selectedSubcategory === sub.name;

                                return (
                                    <div
                                        key={sub.slug}
                                        onClick={() => setSelectedSubcategory(sub.name)}
                                        style={{
                                            padding: "1.5rem",
                                            borderRadius: "16px",
                                            background: isSelected
                                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                : "linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)",
                                            border: "2px solid",
                                            borderColor: isSelected ? "transparent" : "#334155",
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            position: "relative",
                                            overflow: "hidden",
                                            boxShadow: isSelected
                                                ? "0 8px 24px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(102, 126, 234, 0.1) inset"
                                                : "0 2px 8px rgba(0, 0, 0, 0.2)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                                            e.currentTarget.style.boxShadow = isSelected
                                                ? "0 12px 32px rgba(102, 126, 234, 0.5), 0 0 0 1px rgba(102, 126, 234, 0.2) inset"
                                                : "0 8px 24px rgba(102, 126, 234, 0.3)";
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = "#667eea";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                                            e.currentTarget.style.boxShadow = isSelected
                                                ? "0 8px 24px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(102, 126, 234, 0.1) inset"
                                                : "0 2px 8px rgba(0, 0, 0, 0.2)";
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = "#334155";
                                            }
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={{
                                                position: "absolute",
                                                top: "10px",
                                                right: "10px",
                                                background: "rgba(255, 255, 255, 0.2)",
                                                borderRadius: "50%",
                                                width: "24px",
                                                height: "24px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.875rem",
                                                fontWeight: "bold"
                                            }}>
                                                ✓
                                            </div>
                                        )}

                                        {postCount > 0 && (
                                            <div style={{
                                                position: "absolute",
                                                top: "10px",
                                                left: "10px",
                                                background: isSelected
                                                    ? "rgba(255, 255, 255, 0.25)"
                                                    : "rgba(102, 126, 234, 0.3)",
                                                borderRadius: "12px",
                                                padding: "0.25rem 0.5rem",
                                                fontSize: "0.75rem",
                                                fontWeight: "700",
                                                color: "#ffffff",
                                                border: "1px solid rgba(255, 255, 255, 0.2)"
                                            }}>
                                                {postCount}
                                            </div>
                                        )}

                                        <div style={{
                                            fontSize: "2.5rem",
                                            marginBottom: "0.75rem",
                                            textAlign: "center",
                                            filter: isSelected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none"
                                        }}>
                                            📌
                                        </div>
                                        <div style={{
                                            fontSize: "1rem",
                                            fontWeight: "700",
                                            textAlign: "center",
                                            color: "#ffffff",
                                            marginBottom: "0.5rem",
                                            wordBreak: "break-word",
                                            lineHeight: "1.3"
                                        }}>
                                            {sub.name}
                                        </div>
                                        <div style={{
                                            fontSize: "0.75rem",
                                            textAlign: "center",
                                            color: isSelected ? "rgba(255, 255, 255, 0.85)" : "#94a3b8",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "0.25rem"
                                        }}>
                                            <span>👤</span>
                                            <span style={{ fontWeight: "500" }}>
                                                {sub.createdByName?.split(' ')[0] || "Anonyme"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: "center",
                            padding: "3rem",
                            background: "rgba(51, 65, 85, 0.3)",
                            borderRadius: "12px",
                            border: "2px dashed #334155"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                            <p style={{ color: "#94a3b8", fontSize: "1.1rem", fontWeight: "500" }}>
                                Aucune sous-catégorie ne correspond à votre recherche
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Bouton créer sous-catégorie si aucune sous-catégorie n'existe */}
            {subcategories.length === 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "3rem",
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                    marginBottom: "2rem"
                }}>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#f1f5f9" }}>
                        📁 Aucune sous-catégorie
                    </h3>
                    <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                        Cette catégorie ne contient pas encore de sous-catégories.
                        {user && " Créez-en une pour pouvoir poster !"}
                    </p>
                    {user && (
                        <button
                            onClick={() => setShowSubcategoryModal(true)}
                            className="btn btn-primary"
                            style={{ fontSize: "1rem", padding: "0.75rem 1.5rem" }}
                        >
                            ✨ Créer la première sous-catégorie
                        </button>
                    )}
                </div>
            )}

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                padding: "1.25rem",
                background: "linear-gradient(135deg, rgba(51, 65, 85, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)",
                borderRadius: "12px",
                border: "1px solid #334155"
            }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", margin: 0, marginBottom: "0.25rem" }}>
                        {posts.length} {posts.length > 1 ? "posts" : "post"}
                    </h2>
                    {selectedSubcategory && (
                        <p style={{
                            fontSize: "0.875rem",
                            color: "#94a3b8",
                            margin: 0
                        }}>
                            dans <strong style={{ color: "#c4b5fd" }}>{selectedSubcategory}</strong>
                        </p>
                    )}
                </div>
                {user && selectedSubcategory && (
                    <button
                        onClick={() => setShowNewPost(true)}
                        style={{
                            padding: "0.875rem 1.5rem",
                            fontSize: "1rem",
                            fontWeight: "600",
                            borderRadius: "10px",
                            border: "none",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                        }}
                    >
                        <span style={{ fontSize: "1.2rem" }}>✍️</span>
                        Créer un post
                    </button>
                )}
            </div>

            {/* Message si aucune sous-catégorie sélectionnée */}
            {!selectedSubcategory && subcategories.length > 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
                    borderRadius: "20px",
                    border: "3px dashed rgba(102, 126, 234, 0.4)",
                    marginBottom: "1.5rem",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute",
                        top: "-30px",
                        right: "-30px",
                        fontSize: "8rem",
                        opacity: "0.08",
                        transform: "rotate(15deg)"
                    }}>
                        📁
                    </div>
                    <div style={{
                        fontSize: "4rem",
                        marginBottom: "1.5rem",
                        animation: "bounce 2s infinite"
                    }}>
                        📂
                    </div>
                    <h3 style={{
                        fontSize: "2rem",
                        color: "#f1f5f9",
                        marginBottom: "1rem",
                        fontWeight: "700"
                    }}>
                        Une catégorie = Un dossier
                    </h3>
                    <p style={{
                        fontSize: "1.2rem",
                        color: "#cbd5e1",
                        marginBottom: "0.75rem",
                        lineHeight: "1.6",
                        maxWidth: "600px",
                        margin: "0 auto 1rem"
                    }}>
                        Pour accéder aux posts et pouvoir en créer, vous devez <strong>sélectionner une sous-catégorie</strong> ci-dessus
                    </p>
                    <div style={{
                        display: "inline-block",
                        padding: "1rem 2rem",
                        background: "rgba(102, 126, 234, 0.2)",
                        borderRadius: "12px",
                        border: "2px solid rgba(102, 126, 234, 0.3)",
                        marginTop: "1rem"
                    }}>
                        <p style={{
                            fontSize: "1rem",
                            color: "#a5b4fc",
                            margin: 0,
                            fontWeight: "600"
                        }}>
                            💡 Sous-catégorie = Fichier contenant les posts
                        </p>
                    </div>
                </div>
            )}

            {posts.length === 0 && selectedSubcategory ? (
                postsLoading ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                        <p style={{ color: "#94a3b8" }}>Chargement des posts...</p>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                        <p>Aucun post dans cette sous-catégorie.</p>
                        {user && <p>Soyez le premier à créer un post !</p>}
                    </div>
                )
            ) : selectedSubcategory && posts.length > 0 ? (
                <div className="posts-grid">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : null}

            {showNewPost && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "1rem",
                    overflow: "auto"
                }}>
                    <div style={{
                        width: "100%",
                        maxWidth: "800px",
                        maxHeight: "90vh",
                        overflow: "auto"
                    }}>
                        <NewPostForm
                            fixedCategory={category.name}
                            fixedCategorySlug={category.slug}
                            fixedSubcategory={selectedSubcategory}
                            subcategories={subcategories}
                            onSuccess={() => {
                                setShowNewPost(false);
                                // Trigger reload posts? Logic needs enhancement to auto-reload
                                // or optimistically add. 
                                // Since we fetch in useEffect depends on slug, we can trigger re-fetch.
                                setCategory({ ...category }); // Mock update to trigger effect? No, bad.
                                // simpler: reload page or use context.
                                // For now, simple standard reload or just accept it appears on refresh.
                                // Actually, I should expose loadPosts to refresh.
                                window.location.reload();
                            }}
                        />
                    </div>
                </div>
            )}

            {showSubcategoryModal && (
                <SubcategoryModal
                    categoryId={category.id}
                    categoryName={category.name}
                    categorySlug={slug}
                    onClose={() => setShowSubcategoryModal(false)}
                    onSuccess={() => {
                        setShowSubcategoryModal(false);
                        window.location.reload(); // Reload to see new subcategory
                    }}
                />
            )}
        </div>
    );
}

export default Category;
