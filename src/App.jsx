import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Forum from './pages/Forum.jsx'
import Header from './components/Header.jsx'
import Category from './pages/Category.jsx'


export default function App() {
return (
<div className="app">
<Header />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/forum" element={<Forum />} />
<Route path="/forum/:slug" element={<Category />} />
</Routes>
</div>
)
}