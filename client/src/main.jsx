import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App'
import { AuthProvider } from './context/AuthContext'

const theme = extendTheme({
  fonts: { heading: '"Playfair Display", serif', body: 'Inter, system-ui, sans-serif' },
  colors: {
    brand: {
      50: '#f4f7f2',
      100: '#e3ecdd',
      200: '#d2e1c7',
      300: '#b9d1aa',
      400: '#9fc08c',
      500: '#86af6f',
      600: '#749f57', // principal
      700: '#5f8748',
      800: '#476135',
      900: '#2c3a20'
    }
  },
  components: {
    Button: {
      baseStyle: { borderRadius: 'full', fontWeight: 600 },
      variants: {
        solid: { bg: 'brand.600', _hover: { bg: 'brand.700' }, color: 'white' },
        outline: { borderColor: 'brand.600', color: 'brand.700', _hover: { bg: 'brand.50' } }
      }
    },
    Tabs: { baseStyle: { tab: { _selected: { bg: 'brand.600', color: 'white' } } } }
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
