import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Divider,
  useToast,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepNumber,
  StepIcon
} from '@chakra-ui/react'

const steps = [
  { title: 'Datos de tarjeta', description: 'Información principal' },
  { title: 'Verificación', description: 'CVV y fecha de vencimiento' },
  { title: 'Confirmación', description: 'Revisa tu compra' }
]

export default function PaymentModal({ isOpen, onClose, total, onConfirm, isLoading }) {
  const [activeStep, setActiveStep] = useState(0)
  const toast = useToast()
  
  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    cvv: '',
    expiryMonth: '01',
    expiryYear: new Date().getFullYear().toString(),
    cardType: 'visa'
  })

  const handleCardChange = (e) => {
    const { name, value } = e.target
    setCardData(prev => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    if (activeStep === 0) {
      if (!cardData.cardholderName.trim() || !cardData.cardNumber.trim() || !cardData.cardType) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los campos de la tarjeta',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
        return false
      }
      // Validar formato básico del número de tarjeta
      if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
        toast({
          title: 'Error',
          description: 'El número de tarjeta debe tener 16 dígitos',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
        return false
      }
      return true
    }
    
    if (activeStep === 1) {
      if (!cardData.cvv.trim() || !cardData.expiryMonth || !cardData.expiryYear) {
        toast({
          title: 'Error',
          description: 'Por favor completa CVV y fecha de vencimiento',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
        return false
      }
      if (!/^\d{3,4}$/.test(cardData.cvv)) {
        toast({
          title: 'Error',
          description: 'El CVV debe tener 3 o 4 dígitos',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
        return false
      }
      return true
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrev = () => {
    setActiveStep(prev => Math.max(prev - 1, 0))
  }

  const handleConfirm = () => {
    if (validateStep()) {
      onConfirm(cardData)
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setCardData({
      cardholderName: '',
      cardNumber: '',
      cvv: '',
      expiryMonth: '01',
      expiryYear: new Date().getFullYear().toString(),
      cardType: 'visa'
    })
    onClose()
  }

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered closeOnBackdropClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Información de Pago</Heading>
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />
        
        <ModalBody>
          <VStack spacing={6}>
            {/* Stepper */}
            <Box w="full">
              <Stepper size="sm" index={activeStep}>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Divider />

            {/* Paso 0: Datos básicos de la tarjeta */}
            {activeStep === 0 && (
              <VStack spacing={4} w="full">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={3}>Tipo de tarjeta</Text>
                  <HStack spacing={3}>
                    {['visa', 'mastercard', 'amex'].map(type => (
                      <Button
                        key={type}
                        variant={cardData.cardType === type ? 'solid' : 'outline'}
                        colorScheme={cardData.cardType === type ? 'blue' : 'gray'}
                        size="sm"
                        onClick={() => setCardData(prev => ({ ...prev, cardType: type }))}
                        textTransform="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                <FormControl>
                  <FormLabel fontSize="sm">Nombre del titular</FormLabel>
                  <Input
                    name="cardholderName"
                    placeholder="Juan Pérez"
                    value={cardData.cardholderName}
                    onChange={handleCardChange}
                    textTransform="uppercase"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Número de tarjeta</FormLabel>
                  <Input
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formatCardNumber(cardData.cardNumber)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\s/g, '').slice(0, 16)
                      setCardData(prev => ({ ...prev, cardNumber: cleaned }))
                    }}
                    maxLength="19"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Se aceptan números sin espacios</Text>
                </FormControl>
              </VStack>
            )}

            {/* Paso 1: CVV y vencimiento */}
            {activeStep === 1 && (
              <VStack spacing={4} w="full">
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel fontSize="sm">Mes de vencimiento</FormLabel>
                    <Select
                      name="expiryMonth"
                      value={cardData.expiryMonth}
                      onChange={handleCardChange}
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const month = String(i + 1).padStart(2, '0')
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        )
                      })}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Año de vencimiento</FormLabel>
                    <Select
                      name="expiryYear"
                      value={cardData.expiryYear}
                      onChange={handleCardChange}
                    >
                      {Array.from({ length: 10 }).map((_, i) => {
                        const year = (new Date().getFullYear() + i).toString()
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      })}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm">CVV (Código de seguridad)</FormLabel>
                  <Input
                    name="cvv"
                    placeholder="123"
                    type="password"
                    maxLength="4"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Los últimos 3 o 4 dígitos de tu tarjeta</Text>
                </FormControl>

                <Box bg="yellow.50" p={3} borderRadius="md" w="full">
                  <Text fontSize="xs" color="yellow.800">
                    ⚠️ Esto es una demostración. Los datos son simulados y no se procesan realmente.
                  </Text>
                </Box>
              </VStack>
            )}

            {/* Paso 2: Confirmación */}
            {activeStep === 2 && (
              <VStack spacing={4} w="full">
                <Box w="full" bg="gray.50" p={4} borderRadius="md">
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Tarjeta</Text>
                      <Text fontSize="sm" fontWeight="600">
                        {cardData.cardType.toUpperCase()} •••• {cardData.cardNumber.slice(-4)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Titular</Text>
                      <Text fontSize="sm" fontWeight="600">{cardData.cardholderName}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Vencimiento</Text>
                      <Text fontSize="sm" fontWeight="600">
                        {cardData.expiryMonth}/{cardData.expiryYear}
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                <Divider />

                <HStack justify="space-between" w="full">
                  <Text fontWeight="600" fontSize="lg">Total a pagar:</Text>
                  <Text fontWeight="700" fontSize="lg" color="green.600">
                    ${total.toLocaleString('es-CO')}
                  </Text>
                </HStack>

                <Box bg="blue.50" p={3} borderRadius="md" w="full">
                  <Text fontSize="xs" color="blue.800">
                    ✓ Haz clic en "Confirmar compra" para completar tu pedido
                  </Text>
                </Box>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handlePrev}
              isDisabled={activeStep === 0 || isLoading}
            >
              Atrás
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button
                colorScheme="blue"
                onClick={handleNext}
                isDisabled={isLoading}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                colorScheme="green"
                onClick={handleConfirm}
                isLoading={isLoading}
                loadingText="Procesando..."
              >
                Confirmar compra
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
