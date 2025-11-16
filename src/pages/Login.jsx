import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../styles/Login.css'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInEmail, signUpEmail, signInGoogle } = useAuth()
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

        // Créer le compte
        await signUpEmail(email, password)
        navigate('/') // Rediriger vers la page d'accueil
      } else {
        // Se connecter
        await signInEmail(email, password)
        navigate('/') // Rediriger vers la page d'accueil
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé')
      } else if (err.code === 'auth/invalid-email') {
        setError('Email invalide')
      } else if (err.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect')
      } else if (err.code === 'auth/user-not-found') {
        setError('Utilisateur non trouvé')
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erreur avec Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="logo-login">THE<br/>Polyglot</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isSignUp ? 'S\'inscrire' : 'Se connecter'}</h2>

          {error && <div className="error-message">{error}</div>}

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

        <div className="divider">OU</div>

        <button
          onClick={handleGoogleSignIn}
          className="btn btn-google"
          disabled={loading}
        >
          {loading ? 'Chargement...' : '🔐 Continuer avec Google'}
        </button>

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
