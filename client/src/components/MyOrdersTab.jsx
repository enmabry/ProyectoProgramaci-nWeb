import React, { useState, useEffect } from 'react'
import { 
  VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalFooter, ModalCloseButton, Box, Text, Divider, useDisclosure, 
  Spinner, Center, useToast
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0)
  } catch {
    return `$${(value || 0).toLocaleString('es-CO')}`
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusColor(status) {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    shipped: 'Enviada',
    delivered: 'Entregada',
    cancelled: 'Cancelada'
  }
  return labels[status] || status
}

export default function MyOrdersTab() {
  const { user, token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    loadOrders()
  }, [user?.id, token])

  const loadOrders = async () => {
    if (!user?.id || !token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const query = `query {
        userOrders(userId: "${user.id}") {
          id
          total
          status
          createdAt
          items {
            productId
            productName
            quantity
            price
          }
          shippingAddress {
            fullName
            address
            city
            postalCode
            country
          }
        }
      }`

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })

      const data = await response.json()

      if (data.errors) {
        toast({
          title: 'Error',
          description: data.errors[0]?.message || 'No se pudieron cargar los pedidos',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setOrders([])
      } else {
        setOrders(data.data?.userOrders || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los pedidos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    onOpen()
  }

  if (!user?.id) {
    return (
      <Center py={10}>
        <Text>Debes iniciar sesión para ver tus pedidos</Text>
      </Center>
    )
  }

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="green.500" />
      </Center>
    )
  }

  if (orders.length === 0) {
    return (
      <Center py={10}>
        <Text>No tienes pedidos aún</Text>
      </Center>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID Pedido</Th>
              <Th>Fecha</Th>
              <Th>Total</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td fontSize="sm" fontFamily="mono">{order.id.substring(0, 8)}...</Td>
                <Td fontSize="sm">{formatDate(order.createdAt)}</Td>
                <Td fontWeight="bold">{formatCurrency(order.total)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </Td>
                <Td>
                  <Button size="sm" colorScheme="blue" onClick={() => handleViewDetails(order)}>
                    Ver detalles
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles del Pedido</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">ID DEL PEDIDO</Text>
                  <Text fontFamily="mono" fontSize="lg">{selectedOrder.id}</Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">ESTADO</Text>
                  <Badge colorScheme={getStatusColor(selectedOrder.status)} mt={2}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </Box>

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>FECHA</Text>
                  <Text fontSize="sm">{formatDate(selectedOrder.createdAt)}</Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>PRODUCTOS</Text>
                  <VStack spacing={2} align="stretch">
                    {selectedOrder.items?.map((item, idx) => (
                      <HStack key={idx} justify="space-between" fontSize="sm">
                        <Box flex={1}>
                          <Text fontWeight="500">{item.productName}</Text>
                          <Text color="gray.600">Cantidad: {item.quantity}</Text>
                        </Box>
                        <Text fontWeight="bold">{formatCurrency(item.price * item.quantity)}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={2}>DIRECCIÓN DE ENTREGA</Text>
                  <VStack spacing={1} align="start" fontSize="sm">
                    <Text>{selectedOrder.shippingAddress?.fullName}</Text>
                    <Text>{selectedOrder.shippingAddress?.address}</Text>
                    <Text>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</Text>
                    <Text>{selectedOrder.shippingAddress?.country}</Text>
                  </VStack>
                </Box>

                <Divider />

                <Box textAlign="right">
                  <HStack justify="flex-end" spacing={4}>
                    <VStack spacing={0} align="end">
                      <Text fontSize="sm" color="gray.600">Subtotal</Text>
                      <Text fontSize="sm" color="gray.600">Impuesto (19%)</Text>
                      <Text fontSize="sm" color="gray.600">Envío</Text>
                    </VStack>
                    <VStack spacing={0} align="end">
                      <Text fontSize="sm">{formatCurrency((selectedOrder.total * 0.9) / 1.19)}</Text>
                      <Text fontSize="sm">{formatCurrency((selectedOrder.total * 0.9) / 1.19 * 0.19)}</Text>
                      <Text fontSize="sm">$0</Text>
                    </VStack>
                  </HStack>
                  <Divider my={2} />
                  <HStack justify="flex-end" spacing={2}>
                    <Text fontWeight="bold" fontSize="lg">TOTAL:</Text>
                    <Text fontWeight="bold" fontSize="lg">{formatCurrency(selectedOrder.total)}</Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
