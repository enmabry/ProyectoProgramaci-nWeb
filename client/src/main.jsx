import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App'
import { AuthProvider } from './context/AuthContext'

const theme = extendTheme({
  fonts: { heading: 'Lora, serif', body: 'Inter, system-ui, sans-serif' },
  colors: {
    // Paleta basada en tonos profundos y saturados de la fotografía (hojas verdes oscuras)
    brand: {
      50: '#f2f6f3',  // verde casi blanco para backgrounds
      100: '#e0ebe4',
      200: '#bfd7c7',
      300: '#91bb9d',
      400: '#5da176',
      500: '#3c8157', // botón principal
      600: '#2f6845', // hover
      700: '#255336',
      800: '#1b3e28',
      900: '#122618'  // tono más profundo
    }
  },
  components: {
    Button: {
      baseStyle: { borderRadius: 'full', fontWeight: 600 },
      variants: {
        solid: { bg: 'brand.500', _hover: { bg: 'brand.600' }, color: 'white' },
        outline: { borderColor: 'brand.500', color: 'brand.600', _hover: { bg: 'brand.50' } }
      }
    },
    Tabs: { baseStyle: { tab: { _selected: { bg: 'brand.500', color: 'white' } } } }
  }
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)
