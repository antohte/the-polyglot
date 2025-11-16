import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import PostCard from '../components/PostCard'
import { ChatBubbleIllustration, BookIllustration, PeopleIllustration } from '../components/Illustrations'
import { EmptyState } from '../components/EmptyState'
import '../styles/Home.css'
import '../styles/Illustrations.css'


const promoImages = [
'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
'https://images.unsplash.com/photo-1496307653780-42ee777d4833'
]


export default function Home() {
const [posts, setPosts] = useState([])
const [i, setI] = useState(0)


useEffect(() => {
const t = setInterval(() => setI((v) => (v + 1) % promoImages.length), 3500)
return () => clearInterval(t)
}, [])


useEffect(() => {
async function load() {
const q1 = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(6))
const snap = await getDocs(q1)
setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
}
load()
}, [])


return (
<div className="home-page">
<section className="hero">
<div className="carousel" style={{ backgroundImage: `url(${promoImages[i]})` }} />
<div className="hero-text">
<h1>Le Forum — Licence</h1>
<p>Posts, actus, projets. Un espace pour la promo.</p>
<Link to="/forum" className="btn btn-cta">
Accéder au Forum →
</Link>
</div>
</section>

<div className="container">
<section className="features">
<h2>Bienvenue sur The Polyglot</h2>
<div className="features-grid">
<div className="feature-card">
<div className="illustration-container">
<ChatBubbleIllustration />
</div>
<h3>Discussions</h3>
<p>Participez à des conversations enrichissantes avec vos camarades de promo.</p>
</div>
<div className="feature-card">
<div className="illustration-container">
<BookIllustration />
</div>
<h3>Partage</h3>
<p>Partagez vos projets, vos ressources et vos expériences d'apprentissage.</p>
</div>
<div className="feature-card">
<div className="illustration-container">
<PeopleIllustration />
</div>
<h3>Communauté</h3>
<p>Créez des liens avec d'autres étudiants de votre année et au-delà.</p>
</div>
</div>
</section>

<section className="latest-posts">
<div className="section-header">
<h2>Derniers posts</h2>
<Link to="/forum" className="link-more">Voir tous les posts →</Link>
</div>
{posts.length === 0 ? (
<EmptyState 
title="Aucun post pour le moment" 
message="Soyez le premier à créer un post dans le forum !" 
/>
) : (
<div className="posts-list">
{posts.map(p => (
<PostCard key={p.id} post={p} />
))}
</div>
)}
</section>

<section className="cta-section">
<h2>Prêt à participer ?</h2>
<p>Rejoignez la communauté et partagez vos idées !</p>
<Link to="/forum" className="btn btn-cta">
Découvrir le Forum
</Link>
</section>
</div>
</div>
)
}
