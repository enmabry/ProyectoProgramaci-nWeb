import React, { useEffect, useState } from 'react'
import { Box, Container, Flex, HStack, VStack, Text, Heading, Button, Image, SimpleGrid, Input, InputGroup, InputLeftElement, Skeleton, Menu, MenuButton, MenuList, MenuItem, Avatar, IconButton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroImage from '../assets/images/fondoDashboard.jpg'
import '../styles/dashboard.css'

function NavbarGlass(){
  const { user, logout } = useAuth()
  return (
    <Box as="header" position="fixed" top={4} left={0} right={0} zIndex={20}>
      <Container maxW="7xl">
        <Flex align="center" className="nav-glass">
          <HStack spacing={2} flex={1}>
            <Heading size="sm" color="brand.700">A PRIORI • VERDE</Heading>
          </HStack>
          <HStack spacing={6} display={{ base:'none', md:'flex' }}>
            <Link className="nav-link" to="#">Tienda</Link>
            <Link className="nav-link" to="#">Sobre Nosotros</Link>
            <Link className="nav-link" to="#">Contacto</Link>
          </HStack>
          <HStack spacing={3} flex={1} justify="flex-end">
            <IconButton
              aria-label="Carrito"
              className="icon-glass"
              icon={<CartIcon />}
              variant="ghost"
              size="sm"
            />
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

function Hero(){
  return (
    <Box as="section" className="hero-section" style={{ ['--hero-bg']:`url(${HeroImage})` }}>
      <Container maxW="7xl">
           <VStack spacing={7} align="center" textAlign="center">
             <Heading as="h1" className="hero-title">Orden, luz y savia</Heading>
             <Text as="p" className="hero-quote">
               “Creemos que el gusto por lo vivo se cultiva. Por eso diseñamos principios claros —luz, riego, sustrato y forma— para que tu hogar reconozca la belleza del verde casi… <span className="hero-quote-em">a priori</span>.”
             </Text>
          <InputGroup maxW="lg" className="hero-search-group">
            <Input placeholder="¿Qué planta buscas?" className="hero-search" />
          </InputGroup>
          <Button size="lg" variant="solid" as={Link} to="/catalog">Ver catálogo</Button>
        </VStack>
      </Container>
    </Box>
  )
}

function CartIcon(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4h-2l-1 2m0 0l3 9h10l3-7H6m-2 0H3" stroke="#255336" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="20" r="1.5" fill="#255336"/>
      <circle cx="17" cy="20" r="1.5" fill="#255336"/>
    </svg>
  )
}

function ProductCard({ product }){
  return (
    <Box className="product-card" overflow="hidden">
      <Box className="product-card__media">
        {product?.images?.[0]?.url ? (
          <Image src={product.images[0].url} alt={product.name} className="product-card__img" />
        ) : (
          <Box className="product-card__img product-card__img--placeholder" />
        )}
      </Box>
      <Box className="product-card__body">
        <Text className="product-card__title" noOfLines={1}>{product?.name || 'Planta'}</Text>
        <Text className="product-card__price">{product?.price ? `€${product.price.toFixed(2)}` : '—'}</Text>
        <Button mt={3} size="sm" w="full">Añadir al carrito</Button>
      </Box>
    </Box>
  )
}

function NewProducts(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    fetch('/api/products?sort=newest')
      .then(r => r.json())
      .then(d => { if (mounted) { setItems(Array.isArray(d) ? d.slice(0,8) : []); setLoading(false) } })
      .catch(() => { if (mounted) { setItems([]); setLoading(false) } })
    return () => { mounted = false }
  }, [])
  return (
    <Container maxW="7xl" py={10}>
      <Heading size="md" mb={4}>Novedades</Heading>
      <SimpleGrid columns={{ base:2, md:4 }} spacing={5}>
        {loading ? Array.from({ length: 8 }).map((_,i)=> (
          <Box key={i}>
            <Skeleton h="210px" borderRadius="lg" />
            <Skeleton mt={3} h="18px" />
            <Skeleton mt={2} h="14px" w="40%" />
            <Skeleton mt={3} h="32px" borderRadius="full" />
          </Box>
        )) : items.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </SimpleGrid>
    </Container>
  )
}

function Categories(){
  const cats = [
    { key:'interior', label:'Plantas de Interior' },
    { key:'exterior', label:'Plantas de Exterior' },
    { key:'suculentas', label:'Suculentas y Cactus' },
    { key:'aromaticas', label:'Plantas Aromáticas' }
  ]
  return (
    <Container maxW="7xl" py={10}>
      <Heading size="md" mb={4}>Explora nuestras categorías</Heading>
      <SimpleGrid columns={{ base:1, md:4 }} spacing={5}>
        {cats.map(c => (
          <Box key={c.key} className="category-card">
            <Box className="category-card__overlay" />
            <Flex className="category-card__content" align="center" justify="center">
              <Heading size="sm" className="category-card__title">{c.label}</Heading>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  )
}

function Features(){
  const feats = [
    { title:'Envíos Rápidos y Seguros', desc:'Recibe tus plantas en perfecto estado con nuestro empaque especializado.' },
    { title:'Soporte Experto', desc:'Te ayudamos a elegir y cuidar tus plantas con consejos prácticos.' },
    { title:'Garantía de Calidad', desc:'Si tu planta no llega sana y feliz, te la cambiamos.' }
  ]
  return (
    <Box className="features-section">
      <Container maxW="7xl">
        <SimpleGrid columns={{ base:1, md:3 }} spacing={6}>
          {feats.map((f,i)=> (
              <HStack key={i} className="feature-card" align="flex-start">
              <Box className="feature-card__icon">🌿</Box>
              <Box>
                <Text className="feature-card__title">{f.title}</Text>
                <Text className="feature-card__desc">{f.desc}</Text>
              </Box>
            </HStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default function DashboardPage(){
  return (
    <Box>
      <NavbarGlass />
      <Hero />
      <NewProducts />
      <Categories />
      <Features />
    </Box>
  )
}
