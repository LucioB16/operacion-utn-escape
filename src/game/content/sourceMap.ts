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
    topics: ['alcance del examen', 'simplex', 'inventarios', 'pronósticos', 'redes'],
    priority: 'alta',
    reason: 'Es la fuente más directa para definir qué entra, qué no entra y cómo se reparte el examen entre práctica y teoría aplicada.',
  },
  {
    id: 'preguntas-teorico',
    label: 'Preguntas Teórico.docx',
    path: 'Preguntas Teórico.docx',
    driveLinks: [
      {
        label: 'Preguntas Teórico',
        url: 'https://docs.google.com/document/d/1tR2I2ta4cx8e2BIWpvKg5dLoY-_EdPCD1oJY2TD8ET4/edit?usp=drivesdk',
      },
    ],
    topics: ['simplex', 'sensibilidad', 'inventarios', 'pronósticos', 'redes'],
    priority: 'alta',
    reason: 'Sirve para transformar teoría suelta en preguntas cortas pegadas a la resolución práctica.',
  },
  {
    id: 'resumen-iop',
    label: 'Resumen IoP.pdf',
    path: 'Resumen IoP.pdf',
    driveLinks: [
      {
        label: 'Resumen IoP.pdf',
        url: 'https://drive.google.com/file/d/1dARfsNoGckrC60706Ldac7AfoUxkxlz2/view?usp=drivesdk',
      },
    ],
    topics: ['repaso general', 'fórmulas', 'síntesis de unidades'],
    priority: 'media',
    reason: 'Aporta un repaso rápido transversal para reforzar feedback corto entre ejercicios.',
  },
  {
    id: 'material-estudio-carpeta',
    label: 'Carpeta Material de estudio (Drive)',
    path: 'Material de estudio/*',
    driveLinks: [
      {
        label: 'Material de estudio (carpeta)',
        url: 'https://drive.google.com/drive/folders/1l3CNzgBJprh5Znc-t_1KktbZPl8RUkk4',
      },
    ],
    topics: ['corpus completo', 'material base de cátedra'],
    priority: 'media',
    reason: 'Permite abrir de una sola vez todos los PDFs de estudio en Drive.',
  },
  {
    id: 'parciales-carpeta',
    label: 'Carpeta Parciales (Drive)',
    path: 'Parciales/*',
    driveLinks: [
      {
        label: 'Parciales (carpeta)',
        url: 'https://drive.google.com/drive/folders/1CHsxY1ZUR1e5bLEvHlqHsuUpAkPbSG4E',
      },
    ],
    topics: ['parciales históricos', 'variantes de enunciados'],
    priority: 'media',
    reason: 'Da acceso completo al banco de parciales para ampliar escenarios.',
  },
  {
    id: 'parciales-primero-carpeta',
    label: 'Carpeta Parciales/Primero (Drive)',
    path: 'Parciales/Primero/*',
    driveLinks: [
      {
        label: 'Parciales Primero (carpeta)',
        url: 'https://drive.google.com/drive/folders/1jewsDcn3ORLJOF-ITZc9Tu4Ds7qKQV70',
      },
    ],
    topics: ['parcial primero', 'escaneos y variantes'],
    priority: 'baja',
    reason: 'Repositorio amplio de variantes del primer parcial; útil para expansión futura de generadores.',
  },
  {
    id: 'parciales-segundo-carpeta',
    label: 'Carpeta Parciales/Segundo (Drive)',
    path: 'Parciales/Segundo/*',
    driveLinks: [
      {
        label: 'Parciales Segundo (carpeta)',
        url: 'https://drive.google.com/drive/folders/1JKARcaymv7ozdwsw2xvY56w-B9utR5zC',
      },
    ],
    topics: ['parcial segundo', 'inventarios', 'redes', 'simplex'],
    priority: 'media',
    reason: 'Concentra gran parte de ejercicios prácticos de segundo parcial.',
  },
  {
    id: 'finales-carpeta',
    label: 'Carpeta Finales (Drive)',
    path: 'Finales/*',
    driveLinks: [
      {
        label: 'Finales (carpeta)',
        url: 'https://drive.google.com/drive/folders/11NmnyKFByIuoTXxaRx-xCTweietqZnC-',
      },
    ],
    topics: ['finales históricos', 'fotos de enunciados'],
    priority: 'media',
    reason: 'Acceso centralizado a finales usados como referencia de dificultad y formato.',
  },
  {
    id: 'finales-2026-carpeta',
    label: 'Carpeta Finales/2026-02-23 (Drive)',
    path: 'Finales/2026-02-23/*',
    driveLinks: [
      {
        label: 'Final 2026-02-23 (carpeta)',
        url: 'https://drive.google.com/drive/folders/1xQ6KAUt0piD5CEWYZL7A9N06yD04uo2J',
      },
    ],
    topics: ['simplex', 'pronósticos', 'redes'],
    priority: 'media',
    reason: 'Reúne enunciado y resolución del final tomado como referencia principal.',
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
    topics: ['síntesis transversal', 'glosario', 'apoyo conceptual'],
    priority: 'media',
    reason: 'Resume el corpus y ayuda a redactar feedback breve sin desplazar a las fuentes de examen.',
  },
  {
    id: 'notebooklm-guia-pdf',
    label: 'Material generado por NotebookLM/Guía_de_Investigación_Operativa.pdf',
    path: 'Material generado por NotebookLM/Guía_de_Investigación_Operativa.pdf',
    driveLinks: [
      {
        label: 'Guía_de_Investigación_Operativa.pdf',
        url: 'https://drive.google.com/file/d/1sYKAoH3h7eb0BWMJ2sFJhZhilL1m_7Jg/view?usp=drivesdk',
      },
    ],
    topics: ['síntesis transversal', 'checklist de estudio'],
    priority: 'baja',
    reason: 'Material de apoyo complementario para resumen rápido pre-examen.',
  },
  {
    id: 'formulacion-modelos',
    label: 'Material de estudio/1. Formulación de modelos.pdf',
    path: 'Material de estudio/1. Formulación de modelos.pdf',
    driveLinks: [
      {
        label: '1. Formulación de modelos.pdf',
        url: 'https://drive.google.com/file/d/1SYoujL39qG02laIcXBqJ8-Beyzg3RwS1/view?usp=drivesdk',
      },
    ],
    topics: ['programación lineal', 'modelado'],
    priority: 'media',
    reason: 'Respalda la lectura de restricciones y la formulación base de programación lineal.',
  },
  {
    id: 'resolucion-problemas',
    label: 'Material de estudio/2. Resolucion problemas.pdf',
    path: 'Material de estudio/2. Resolucion problemas.pdf',
    driveLinks: [
      {
        label: '2. Resolucion problemas.pdf',
        url: 'https://drive.google.com/file/d/1nvuKOVigW3oODFNYAL0jW4dUDTRFEuAE/view?usp=drivesdk',
      },
    ],
    topics: ['programación lineal', 'simplex aplicado'],
    priority: 'media',
    reason: 'Agrega ejemplos prácticos de resolución sobre el bloque de optimización lineal.',
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
    reason: 'Es la base matemática de la sala principal de simplex y sensibilidad.',
  },
  {
    id: 'inventarios-administracion',
    label: 'Material de estudio/7. Administración de inventarios.pdf',
    path: 'Material de estudio/7. Administración de inventarios.pdf',
    driveLinks: [
      {
        label: '7. Administración de inventarios.pdf',
        url: 'https://drive.google.com/file/d/1CP5ec6noCqBAO825D4SzdAwnEFy0jQ_y/view?usp=drivesdk',
      },
    ],
    topics: ['inventarios', 'políticas de reposición'],
    priority: 'media',
    reason: 'Suma criterios de decisión y terminología aplicada al bloque de inventarios.',
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
    reason: 'Respaldó la variante con producción/reaprovisionamiento gradual que aparece en examen.',
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
    topics: ['demanda aleatoria', 'pedido único', 'distribución discreta'],
    priority: 'alta',
    reason: 'Aporta el ejemplo de diarios con costo de excedente, costo de faltante y criterio de razón crítica.',
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
    topics: ['descuento por cantidad', 'comparación de costos totales'],
    priority: 'alta',
    reason: 'Incluye un ejercicio numérico completo para validar tramos, Q factible y costo total con descuento.',
  },
  {
    id: 'parcial-segundo-2021',
    label: 'Parciales/Segundo/Segundo Parcial Práctico_ Revisión del intento.pdf',
    path: 'Parciales/Segundo/Segundo Parcial Práctico_ Revisión del intento.pdf',
    driveLinks: [
      {
        label: 'Segundo Parcial Práctico_ Revisión del intento.pdf',
        url: 'https://drive.google.com/file/d/1RYIP1D8Pw2nGfKlyP9X6NGi4mtG_DWx9/view?usp=drivesdk',
      },
    ],
    topics: ['inventarios', 'reabastecimiento uniforme', 'redes'],
    priority: 'alta',
    reason: 'Parcial práctico con datos concretos de harina, costos de pedido/almacenamiento, punto de reorden y entregas parciales.',
  },
  {
    id: 'parcial-segundo-compilado',
    label: 'Parciales/Segundo/IOP parciales segundo.pdf',
    path: 'Parciales/Segundo/IOP parciales segundo.pdf',
    driveLinks: [
      {
        label: 'IOP parciales segundo.pdf',
        url: 'https://drive.google.com/file/d/1d2kDrjfN8DGwEsgV3k37DCH3mwTwvgdy/view?usp=drivesdk',
      },
    ],
    topics: ['simplex', 'inventarios', 'pronósticos', 'redes'],
    priority: 'media',
    reason: 'Compendio de parciales de segundo con variedad de escenarios prácticos.',
  },
  {
    id: 'parcial-segundo-hechos',
    label: 'Parciales/Segundo/Parciales hechos y corregidos.pdf',
    path: 'Parciales/Segundo/Parciales hechos y corregidos.pdf',
    driveLinks: [
      {
        label: 'Parciales hechos y corregidos.pdf',
        url: 'https://drive.google.com/file/d/1jQihTtb5ia_5tut6yG5yAC2_o3cID_mf/view?usp=drivesdk',
      },
    ],
    topics: ['práctica de examen', 'correcciones'],
    priority: 'media',
    reason: 'Sirve para ampliar el pool de casos validados con resolución.',
  },
  {
    id: 'parcial-segundo-teoricos',
    label: 'Parciales/Segundo/2dos teóricos.pdf',
    path: 'Parciales/Segundo/2dos teóricos.pdf',
    driveLinks: [
      {
        label: '2dos teóricos.pdf',
        url: 'https://drive.google.com/file/d/1mPdPo4Pd6PgxK5bxf5QBVVK6pnUB1m1a/view?usp=drivesdk',
      },
    ],
    topics: ['teoría aplicada', 'preguntas de parcial'],
    priority: 'baja',
    reason: 'Aporta soporte conceptual breve asociado a los ejercicios prácticos.',
  },
  {
    id: 'parcial-primero-resolucion-teorico',
    label: 'Parciales/Primero/Resolucion_del_Parcial_Teorico.pdf',
    path: 'Parciales/Primero/Resolucion_del_Parcial_Teorico.pdf',
    driveLinks: [
      {
        label: 'Resolucion_del_Parcial_Teorico.pdf',
        url: 'https://drive.google.com/file/d/1c-yYS09tr0J2H1GC0vlLEuTjDXCxOPfo/view?usp=drivesdk',
      },
    ],
    topics: ['teoría aplicada', 'resolución guiada'],
    priority: 'baja',
    reason: 'Complementa la parte teórica sin desviar el foco 80/20 práctico.',
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
    topics: ['inventarios', 'ruptura', 'lote óptimo'],
    priority: 'alta',
    reason: 'Aporta un caso de autopartes con demanda anual, costo de preparación, mantenimiento y decisión de ruptura.',
  },
  {
    id: 'pronosticos-pdf',
    label: 'Material de estudio/Modelos de Pronósticos.pdf',
    path: 'Material de estudio/Modelos de Pronósticos.pdf',
    driveLinks: [
      {
        label: 'Modelos de Pronósticos.pdf',
        url: 'https://drive.google.com/file/d/1rhdWdldC0LMSv954bew9ENWc-HjrbJAa/view?usp=drivesdk',
      },
    ],
    topics: ['promedios móviles', 'suavizado exponencial', 'MAD', 'estacionalidad'],
    priority: 'alta',
    reason: 'Consolida métodos cuantitativos de pronóstico y las componentes de series de tiempo.',
  },
  {
    id: 'pronosticos-xlsx',
    label: 'Material de estudio/Pronóstico.xlsx',
    path: 'Material de estudio/Pronóstico.xlsx',
    driveLinks: [
      {
        label: 'Pronóstico.xlsx',
        url: 'https://docs.google.com/spreadsheets/d/1jYgnevXqO_RzJ7H-iNj3YdQySPanfJGX/edit?usp=drivesdk&ouid=117496648146536696985&rtpof=true&sd=true',
      },
    ],
    topics: ['ejercicios resueltos', 'MAD', 'promedios móviles', 'índices estacionales'],
    priority: 'alta',
    reason: 'Aporta datasets concretos y formatos de ejercicios muy cercanos a práctica de parcial/final.',
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
    topics: ['árbol', 'árbol de expansión mínima', 'Dijkstra'],
    priority: 'alta',
    reason: 'Respalda el bloque de redes y la terminología exacta de la cátedra.',
  },
  {
    id: 'redes-guia-parte-1',
    label: 'Material de estudio/Guía de estudio REDES Parte 1.pdf',
    path: 'Material de estudio/Guía de estudio REDES Parte 1.pdf',
    driveLinks: [
      {
        label: 'Guía de estudio REDES Parte 1.pdf',
        url: 'https://drive.google.com/file/d/1_qCMXtgnuiF5OuM1k2Q0lnVmWoP38TDs/view?usp=drivesdk',
      },
    ],
    topics: ['redes', 'árbol de expansión'],
    priority: 'media',
    reason: 'Complementa teoría y pasos de resolución de redes en formato de guía.',
  },
  {
    id: 'redes-guia-parte-2',
    label: 'Material de estudio/Guía de estudio REDES Parte 2.pdf',
    path: 'Material de estudio/Guía de estudio REDES Parte 2.pdf',
    driveLinks: [
      {
        label: 'Guía de estudio REDES Parte 2.pdf',
        url: 'https://drive.google.com/file/d/1FBmSwkwtG4OQyrBT0WpbF2uj6n9HjbbG/view?usp=drivesdk',
      },
    ],
    topics: ['redes', 'camino mínimo'],
    priority: 'media',
    reason: 'Amplía variantes de ejercicios para Dijkstra y caminos de costo mínimo.',
  },
  {
    id: 'redes-flujo',
    label: 'Material de estudio/Redes de Flujo.pdf',
    path: 'Material de estudio/Redes de Flujo.pdf',
    driveLinks: [
      {
        label: 'Redes de Flujo.pdf',
        url: 'https://drive.google.com/file/d/1BHTCo0KbecWPSmN7JU1H1cmoU02jeRDU/view?usp=drivesdk',
      },
    ],
    topics: ['redes', 'flujo en redes'],
    priority: 'baja',
    reason: 'Material complementario para expansión futura del módulo de redes.',
  },
  {
    id: 'redes-arbol-camino',
    label: 'Material de estudio/Aárbol de expansión-camino de valor mínimo.pdf',
    path: 'Material de estudio/Aárbol de expansión-camino de valor mínimo.pdf',
    driveLinks: [
      {
        label: 'Aárbol de expansión-camino de valor mínimo.pdf',
        url: 'https://drive.google.com/file/d/1BlYbBNjgJjtsaHqM8tDUPfJ0IdFWnxxl/view?usp=drivesdk',
      },
    ],
    topics: ['árbol de expansión', 'camino de valor mínimo'],
    priority: 'media',
    reason: 'Refuerza exactamente los dos subtemas centrales que evalúa la sala de redes.',
  },
  {
    id: 'casos-guia-iop',
    label: 'Material de estudio/GUIA de Casos y  Problemas IOP.pdf',
    path: 'Material de estudio/GUIA de Casos y  Problemas IOP.pdf',
    driveLinks: [
      {
        label: 'GUIA de Casos y  Problemas IOP.pdf',
        url: 'https://drive.google.com/file/d/1ISZ8iPmgaJr9doSsGQkV7XC4KroD6nXA/view?usp=drivesdk',
      },
    ],
    topics: ['casos integradores', 'práctica general'],
    priority: 'media',
    reason: 'Fuente amplia para generar más variantes de ejercicios por unidad.',
  },
  {
    id: 'acortamiento-lineal',
    label: 'Material de estudio/Acortamiento Lineal.pdf',
    path: 'Material de estudio/Acortamiento Lineal.pdf',
    driveLinks: [
      {
        label: 'Acortamiento Lineal.pdf',
        url: 'https://drive.google.com/file/d/15pG9UlFNEMgjGh79uy4Ok78r6btZWWWx/view?usp=drivesdk',
      },
    ],
    topics: ['programación lineal', 'aplicaciones'],
    priority: 'baja',
    reason: 'Caso adicional que puede alimentar futuras salas bonus de PL aplicada.',
  },
  {
    id: 'apoyo-cuantitativo',
    label: 'Material de estudio/Apoyo_cuantitativo_a_la_toma_de.pdf',
    path: 'Material de estudio/Apoyo_cuantitativo_a_la_toma_de.pdf',
    driveLinks: [
      {
        label: 'Apoyo_cuantitativo_a_la_toma_de.pdf',
        url: 'https://drive.google.com/file/d/1IswwJem0rB0_K-579GnJ34Z9mA8drwbj/view?usp=drivesdk',
      },
    ],
    topics: ['decisiones cuantitativas', 'marco general'],
    priority: 'baja',
    reason: 'Suma contexto metodológico para orientar explicaciones cortas de criterios.',
  },
  {
    id: 'caso-parque-cataratas',
    label: 'Material de estudio/Caso Parque N Cataratas.pdf',
    path: 'Material de estudio/Caso Parque N Cataratas.pdf',
    driveLinks: [
      {
        label: 'Caso Parque N Cataratas.pdf',
        url: 'https://drive.google.com/file/d/1HkyN28_uXOUsF5cJHy8AlqswIyehD50r/view?usp=drivesdk',
      },
    ],
    topics: ['caso aplicado', 'redes', 'optimización'],
    priority: 'baja',
    reason: 'Caso de aplicación útil para expansión narrativa de escenarios.',
  },
  {
    id: 'resolucion-primer-parcial-viejo',
    label: 'Material de estudio/Resolución Primer parcial (viejo).pdf',
    path: 'Material de estudio/Resolución Primer parcial (viejo).pdf',
    driveLinks: [
      {
        label: 'Resolución Primer parcial (viejo).pdf',
        url: 'https://drive.google.com/file/d/1-JPMYd7y6syqHXTYAKPTGVTJyytv4kdY/view?usp=drivesdk',
      },
    ],
    topics: ['parcial histórico', 'resolución guiada'],
    priority: 'baja',
    reason: 'Aporta ejemplos resueltos para ampliar el banco de validaciones.',
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
    topics: ['simplex', 'tasa de sustitución', 'índices estacionales'],
    priority: 'alta',
    reason: 'Confirma que el final real pidió una tabla de simplex, un ejercicio de pronóstico y teoría aplicada.',
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
    topics: ['pronósticos', 'recta de tendencia', 'lectura del gráfico'],
    priority: 'media',
    reason: 'Aporta una resolución manuscrita del mismo examen y el tipo de lectura gráfica esperada.',
  },
  {
    id: 'final-2026-resolucion-03',
    label: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.03.jpeg',
    path: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.03.jpeg',
    driveLinks: [
      {
        label: 'WhatsApp Image 2026-02-27 at 19.00.03.jpeg',
        url: 'https://drive.google.com/file/d/1mmHUiPqcHssb-Y2p1jf0YWKYCLYulCTx/view?usp=drivesdk',
      },
    ],
    topics: ['resolución final 2026', 'paso a paso'],
    priority: 'baja',
    reason: 'Completa la secuencia de imágenes de la resolución del final 2026.',
  },
  {
    id: 'final-2026-resolucion-34',
    label: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.34.jpeg',
    path: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.34.jpeg',
    driveLinks: [
      {
        label: 'WhatsApp Image 2026-02-27 at 19.00.34.jpeg',
        url: 'https://drive.google.com/file/d/1PFZGqLmI7E-ZOos0oOekThSAdibnLlU8/view?usp=drivesdk',
      },
    ],
    topics: ['resolución final 2026', 'paso a paso'],
    priority: 'baja',
    reason: 'Amplía material de corrección para contraste de resultados en el final 2026.',
  },
  {
    id: 'final-2026-resolucion-45',
    label: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.45.jpeg',
    path: 'Finales/2026-02-23/Resolucion/WhatsApp Image 2026-02-27 at 19.00.45.jpeg',
    driveLinks: [
      {
        label: 'WhatsApp Image 2026-02-27 at 19.00.45.jpeg',
        url: 'https://drive.google.com/file/d/1nWTQ3B9NUnqtTr3jAvif9xovk6pUMSXw/view?usp=drivesdk',
      },
    ],
    topics: ['resolución final 2026', 'paso a paso'],
    priority: 'baja',
    reason: 'Cierra el set de resolución del final 2026 para revisión completa.',
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
    topics: ['inventarios', 'árbol de expansión mínima', 'Dijkstra'],
    priority: 'alta',
    reason: 'Prueba que inventarios y redes se toman juntos en el final, con teoría corta asociada.',
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
    reason: 'Se relevaron para descartarlos del alcance, porque Temas de Examen.docx los excluye explícitamente.',
    excluded: true,
  },
  {
    id: 'excluidos-guia-cpm-pert',
    label: 'Material de estudio/Guía de estudio CPM-PERT.pdf',
    path: 'Material de estudio/Guía de estudio CPM-PERT.pdf',
    driveLinks: [
      {
        label: 'Guía de estudio CPM-PERT.pdf',
        url: 'https://drive.google.com/file/d/1I1uJxdSgWRCDsLFIu5h5RcmZdMn6kAfe/view?usp=drivesdk',
      },
    ],
    topics: ['cpm', 'pert'],
    priority: 'alta',
    reason: 'Material relevado y excluido por regla de alcance: CPM/PERT no entra en este juego.',
    excluded: true,
  },
]

export const sourceIndex = Object.fromEntries(sourceMap.map((entry) => [entry.id, entry])) as Record<string, SourceMapEntry>
