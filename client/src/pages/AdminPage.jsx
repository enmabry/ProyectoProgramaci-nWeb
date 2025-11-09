import { Box, Heading, Text } from '@chakra-ui/react'

export default function AdminPage(){
  return (
    <Box p={8}>
      <Heading size="lg" mb={2}>Panel de Administración</Heading>
      <Text color="gray.600">Solo usuarios con rol <b>admin</b> pueden ver esta página.</Text>
    </Box>
  )
}
