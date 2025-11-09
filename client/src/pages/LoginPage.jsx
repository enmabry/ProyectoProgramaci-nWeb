import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Tabs, TabList, Tab, Heading, FormControl, FormLabel, FormErrorMessage, Input, InputGroup, InputRightElement, Button, Link, Text, Image, useToast } from '@chakra-ui/react'
import '../styles/login.css'
// Volver a usar el logo original del proyecto
import logo from '../assets/images/logo.svg'
import fondoPanel from '../assets/images/FondoLogin.jpg'

export default function LoginPage(){
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  // Mostrar toast de sesión expirada si venimos de un logout automático
  useEffect(() => {
    if (sessionStorage.getItem('expired')) {
      sessionStorage.removeItem('expired')
      toast({ title: 'Sesión expirada', description: 'Vuelve a iniciar sesión.', status: 'warning', duration: 3000, isClosable: true })
    }
  }, [])

  // estados de touched por campo para mostrar errores al interactuar
  const [tEmail, setTEmail] = useState(false)
  const [tPassword, setTPassword] = useState(false)
  const [tUsername, setTUsername] = useState(false)

  // Validaciones por campo
  const emailError = !email
    ? 'Email requerido'
    : (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '' : 'Email inválido')
  const passwordError = !password
    ? 'Contraseña requerida'
    : (mode === 'register'
        ? (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
            ? ''
            : 'Mín. 8, incluye mayúscula, minúscula y número')
        : (password.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres'))
  const usernameError = mode === 'register'
    ? (!username ? 'Usuario requerido' : (username.trim().length >= 3 ? '' : 'Usuario mínimo 3 caracteres'))
    : ''

  const isFormValid = mode === 'login'
    ? !emailError && !passwordError
    : !emailError && !passwordError && !usernameError

  async function onSubmit(e){
    e.preventDefault()
    if (!isFormValid){
      // marcar campos como tocados para mostrar errores
      setTEmail(true); setTPassword(true); if (mode === 'register') setTUsername(true)
      // mensaje general con el primer error
      const firstErr = usernameError || emailError || passwordError
      setError(firstErr)
      return
    }
    setError('')
    const result = mode === 'login'
      ? await login(email, password)
      : await register({ username, email, password })
    if (result.ok){
      toast({ title: mode==='login' ? 'Sesión iniciada' : 'Registro exitoso', status: 'success', duration: 2500, isClosable: true })
      navigate('/', { replace: true })
    } else {
      setError(result.error || 'Revisa tus datos e inténtalo nuevamente')
      toast({ title: 'Error', description: result.error, status: 'error', duration: 3000, isClosable: true })
    }
  }

  // Reset de touched/errores al cambiar de modo
  // Evita que queden errores de username cuando vuelves a login
  useEffect(() => {
    setTUsername(false)
    setError('')
  }, [mode])

  return (
    <Flex minH="100vh" bg="brand.50">
      {/* Lado izquierdo: formulario */}
      <Flex flex="1.1" flexDir="column" align="flex-start" justify="flex-start" className="login-left-panel" position="relative">
        {/* Cabecera centrada (logo + marca) */}
        <Box className="auth-container" mb={5}>
          <Flex className="brand-header">
            <Image src={logo} alt="Logo" className="brand-logo" />
            <Heading as="h1" fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} className="brand-title">
              A PRIORI • VERDE
            </Heading>
          </Flex>
        </Box>
        {/* Contenedor centrado del formulario (tarjeta) */}
        <Box className="auth-container">
          <Box className="auth-card">
            <Tabs index={mode==='login'?0:1} onChange={(i)=>setMode(i===0?'login':'register')} variant="soft-rounded" colorScheme="brand" mb={4}>
              <TabList>
                <Tab>Iniciar Sesión</Tab>
                <Tab>Registrarse</Tab>
              </TabList>
            </Tabs>
            <Heading size="lg" mb={5} fontFamily="heading" lineHeight="1.1">
              {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
            </Heading>

            <form onSubmit={onSubmit}>
              {mode==='register' && (
                <FormControl mb={4} isInvalid={tUsername && !!usernameError}>
                  <FormLabel>Usuario</FormLabel>
                  <Input value={username} onChange={e=>{ setUsername(e.target.value); if (!tUsername) return }} onBlur={()=>setTUsername(true)} placeholder="Tu usuario" borderRadius="full" />
                  <FormErrorMessage>{usernameError}</FormErrorMessage>
                </FormControl>
              )}

              <FormControl mb={5} isInvalid={tEmail && !!emailError}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={e=>{ setEmail(e.target.value) }} onBlur={()=>setTEmail(true)} placeholder="email@ejemplo.com" borderRadius="full" />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>

              <FormControl mb={4} isInvalid={tPassword && !!passwordError}>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input type={showPass?'text':'password'} value={password} onChange={e=>{ setPassword(e.target.value) }} onBlur={()=>setTPassword(true)} placeholder="******" borderRadius="full" pr="4.5rem" />
                  <InputRightElement width="4.5rem">
                    <Button size="sm" variant="ghost" colorScheme="brand" onClick={()=>setShowPass(s=>!s)}>
                      {showPass? 'Ocultar':'Mostrar'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{passwordError}</FormErrorMessage>
              </FormControl>
              <Flex justify="flex-end" mb={4}>
                <Link as={RouterLink} to="/forgot" fontSize="sm" color="brand.700">¿Olvidaste tu contraseña?</Link>
              </Flex>

              {error && <Text color="red.500" mb={4}>{error}</Text>}

              <Button type="submit" isLoading={loading} isDisabled={!isFormValid || loading} w="full" size="lg" variant="solid">
                {mode==='login' ? 'Iniciar Sesión' : 'Crear cuenta'}
              </Button>
            </form>
          </Box>
        </Box>
      </Flex>

      {/* Lado derecho: panel visual a pantalla completa */}
      <Flex
        flex="0.9"
        display={{ base:'none', md:'flex' }}
        align="center"
        justify="center"
        position="relative"
        bgImage={`linear-gradient(rgba(18,38,24,0.55), rgba(18,38,24,0.55)), url(${fondoPanel})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        <Box position="absolute" left="12" right="12" bottom="12" color="brand.50" textShadow="0 1px 3px rgba(0,0,0,0.6)">
          <Text fontWeight="semibold" fontSize={{ base: 'md', lg: 'lg' }}>“Llega a ser quien eres.”</Text>
          <Text fontSize="sm" color="brand.200">— Nietzsche</Text>
        </Box>
      </Flex>
    </Flex>
  )
}
