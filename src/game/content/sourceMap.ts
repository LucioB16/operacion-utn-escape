import type { SourceMapEntry } from '../core/types'

export const sourceMap: SourceMapEntry[] = [
  {
    id: 'temas-examen',
    label: 'Temas de Examen.docx',
    path: 'Temas de Examen.docx',
    driveLinks: [
      {
        label: 'Temas de Examen',
        url: 'https://docs.google.com/document/d/14ohqX1CGs4tAuGmC1qXgkW3dgxX1WcGXW16scSJsPsM/edit?usp=drivesdk',
      },
    ],
    topics: ['alcance del examen', 'simplex', 'inventarios', 'pronÃ³sticos', 'redes'],
    priority: 'alta',
    reason: 'Es la fuente mÃ¡s directa para definir quÃ© entra, quÃ© no entra y cÃ³mo se reparte el examen entre prÃ¡ctica y teorÃ­a aplicada.',
  },
  {
    id: 'preguntas-teorico',
    label: 'Preguntas TeÃ³rico.docx',
    path: 'Preguntas TeÃ³rico.docx',
    driveLinks: [
      {
        label: 'Preguntas TeÃ³rico',
        url: 'https://docs.google.com/document/d/1tR2I2ta4cx8e2BIWpvKg5dLoY-_EdPCD1oJY2TD8ET4/edit?usp=drivesdk',
      },
    ],
    topics: ['simplex', 'sensibilidad', 'inventarios', 'pronÃ³sticos', 'redes'],
    priority: 'alta',
    reason: 'Sirve para transformar teorÃ­a suelta en preguntas cortas pegadas a la resoluciÃ³n prÃ¡ctica.',
  },
  {
    id: 'notebooklm-guia',
    label: 'Material generado por NotebookLM/notebook-guia-estudio.md',
    path: 'Material generado por NotebookLM/notebook-guia-estudio.md',
    driveLinks: [
      {
        label: 'notebook-guia-estudio.md',
        url: 'https://drive.google.com/file/d/1Av9gzGmyqPgCHwPkT0-Y-QTqAS-ndRBH/view?usp=drivesdk',
      },
    ],
    topics: ['sÃ­ntesis transversal', 'glosario', 'apoyo conceptual'],
    priority: 'media',
    reason: 'Resume el corpus y ayuda a redactar feedback breve sin desplazar a las fuentes de examen.',
  },
  {
    id: 'formulacion-modelos',
    label: 'Material de estudio/1. FormulaciÃ³n de modelos.pdf',
    path: 'Material de estudio/1. FormulaciÃ³n de modelos.pdf',
    driveLinks: [
      {
        label: '1. FormulaciÃ³n de modelos.pdf',
        url: 'https://drive.google.com/file/d/1SYoujL39qG02laIcXBqJ8-Beyzg3RwS1/view?usp=drivesdk',
      },
    ],
    topics: ['programaciÃ³n lineal', 'modelado'],
    priority: 'media',
    reason: 'Respalda la lectura de restricciones y la formulaciÃ³n base de programaciÃ³n lineal.',
  },
  {
    id: 'dualidad-sensibilidad',
    label: 'Material de estudio/3. Dualidad y sensibilidad.pdf',
    path: 'Material de estudio/3. Dualidad y sensibilidad.pdf',
    driveLinks: [
      {
        label: '3. Dualidad y sensibilidad.pdf',
        url: 'https://drive.google.com/file/d/1HBSv9hQ6Zjki8zvPQHnxfbAbdlZdSoSw/view?usp=drivesdk',
      },
    ],
    topics: ['dualidad', 'precio sombra', 'cambio de VLD'],
    priority: 'alta',
    reason: 'Es la base matemÃ¡tica de la sala principal de simplex y sensibilidad.',
  },
  {
    id: 'inventarios-cep',
    label: 'Material de estudio/Modelos CEP y con Ruptura.pdf',
    path: 'Material de estudio/Modelos CEP y con Ruptura.pdf',
    driveLinks: [
      {
        label: 'Modelos CEP y con Ruptura.pdf',
        url: 'https://drive.google.com/file/d/1XJdMRsCBVvtP6w-DbbTt1tPepxwsgWqQ/view?usp=drivesdk',
      },
    ],
    topics: ['inventario sin ruptura', 'inventario con ruptura'],
    priority: 'alta',
    reason: 'Da el sustento para elegir el modelo correcto, calcular Q* y discutir pedidos pendientes.',
  },
  {
    id: 'inventarios-reab',
    label: 'Material de estudio/Modelos con Reab Unif y Discont.pdf',
    path: 'Material de estudio/Modelos con Reab Unif y Discont.pdf',
    driveLinks: [
      {
        label: 'Modelos con Reab Unif y Discont.pdf',
        url: 'https://drive.google.com/file/d/1Pcr0G2Aw_b9A3V6XUHI0ZOUFajduwKYo/view?usp=drivesdk',
      },
    ],
    topics: ['reabastecimiento uniforme'],
    priority: 'alta',
    reason: 'RespaldÃ³ la variante con producciÃ³n/reaprovisionamiento gradual que aparece en examen.',
  },
  {
    id: 'inventarios-aleatorio',
    label: 'Material de estudio/Modelo aleatorio.pdf',
    path: 'Material de estudio/Modelo aleatorio.pdf',
    driveLinks: [
      {
        label: 'Modelo aleatorio.pdf',
        url: 'https://drive.google.com/file/d/1hGRdF0TujxD0C6-CmFgmoOVw38X8B21X/view?usp=drivesdk',
      },
    ],
    topics: ['demanda aleatoria', 'pedido Ãºnico', 'distribuciÃ³n discreta'],
    priority: 'alta',
    reason: 'Aporta el ejemplo de diarios con costo de excedente, costo de faltante y criterio de razÃ³n crÃ­tica.',
  },
  {
    id: 'inventarios-descuento-ejemplo',
    label: 'Material de estudio/Ejemplo Modelo con Dscto.pdf',
    path: 'Material de estudio/Ejemplo Modelo con Dscto.pdf',
    driveLinks: [
      {
        label: 'Ejemplo Modelo con Dscto.pdf',
        url: 'https://drive.google.com/file/d/12YvhJR3EKmhXqMbXvKQEbW8ZKOw7L7lM/view?usp=drivesdk',
      },
    ],
    topics: ['descuento por cantidad', 'comparaciÃ³n de costos totales'],
    priority: 'alta',
    reason: 'Incluye un ejercicio numÃ©rico completo para validar tramos, Q factible y costo total con descuento.',
  },
  {
    id: 'parcial-segundo-2021',
    label: 'Parciales/Segundo/Segundo Parcial PrÃ¡ctico_ RevisiÃ³n del intento.pdf',
    path: 'Parciales/Segundo/Segundo Parcial PrÃ¡ctico_ RevisiÃ³n del intento.pdf',
    driveLinks: [
      {
        label: 'Segundo Parcial PrÃ¡ctico_ RevisiÃ³n del intento.pdf',
        url: 'https://drive.google.com/file/d/1RYIP1D8Pw2nGfKlyP9X6NGi4mtG_DWx9/view?usp=drivesdk',
      },
    ],
    topics: ['inventarios', 'reabastecimiento uniforme', 'redes'],
    priority: 'alta',
    reason: 'Parcial prÃ¡ctico con datos concretos de harina, costos de pedido/almacenamiento, punto de reorden y entregas parciales.',
  },
  {
    id: 'parcial-repaso-inventarios',
    label: 'Material de estudio/Repaso parcial IOP.pdf',
    path: 'Material de estudio/Repaso parcial IOP.pdf',
    driveLinks: [
      {
        label: 'Repaso parcial IOP.pdf',
        url: 'https://drive.google.com/file/d/1mAzTXd98oA2Ebrd4KDh7nPyJwkSU_J8W/view?usp=drivesdk',
      },
    ],
    topics: ['inventarios', 'ruptura', 'lote Ã³ptimo'],
    priority: 'alta',
    reason: 'Aporta un caso de autopartes con demanda anual, costo de preparaciÃ³n, mantenimiento y decisiÃ³n de ruptura.',
  },
  {
    id: 'pronosticos-pdf',
    label: 'Material de estudio/Modelos de PronÃ³sticos.pdf',
    path: 'Material de estudio/Modelos de PronÃ³sticos.pdf',
    driveLinks: [
      {
        label: 'Modelos de PronÃ³sticos.pdf',
        url: 'https://drive.google.com/file/d/1rhdWdldC0LMSv954bew9ENWc-HjrbJAa/view?usp=drivesdk',
      },
    ],
    topics: ['promedios mÃ³viles', 'suavizado exponencial', 'MAD', 'estacionalidad'],
    priority: 'alta',
    reason: 'Consolida mÃ©todos cuantitativos de pronÃ³stico y las componentes de series de tiempo.',
  },
  {
    id: 'pronosticos-xlsx',
    label: 'Material de estudio/PronÃ³stico.xlsx',
    path: 'Material de estudio/PronÃ³stico.xlsx',
    driveLinks: [
      {
        label: 'PronÃ³stico.xlsx',
        url: 'https://docs.google.com/spreadsheets/d/1jYgnevXqO_RzJ7H-iNj3YdQySPanfJGX/edit?usp=drivesdk&ouid=117496648146536696985&rtpof=true&sd=true',
      },
    ],
    topics: ['ejercicios resueltos', 'MAD', 'promedios mÃ³viles', 'Ã­ndices estacionales'],
    priority: 'alta',
    reason: 'Aporta datasets concretos y formatos de ejercicios muy cercanos a prÃ¡ctica de parcial/final.',
  },
  {
    id: 'redes-modelos',
    label: 'Material de estudio/5. Modelos de redes.pdf',
    path: 'Material de estudio/5. Modelos de redes.pdf',
    driveLinks: [
      {
        label: '5. Modelos de redes.pdf',
        url: 'https://drive.google.com/file/d/1TOKD5hvmXaboi58QkZaH5UllUZgoTQHw/view?usp=drivesdk',
      },
    ],
    topics: ['Ã¡rbol', 'Ã¡rbol de expansiÃ³n mÃ­nima', 'Dijkstra'],
    priority: 'alta',
    reason: 'Respalda el bloque de redes y la terminologÃ­a exacta de la cÃ¡tedra.',
  },
  {
    id: 'final-2026-simplex',
    label: 'Finales/2026-02-23/WhatsApp Image 2026-02-23 at 20.11.57.jpeg',
    path: 'Finales/2026-02-23/WhatsApp Image 2026-02-23 at 20.11.57.jpeg',
    driveLinks: [
      {
        label: 'WhatsApp Image 2026-02-23 at 20.11.57.jpeg',
        url: 'https://drive.google.com/file/d/1P62LVM47KD2Ig4RH0A8VDYlrXHHy_Rdd/view?usp=drivesdk',
      },
    ],
    topics: ['simplex', 'tasa de sustituciÃ³n', 'Ã­ndices estacionales'],
    priority: 'alta',
    reason: 'Confirma que el final real pidiÃ³ una tabla de simplex, un ejercicio de pronÃ³stico y teorÃ­a aplicada.',
  },
  {
    id: 'final-2026-pronosticos',
    label: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.19.jpeg',
    path: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.19.jpeg',
    driveLinks: [
      {
        label: 'WhatsApp Image 2026-02-27 at 19.00.19.jpeg',
        url: 'https://drive.google.com/file/d/1EBZycfMHLqpWXDpphyie6iY0g7XVFRfM/view?usp=drivesdk',
      },
    ],
    topics: ['pronÃ³sticos', 'recta de tendencia', 'lectura del grÃ¡fico'],
    priority: 'media',
    reason: 'Aporta una resoluciÃ³n manuscrita del mismo examen y el tipo de lectura grÃ¡fica esperada.',
  },
  {
    id: 'final-2026-redes',
    label: 'Finales/2026-02-23/WhatsApp Image 2026-02-23 at 20.11.57 (1).jpeg',
    path: 'Finales/2026-02-23/WhatsApp Image 2026-02-23 at 20.11.57 (1).jpeg',
    driveLinks: [
      {
        label: 'WhatsApp Image 2026-02-23 at 20.11.57 (1).jpeg',
        url: 'https://drive.google.com/file/d/1RYkRcPWMFZ5j7YAm7nCNRqEks0ZagyQD/view?usp=drivesdk',
      },
    ],
    topics: ['inventarios', 'Ã¡rbol de expansiÃ³n mÃ­nima', 'Dijkstra'],
    priority: 'alta',
    reason: 'Prueba que inventarios y redes se toman juntos en el final, con teorÃ­a corta asociada.',
  },
  {
    id: 'excluidos-cpm-pert',
    label: 'Material de estudio/CPM.pdf y PERT.pdf',
    path: 'Material de estudio/CPM.pdf | Material de estudio/PERT.pdf',
    driveLinks: [
      {
        label: 'CPM.pdf',
        url: 'https://drive.google.com/file/d/1Q01ooQL_PREEIJtCUhb4-tzJO89Ksxg-/view?usp=drivesdk',
      },
      {
        label: 'PERT.pdf',
        url: 'https://drive.google.com/file/d/1qSWRc0rs0_ZLdfIB5C4nWdvckeCiojQb/view?usp=drivesdk',
      },
    ],
    topics: ['cpm', 'pert'],
    priority: 'alta',
    reason: 'Se relevaron para descartarlos del alcance, porque Temas de Examen.docx los excluye explÃ­citamente.',
    excluded: true,
  },
]

export const sourceIndex = Object.fromEntries(sourceMap.map((entry) => [entry.id, entry])) as Record<string, SourceMapEntry>
