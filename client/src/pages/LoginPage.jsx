import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const ok = await login(email, password)
    if (ok) navigate('/')
    else setError('Credenciales inválidas')
  }

  return (
    <div style={{ maxWidth: 360, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="email" style={{width:'100%',padding:8,margin:'8px 0'}}/>
        <label>Contraseña</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="******" style={{width:'100%',padding:8,margin:'8px 0'}}/>
        {error && <div style={{ color:'crimson', marginBottom:8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{width:'100%',padding:10}}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
