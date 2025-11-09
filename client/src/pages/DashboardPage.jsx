import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function DashboardPage(){
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Bienvenido, {user?.username}</h2>
      <p>Rol: {user?.role}</p>
      {user?.role === 'admin' && (
        <p>
          <Link to="/admin">Ir al panel de administración</Link>
        </p>
      )}
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
