import React from 'react'
import { Box, Heading, Text, VStack, Image, Container } from '@chakra-ui/react'
import NavbarGlass from '../components/NavbarGlass'
import LogosEvolucion from '../assets/images/bocetosLogos.png'
import PaletaColores from '../assets/images/paletaDeColores.png'

export default function AboutPage() {
  return (
    <>
      <NavbarGlass />
      <Container maxW="5xl" py={12} mt={20}>
      <VStack align="start" spacing={10}>
        <Box>
          <Heading as="h1" size="lg" mb={6}>Nuestra Historia</Heading>
          <VStack align="start" spacing={4} fontSize="sm" lineHeight={1.6}>
            <Text>
              A Priori Verde nació de una intuición sencilla: el gusto por lo vivo se cultiva. Empezamos en un piso pequeño, 
              rodeados de macetas, cuadernos y pruebas de sustratos. Entre cafés y trasplantes nos preguntamos cómo ayudar a que cualquier hogar —aun sin experiencia— pudiera reconocer la belleza de una planta y cuidarla con criterio. No queríamos vender “cosas verdes”, sino enseñar a mirar lo vivo.
            </Text>
            <Text>
              En esa búsqueda nos acompañó la filosofía de Immanuel Kant. Sus paseos puntuales por Königsberg, su amor por el orden y, sobre todo, su <em>Crítica del Juicio</em> nos dieron lenguaje para lo que intuíamos: el juicio de gusto no es una receta; es una disposición que se educa. Kant llamó <em>a priori</em> a aquello que hace posible nuestra experiencia. Nosotros lo traducimos al mundo botánico como principios claros —luz, riego, sustrato y forma— que preparan el ojo y la mano para que la planta prospere.
            </Text>
            <Text>
              Con ese espíritu creamos fichas didácticas, kits guiados y una curaduría honesta. Probamos combinaciones, fallamos, aprendimos y volvimos a empezar. Creamos un pequeño “jardín ilustrado” donde cada especie se presenta con su porqué y su telos práctico: dónde va mejor, cómo se integra al espacio, qué cuidados pide. Creemos, como sugiere Kant, en un <em>sensus communis</em>: un gusto compartido que no impone, sino que invita a reconocer juntos lo bello.
            </Text>
            <Text>
              Hoy, A Priori Verde es una comunidad que ordena, ilumina y da savia: orden para elegir con criterio; luz para comprender; savia para que la vida suceda. Si llegaste hasta aquí, bienvenido: este proyecto existe para que tu hogar reconozca la belleza del verde casi… <em>a priori</em>.
            </Text>
          </VStack>
        </Box>

        <Box w="full">
          <Heading as="h2" size="md" mb={4}>Evolución de Nuestro Logo</Heading>
          <Text fontSize="sm" mb={4} color="gray.600">
            Un recorrido visual por el proceso: exploración conceptual, refinamiento y versión final.
          </Text>
          <Image src={LogosEvolucion} alt="Evolución del logo" borderRadius="lg" shadow="md" />
        </Box>

        <Box w="full">
          <Heading as="h2" size="md" mb={4}>Paleta de Colores</Heading>
          <Text fontSize="sm" mb={4} color="gray.600">
            Nuestra identidad cromática: tonos tierra y verdes que transmiten calma, frescura y conexión viva.
          </Text>
          <Image src={PaletaColores} alt="Paleta de colores" borderRadius="lg" shadow="md" />
        </Box>
      </VStack>
    </Container>
    </>
  )
}
