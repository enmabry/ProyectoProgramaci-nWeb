import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Grid, GridItem, Heading, Text, Button, HStack, VStack, Image, Flex, Badge, IconButton, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Skeleton, Breadcrumb, BreadcrumbItem, BreadcrumbLink, useToast } from '@chakra-ui/react'
import { MdChevronRight } from 'react-icons/md'
import NavbarGlass from '../components/NavbarGlass'
import { useCart } from '../context/CartContext'
import '../styles/productDetail.css'

function formatCurrency(value) {
    try {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0)
    } catch {
        return `$${(value || 0).toLocaleString('es-CO')}`
    }
}

function CareIcon({ type }) {
    const icons = {
        light: '☀️',
        water: '💧',
        temp: '🌡️'
    }
    return <Text fontSize="2xl">{icons[type] || '🌿'}</Text>
}

function CareCard({ icon, title, description }) {
    return (
        <VStack spacing={2} align="center" p={4} bg="gray.50" borderRadius="lg" flex={1}>
            <CareIcon type={icon} />
            <Text fontWeight="700" fontSize="sm" textAlign="center">{title}</Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">{description}</Text>
        </VStack>
    )
}

export default function ProductDetailPage() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const { addToCart } = useCart()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        let mounted = true
        fetch(`/api/products/slug/${slug}`)
            .then(r => {
                if (!r.ok) throw new Error('Producto no encontrado')
                return r.json()
            })
            .then(d => { if (mounted) { setProduct(d); setLoading(false) } })
            .catch(err => {
                console.error(err)
                if (mounted) { setLoading(false); setProduct(null) }
            })
        return () => { mounted = false }
    }, [slug])

    if (loading) {
        return (
            <Box>
                <NavbarGlass />
                <Box pt={{ base: '120px', md: '130px' }} pb={10}>
                    <Container maxW="7xl">
                        <Skeleton h="30px" w="300px" mb={6} />
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
                            <Skeleton h="500px" borderRadius="lg" />
                            <Box>
                                <Skeleton h="40px" mb={4} />
                                <Skeleton h="20px" w="60%" mb={6} />
                                <Skeleton h="100px" mb={6} />
                            </Box>
                        </Grid>
                    </Container>
                </Box>
            </Box>
        )
    }

    if (!product) {
        return (
            <Box>
                <NavbarGlass />
                <Box pt={{ base: '120px', md: '130px' }} pb={10}>
                    <Container maxW="7xl">
                        <Text>Producto no encontrado.</Text>
                        <Button mt={4} onClick={() => navigate('/catalog')}>Volver al catálogo</Button>
                    </Container>
                </Box>
            </Box>
        )
    }

    const images = product.images?.length ? product.images : [{ url: '', public_id: '' }]
    const currentImage = images[selectedImage]?.url || ''

    return (
        <Box>
            <NavbarGlass />
            <Box pt={{ base: '120px', md: '130px' }} pb={10} className="product-detail-wrapper">
                <Container maxW="7xl">
                    {/* Breadcrumbs */}
                    <Breadcrumb spacing='8px' separator={<MdChevronRight color='gray.500' />} mb={6} fontSize="sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={() => navigate('/')}>Inicio</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={() => navigate('/catalog')}>Catálogo</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink>{product.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>

                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={10}>
                        {/* Galería de imágenes */}
                        <GridItem>
                            <Box className="product-gallery">
                                <Box className="product-gallery__main" mb={4}>
                                    {currentImage ? (
                                        <Image src={currentImage} alt={product.name} className="product-gallery__main-img" />
                                    ) : (
                                        <Box className="product-gallery__placeholder" />
                                    )}
                                </Box>
                                {images.length > 1 && (
                                    <HStack spacing={3} className="product-gallery__thumbs">
                                        {images.map((img, i) => (
                                            <Box
                                                key={i}
                                                className={`product-gallery__thumb ${i === selectedImage ? 'active' : ''}`}
                                                onClick={() => setSelectedImage(i)}
                                            >
                                                {img.url ? <Image src={img.url} alt={`${product.name} ${i + 1}`} /> : <Box className="product-gallery__placeholder" />}
                                            </Box>
                                        ))}
                                    </HStack>
                                )}
                            </Box>
                        </GridItem>

                        {/* Información del producto */}
                        <GridItem>
                            <VStack align="stretch" spacing={4}>
                                <Heading as="h1" size="xl" fontFamily="Lora, serif" lineHeight={1.2}>{product.name}</Heading>

                                {/* Precio */}
                                <Heading as="h2" size="lg" color="brand.700">{formatCurrency(product.price)}</Heading>

                                {/* Descripción corta */}
                                <Text fontSize="md" color="gray.700">{product.shortDesc || product.description}</Text>

                                {/* Stock badge */}
                                {product.stock > 0 ? (
                                    <Badge colorScheme="green" fontSize="sm" w="fit-content">En stock</Badge>
                                ) : (
                                    <Badge colorScheme="red" fontSize="sm" w="fit-content">Agotado</Badge>
                                )}

                                {/* Cantidad y botones */}
                                <HStack spacing={4} pt={2}>
                                    <Box>
                                        <Text fontSize="xs" mb={1} fontWeight="600">Cantidad:</Text>
                                        <NumberInput
                                            size="md"
                                            maxW={24}
                                            min={1}
                                            max={product.stock || 1}
                                            value={quantity}
                                            onChange={(val) => setQuantity(parseInt(val) || 1)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </Box>
                                    <Button
                                        flex={1}
                                        colorScheme="brand"
                                        size="lg"
                                        isDisabled={product.stock < 1}
                                        onClick={() => {
                                            addToCart(product, quantity)
                                            toast({
                                                title: 'Producto añadido',
                                                description: `${quantity} x ${product.name}`,
                                                status: 'success',
                                                duration: 3000,
                                                isClosable: true,
                                                position: 'top-right'
                                            })
                                        }}
                                    >
                                        Añadir al carrito
                                    </Button>
                                </HStack>
                                <Button
                                    variant="outline"
                                    colorScheme="brand"
                                    size="lg"
                                    w="full"
                                    isDisabled={product.stock < 1}
                                    onClick={() => {
                                        addToCart(product, quantity)
                                        navigate('/cart')
                                    }}
                                >
                                    Comprar ahora
                                </Button>
                            </VStack>
                        </GridItem>
                    </Grid>

                    {/* Guía de Cuidados */}
                    <Box mt={10} p={6} bg="white" borderRadius="lg" boxShadow="sm">
                        <Heading as="h3" size="md" mb={6}>Guía de Cuidados</Heading>
                        <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                            <CareCard
                                icon="light"
                                title="Luz"
                                description={product.care?.light?.description || 'Luz media filtrada'}
                            />
                            <CareCard
                                icon="water"
                                title="Riego"
                                description={product.care?.watering?.description || 'Riego moderado'}
                            />
                            <CareCard
                                icon="temp"
                                title="Temperatura"
                                description={product.care?.temp?.description || '18–24°C'}
                            />
                        </Flex>
                    </Box>

                    {/* Descripción completa */}
                    <Box mt={8} p={6} bg="white" borderRadius="lg" boxShadow="sm">
                        <Heading as="h3" size="md" mb={4}>Descripción</Heading>
                        <Text color="gray.700" lineHeight={1.7}>{product.description || 'Sin descripción disponible.'}</Text>
                    </Box>

                    {/* Dimensiones y Maceta */}
                    {(product.dimensions || product.potRecommended) && (
                        <Box mt={8} p={6} bg="white" borderRadius="lg" boxShadow="sm">
                            <Heading as="h3" size="md" mb={4}>Dimensiones y Maceta</Heading>
                            <VStack align="stretch" spacing={2}>
                                {product.dimensions && (
                                    <HStack>
                                        <Text fontWeight="600" fontSize="sm" minW="120px">📏 Altura/tamaño:</Text>
                                        <Text fontSize="sm" color="gray.700">{product.dimensions}</Text>
                                    </HStack>
                                )}
                                {product.potRecommended && (
                                    <HStack>
                                        <Text fontWeight="600" fontSize="sm" minW="120px">🪴 Maceta recomendada:</Text>
                                        <Text fontSize="sm" color="gray.700">{product.potRecommended}</Text>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    )
}
