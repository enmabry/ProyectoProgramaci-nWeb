import React from 'react'
import { Box, Container, Flex, HStack, Heading, Button, Text, Menu, MenuButton, MenuList, MenuItem, Avatar, IconButton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

function CartIcon(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4h-2l-1 2m0 0l3 9h10l3-7H6m-2 0H3" stroke="#255336" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="20" r="1.5" fill="#255336"/>
      <circle cx="17" cy="20" r="1.5" fill="#255336"/>
    </svg>
  )
}

export default function NavbarGlass(){
  const { user, logout } = useAuth()
  return (
    <Box as="header" position="fixed" top={4} left={0} right={0} zIndex={20}>
      <Container maxW="7xl">
        <Flex align="center" className="nav-glass">
          <HStack spacing={2} flex={1}>
            <Link to="/" className="brand-link" aria-label="Ir al dashboard">
              <Heading size="sm" color="brand.700">A PRIORI • VERDE</Heading>
            </Link>
          </HStack>
          <HStack spacing={6} display={{ base:'none', md:'flex' }}>
            <Link className="nav-link" to="/catalog">Tienda</Link>
            <Link className="nav-link" to="#">Sobre Nosotros</Link>
            <Link className="nav-link" to="#">Contacto</Link>
          </HStack>
          <HStack spacing={3} flex={1} justify="flex-end">
            <IconButton aria-label="Carrito" className="icon-glass" icon={<CartIcon />} variant="ghost" size="sm" />
            <Menu>
              <MenuButton as={Button} variant="ghost" className="user-menu-btn" aria-label="Menú de usuario">
                <Avatar name={user?.username} size="sm" bg="brand.500" color="white" fontWeight={700} />
              </MenuButton>
              <MenuList>
                <Box px={3} pt={2} pb={1}>
                  <Text fontSize="sm" fontWeight="semibold">{user?.username}</Text>
                  <Text fontSize="xs" color="gray.500">{user?.role}</Text>
                </Box>
                <MenuItem as={Link} to="#">Perfil</MenuItem>
                <MenuItem onClick={logout}>Salir</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
