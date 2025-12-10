import React, { useEffect, useState } from 'react'
import { Box, Container, Flex, HStack, VStack, Text, Heading, Button, Image, SimpleGrid, Input, InputGroup, InputLeftElement, Skeleton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroImage from '../assets/images/fondoDashboard.jpg'
import '../styles/dashboard.css'
import NavbarGlass from '../components/NavbarGlass'

function formatCurrency(value){
  try {
    return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(value || 0)
  } catch {
    return `$${(value||0).toLocaleString('es-CO')}`
  }
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


function ProductCard({ product }){
  return (
    <Box 
      as={Link} 
      to={`/product/${product.slug}`} 
      className="product-card" 
      overflow="hidden"
    >
      <Box className="product-card__media">
        {product?.images?.[0]?.url ? (
          <Image src={product.images[0].url} alt={product.name} className="product-card__img" />
        ) : (
          <Box className="product-card__img product-card__img--placeholder" />
        )}
      </Box>
      <Box className="product-card__body">
        <Text className="product-card__title" noOfLines={1}>{product?.name || 'Planta'}</Text>
        <Text className="product-card__price">{product?.price != null ? formatCurrency(product.price) : '—'}</Text>
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
      .then(d => { if (mounted) { setItems(Array.isArray(d) ? d.slice(0,4) : []); setLoading(false) } })
      .catch(() => { if (mounted) { setItems([]); setLoading(false) } })
    return () => { mounted = false }
  }, [])
  return (
    <Container maxW="7xl" py={10}>
      <Heading size="md" mb={4}>Novedades</Heading>
      <SimpleGrid columns={{ base:2, md:4 }} spacing={5}>
        {loading ? Array.from({ length: 4 }).map((_,i)=> (
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
    { key:'Interior', label:'Plantas de Interior' },
    { key:'Suculentas', label:'Suculentas y Cactus' },
    { key:'Tropical', label:'Plantas Tropicales' },
    { key:'Medicinal', label:'Plantas Medicinales' }
  ]
  return (
    <Container maxW="7xl" py={10}>
      <Heading size="md" mb={4}>Explora nuestras categorías</Heading>
      <SimpleGrid columns={{ base:1, md:4 }} spacing={5}>
        {cats.map(c => (
          <Box key={c.key} as={Link} to={`/catalog?category=${encodeURIComponent(c.key)}`} className="category-card">
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
