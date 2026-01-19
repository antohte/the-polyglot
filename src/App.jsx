import { Routes, Route } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home.jsx'
import Forum from './pages/Forum.jsx'
import Header from './components/Header.jsx'
import Category from './pages/Category.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Events from './pages/Events.jsx'
import Friends from './pages/Friends.jsx'
import UserProfile from './pages/UserProfile.jsx'

// Admin Components
import AdminRoute from './components/AdminRoute.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminPosts from './pages/admin/AdminPosts.jsx'
import AdminEvents from './pages/admin/AdminEvents.jsx'
import AdminPolls from './pages/admin/AdminPolls.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
import AdminModeration from './pages/admin/AdminModeration.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <ToastProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Home />} />
          <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:slug" element={<Category />} />
        <Route path="/events" element={<Events />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/post/:postId" element={<PostDetail />} />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="polls" element={<AdminPolls />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>
      </Routes>
      </div>
    </ToastProvider>
  )
}