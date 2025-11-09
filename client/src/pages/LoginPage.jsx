import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, Tabs, TabList, Tab, Heading, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, Link, Text, Image } from '@chakra-ui/react'
import logo from '../assets/images/logo.svg'
import fondoPanel from '../assets/images/FondoLogin.jpg'

export default function LoginPage(){
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('123456')
  const [showPass, setShowPass] = useState(false)
  const [username, setUsername] = useState('admin')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function validate(){
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return 'Email inválido'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (mode === 'register' && username.trim().length < 3) return 'Usuario mínimo 3 caracteres'
    return ''
  }

  async function onSubmit(e){
    e.preventDefault()
    const vErr = validate()
    if (vErr){ setError(vErr); return }
    setError('')
    const ok = mode === 'login'
      ? await login(email, password)
      : await register({ username, email, password })
    if (ok) navigate('/')
    else setError('Revisa tus datos e inténtalo nuevamente')
  }

  return (
    <Flex minH="100vh" bg="brand.50">
      {/* Lado izquierdo: formulario */}
      <Flex flex="1.1" align="center" justify="center" p={{ base: 6, md: 12 }} bg="white">
        <Box w="full" maxW="520px">
          <Image src={logo} alt="Logo" boxSize={{ base: '120px', md: '140px' }} mb={4} />
          <Tabs index={mode==='login'?0:1} onChange={(i)=>setMode(i===0?'login':'register')} variant="soft-rounded" colorScheme="brand" mb={4}>
            <TabList>
              <Tab>Iniciar Sesión</Tab>
              <Tab>Registrarse</Tab>
            </TabList>
          </Tabs>

          <Heading size="lg" mb={6} fontFamily="heading">Bienvenido de nuevo</Heading>

          <form onSubmit={onSubmit}>
            {mode==='register' && (
              <FormControl mb={4}>
                <FormLabel>Usuario</FormLabel>
                <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="tuusuario" borderRadius="full" />
              </FormControl>
            )}

            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu.email@ejemplo.com" borderRadius="full" />
            </FormControl>

            <FormControl mb={1}>
              <FormLabel>Contraseña</FormLabel>
              <InputGroup>
                <Input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="******" borderRadius="full" pr="4.5rem" />
                <InputRightElement width="4.5rem">
                  <Button size="sm" variant="ghost" colorScheme="brand" onClick={()=>setShowPass(s=>!s)}>
                    {showPass? 'Ocultar':'Mostrar'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Flex justify="flex-end" mb={3}>
              <Link fontSize="sm" color="brand.700">¿Olvidaste tu contraseña?</Link>
            </Flex>

            {error && <Text color="red.500" mb={3}>{error}</Text>}

            <Button type="submit" isLoading={loading} w="full" size="lg" variant="solid">
              {mode==='login' ? 'Iniciar Sesión' : 'Crear cuenta'}
            </Button>
          </form>
        </Box>
      </Flex>

      {/* Lado derecho: panel visual a pantalla completa */}
      <Flex
        flex="0.9"
        display={{ base:'none', md:'flex' }}
        align="center"
        justify="center"
        position="relative"
        bgImage={`url(${fondoPanel})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        <Box position="absolute" left="10" right="10" bottom="9" color="white" textShadow="0 1px 2px rgba(0,0,0,0.5)">
          <Text fontWeight="semibold">"“Llega a ser quien eres."</Text>
          <Text fontSize="sm" color="gray.200">— Nietzsche</Text>
        </Box>
      </Flex>
    </Flex>
  )
}
