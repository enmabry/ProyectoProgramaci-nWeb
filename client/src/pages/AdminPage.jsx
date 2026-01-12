import React, { useState, useEffect } from 'react'
import { Box, Container, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Button, HStack, Table, Thead, Tbody, Tr, Th, Td, Image, Badge, IconButton, Skeleton, useToast, useDisclosure } from '@chakra-ui/react'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import NavbarGlass from '../components/NavbarGlass'
import ProductFormModal from '../components/ProductFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import ChatsTab from '../components/ChatsTab'
import UsersTab from '../components/UsersTab'
import '../styles/admin.css'

function formatCurrency(value){
  try {
    return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(value || 0)
  } catch {
    return `$${(value||0).toLocaleString('es-CO')}`
  }
}

function ProductsTab(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const confirmDisc = useDisclosure()
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if(!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
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
    fetchProducts()
  },[])

  const handleOpenCreate = () => {
    setSelectedProduct(null)
    onOpen()
  }

  const handleOpenEdit = (product) => {
    setSelectedProduct(product)
    onOpen()
  }

  const handleSave = () => {
    fetchProducts()
  }

  const handleAskDelete = (id) => {
    setDeletingId(id)
    confirmDisc.onOpen()
  }

  const handleDelete = async () => {
    const id = deletingId
    if(!id) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if(!res.ok) throw new Error('Error al eliminar producto')
      
      toast({
        title: 'Producto eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      fetchProducts()
      setDeletingId(null)
      confirmDisc.onClose()
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

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="md" mb={1}>Gestión de Productos</Heading>
          <Text fontSize="sm" color="gray.600">Administra tu catálogo de plantas ({products.length} productos)</Text>
        </Box>
        <Button leftIcon={<MdAdd />} colorScheme="brand" size="md" onClick={handleOpenCreate}>
          Nuevo Producto
        </Button>
      </HStack>
      
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto" className="admin-table-container">
        {loading ? (
          <Box p={6}>
            {Array.from({length:5}).map((_,i)=>(
              <Skeleton key={i} h="60px" mb={3} />
            ))}
          </Box>
        ) : products.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text color="gray.500" mb={4}>No hay productos todavía</Text>
            <Button leftIcon={<MdAdd />} colorScheme="brand" size="sm" onClick={handleOpenCreate}>
              Crear primer producto
            </Button>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Imagen</Th>
                <Th>Nombre</Th>
                <Th>Precio</Th>
                <Th>Stock</Th>
                <Th>Categorías</Th>
                <Th textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map(product => (
                <Tr key={product._id} className="admin-table-row">
                  <Td>
                    {product.images?.[0]?.url ? (
                      <Image 
                        src={product.images[0].url} 
                        alt={product.name}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ) : (
                      <Box className="admin-placeholder-box" />
                    )}
                  </Td>
                  <Td>
                    <Text fontWeight="600" fontSize="sm">{product.name}</Text>
                    <Text fontSize="xs" color="gray.500">{product.slug}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="600">{formatCurrency(product.price)}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={product.stock > 0 ? 'green' : 'red'} fontSize="xs">
                      {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1} flexWrap="wrap">
                      {product.categories?.slice(0,2).map((cat,i)=>(
                        <Badge key={i} colorScheme="brand" fontSize="xs">{cat}</Badge>
                      ))}
                      {product.categories?.length > 2 && (
                        <Badge fontSize="xs" variant="outline">+{product.categories.length - 2}</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        aria-label="Editar producto"
                        icon={<MdEdit />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleOpenEdit(product)}
                      />
                      <IconButton
                        aria-label="Eliminar producto"
                        icon={<MdDelete />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={()=>handleAskDelete(product._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <ProductFormModal
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={confirmDisc.isOpen}
        onClose={() => { setDeletingId(null); confirmDisc.onClose() }}
        title="Eliminar producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        accent="red"
      />
    </Box>
  )
}

function OrdersTab(){
  return (
    <Box>
      <Heading size="md" mb={4}>Pedidos</Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Text color="gray.500">Historial de pedidos próximamente...</Text>
      </Box>
    </Box>
  )
}

export default function AdminPage(){
  const [tabIndex, setTabIndex] = useState(0)
  const { token } = useAuth()

  return (
    <Box>
      <NavbarGlass />
      <Box pt={{ base: '120px', md: '130px' }} pb={10} className="admin-wrapper">
        <Container maxW="7xl">
          <Box mb={6}>
            <Heading size="lg" mb={2}>Panel de Administración</Heading>
            <Text color="gray.600">Gestiona productos, usuarios, pedidos y conversaciones desde aquí</Text>
          </Box>

          <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab fontWeight="600">Productos</Tab>
              <Tab fontWeight="600">Conversaciones</Tab>
              <Tab fontWeight="600">Usuarios</Tab>
              <Tab fontWeight="600">Pedidos</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0} pt={6}>
                <ProductsTab />
              </TabPanel>
              <TabPanel px={0} pt={6}>
                <ChatsTab token={token} />
              </TabPanel>
              <TabPanel px={0} pt={6}>
                <UsersTab />
              </TabPanel>
              <TabPanel px={0} pt={6}>
                <OrdersTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Box>
  )
}

