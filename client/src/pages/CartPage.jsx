import React, { useState } from 'react'
import { Box, Container, Heading, Text, Button, HStack, VStack, Image, Grid, GridItem, IconButton, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Divider, Flex, useToast, FormControl, FormLabel, Input, Select, useDisclosure } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { MdDelete, MdShoppingCart } from 'react-icons/md'
import NavbarGlass from '../components/NavbarGlass'
import PaymentModal from '../components/PaymentModal'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
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
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [processingPayment, setProcessingPayment] = React.useState(false)

  // Estado formulario de envío
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.username || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Colombia'
  })

  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = () => {
    // Validar autenticación
    if (!user || !token) {
      toast({
        title: 'Error',
        description: 'Debes estar autenticado para realizar una compra',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      navigate('/login')
      return
    }

    // Validar formulario de envío
    if (!shippingForm.fullName || !shippingForm.phone || !shippingForm.address || !shippingForm.city || !shippingForm.postalCode) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos de envío',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    // Si todo es válido, abrir el modal de pago
    onOpen()
  }

  const handlePaymentConfirm = async (cardData) => {
    try {
      setProcessingPayment(true)
      
      // Construir mutation GraphQL
      const itemsInput = items.map(item => 
        `{productId: "${item._id}", quantity: ${item.quantity}}`
      ).join(',')

      const shippingInput = `{
        fullName: "${shippingForm.fullName.replace(/"/g, '\\"')}", 
        phone: "${shippingForm.phone}", 
        address: "${shippingForm.address.replace(/"/g, '\\"')}", 
        city: "${shippingForm.city}", 
        postalCode: "${shippingForm.postalCode}", 
        country: "${shippingForm.country}"
      }`

      const mutation = `mutation {
        createOrder(
          items: [${itemsInput}],
          shippingAddress: ${shippingInput},
          paymentMethod: "credit_card",
          notes: "Tarjeta: ${cardData.cardType.toUpperCase()} •••• ${cardData.cardNumber.slice(-4)}"
        ) {
          id
          total
          status
        }
      }`

      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: mutation })
      })

      if (!res.ok) throw new Error('Error en la petición')
      
      const data = await res.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      const order = data.data.createOrder
      
      toast({
        title: '¡Orden creada exitosamente!',
        description: `Orden #${order.id.substring(0, 8)}... por ${formatCurrency(order.total)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })

      // Cerrar modal, limpiar carrito y redirigir
      onClose()
      clearCart()
      navigate('/profile')
    } catch (err) {
      toast({
        title: 'Error al crear la orden',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })
    } finally {
      setProcessingPayment(false)
    }
  }

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
            {/* Productos y Formulario */}
            <VStack spacing={6} align="stretch">
              {/* Productos */}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={3}>{itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito</Text>
                <VStack spacing={4}>
                  {items.map(item => <CartItem key={item._id} item={item} />)}
                </VStack>
              </Box>

              <Divider />

              {/* Formulario de envío */}
              <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
                <Heading size="md" mb={4}>Dirección de envío</Heading>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Nombre completo</FormLabel>
                    <Input 
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      placeholder="Juan Pérez"
                      size="sm"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Teléfono</FormLabel>
                    <Input 
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      placeholder="+57 301 234 5678"
                      size="sm"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Dirección</FormLabel>
                    <Input 
                      name="address"
                      value={shippingForm.address}
                      onChange={handleShippingChange}
                      placeholder="Cra. 5 # 10-50, Apartamento 501"
                      size="sm"
                    />
                  </FormControl>

                  <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                    <FormControl>
                      <FormLabel fontSize="sm">Ciudad</FormLabel>
                      <Input 
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        placeholder="Bogotá"
                        size="sm"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Código postal</FormLabel>
                      <Input 
                        name="postalCode"
                        value={shippingForm.postalCode}
                        onChange={handleShippingChange}
                        placeholder="110221"
                        size="sm"
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel fontSize="sm">País</FormLabel>
                    <Select 
                      name="country"
                      value={shippingForm.country}
                      onChange={handleShippingChange}
                      size="sm"
                    >
                      <option value="Colombia">Colombia</option>
                      <option value="Otro">Otro país</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>
            </VStack>

            {/* Resumen */}
            <Box className="cart-summary">
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
                <Button 
                  colorScheme="brand" 
                  size="lg" 
                  w="full" 
                  mt={4}
                  onClick={handleCheckout}
                  isLoading={processingPayment}
                  loadingText="Creando orden..."
                >
                  Finalizar compra
                </Button>
                <Button as={Link} to="/catalog" variant="outline" colorScheme="brand" size="md" w="full">
                  Seguir comprando
                </Button>
              </VStack>
            </Box>
          </Grid>
        </Container>

        {/* Modal de Pago */}
        <PaymentModal 
          isOpen={isOpen} 
          onClose={onClose} 
          total={total} 
          onConfirm={handlePaymentConfirm}
          isLoading={processingPayment}
        />
      </Box>
    </Box>
  )
}
