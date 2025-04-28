


# Changelog

# Changelog

## [1.0.0] - 2025-04-28

### ✨ Improvements
- Full support for detecting `TODO`, `FIXME`, `HACK`, and `IDEA` comments:
  - Both single-line (`//`) and multi-line (`/* ... */`) comments are now handled correctly.
- Automatic deletion of TODO blocks:
  - Entire blocks (`/* ... */`) or consecutive lines (`// ...`) are properly deleted.
  - Correct handling of line breaks when deleting.
- No need to configure `autoDeleteOnDone`; TODOs are auto-removed when marked as done.
- Excludes unwanted files automatically:
  - Excluded folders: `node_modules`, `bower_components`, `dist`, `build`, `out`.
  - Excluded files: `.map`, `.min.*`, `.json`.
- Color coding for TODO tags:
  - `[TODO]` green.
  - `[FIXME]` orange.
  - `[HACK]` red.
  - `[IDEA]` blue.
- Clicking on a TODO item opens the file and focuses directly on the correct line.
- General code refactor for better stability and cleanliness.

### 🐛 Bug Fixes
- Fixed `object is not iterable (cannot read property Symbol(Symbol.iterator))` error during activation.
- Fixed `There is no data provider registered for view` error on the sidebar.
- Correctly displays the total number of pending TODOs.

### 🔥 Upcoming Improvements
- Button to expand/collapse all files at once.
- Advanced filters by tag (TODO/FIXME/IDEA/HACK).
- Search bar for finding keywords in TODOs.
- Support for `.vue`, `.php`, `.cpp`, `.java`, and more file types.

---



## [1.0.0] - 2025-04-28

### ✨ Mejoras principales
- Añadido soporte completo para detectar comentarios `TODO`, `FIXME`, `HACK` e `IDEA` tanto en una línea como en varias líneas (`//` y `/* */`).
- Corrección del borrado de TODOs:
  - Borrado automático de bloques completos (`/* ... */`) o líneas consecutivas (`// ...`).
  - Manejo correcto del salto de línea final al borrar.
- Autoeliminación de comentarios TODO marcados como "Hechos" sin necesidad de configurar `autoDeleteOnDone`.
- Excluidos automáticamente los archivos de:
  - `node_modules`, `bower_components`, `dist`, `build`, `out`, `*.map`, `*.min.*`, y archivos `.json`.
- Colores en etiquetas:
  - `[TODO]` verde.
  - `[FIXME]` naranja.
  - `[HACK]` rojo.
  - `[IDEA]` azul.
- Al hacer clic en un TODO, se abre el archivo y se enfoca en la línea exacta.
- Refactor general del código para mayor estabilidad y limpieza.

### 🐛 Corrección de errores
- Solucionado error `object is not iterable (cannot read property Symbol(Symbol.iterator))` en la carga inicial.
- Solucionado error `There is no data provider registered for view` en la barra lateral.
- Ahora se muestra correctamente el número total de TODOs pendientes.

### 🔥 Próximas mejoras propuestas
- Botón para expandir/colapsar todos los ficheros a la vez.
- Filtros avanzados por tipo (TODO/FIXME/IDEA/HACK).
- Búsqueda por palabra clave en los TODOs.
- Soporte para ficheros `.vue`, `.php`, `.cpp`, `.java`.

---



## 0.0.1 – 2025-04-25

🚀 Primera versión funcional:

- Escanea TODO, FIXME, y HACK en archivos `.ts`, `.js`, `.html`, `.scss`
- Muestra lista lateral con agrupación por archivo
- Colores personalizados para cada tipo de tag
- Checkbox para marcar como hecho
- ✅ Al marcar como hecho, el comentario se borra automáticamente del archivo (si es solo una línea tipo `// TODO:`)
- Estado persistente con `globalState`
- Auto-refresh tras guardar archivos
- Preparado para publicación en el Marketplace