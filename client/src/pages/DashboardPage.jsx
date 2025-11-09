import { useAuth } from '../context/AuthContext'

export default function DashboardPage(){
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Bienvenido, {user?.username}</h2>
      <p>Rol: {user?.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
