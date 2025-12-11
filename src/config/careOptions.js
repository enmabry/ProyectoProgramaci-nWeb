// Mapeo de opciones de cuidado con descripciones
const careOptions = {
  light: {
    baja: {
      value: 'baja',
      label: 'Luz baja',
      description: 'Prefiere luz baja o sombra brillante (indirecta). Evita sol directo fuerte.'
    },
    media: {
      value: 'media',
      label: 'Luz media',
      description: 'Luz media filtrada. Cerca de una ventana brillante sin sol directo intenso.'
    },
    alta: {
      value: 'alta',
      label: 'Luz alta',
      description: 'Luz muy brillante o sol directo suave. Ideal ventanas orientadas al este.'
    }
  },
  watering: {
    poco: {
      value: 'poco',
      label: 'Poco riego',
      description: 'Riegos espaciados. Deja secar la capa superior antes de volver a hidratar.'
    },
    medio: {
      value: 'medio',
      label: 'Riego moderado',
      description: 'Riego moderado. Mantén el sustrato ligeramente húmedo, no encharcado.'
    },
    frecuente: {
      value: 'frecuente',
      label: 'Riego frecuente',
      description: 'Necesita humedad constante. Revisa el sustrato seguido y evita que se seque.'
    }
  },
  temp: {
    fresco: {
      value: 'fresco',
      label: 'Fresco',
      range: '15–18°C',
      description: 'Temperatura fresca. Prefiere ambientes no muy calurosos.'
    },
    moderado: {
      value: 'moderado',
      label: 'Moderado',
      range: '18–24°C',
      description: 'Temperatura moderada. Rango óptimo para la mayoría de plantas de interior.'
    },
    calido: {
      value: 'calido',
      label: 'Cálido',
      range: '24–30°C',
      description: 'Temperatura cálida. Ideal para plantas tropicales que requieren calor.'
    }
  }
};

module.exports = careOptions;
