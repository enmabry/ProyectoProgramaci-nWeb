import { Routes, Route, Navigate } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminPage from './pages/AdminPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" thickness='4px' color='brand.500' />
      </Center>
    )
  }
  if (!user) return <Navigate to="/login" replace />;
  // Si el usuario es admin, redirigir al panel de administración
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }){
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" thickness='4px' color='brand.500' />
      </Center>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Ruta pública accesible por admins y clientes autenticados
function PublicAuthRoute({ children }){
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" thickness='4px' color='brand.500' />
      </Center>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/catalog" element={<PublicAuthRoute><CatalogPage /></PublicAuthRoute>} />
      <Route path="/product/:slug" element={<PublicAuthRoute><ProductDetailPage /></PublicAuthRoute>} />
      <Route path="/about" element={<PublicAuthRoute><AboutPage /></PublicAuthRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/forgot" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
    </Routes>
  )
}

function GuestRoute({ children }){
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" thickness='4px' color='brand.500' />
      </Center>
    )
  }
  if (user) {
    // Redirigir según el rol
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
  }
  return children
}
