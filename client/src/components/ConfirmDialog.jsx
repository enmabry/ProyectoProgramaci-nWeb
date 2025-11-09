import React from 'react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, HStack, Box } from '@chakra-ui/react'

/**
 * ConfirmDialog
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - title: string
 *  - message: string (puede contener JSX)
 *  - confirmLabel: string
 *  - cancelLabel: string
 *  - onConfirm: function async/normal
 *  - loading: boolean para estado de confirmación
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  title = 'Confirmar acción',
  message = '¿Estás seguro?',
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  onConfirm,
  loading = false,
  accent = 'brand'
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size='md'>
      <ModalOverlay backdropFilter='blur(4px)' />
      <ModalContent borderRadius='2xl' bg='white' boxShadow='xl'>
        <ModalHeader fontSize='lg' fontWeight='700' color='brand.700'>
          {title}
        </ModalHeader>
        <ModalBody>
          <Text fontSize='sm' color='gray.600'>{message}</Text>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3} w='100%' justify='flex-end'>
            <Button
              variant='ghost'
              onClick={onClose}
              disabled={loading}
              borderRadius='full'
            >
              {cancelLabel}
            </Button>
            <Button
              colorScheme={accent}
              onClick={onConfirm}
              isLoading={loading}
              borderRadius='full'
            >
              {confirmLabel}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
