import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import logoPolyglot from '../assets/logo_polyglot.jpg'
import '../styles/Login.css'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Validation inscription
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères')
          setLoading(false)
          return
        }
        if (!fullName.trim()) {
          setError("Veuillez entrer votre nom complet");
          setLoading(false);
          return;
        }

        const allowedDomains = ['@lacatholille.fr', '@univ-catholille.fr'];
        const lowerEmail = email.toLowerCase();
        if (!allowedDomains.some(d => lowerEmail.endsWith(d))) {
          setError("Veuillez utiliser votre email universitaire (@lacatholille.fr ou @univ-catholille.fr)");
          setLoading(false);
          return;
        }

        // Créer le compte
        await signUp(email.trim(), password, fullName)
        navigate('/')
      } else {
        // Se connecter
        await signIn(email.trim(), password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src={logoPolyglot} alt="The Polyglot" style={{ height: '120px', width: 'auto' }} />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isSignUp ? 'S\'inscrire' : 'Se connecter'}</h2>

          {error && <div className="error-message">{error}</div>}

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="fullName">Nom complet</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Chargement...' : (isSignUp ? 'S\'inscrire' : 'Se connecter')}
          </button>
        </form>

        <p className="toggle-text">
          {isSignUp ? 'Vous avez déjà un compte? ' : 'Pas encore de compte? '}
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setPassword('')
              setConfirmPassword('')
            }}
            disabled={loading}
          >
            {isSignUp ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </p>
      </div>
    </div>
  )
}
