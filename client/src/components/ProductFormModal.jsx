import React, { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, Select, NumberInput, NumberInputField,
  VStack, HStack, Grid, GridItem, Box, Text, Image, IconButton, Badge, useToast, Checkbox, CheckboxGroup, Stack
} from '@chakra-ui/react'
import { MdClose, MdAdd } from 'react-icons/md'

const CATEGORIES_OPTIONS = ['Interior', 'Exterior', 'Suculentas', 'Tropical', 'Cactus', 'Árbol', 'Medicinal', 'Palmeras']
const LIGHT_OPTIONS = ['baja', 'media', 'alta']
const WATERING_OPTIONS = ['poco', 'medio', 'frecuente']
const TEMP_OPTIONS = ['fresco', 'moderado', 'calido']
const SIZE_OPTIONS = ['S', 'M', 'L']

export default function ProductFormModal({ isOpen, onClose, product, onSave }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [allImages, setAllImages] = useState([])
  const [hoveredImage, setHoveredImage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categories: [],
    badges: '',
    care: {
      light: 'media',
      watering: 'medio',
      temp: 'moderado'
    },
    size: 'M',
    dimensions: '',
    potRecommended: '',
    stock: '',
    isFeatured: false
  })

  // Cargar datos del producto si es edición
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        shortDesc: product.shortDesc || '',
        description: product.description || '',
        price: product.price || '',
        compareAtPrice: product.compareAtPrice || '',
        categories: product.categories || [],
        badges: product.badges?.join(', ') || '',
        care: {
          light: product.care?.light || 'media',
          watering: product.care?.watering || 'medio',
          temp: product.care?.temp || ''
        },
        size: product.size || 'M',
        dimensions: product.dimensions || '',
        potRecommended: product.potRecommended || '',
        stock: product.stock || '',
        isFeatured: product.isFeatured || false
      })
      // Inicializar imágenes existentes
      if (product?.images?.length > 0) {
        setAllImages(product.images)
      } else {
        setAllImages([])
      }
    } else {
      // Reset para crear nuevo
      setFormData({
        name: '',
        slug: '',
        shortDesc: '',
        description: '',
        price: '',
        compareAtPrice: '',
        categories: [],
        badges: '',
        care: { light: 'media', watering: 'medio', temp: '' },
        size: 'M',
        dimensions: '',
        potRecommended: '',
        stock: '',
        isFeatured: false
      })
      setAllImages([])
    }
    
    // IMPORTANTE: Limpiar estados de imágenes nuevas cuando se abre/cierra el modal
    setImageFiles([])
    setImageUrls([])
  }, [product, isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCareChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      care: { ...prev.care, [field]: value }
    }))
  }

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files)
    const total = imageFiles.length + imageUrls.length + allImages.length
    const remaining = Math.max(0, 3 - total)
    setImageFiles(prev => [...prev, ...files.slice(0, remaining)])
  }

  const handleAddImageUrl = (url) => {
    if (!url.trim()) return
    const total = imageFiles.length + imageUrls.length + allImages.length
    if (total >= 3) {
      toast({ title: 'Máximo 3 imágenes permitidas', status: 'warning', duration: 2000, isClosable: true })
      return
    }
    setImageUrls(prev => [...prev, url])
  }

  const handleRemoveImage = (index, type) => {
    if (type === 'file') {
      setImageFiles(prev => prev.filter((_, i) => i !== index))
    } else if (type === 'url') {
      setImageUrls(prev => prev.filter((_, i) => i !== index))
    } else if (type === 'existing') {
      setAllImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      toast({ title: 'El nombre es requerido', status: 'error', duration: 3000, isClosable: true })
      return
    }
    if (!formData.slug.trim()) {
      toast({ title: 'El slug es requerido', status: 'error', duration: 3000, isClosable: true })
      return
    }
    if (!formData.price || formData.price <= 0) {
      toast({ title: 'El precio debe ser mayor a 0', status: 'error', duration: 3000, isClosable: true })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()

      // Campos básicos
      formDataToSend.append('name', formData.name)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('shortDesc', formData.shortDesc)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      if (formData.compareAtPrice) formDataToSend.append('compareAtPrice', formData.compareAtPrice)
      formDataToSend.append('categories', JSON.stringify(formData.categories))
      if (formData.badges) formDataToSend.append('badges', formData.badges.split(',').map(b => b.trim()).filter(Boolean).join(','))
      formDataToSend.append('care', JSON.stringify(formData.care))
      formDataToSend.append('size', formData.size)
      formDataToSend.append('dimensions', formData.dimensions)
      formDataToSend.append('potRecommended', formData.potRecommended)
      formDataToSend.append('stock', formData.stock || 0)
      formDataToSend.append('isFeatured', formData.isFeatured)

      // Enviar imágenes nuevas desde archivos
      imageFiles.forEach(file => {
        formDataToSend.append('images', file)
      })

      // Enviar URLs de imágenes nuevas
      if (imageUrls.length > 0) {
        formDataToSend.append('imageUrls', JSON.stringify(imageUrls))
      }

      // Enviar IDs de imágenes existentes a preservar
      if (allImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(allImages.map(img => img.publicId)))
      }

      const url = product ? `/api/products/${product._id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar producto')
      }

      const savedProduct = await res.json()

      toast({
        title: product ? 'Producto actualizado' : 'Producto creado',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      onSave(savedProduct)
      onClose()
    } catch (err) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Información básica */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Nombre</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Monstera Deliciosa"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Slug (URL)</FormLabel>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="monstera-deliciosa"
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel fontSize="sm">Descripción corta</FormLabel>
              <Input
                value={formData.shortDesc}
                onChange={(e) => handleChange('shortDesc', e.target.value)}
                placeholder="Hojas perforadas icónicas"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Descripción completa</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción detallada del producto..."
                rows={4}
              />
            </FormControl>

            {/* Precios */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Precio (COP)</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.price}
                  onChange={(val) => handleChange('price', val)}
                >
                  <NumberInputField placeholder="45000" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Precio de comparación (COP)</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.compareAtPrice}
                  onChange={(val) => handleChange('compareAtPrice', val)}
                >
                  <NumberInputField placeholder="50000" />
                </NumberInput>
              </FormControl>
            </Grid>

            {/* Categorías */}
            <FormControl>
              <FormLabel fontSize="sm">Categorías</FormLabel>
              <CheckboxGroup
                value={formData.categories}
                onChange={(vals) => handleChange('categories', vals)}
              >
                <Stack direction="row" flexWrap="wrap" spacing={3}>
                  {CATEGORIES_OPTIONS.map(cat => (
                    <Checkbox key={cat} value={cat} size="sm">{cat}</Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </FormControl>

            {/* Badges */}
            <FormControl>
              <FormLabel fontSize="sm">Badges (separados por coma)</FormLabel>
              <Input
                value={formData.badges}
                onChange={(e) => handleChange('badges', e.target.value)}
                placeholder="nuevo, top, oferta"
              />
            </FormControl>

            {/* Cuidados */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="600" mb={3} fontSize="sm">Guía de Cuidados</Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Luz</FormLabel>
                  <Select
                    value={formData.care.light}
                    onChange={(e) => handleCareChange('light', e.target.value)}
                    size="sm"
                  >
                    {LIGHT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Riego</FormLabel>
                  <Select
                    value={formData.care.watering}
                    onChange={(e) => handleCareChange('watering', e.target.value)}
                    size="sm"
                  >
                    {WATERING_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Temperatura</FormLabel>
                  <Select
                    value={formData.care.temp}
                    onChange={(e) => handleCareChange('temp', e.target.value)}
                    size="sm"
                  >
                    {TEMP_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Box>

            {/* Tamaño y dimensiones */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontSize="sm">Tamaño</FormLabel>
                <Select
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  size="sm"
                >
                  {SIZE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Dimensiones</FormLabel>
                <Input
                  value={formData.dimensions}
                  onChange={(e) => handleChange('dimensions', e.target.value)}
                  placeholder="60–90 cm"
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Maceta recomendada</FormLabel>
                <Input
                  value={formData.potRecommended}
                  onChange={(e) => handleChange('potRecommended', e.target.value)}
                  placeholder="25 cm diámetro"
                  size="sm"
                />
              </FormControl>
            </Grid>

            {/* Stock */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Stock</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.stock}
                  onChange={(val) => handleChange('stock', val)}
                >
                  <NumberInputField placeholder="10" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Destacado</FormLabel>
                <Checkbox
                  isChecked={formData.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                >
                  Producto destacado
                </Checkbox>
              </FormControl>
            </Grid>

            {/* Imágenes */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="600" mb={3} fontSize="sm">Imágenes del producto (máximo 3)</Text>
              <Text fontSize="xs" color="gray.600" mb={3}>Total: {imageFiles.length + imageUrls.length + allImages.length}/3</Text>
              
              <FormControl mb={3}>
                <FormLabel fontSize="sm">Subir imágenes (JPG, PNG, etc.)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                  size="sm"
                  isDisabled={imageFiles.length + imageUrls.length + allImages.length >= 3}
                />
              </FormControl>

              {imageFiles.length > 0 && (
                <Box mb={3}>
                  <Text fontSize="xs" fontWeight="600" mb={2}>Imágenes nuevas ({imageFiles.length}):</Text>
                  <VStack spacing={2} align="flex-start">
                    {imageFiles.map((file, idx) => (
                      <VStack key={`file-${idx}`} spacing={1} align="flex-start">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Nueva imagen ${idx + 1}`}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid"
                          borderColor="blue.300"
                        />
                        <Button
                          leftIcon={<MdClose />}
                          colorScheme="red"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveImage(idx, 'file')}
                        >
                          Eliminar
                        </Button>
                      </VStack>
                    ))}
                  </VStack>
                </Box>
              )}

              <FormControl mb={3}>
                <FormLabel fontSize="sm">Agregar imagen por URL</FormLabel>
                <HStack spacing={2}>
                  <Input
                    id="imageUrlInput"
                    placeholder="https://example.com/image.jpg"
                    size="sm"
                  />
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('imageUrlInput')
                      handleAddImageUrl(input.value)
                      input.value = ''
                    }}
                    isDisabled={imageFiles.length + imageUrls.length + allImages.length >= 3}
                  >
                    <MdAdd />
                  </Button>
                </HStack>
              </FormControl>

              {imageUrls.length > 0 && (
                <Box mb={3}>
                  <Text fontSize="xs" fontWeight="600" mb={2}>URLs agregadas ({imageUrls.length}):</Text>
                  <VStack spacing={2} align="flex-start">
                    {imageUrls.map((url, idx) => (
                      <VStack key={`url-${idx}`} spacing={1} align="flex-start">
                        <Image
                          src={url}
                          alt={`Imagen URL ${idx + 1}`}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid"
                          borderColor="purple.300"
                          onError={() => {}}
                        />
                        <Button
                          leftIcon={<MdClose />}
                          colorScheme="red"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveImage(idx, 'url')}
                        >
                          Eliminar
                        </Button>
                      </VStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {allImages.length > 0 && (
                <Box mt={3}>
                  <Text fontSize="xs" fontWeight="600" mb={2}>Imágenes existentes ({allImages.length}):</Text>
                  <VStack spacing={2} align="flex-start">
                    {allImages.map((img, idx) => (
                      <VStack key={`existing-${idx}`} spacing={1} align="flex-start">
                        <Image
                          src={img.url}
                          alt={`Imagen existente ${idx + 1}`}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid"
                          borderColor="green.300"
                        />
                        <Button
                          leftIcon={<MdClose />}
                          colorScheme="red"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveImage(idx, 'existing')}
                        >
                          Eliminar
                        </Button>
                      </VStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit} isLoading={loading}>
            {product ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
