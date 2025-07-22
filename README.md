# IMGpedia Frontend

## Índice
- [Introducción](#introducción)
- [Responsabilidades principales](#responsabilidades-principales)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tecnologías principales](#tecnologías-principales)
- [Levantamiento en Ambiente Local](#levantamiento-en-ambiente-local)
- [Levantamiento en Producción](#levantamiento-en-producción)
- [Recursos adicionales](#recursos-adicionales)
- [Contacto](#contacto)

## Introducción
**IMGpedia Frontend** es la interfaz web que permite a los usuarios interactuar con el conjunto de datos enlazados IMGpedia. Proporciona herramientas visuales para explorar imágenes, realizar consultas SPARQL, gestionar usuarios y cargar datos, integrándose con el backend mediante una API RESTful segura.

## Responsabilidades principales
- Visualización y consulta de imágenes y metadatos de IMGpedia.
- Interfaz para consultas SPARQL y visualización de resultados.
- Gestión de autenticación y roles de usuario.
- Carga de archivos RDF a través de la interfaz.
- Navegación intuitiva y experiencia de usuario moderna.

## Estructura del proyecto
- **components** — Componentes principales de la aplicación (home, login, upload, ontology, query, etc.).
- **services** — Servicios para autenticación, consultas SPARQL, gestión de imágenes, etc.
- **models** — Modelos y DTOs utilizados en la comunicación con el backend.
- **guards** — Guards de rutas para autenticación y autorización.
- **util** — Utilidades, constantes y datos de ejemplo.
- **public** — Recursos estáticos (imágenes, favicon, etc.).

## Tecnologías principales
- Angular 19
- TypeScript
- RxJS
- Sass
- Angular CLI
- [CodeMirror](https://codemirror.net/) (editor de código embebido)
- [sparql-editor](https://www.npmjs.com/package/sparql-editor) (editor especializado para consultas SPARQL)

## Levantamiento en Ambiente Local
1. Instala las dependencias del proyecto:
    ```bash
    npm install
    ```
2. Inicia el servidor de desarrollo:
    ```bash
    ng serve
    ```
3. Abre tu navegador en [http://localhost:4200/](http://localhost:4200/). La aplicación se recargará automáticamente al modificar los archivos fuente.

## Levantamiento en Producción
Para desplegar en producción, ejecuta el workflow de **Build & Deploy** disponible en las *GitHub Actions* del repositorio. Este proceso compilará la aplicación y la publicará automáticamente en el entorno de producción configurado.

## Recursos adicionales
- [Angular CLI Overview and Command Reference](https://angular.io/cli)
- [Documentación oficial de Angular](https://angular.io/docs)

## Contacto
Para dudas o contribuciones, contactar con los desarrolladores del proyecto IMGpedia:

- **scferrada**
- **Elemma00**