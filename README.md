# Operación UTN: El Escape de la Incertidumbre

Juego de navegador para preparar el final de Investigación Operativa con foco **práctico** y apoyo directo en el corpus local de `C:\Users\lucio\repos\IOP`.

El diseño replica la lógica detectada en examen: aproximadamente **80% resolución / 20% teoría aplicada**.

## Estado actual

- Loop completo con `15` minutos en modo examen.
- `5` salas secuenciales jugables.
- `Modo entrenamiento` sin temporizador para practicar paso a paso.
- Persistencia **solo local en el browser** con `localStorage`.
- Ranking y estadísticas **locales**, sin backend ni storage cloud.
- Sala 2 de simplex/sensibilidad desarrollada como prueba de concepto profunda.
- Pools ampliados de escenarios en PL, simplex, inventarios, pronósticos y redes.
- Feedback educativo breve con fórmulas y criterios del corpus.
- Suite de tests con cobertura alta sobre motores, estado, storage y UI.

## Qué entrenás

- Programación lineal gráfica:
  - región factible
  - vértice óptimo
  - lectura dual aplicada
- Simplex y sensibilidad:
  - `Cj - Zj`
  - variable que entra
  - variable que sale
  - pivot
  - precio sombra
  - intervalo de sensibilidad
  - nuevo `Z`
  - cambio de base
- Inventarios:
  - CEP sin ruptura
  - CEP con ruptura
  - reabastecimiento uniforme
  - identificación del modelo
  - `Q*`
  - costo total
- Pronósticos:
  - promedio móvil
  - promedio móvil ponderado
  - suavizado exponencial
  - `MAD`
  - escenario pesimista
  - índices estacionales
- Redes:
  - árbol
  - árbol de expansión mínima
  - Dijkstra
  - camino de valor mínimo

## Corpus priorizado

Se usaron como fuentes principales:

- `Temas de Examen.docx`
- `Preguntas Teórico.docx`
- `Material generado por NotebookLM/notebook-guia-estudio.md`
- `Material de estudio/3. Dualidad y sensibilidad.pdf`
- `Material de estudio/Modelos CEP y con Ruptura.pdf`
- `Material de estudio/Modelos con Reab Unif y Discont.pdf`
- `Material de estudio/Modelos de Pronósticos.pdf`
- `Material de estudio/Pronóstico.xlsx`
- `Material de estudio/5. Modelos de redes.pdf`
- finales e imágenes relevadas del `23/02/2026`

## Temas excluidos

Por alcance explícito del corpus y del proyecto, no se incluye:

- CPM
- PERT
- Transporte
- Transbordo

## Arquitectura

```text
src/
├─ game/
│  ├─ core/        -> estado, scoring, timer, stats, storage
│  ├─ content/     -> mapa de fuentes del corpus
│  └─ utils/       -> tolerancia decimal
├─ features/
│  ├─ sala-1-pl-grafica/
│  ├─ sala-2-simplex/
│  ├─ sala-3-inventarios/
│  ├─ sala-4-pronosticos/
│  ├─ sala-5-redes/
│  └─ shared/
└─ styles/
```

La lógica matemática vive en funciones puras desacopladas de React. Eso deja el proyecto listo para sumar visualizaciones más ricas o una capa 3D futura sin reescribir el núcleo del juego.

## Cómo correrlo

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Tests

```bash
node .\node_modules\vitest\vitest.mjs run
node .\node_modules\vitest\vitest.mjs run --coverage
```

Cobertura validada en esta iteración:

- `Statements`: `93.4%`
- `Lines`: `93.45%`
- `Functions`: `94.36%`
- `Branches`: `75.09%`

## Persistencia local

Los resultados se guardan únicamente en el navegador del usuario:

- modo preferido
- historial de partidas
- top local por XP
- estadísticas agregadas

No hay ranking global, backend ni dependencia de servicios externos.
