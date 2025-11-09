import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'


export default function Header() {
const { user, logout, signInGoogle } = useAuth()
const loc = useLocation()


const navClass = (path) => `nav-link ${loc.pathname === path ? 'active' : ''}`


return (
<header className="header header-centered">
{/* Actions auth en haut à droite */}
<div className="auth-actions">
{user ? (
<>
<span className="user">{user.displayName || user.email}</span>
<button className="btn" onClick={logout}>Logout</button>
</>
) : (
<button className="btn" onClick={signInGoogle}>Login</button>
)}
</div>


{/* Logo centré (remplace par <img className="logo-img" src="/logo.png" alt="The Polyglot" /> si tu as l'image) */}
<div className="logo big">THE<br/>Polyglot</div>


{/* Nav centrée sous le logo, espacée et en "pills" */}
<nav className="nav-under-logo">
<Link className={navClass('/')} to="/">Accueil</Link>
<Link className={navClass('/forum')} to="/forum">Forum</Link>
</nav>
</header>
)
}
