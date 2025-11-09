import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Heading, FormControl, FormLabel, FormErrorMessage, Input, Button, Text, Link, useToast } from '@chakra-ui/react'
import '../styles/login.css'

export default function ForgotPasswordPage(){
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const emailError = !email
    ? 'Email requerido'
    : (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '' : 'Email inválido')
  const isValid = !emailError

  async function onSubmit(e){
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    setSubmitting(true)
    setError('')
    try{
      const res = await fetch('/api/auth/forgot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'No se pudo solicitar el reset')
      toast({ title: 'Hemos enviado instrucciones', description: 'Si el correo existe recibirás un enlace.', status: 'success', duration: 3000, isClosable: true })
      // En modo desarrollo ya no redirigimos automáticamente porque el correo contiene el enlace
    }catch(err){
      setError(err.message)
      toast({ title: 'Error', description: err.message, status: 'error', duration: 3000, isClosable: true })
    }finally{ setSubmitting(false) }
  }

  return (
    <Flex minH="100vh" bg="brand.50" align="center" justify="center">
      <Box className="auth-container">
        <Box className="auth-card">
          <Heading size="lg" mb={5}>Recuperar contraseña</Heading>
          <Text mb={4} color="gray.600">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</Text>
          <form onSubmit={onSubmit}>
            <FormControl mb={5} isInvalid={touched && !!emailError}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} onBlur={()=>setTouched(true)} placeholder="email@ejemplo.com" borderRadius="full"/>
              <FormErrorMessage>{emailError}</FormErrorMessage>
            </FormControl>
            {error && <Text color="red.500" mb={4}>{error}</Text>}
            <Button type="submit" isLoading={submitting} isDisabled={!isValid || submitting} w="full" size="lg">Enviar enlace</Button>
          </form>
          <Flex mt={4} justify="center">
            <Link as={RouterLink} to="/login" color="brand.700">Volver a iniciar sesión</Link>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
