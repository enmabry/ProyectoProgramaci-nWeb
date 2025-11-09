import React, { useEffect, useState, useMemo } from 'react'
import { Box, Container, Flex, Heading, SimpleGrid, Select, Input, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Checkbox, CheckboxGroup, Stack, Skeleton } from '@chakra-ui/react'
import { useSearchParams, Link } from 'react-router-dom'
import NavbarGlass from '../components/NavbarGlass'
import '../styles/catalog.css'

function formatCurrency(value){
  try {
    return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(value || 0)
  } catch {
    return `$${(value||0).toLocaleString('es-CO')}`
  }
}

function ProductTile({ p }){
  return (
    <Box 
      as={Link} 
      to={`/product/${p.slug}`} 
      className="catalog-card"
      _hover={{ transform:'scale(1.03)', transition:'transform 0.2s', textDecoration:'none' }}
    >
      <Box className="catalog-card__media">
        {p.images?.[0]?.url ? (
          <img src={p.images[0].url} alt={p.name} />
        ) : <div className="catalog-card__placeholder" />}
      </Box>
      <Box className="catalog-card__body">
        <Heading as="h3" className="catalog-card__title" title={p.name}>{p.name}</Heading>
        <Text className="catalog-card__price">{formatCurrency(p.price)}</Text>
        <Button size="sm" w="full" mt={2}>Añadir</Button>
      </Box>
    </Box>
  )
}

export default function CatalogPage(){
  const [searchParams] = useSearchParams()
  const [all,setAll] = useState([])
  const [loading,setLoading] = useState(true)

  // Filtros UI
  const [search,setSearch] = useState('')
  const [sort,setSort] = useState('newest')
  const [categories,setCategories] = useState([])
  const [priceMax,setPriceMax] = useState(200000)
  const [page,setPage] = useState(1)
  const pageSize = 9

  // Aplicar filtro de categoría desde query params al montar
  useEffect(()=>{
    const cat = searchParams.get('category')
    if(cat) setCategories([cat])
  },[searchParams])

  useEffect(()=>{
    let mounted=true
    fetch(`/api/products?sort=${sort}`)
      .then(r=>r.json())
      .then(d=>{if(mounted){setAll(Array.isArray(d)?d:[]);setLoading(false)}})
      .catch(()=>{if(mounted){setAll([]);setLoading(false)}})
    return ()=>{mounted=false}
  },[sort])

  // Derivar categorías disponibles desde los productos
  const availableCategories = useMemo(()=>{
    const set = new Set()
    all.forEach(p=> (p.categories||[]).forEach(c=> set.add(c)))
    return Array.from(set)
  },[all])

  const filtered = useMemo(()=>{
    return all.filter(p=>{
      if(search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if(categories.length && !p.categories?.some(c=> categories.includes(c))) return false
      if(p.price > priceMax) return false
      return true
    })
  },[all,search,categories,priceMax])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize)

  useEffect(()=>{ if(page>totalPages) setPage(1) },[totalPages,page])

  return (
    <Box>
      <NavbarGlass />
      <Box pt={{ base: '120px', md: '130px' }} pb={10} className="catalog-page-wrapper">
      <Container maxW="7xl">
        <Heading mb={6} size="lg">Catálogo</Heading>
        <Flex gap={8} align="flex-start" direction={{ base:'column', md:'row' }}>
          {/* Sidebar filtros */}
          <Box className="catalog-filters">
            <Heading as="h4" size="sm" mb={4}>Filtros</Heading>
            <Box mb={5}>
              <Text mb={2} className="filter-label">Buscar</Text>
              <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre de planta" size="sm" />
            </Box>
            <Box mb={5}>
              <Text mb={2} className="filter-label">Ordenar</Text>
              <Select size="sm" value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="newest">Más nuevo</option>
                <option value="price-asc">Precio ↑</option>
                <option value="price-desc">Precio ↓</option>
              </Select>
            </Box>
            <Box mb={6}>
              <Text mb={2} className="filter-label">Categorías</Text>
              <CheckboxGroup value={categories} onChange={vals=>setCategories(vals)}>
                <Stack spacing={1}>
                  {availableCategories.map(c=> (
                    <Checkbox key={c} value={c} size="sm">{c}</Checkbox>
                  ))}
                  {!availableCategories.length && <Text fontSize="xs" color="gray.500">(No hay categorías)</Text>}
                </Stack>
              </CheckboxGroup>
            </Box>
            <Box mb={6}>
              <Text mb={2} className="filter-label">Precio máximo: {formatCurrency(priceMax)}</Text>
              <Slider aria-label='precio-max' min={0} max={200000} step={5000} value={priceMax} onChange={v=>setPriceMax(v)}>
                <SliderTrack><SliderFilledTrack bg='brand.500' /></SliderTrack>
                <SliderThumb boxSize={5} />
              </Slider>
            </Box>
            <Button size="sm" variant="outline" onClick={()=>{setSearch('');setCategories([]);setPriceMax(200000);setSort('newest');setPage(1)}}>Reset</Button>
          </Box>

          {/* Grid productos */}
          <Box flex={1}>
            {loading ? (
              <SimpleGrid columns={{ base:2, md:3, xl:4 }} spacing={5}>
                {Array.from({ length: pageSize }).map((_,i)=> <Skeleton key={i} h='240px' borderRadius='lg' />)}
              </SimpleGrid>
            ) : (
              <>
                <SimpleGrid columns={{ base:2, md:3, xl:4 }} spacing={5} mb={8}>
                  {pageItems.map(p=> <ProductTile key={p._id} p={p} />)}
                  {!pageItems.length && <Text fontSize='sm' color='gray.500'>Sin resultados con los filtros actuales.</Text>}
                </SimpleGrid>
                <Flex justify='space-between' align='center'>
                  <Text fontSize='xs' color='gray.600'>Mostrando {pageItems.length} de {filtered.length} resultados</Text>
                  <Flex gap={2}>
                    <Button size='xs' onClick={()=>setPage(p=> Math.max(1,p-1))} disabled={page===1}>Anterior</Button>
                    <Text fontSize='xs' px={2} py={1} bg='brand.50' borderRadius='md'>Página {page} / {totalPages}</Text>
                    <Button size='xs' onClick={()=>setPage(p=> Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente</Button>
                  </Flex>
                </Flex>
              </>
            )}
          </Box>
        </Flex>
      </Container>
      </Box>
    </Box>
  )
}
