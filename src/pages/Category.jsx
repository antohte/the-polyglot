import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { CATEGORIES, bySlug } from "../constants/categories";
import NewPostForm from "../components/NewPostForm";
import PostCard from "../components/PostCard";

export default function Category() {
  const { slug } = useParams();

  // Nom lisible de la catégorie (en Firestore, on stocke le name, pas le slug)
  const categoryName = bySlug[slug] || null;

  // Liste pour le fil + recherche locale
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  // Fil d’Ariane simple
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

    // Écoute en temps réel
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

  // Filtre de recherche côté client
  const filtered = posts.filter((p) => {
    if (!search.trim()) return true;
    const t = search.toLowerCase();
    return (p.title + " " + p.content).toLowerCase().includes(t);
  });

  return (
    <div className="container">
      {/* Header rubrique */}
      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            <Link to="/forum" style={{ color: "var(--brand)" }}>Forum</Link> / {breadcrumb}
          </div>
          <h2 style={{ margin: "6px 0 0" }}>{breadcrumb}</h2>
        </div>
        <input
          className="ui-input"
          type="search"
          placeholder="Rechercher dans cette rubrique…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      {/* Formulaire de post — catégorie fixée */}
      <NewPostForm fixedCategory={categoryName} />

      {/* Liste des posts */}
      <div className="list">
        {filtered.length === 0 ? (
          <p>Aucun post pour le moment.</p>
        ) : (
          filtered.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}