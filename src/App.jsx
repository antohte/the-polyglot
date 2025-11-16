import { Routes, Route } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Home from './pages/Home.jsx'
import Forum from './pages/Forum.jsx'
import Header from './components/Header.jsx'
import Category from './pages/Category.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import PostDetail from './pages/PostDetail.jsx'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:slug" element={<Category />} />
        <Route path="/post/:postId" element={<PostDetail />} />
      </Routes>
    </div>
  )
}