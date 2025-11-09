import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signInGoogle = () => signInWithPopup(auth, googleProvider)
  const signInEmail = (email, pass) => signInWithEmailAndPassword(auth, email, pass)
  const signUpEmail = (email, pass) => createUserWithEmailAndPassword(auth, email, pass)
  const logout = () => signOut(auth)

  return (
    <AuthCtx.Provider value={{ user, loading, signInGoogle, signInEmail, signUpEmail, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}