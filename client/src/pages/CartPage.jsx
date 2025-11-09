import React from 'react'
import { Box, Container, Heading, Text, Button, HStack, VStack, Image, Grid, GridItem, IconButton, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Divider, Flex } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { MdDelete, MdShoppingCart } from 'react-icons/md'
import NavbarGlass from '../components/NavbarGlass'
import { useCart } from '../context/CartContext'
import '../styles/cart.css'

function formatCurrency(value){
  try {
    return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(value || 0)
  } catch {
    return `$${(value||0).toLocaleString('es-CO')}`
  }
}

function CartItem({ item }){
  const { updateQuantity, removeFromCart } = useCart()
  
  return (
    <Grid templateColumns={{ base:'1fr', md:'100px 1fr 150px 150px 50px' }} gap={4} p={4} bg="white" borderRadius="lg" boxShadow="sm" alignItems="center">
      <Box className="cart-item__image">
        {item.images?.[0]?.url ? (
          <Image src={item.images[0].url} alt={item.name} borderRadius="md" objectFit="cover" w="100px" h="100px" />
        ) : (
          <Box w="100px" h="100px" bg="gray.200" borderRadius="md" />
        )}
      </Box>
      
      <VStack align="start" spacing={1}>
        <Text fontWeight="700" fontSize="md" as={Link} to={`/product/${item.slug}`} _hover={{ color:'brand.600', textDecoration:'underline' }}>
          {item.name}
        </Text>
        <Text fontSize="sm" color="gray.600">{item.shortDesc || ''}</Text>
        <Text fontSize="xs" color="gray.500">Stock disponible: {item.stock}</Text>
      </VStack>

      <Box>
        <Text fontSize="xs" color="gray.600" mb={1}>Cantidad</Text>
        <NumberInput 
          size="sm" 
          maxW={24} 
          min={1} 
          max={item.stock} 
          value={item.quantity} 
          onChange={(val)=>updateQuantity(item._id, parseInt(val)||1)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Box>

      <VStack align="end" spacing={0}>
        <Text fontSize="sm" color="gray.500">Precio unitario</Text>
        <Text fontSize="md" fontWeight="600">{formatCurrency(item.price)}</Text>
        <Text fontSize="xs" color="gray.500" mt={1}>Subtotal</Text>
        <Text fontSize="lg" fontWeight="700" color="brand.700">{formatCurrency(item.price * item.quantity)}</Text>
      </VStack>

      <IconButton 
        aria-label="Eliminar del carrito" 
        icon={<MdDelete />} 
        colorScheme="red" 
        variant="ghost" 
        size="sm"
        onClick={()=>removeFromCart(item._id)}
      />
    </Grid>
  )
}

export default function CartPage(){
  const { items, clearCart, total, itemCount } = useCart()
  const navigate = useNavigate()

  if(items.length === 0){
    return (
      <Box>
        <NavbarGlass />
        <Box pt={{ base: '120px', md: '130px' }} pb={10}>
          <Container maxW="7xl">
            <Heading size="lg" mb={6}>Carrito de Compras</Heading>
            <VStack spacing={6} py={10} textAlign="center">
              <MdShoppingCart size={80} color="#cbd5e0" />
              <Heading size="md" color="gray.600">Tu carrito está vacío</Heading>
              <Text color="gray.500">Explora nuestro catálogo y añade tus plantas favoritas</Text>
              <Button as={Link} to="/catalog" colorScheme="brand" size="lg">Ver catálogo</Button>
            </VStack>
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <NavbarGlass />
      <Box pt={{ base: '120px', md: '130px' }} pb={10} className="cart-wrapper">
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="lg">Carrito de Compras</Heading>
            <Button variant="ghost" size="sm" colorScheme="red" onClick={clearCart}>Vaciar carrito</Button>
          </Flex>

          <Grid templateColumns={{ base:'1fr', lg:'2fr 1fr' }} gap={8}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">{itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito</Text>
              {items.map(item => <CartItem key={item._id} item={item} />)}
            </VStack>

            {/* Resumen */}
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md" h="fit-content" position="sticky" top="140px">
              <Heading size="md" mb={4}>Resumen del pedido</Heading>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.600">Subtotal ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})</Text>
                  <Text fontSize="sm" fontWeight="600">{formatCurrency(total)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.600">Envío</Text>
                  <Text fontSize="sm" fontWeight="600" color="green.600">Gratis</Text>
                </Flex>
                <Divider />
                <Flex justify="space-between">
                  <Text fontSize="lg" fontWeight="700">Total</Text>
                  <Text fontSize="xl" fontWeight="700" color="brand.700">{formatCurrency(total)}</Text>
                </Flex>
                <Button colorScheme="brand" size="lg" w="full" mt={4}>
                  Proceder al pago
                </Button>
                <Button as={Link} to="/catalog" variant="outline" colorScheme="brand" size="md" w="full">
                  Seguir comprando
                </Button>
              </VStack>
            </Box>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
