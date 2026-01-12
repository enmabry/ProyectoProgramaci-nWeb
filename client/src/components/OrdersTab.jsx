import React, { useState, useEffect } from 'react'
import { Box, Heading, Text, Button, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Skeleton, useToast, useDisclosure, Select, VStack } from '@chakra-ui/react'
import { MdVisibility, MdEdit } from 'react-icons/md'
import ConfirmDialog from './ConfirmDialog'

const GRAPHQL_ENDPOINT = '/graphql'

export default function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [viewingOrderId, setViewingOrderId] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const confirmDisc = useDisclosure()
  const toast = useToast()

  const fetchOrders = async (status = '') => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const query = status 
        ? `query { orders(status: "${status}") { id userId items { productId productName quantity price subtotal } subtotal tax shippingCost total status createdAt } }`
        : `query { orders { id userId items { productId productName quantity price subtotal } subtotal tax shippingCost total status createdAt } }`

      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if(!res.ok) throw new Error('Error al cargar pedidos')
      
      const data = await res.json()
      if(data.errors) {
        throw new Error(data.errors[0].message)
      }
      
      setOrders(data.data.orders || [])
    } catch(err){
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchOrders(statusFilter)
  },[statusFilter])

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setViewingOrderId(order.id)
    onOpen()
  }

  const handleOpenUpdateStatus = (order) => {
    setSelectedOrder(order)
    setUpdatingOrderId(order.id)
    setNewStatus(order.status)
    confirmDisc.onOpen()
  }

  const handleUpdateStatus = async () => {
    if(!updatingOrderId || !newStatus) return
    
    try {
      const token = localStorage.getItem('token')
      const mutation = `mutation { 
        updateOrderStatus(id: "${updatingOrderId}", status: "${newStatus}") { 
          id status 
        } 
      }`

      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: mutation })
      })

      if(!res.ok) throw new Error('Error al actualizar estado')
      
      const data = await res.json()
      if(data.errors) {
        throw new Error(data.errors[0].message)
      }

      toast({
        title: 'Estado actualizado',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      
      setUpdatingOrderId(null)
      setNewStatus('')
      confirmDisc.onClose()
      fetchOrders(statusFilter)
      onClose()
    } catch(err){
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'shipped': 'purple',
      'delivered': 'green',
      'cancelled': 'red'
    }
    return colors[status] || 'gray'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En curso',
      'confirmed': 'Confirmado',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    }
    return labels[status] || status
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="md" mb={1}>Gestión de Pedidos</Heading>
          <Text fontSize="sm" color="gray.600">Administra los pedidos del sistema ({orders.length} pedidos)</Text>
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="600" mb={2}>Filtrar por estado:</Text>
          <Select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            maxW="200px"
          >
            <option value="">Todos los estados</option>
            <option value="pending">En curso</option>
            <option value="confirmed">Confirmado</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
        </Box>
      </HStack>
      
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto" className="admin-table-container">
        {loading ? (
          <Box p={6}>
            {Array.from({length:5}).map((_,i)=>(
              <Skeleton key={i} h="60px" mb={3} />
            ))}
          </Box>
        ) : orders.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text color="gray.500">No hay pedidos {statusFilter ? `con estado "${getStatusLabel(statusFilter)}"` : 'aún'}</Text>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>ID Pedido</Th>
                <Th>Usuario ID</Th>
                <Th>Total</Th>
                <Th>Estado</Th>
                <Th>Fecha</Th>
                <Th textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map(order => (
                <Tr key={order.id} className="admin-table-row">
                  <Td>
                    <Text fontWeight="600" fontSize="sm">{order.id.substring(0, 8)}...</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{order.userId.substring(0, 8)}...</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="600">${order.total.toFixed(2)}</Text>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={getStatusColor(order.status)}
                      fontSize="xs"
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="xs" color="gray.600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO') : '—'}
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        aria-label="Ver detalles"
                        icon={<MdVisibility />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleViewDetails(order)}
                      />
                      <IconButton
                        aria-label="Cambiar estado"
                        icon={<MdEdit />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={() => handleOpenUpdateStatus(order)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal para ver detalles del pedido */}
      {isOpen && selectedOrder && (
        <Box 
          position="fixed" 
          inset={0} 
          bg="rgba(0,0,0,0.5)" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          zIndex={1000}
          onClick={onClose}
        >
          <Box 
            bg="white" 
            borderRadius="lg" 
            p={6} 
            maxW="600px" 
            w="90%"
            maxH="80vh"
            overflowY="auto"
            onClick={e => e.stopPropagation()}
          >
            <Heading size="md" mb={4}>Detalles del Pedido</Heading>
            
            <VStack align="start" spacing={4} mb={6}>
              <Box w="100%">
                <Text fontSize="sm" color="gray.600">ID del Pedido</Text>
                <Text fontSize="sm" fontWeight="600">{selectedOrder.id}</Text>
              </Box>

              <Box w="100%">
                <Text fontSize="sm" color="gray.600">ID del Usuario</Text>
                <Text fontSize="sm" fontWeight="600">{selectedOrder.userId}</Text>
              </Box>

              <Box w="100%">
                <Text fontSize="sm" color="gray.600">Estado</Text>
                <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </Box>

              <Box w="100%">
                <Text fontSize="sm" color="gray.600">Fecha</Text>
                <Text fontSize="sm" fontWeight="600">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('es-CO') : '—'}</Text>
              </Box>

              <Box w="100%" borderTop="1px solid #e2e8f0" pt={4}>
                <Text fontSize="sm" color="gray.600" mb={3} fontWeight="600">Productos ({selectedOrder.items.length})</Text>
                <VStack align="start" spacing={3}>
                  {selectedOrder.items.map((item, idx) => (
                    <Box key={idx} w="100%" p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600">{item.productName}</Text>
                        <Text fontSize="sm">${item.subtotal.toFixed(2)}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box w="100%" borderTop="1px solid #e2e8f0" pt={4}>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">Subtotal:</Text>
                  <Text fontSize="sm" fontWeight="600">${selectedOrder.subtotal.toFixed(2)}</Text>
                </HStack>
                {selectedOrder.tax > 0 && (
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Impuesto:</Text>
                    <Text fontSize="sm" fontWeight="600">${selectedOrder.tax.toFixed(2)}</Text>
                  </HStack>
                )}
                {selectedOrder.shippingCost > 0 && (
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Envío:</Text>
                    <Text fontSize="sm" fontWeight="600">${selectedOrder.shippingCost.toFixed(2)}</Text>
                  </HStack>
                )}
                <HStack justify="space-between" borderTop="1px solid #e2e8f0" pt={2}>
                  <Text fontSize="sm" fontWeight="600">Total:</Text>
                  <Text fontSize="md" fontWeight="bold">${selectedOrder.total.toFixed(2)}</Text>
                </HStack>
              </Box>
            </VStack>

            <HStack spacing={3} justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </Box>
        </Box>
      )}

      {/* Dialog de confirmación para cambiar estado */}
      <ConfirmDialog
        isOpen={confirmDisc.isOpen}
        onClose={() => { 
          setUpdatingOrderId(null); 
          setNewStatus('');
          confirmDisc.onClose() 
        }}
        title="Cambiar estado del pedido"
        message={
          <Box>
            <Text mb={3}>Selecciona el nuevo estado:</Text>
            <select 
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="pending">En curso</option>
              <option value="confirmed">Confirmado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </Box>
        }
        confirmLabel="Actualizar"
        cancelLabel="Cancelar"
        onConfirm={handleUpdateStatus}
        accent="green"
      />
    </Box>
  )
}
