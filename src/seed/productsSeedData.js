// seeders/seedProducts.js

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const careOptions = require('../config/careOptions');

const products = [
  {
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    shortDesc: 'Planta de interior robusta con hojas grandes',
    description:
      'La Monstera Deliciosa es una planta tropical perfecta para espacios grandes. Sus hojas fenestradas se vuelven más impresionantes conforme crece. Muy fácil de cuidar.',
    price: 45,
    compareAtPrice: 55,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1563241527-3004b4f8485c?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Interior', 'Grandes'],
    badges: ['Popular', 'Fácil'],
    care: {
      light: careOptions.light.media,
      watering: careOptions.watering.medio,
      temp: careOptions.temp.moderado
    },
    size: 'M',
    dimensions: '60-80 cm',
    potRecommended: '20-25 cm',
    stock: 8,
    ratingAvg: 4.8,
    ratingCount: 45,
    salesCount: 120,
    isFeatured: true
  },
  {
    name: 'Pothos Dorado',
    slug: 'pothos-dorado',
    shortDesc: 'Enredadera colgante con hojas doradas',
    description:
      'El Pothos es una de las plantas más resistentes. Ideal para colgantes o estantes. Tolera baja luz y puede sobrevivir con riego esporádico.',
    price: 25,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1520763992319-fedc88572d87?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Interior', 'Colgantes'],
    badges: ['Principiante', 'Resistente'],
    care: {
      light: careOptions.light.baja,
      watering: careOptions.watering.poco,
      temp: careOptions.temp.moderado
    },
    size: 'S',
    dimensions: '30-40 cm',
    potRecommended: '15 cm',
    stock: 15,
    ratingAvg: 4.9,
    ratingCount: 89,
    salesCount: 250,
    isFeatured: true
  },
  {
    name: 'Snake Plant (Sansevieria)',
    slug: 'snake-plant',
    shortDesc: 'Planta suculenta con hojas verticales',
    description:
      'La Snake Plant es prácticamente indestructible. Purifica el aire y tolera cualquier condición. Perfecta para principiantes y espacios oscuros.',
    price: 35,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1520763992319-fedc88572d87?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Suculentas', 'Interior'],
    badges: ['Purificadora', 'Fácil'],
    care: {
      light: careOptions.light.baja,
      watering: careOptions.watering.poco,
      temp: careOptions.temp.moderado
    },
    size: 'M',
    dimensions: '40-60 cm',
    potRecommended: '17 cm',
    stock: 12,
    ratingAvg: 4.7,
    ratingCount: 65,
    salesCount: 180,
    isFeatured: false
  },
  {
    name: 'Philodendron Rojo',
    slug: 'philodendron-rojo',
    shortDesc: 'Planta tropical con tallos rojos brillantes',
    description:
      'El Philodendron Rojo es una belleza tropical con tallos y hojas nuevas de color rojo intenso. Crece rápido y se adapta bien a interiores.',
    price: 38,
    compareAtPrice: 45,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1543608476-5f3ee62db80f?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Interior', 'Tropicales'],
    badges: ['Colorida', 'Rápido'],
    care: {
      light: careOptions.light.media,
      watering: careOptions.watering.medio,
      temp: careOptions.temp.calido
    },
    size: 'M',
    dimensions: '50-70 cm',
    potRecommended: '18 cm',
    stock: 6,
    ratingAvg: 4.6,
    ratingCount: 32,
    salesCount: 95,
    isFeatured: false
  },
  {
    name: 'Ficus Elastica (Caucho)',
    slug: 'ficus-elastica',
    shortDesc: 'Árbol de interior con hojas grandes y brillantes',
    description:
      'El Ficus Elastica es un árbol robusto que agrega presencia a cualquier espacio. Sus hojas grandes y brillantes lo hacen muy decorativo.',
    price: 55,
    compareAtPrice: 65,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64372?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Árboles', 'Interior', 'Grandes'],
    badges: ['Decorativa', 'Elegante'],
    care: {
      light: careOptions.light.alta,
      watering: careOptions.watering.medio,
      temp: careOptions.temp.calido
    },
    size: 'L',
    dimensions: '100-120 cm',
    potRecommended: '25-30 cm',
    stock: 4,
    ratingAvg: 4.8,
    ratingCount: 28,
    salesCount: 75,
    isFeatured: true
  },
  {
    name: 'Pilea Peperomioides',
    slug: 'pilea-peperomioides',
    shortDesc: 'Planta ornamental con hojas redondas',
    description:
      'La Pilea es muy popular por sus hojas redondas características. Crece de forma compacta y es perfecta para escritorios y mesas.',
    price: 32,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1597848850191-c0bf64ccbc7b?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Interior', 'Compactas'],
    badges: ['Moderna', 'Decorativa'],
    care: {
      light: careOptions.light.media,
      watering: careOptions.watering.medio,
      temp: careOptions.temp.moderado
    },
    size: 'S',
    dimensions: '25-35 cm',
    potRecommended: '15 cm',
    stock: 10,
    ratingAvg: 4.7,
    ratingCount: 52,
    salesCount: 140,
    isFeatured: false
  },
  {
    name: 'Calathea Ornata',
    slug: 'calathea-ornata',
    shortDesc: 'Planta tropical con patrones de rayas',
    description:
      'La Calathea Ornata destaca por sus hojas oscuras con líneas rosadas. Es exótica y elegante, perfecta para quien busca algo especial.',
    price: 48,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Tropicales', 'Interior', 'Decorativa'],
    badges: ['Exótica', 'Elegante'],
    care: {
      light: careOptions.light.media,
      watering: careOptions.watering.frecuente,
      temp: careOptions.temp.calido
    },
    size: 'M',
    dimensions: '45-60 cm',
    potRecommended: '18-20 cm',
    stock: 5,
    ratingAvg: 4.5,
    ratingCount: 24,
    salesCount: 68,
    isFeatured: false
  },
  {
    name: 'ZZ Plant',
    slug: 'zz-plant',
    shortDesc: 'Planta suculenta brillante y resistente',
    description:
      'La ZZ Plant es extremadamente resistente y prácticamente indestructible. Sus hojas brillantes la hacen perfecta para oficinas y hogares modernos.',
    price: 40,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1577720643272-265a5a4a3653?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Suculentas', 'Interior', 'Oficina'],
    badges: ['Resistente', 'Brillo'],
    care: {
      light: careOptions.light.baja,
      watering: careOptions.watering.poco,
      temp: careOptions.temp.moderado
    },
    size: 'M',
    dimensions: '50-70 cm',
    potRecommended: '18 cm',
    stock: 7,
    ratingAvg: 4.8,
    ratingCount: 41,
    salesCount: 110,
    isFeatured: false
  },
  {
    name: 'Alocasia Amazonas',
    slug: 'alocasia-amazonas',
    shortDesc: 'Planta tropical con hojas grandes en forma de flecha',
    description:
      'La Alocasia Amazonas es dramática y tropical. Sus hojas grandes crean un impacto visual inmediato. Ideal para espacios amplios y bien iluminados.',
    price: 52,
    compareAtPrice: 60,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1612437281298-4dae2e84e1db?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Tropicales', 'Grandes', 'Decorativa'],
    badges: ['Dramática', 'Tropical'],
    care: {
      light: careOptions.light.alta,
      watering: careOptions.watering.medio,
      temp: careOptions.temp.calido
    },
    size: 'L',
    dimensions: '80-100 cm',
    potRecommended: '22-25 cm',
    stock: 3,
    ratingAvg: 4.6,
    ratingCount: 19,
    salesCount: 52,
    isFeatured: true
  },
  {
    name: 'String of Pearls',
    slug: 'string-of-pearls',
    shortDesc: 'Suculenta colgante con hojas en forma de perlas',
    description:
      'String of Pearls es una suculenta colgante única con hojas redondas que parecen perlas. Perfecta para macetas colgantes y terrariums.',
    price: 30,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1585892574651-af12a5f51e3f?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Suculentas', 'Colgantes'],
    badges: ['Única', 'Colgante'],
    care: {
      light: careOptions.light.alta,
      watering: careOptions.watering.poco,
      temp: careOptions.temp.moderado
    },
    size: 'S',
    dimensions: '20-30 cm',
    potRecommended: '12-15 cm',
    stock: 9,
    ratingAvg: 4.7,
    ratingCount: 38,
    salesCount: 105,
    isFeatured: false
  },
  {
    name: 'Ficus Lyrata',
    slug: 'ficus-lyrata',
    shortDesc: 'Higuera de hoja de violín',
    description:
      'Sus hojas grandes en forma de violín aportan elegancia a cualquier espacio luminoso indirecto.',
    price: 68,
    compareAtPrice: 75,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1564763842560-51f8e9f2e3b5?w=800&h=600&fit=crop',
        public_id: null
      }
    ],
    categories: ['Interior', 'Árbol'],
    badges: ['top'],
    care: {
      light: careOptions.light.alta,
      watering: careOptions.watering.medio,
      temp: careOptions.temp.calido
    },
    size: 'L',
    dimensions: '80–110 cm',
    potRecommended: '30 cm diámetro',
    stock: 8,
    ratingAvg: 4.6,
    ratingCount: 22,
    salesCount: 90,
    isFeatured: true
  }
];

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plantshop';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Conectado a MongoDB');

    // Opcional: limpiar productos anteriores
    await Product.deleteMany({});
    console.log('🧹 Colección Product vaciada');

    const created = await Product.insertMany(products);
    console.log(`🌱 Se han insertado ${created.length} productos`);

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al hacer el seeding:', err);
    process.exit(1);
  }
};

seed();
