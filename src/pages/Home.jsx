import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import PostCard from '../components/PostCard'


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
const q1 = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(5))
const snap = await getDocs(q1)
setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
}
load()
}, [])


return (
<div className="container">
<section className="hero">
<div className="carousel" style={{ backgroundImage: `url(${promoImages[i]})` }} />
<div className="hero-text">
<h1>Le Forum — Licence</h1>
<p>Posts, actus, projets. Un espace pour la promo.</p>
</div>
</section>


<section>
<h2>Derniers posts</h2>
{posts.length === 0 ? <p>Aucun post pour le moment.</p> : posts.map(p => (
<PostCard key={p.id} post={p} />
))}
</section>
</div>
)
}