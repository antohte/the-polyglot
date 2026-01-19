// src/pages/Category.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { CATEGORIES, bySlug } from "../constants/categories";
import NewPostForm from "../components/NewPostForm";
import PostCard from "../components/PostCard";

export default function Category() {
  const { slug } = useParams();
  const categoryName = bySlug[slug] || null;

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false); // modal "Créer un post"

  const breadcrumb = useMemo(() => {
    const item = CATEGORIES.find((c) => c.slug === slug);
    return item ? item.name : "Rubrique";
  }, [slug]);

  useEffect(() => {
    if (!categoryName) return;
    const q = query(
      collection(db, "posts"),
      where("category", "==", categoryName),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(rows);
    });
    return () => unsub();
  }, [categoryName]);

  if (!categoryName) {
    return (
      <div className="container">
        <div className="card">
          <h3>Rubrique introuvable</h3>
          <p>La catégorie « {slug} » n’existe pas.</p>
          <Link className="btn" to="/forum">← Retour au forum</Link>
        </div>
      </div>
    );
  }

  // ✅ Recherche: titre + contenu + NOM DE L’AUTEUR
  const filtered = posts.filter((p) => {
    if (!search.trim()) return true;
    const t = search.toLowerCase();
    return (
      ((p.title || "") + " " + (p.content || "")).toLowerCase().includes(t) ||
      (p.authorName || "").toLowerCase().includes(t) // ← recherche par nom
    );
  });

  return (
    <div className="container">
      {/* En-tête rubrique */}
      <div
        className="card"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            <Link to="/forum" style={{ color: "var(--brand)" }}>
              Forum
            </Link>{" "}
            / {breadcrumb}
          </div>
          <h2>{breadcrumb}</h2>
        </div>

        <input
          className="ui-input"
          type="search"
          placeholder="Rechercher (titre, contenu, auteur)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      {/* Liste des posts */}
      <div className="list">
        {filtered.length === 0 ? (
          <p>Aucun post pour le moment.</p>
        ) : (
          filtered.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>

      {/* Bouton flottant bas-droite */}
      <button className="fab" onClick={() => setOpen(true)} title="Créer un post">
        + Créer un post
      </button>

      {/* Modal de création */}
      {open && (
        <>
          <div className="modal-backdrop" onClick={() => setOpen(false)} />
          <div className="modal-panel" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>Nouveau post — {breadcrumb}</h3>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <NewPostForm
              fixedCategory={categoryName}
              onSuccess={() => setOpen(false)} // fermeture auto après post
            />
          </div>
        </>
      )}
    </div>
  );
}
