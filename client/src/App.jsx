import { Routes, Route, Navigate } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
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

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
    </Routes>
  )
}
