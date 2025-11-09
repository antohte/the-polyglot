import { Link } from 'react-router-dom'
import { CATEGORIES } from '../constants/categories'


export default function Forum() {
return (
<div className="container">
<div className="categories-grid">
{CATEGORIES.map(c => (
<Link key={c.slug} to={`/forum/${c.slug}`} className="cat-card">
<div className="cat-title">{c.name}</div>
<div className="cat-cta">Voir les posts →</div>
</Link>
))}
</div>
</div>
)
}