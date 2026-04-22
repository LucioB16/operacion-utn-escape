# Operación UTN: El Escape de la Incertidumbre

![CI](https://github.com/LucioB16/operacion-utn-escape/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=fff)
![Vitest](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=fff)
![Storage](https://img.shields.io/badge/storage-localStorage_only-00b894)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://operacion-utn-escape.vercel.app)

🎮 Juego de navegador para preparar el final de **Investigación Operativa** con foco práctico, ritmo de examen y feedback matemático inmediato.

🌐 **Deploy:** [operacion-utn-escape.vercel.app](https://operacion-utn-escape.vercel.app)

El proyecto está basado en el corpus local de `C:\Users\lucio\repos\IOP` y mantiene el criterio de diseño detectado en los materiales: **80% resolución práctica / 20% teoría aplicada**.

## 🚀 Estado actual

- 🧩 `5` salas secuenciales jugables.
- ⏱️ Modo examen con `15` minutos, XP, bonus y penalizaciones.
- 🧪 Modo entrenamiento libre sin temporizador.
- 📊 Estadísticas y top local persistidos solamente en el browser con `localStorage`.
- 🧠 Sala 2 de Simplex y Sensibilidad como prueba de concepto más profunda.
- 📦 Inventarios con CEP sin ruptura, con ruptura, reabastecimiento uniforme, demanda aleatoria y descuentos por cantidad.
- 🔎 Verificación externa con `glpk.js` para PL y `@dagrejs/graphlib` para redes.
- ✅ CI con lint, build, coverage y tabla legible de tests en GitHub Actions.

## 🧭 Salas

| Sala | Tema | Qué practicás |
|---|---|---|
| 1 | PL gráfica | región factible, vértice óptimo, lectura dual aplicada |
| 2 | Simplex + sensibilidad | `Cj - Zj`, entra/sale, `theta`, pivote, precio sombra, nuevo `Z` |
| 3 | Inventarios | modelos CEP, ruptura, reabastecimiento, demanda aleatoria, descuentos |
| 4 | Pronósticos | promedio móvil, ponderado, suavizado, errores, `MAD`, estacionalidad |
| 5 | Redes | árbol, AEM, Kruskal, Dijkstra, camino de valor mínimo |

## 📚 Corpus priorizado

Se priorizaron fuentes del workspace alineadas al examen:

- `Temas de Examen.docx`
- `Preguntas Teórico.docx`
- `Material generado por NotebookLM/notebook-guia-estudio.md`
- `Material de estudio/3. Dualidad y sensibilidad.pdf`
- `Material de estudio/Modelos CEP y con Ruptura.pdf`
- `Material de estudio/Modelos con Reab Unif y Discont.pdf`
- `Material de estudio/Modelos de Pronósticos.pdf`
- `Material de estudio/Pronóstico.xlsx`
- `Material de estudio/5. Modelos de redes.pdf`
- Finales e imágenes relevadas del `23/02/2026`

Quedaron excluidos de forma explícita: **CPM**, **PERT**, **Transporte** y **Transbordo**.

## 🧱 Arquitectura

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

La lógica matemática vive en funciones puras TypeScript, separada de React. La UI consume motores de dominio, validadores y generadores, lo que deja margen para sumar Three.js o visualizaciones 3D sin reescribir el núcleo.

## 🧮 Ejercicios y validación

Los ejercicios son **generados desde pools parametrizados**, no son pantallas fijas hardcodeadas. Cada sala selecciona escenarios desde datos representativos del corpus y resuelve con funciones propias del proyecto.

- Simplex, inventarios, pronósticos y redes se calculan con motores TypeScript propios.
- `glpk.js` se usa como verificador paralelo en PL, sin reemplazar la lógica pedagógica.
- `@dagrejs/graphlib` se usa como contraste de robustez para Dijkstra y árbol mínimo.
- Las respuestas decimales aceptan tolerancia de `±0.05`.

## 💾 Persistencia

La persistencia es local y simple de hostear gratis:

- `localStorage` para historial de partidas.
- Top local por XP.
- Estadísticas agregadas del browser del usuario.
- Sin backend.
- Sin base cloud.
- Sin ranking global entre usuarios.

## 🛠️ Desarrollo

```bash
bun install
bun run dev
```

## 🧪 Tests y cobertura

```bash
bun run lint
bun run build
bun run test:coverage
```

Para CI local con JSON y tabla de resumen:

```bash
bun run test:ci
node scripts/write-github-summary.mjs
```

El workflow `.github/workflows/ci.yml` ejecuta `lint`, `build`, `test:ci`, sube artifacts de `coverage/` y escribe una tabla de tests directamente en el resumen de GitHub Actions.

## 🌐 Deploy gratis

La app está publicada gratis en Vercel:

- Producción: [https://operacion-utn-escape.vercel.app](https://operacion-utn-escape.vercel.app)
- Proyecto conectado al repo de GitHub para futuros deploys automáticos.

La app es una SPA estática Vite:

```bash
bun run build
```

Vercel detecta Vite automáticamente y sirve `dist/`. No requiere variables de entorno ni servicios externos.

## 📌 Roadmap corto

- Sumar más variantes numéricas por sala.
- Profundizar explicación visual paso a paso en Simplex.
- Agregar más tableros de práctica libre.
- Preparar una capa opcional de visualizaciones 3D.
