import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Grid, GridItem, VStack, HStack, Text, Input, Button, Avatar, Badge, Heading, Skeleton, IconButton, Flex
} from '@chakra-ui/react'
import { MdSend, MdCheckCircle } from 'react-icons/md'
import { useSocket } from '../context/SocketContext'

export default function ChatsTab({ token }) {
  const { socket, connected } = useSocket()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setChats(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando chats:', err)
    } finally {
      setLoading(false)
    }
  }

  // Escuchar nuevos mensajes
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = ({ chatId, message, user }) => {
      setChats(prev => prev.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
            lastMessage: new Date(),
            unreadCount: (chat.unreadCount || 0) + 1
          }
        }
        return chat
      }))

      // Si es el chat seleccionado, agregar mensaje
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }))
        scrollToBottom()
      }
    }

    const handleMessage = (message) => {
      if (selectedChat) {
        setSelectedChat(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }))
        scrollToBottom()
      }
    }

    socket.on('chat:newMessage', handleNewMessage)
    socket.on('chat:message', handleMessage)

    return () => {
      socket.off('chat:newMessage', handleNewMessage)
      socket.off('chat:message', handleMessage)
    }
  }, [socket, selectedChat])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom()
    }
  }, [selectedChat?.messages])

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat)
    
    // Marcar como leído
    if (chat.unreadCount > 0 && socket) {
      socket.emit('chat:markRead', chat._id)
      setChats(prev => prev.map(c => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      ))
    }
  }

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !connected || !selectedChat) return

    // Enviar indicando a qué chat (usuario) responde el admin
    socket.emit('chat:send', { chatId: selectedChat._id, content: inputValue.trim() })
    setInputValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Conversaciones de Soporte</Heading>
      
      <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={4} h="600px">
        {/* Lista de chats */}
        <GridItem>
          <Box bg="white" borderRadius="lg" boxShadow="sm" h="full" overflowY="auto">
            {loading ? (
              <VStack p={4} spacing={3}>
                {[1,2,3].map(i => <Skeleton key={i} h="60px" w="full" />)}
              </VStack>
            ) : chats.length === 0 ? (
              <Box p={6} textAlign="center">
                <Text color="gray.500" fontSize="sm">No hay conversaciones activas</Text>
              </Box>
            ) : (
              chats.map(chat => (
                <Box
                  key={chat._id}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  cursor="pointer"
                  bg={selectedChat?._id === chat._id ? 'brand.50' : 'white'}
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleSelectChat(chat)}
                >
                  <HStack justify="space-between" mb={1}>
                    <HStack spacing={2}>
                      <Avatar size="sm" name={chat.user?.username} bg="brand.500" />
                      <Text fontWeight="600" fontSize="sm">{chat.user?.username}</Text>
                    </HStack>
                    {chat.unreadCount > 0 && (
                      <Badge colorScheme="red" borderRadius="full">{chat.unreadCount}</Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                    {chat.messages[chat.messages.length - 1]?.content || 'Sin mensajes'}
                  </Text>
                </Box>
              ))
            )}
          </Box>
        </GridItem>

        {/* Área de mensajes */}
        <GridItem>
          <Box bg="white" borderRadius="lg" boxShadow="sm" h="full" display="flex" flexDir="column">
            {!selectedChat ? (
              <Flex align="center" justify="center" h="full">
                <Text color="gray.500">Selecciona una conversación</Text>
              </Flex>
            ) : (
              <>
                {/* Header del chat */}
                <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                  <HStack>
                    <Avatar size="sm" name={selectedChat.user?.username} bg="brand.500" />
                    <Box>
                      <Text fontWeight="600" fontSize="sm">{selectedChat.user?.username}</Text>
                      <Text fontSize="xs" color="gray.500">{selectedChat.user?.email}</Text>
                    </Box>
                  </HStack>
                </Box>

                {/* Mensajes */}
                <VStack
                  flex={1}
                  p={4}
                  spacing={3}
                  align="stretch"
                  overflowY="auto"
                  bg="gray.50"
                >
                  {selectedChat.messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </VStack>

                {/* Input */}
                <HStack p={3} borderTop="1px solid" borderColor="gray.200">
                  <Input
                    placeholder="Escribe tu respuesta..."
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
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  )
}

function MessageBubble({ message }) {
  const isAdmin = message.senderRole === 'admin'
  
  return (
    <Flex justify={isAdmin ? 'flex-end' : 'flex-start'}>
      <Box
        maxW="75%"
        bg={isAdmin ? 'brand.500' : 'white'}
        color={isAdmin ? 'white' : 'gray.800'}
        px={3}
        py={2}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Text fontSize="sm" fontWeight="600" mb={1} opacity={0.8}>
          {message.sender?.username || (isAdmin ? 'Admin' : 'Usuario')}
        </Text>
        <Text fontSize="sm">{message.content}</Text>
        <HStack spacing={2} mt={1}>
          <Text fontSize="xs" opacity={0.7}>
            {new Date(message.createdAt).toLocaleTimeString('es-CO', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          {message.read && isAdmin && (
            <MdCheckCircle size={12} />
          )}
        </HStack>
      </Box>
    </Flex>
  )
}
