import React, { useState } from 'react'
import { 
  Box, Container, VStack, Tabs, TabList, TabPanels, Tab, TabPanel,
  Heading, useColorMode, Text
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import NavbarGlass from '../components/NavbarGlass'
import MyOrdersTab from '../components/MyOrdersTab'

export default function ProfilePage() {
  const { user } = useAuth()
  const { colorMode } = useColorMode()

  if (!user) {
    return (
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'white'}>
        <NavbarGlass />
        <Container maxW="7xl" py={10}>
          <Heading>Debes iniciar sesión</Heading>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'white'}>
      <NavbarGlass />
      <Container maxW="7xl" py={10} mt={20}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={4}>Mi Perfil</Heading>
            <Box bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} p={8} borderRadius="lg">
              <VStack align="start" spacing={4}>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">Nombre</Text>
                  <Text fontSize="lg" fontWeight="600" mt={1}>{user.username}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">Correo electrónico</Text>
                  <Text fontSize="lg" fontWeight="600" mt={1}>{user.email}</Text>
                </Box>
              </VStack>
            </Box>
          </Box>

          <Tabs variant="enclosed" colorScheme="green">
            <TabList mb="1em">
              <Tab>Mis Pedidos</Tab>
              <Tab>Configuración</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <MyOrdersTab />
              </TabPanel>
              <TabPanel>
                <Box p={6} textAlign="center">
                  <Heading size="sm">Configuración en desarrollo</Heading>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  )
}
