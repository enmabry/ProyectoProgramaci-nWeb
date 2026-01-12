import React, { useState, useEffect } from 'react'
import { Box, Heading, Text, Button, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Skeleton, useToast, useDisclosure } from '@chakra-ui/react'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'
import ConfirmDialog from './ConfirmDialog'

export default function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' })
  const [editingId, setEditingId] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const confirmDisc = useDisclosure()
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if(!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data.users || [])
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
    fetchUsers()
  },[])

  const handleOpenCreate = () => {
    setSelectedUser(null)
    setEditingId(null)
    setNewUser({ username: '', email: '', password: '', role: 'user' })
    onOpen()
  }

  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setEditingId(user._id)
    setNewUser({ username: user.username, email: user.email, password: '', role: user.role })
    onOpen()
  }

  const handleSave = async () => {
    if(!newUser.username || !newUser.email) {
      toast({ title: 'Error', description: 'Username y email son requeridos', status: 'error', duration: 3000, isClosable: true })
      return
    }

    if(!editingId && !newUser.password) {
      toast({ title: 'Error', description: 'Password es requerido para nuevos usuarios', status: 'error', duration: 3000, isClosable: true })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/users/${editingId}` : '/api/users'

      const payload = { ...newUser }
      if(editingId && !newUser.password) {
        delete payload.password
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if(!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar usuario')
      }

      toast({
        title: editingId ? 'Usuario actualizado' : 'Usuario creado',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      fetchUsers()
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

  const handleAskDelete = (id) => {
    setDeletingId(id)
    confirmDisc.onOpen()
  }

  const handleDelete = async () => {
    const id = deletingId
    if(!id) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if(!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar usuario')
      }
      
      toast({
        title: 'Usuario eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      fetchUsers()
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

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if(!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al cambiar rol')
      }

      toast({
        title: 'Rol actualizado',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      fetchUsers()
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
          <Heading size="md" mb={1}>Gestión de Usuarios</Heading>
          <Text fontSize="sm" color="gray.600">Administra los usuarios del sistema ({users.length} usuarios)</Text>
        </Box>
        <Button leftIcon={<MdAdd />} colorScheme="brand" size="md" onClick={handleOpenCreate}>
          Nuevo Usuario
        </Button>
      </HStack>
      
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto" className="admin-table-container">
        {loading ? (
          <Box p={6}>
            {Array.from({length:5}).map((_,i)=>(
              <Skeleton key={i} h="60px" mb={3} />
            ))}
          </Box>
        ) : users.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text color="gray.500" mb={4}>No hay usuarios todavía</Text>
            <Button leftIcon={<MdAdd />} colorScheme="brand" size="sm" onClick={handleOpenCreate}>
              Crear primer usuario
            </Button>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Fecha de Registro</Th>
                <Th textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map(user => (
                <Tr key={user._id} className="admin-table-row">
                  <Td>
                    <Text fontWeight="600" fontSize="sm">{user.username}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{user.email}</Text>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={user.role === 'admin' ? 'red' : 'blue'} 
                      cursor="pointer"
                      onClick={()=>handleChangeRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      title="Click para cambiar rol"
                      fontSize="xs"
                    >
                      {user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        aria-label="Editar usuario"
                        icon={<MdEdit />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleOpenEdit(user)}
                      />
                      <IconButton
                        aria-label="Eliminar usuario"
                        icon={<MdDelete />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={()=>handleAskDelete(user._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal para crear/editar usuario */}
      {isOpen && (
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
            maxW="400px" 
            w="90%"
            onClick={e => e.stopPropagation()}
          >
            <Heading size="md" mb={4}>
              {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Heading>
            
            <Box mb={4}>
              <Text fontSize="sm" fontWeight="600" mb={1}>Username</Text>
              <input 
                type="text"
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                placeholder="usuario123"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </Box>

            <Box mb={4}>
              <Text fontSize="sm" fontWeight="600" mb={1}>Email</Text>
              <input 
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
                placeholder="usuario@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </Box>

            {!editingId && (
              <Box mb={4}>
                <Text fontSize="sm" fontWeight="600" mb={1}>Password</Text>
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            )}

            {editingId && (
              <Box mb={4}>
                <Text fontSize="sm" fontWeight="600" mb={1}>Password (dejar en blanco para no cambiar)</Text>
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Nueva contraseña (opcional)"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            )}

            <Box mb={6}>
              <Text fontSize="sm" fontWeight="600" mb={1}>Rol</Text>
              <select 
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </Box>

            <HStack spacing={3} justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="brand" onClick={handleSave}>
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </HStack>
          </Box>
        </Box>
      )}

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={confirmDisc.isOpen}
        onClose={() => { setDeletingId(null); confirmDisc.onClose() }}
        title="Eliminar usuario"
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        accent="red"
      />
    </Box>
  )
}
