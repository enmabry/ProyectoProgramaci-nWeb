import React, { useState, useEffect, useRef } from 'react'
import {
  Box, IconButton, VStack, HStack, Text, Input, Button, Avatar, Badge, Flex, Heading, CloseButton
} from '@chakra-ui/react'
import { MdChat, MdSend, MdClose } from 'react-icons/md'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

export default function ChatWidget() {
  const { socket, connected } = useSocket()
  const { user, token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const [loading, setLoading] = useState(false)

  // Cargar historial de mensajes al abrir
  useEffect(() => {
    if (isOpen && token) {
      loadChatHistory()
    }
  }, [isOpen, token])

  const loadChatHistory = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/chats/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        // Contar mensajes no leídos del admin
        const unread = data.messages.filter(m => m.senderRole === 'admin' && !m.read).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error('Error cargando historial:', err)
    } finally {
      setLoading(false)
    }
  }

  // Escuchar mensajes del socket
  useEffect(() => {
    if (!socket) return

    const handleMessage = (message) => {
      setMessages(prev => [...prev, message])
      
      // Si el widget está cerrado y es mensaje del admin, incrementar contador
      if (!isOpen && message.senderRole === 'admin') {
        setUnreadCount(prev => prev + 1)
      }
      
      scrollToBottom()
    }

    socket.on('chat:message', handleMessage)

    return () => {
      socket.off('chat:message', handleMessage)
    }
  }, [socket, isOpen])

  // Auto-scroll al final
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0) // Reset contador al abrir
    }
  }, [messages, isOpen])

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !connected) return

    socket.emit('chat:send', { content: inputValue.trim() })
    setInputValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Solo mostrar para usuarios normales (no admin)
  if (!user || user.role === 'admin') return null

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <Box
          position="fixed"
          bottom={6}
          right={6}
          zIndex={1000}
        >
          <IconButton
            icon={<MdChat />}
            colorScheme="brand"
            size="lg"
            borderRadius="full"
            boxShadow="lg"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir chat"
            w="60px"
            h="60px"
            fontSize="28px"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="24px"
              h="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <Box
          position="fixed"
          bottom={6}
          right={6}
          w={{ base: '90vw', md: '400px' }}
          h="600px"
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          display="flex"
          flexDirection="column"
          zIndex={1000}
          overflow="hidden"
        >
          {/* Header */}
          <Flex
            bg="brand.500"
            color="white"
            p={4}
            align="center"
            justify="space-between"
          >
            <HStack spacing={3}>
              <Avatar size="sm" name="Soporte" bg="brand.700" />
              <Box>
                <Heading size="sm">Soporte A Priori Verde</Heading>
                <Text fontSize="xs" opacity={0.9}>
                  {connected ? '🟢 En línea' : '🔴 Desconectado'}
                </Text>
              </Box>
            </HStack>
            <IconButton
              icon={<MdClose />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            />
          </Flex>

          {/* Mensajes */}
          <VStack
            flex={1}
            p={4}
            spacing={3}
            align="stretch"
            overflowY="auto"
            bg="gray.50"
          >
            {loading ? (
              <Text fontSize="sm" color="gray.500" textAlign="center">Cargando mensajes...</Text>
            ) : messages.length === 0 ? (
              <Text fontSize="sm" color="gray.500" textAlign="center" mt={10}>
                ¡Hola! 👋 ¿En qué podemos ayudarte?
              </Text>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} isOwn={msg.senderRole === 'user'} />
              ))
            )}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Input */}
          <HStack p={3} bg="white" borderTop="1px solid" borderColor="gray.200">
            <Input
              placeholder="Escribe tu mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size="md"
              disabled={!connected}
            />
            <IconButton
              icon={<MdSend />}
              colorScheme="brand"
              onClick={handleSend}
              isDisabled={!inputValue.trim() || !connected}
              aria-label="Enviar mensaje"
            />
          </HStack>
        </Box>
      )}
    </>
  )
}

function MessageBubble({ message, isOwn }) {
  return (
    <Flex justify={isOwn ? 'flex-end' : 'flex-start'}>
      <Box
        maxW="75%"
        bg={isOwn ? 'brand.500' : 'white'}
        color={isOwn ? 'white' : 'gray.800'}
        px={3}
        py={2}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Text fontSize="sm">{message.content}</Text>
        <Text fontSize="xs" opacity={0.7} mt={1}>
          {new Date(message.createdAt).toLocaleTimeString('es-CO', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </Box>
    </Flex>
  )
}
