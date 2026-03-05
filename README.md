``
# despensa-frontend

Frontend de la aplicación de gestión de despensa y recetas. Permite a los usuarios gestionar los ingredientes de su despensa, consultar recetas y administrar su perfil.

## Tecnologías principales

- React 18
- Webpack
- Babel
- DaisyUI
- Framer Motion
- HTML5 QRCode

## Estructura del proyecto

```
src/
  app.css                # Estilos globales
  App.jsx                # Componente principal de la app
  index.jsx              # Punto de entrada de React
  components/            # Componentes reutilizables (Header, Footer, Layout, etc.)
  pages/                 # Vistas principales (Login, Register, Pantry, Recipes, ShoppingList, User)
  utils/                 # Utilidades y helpers (auth.js)
public/
  index.html             # HTML principal
webpack.config.js        # Configuración de Webpack
package.json             # Dependencias y scripts
```

## Árbol de componentes

```
App
├── Header
├── Layout
│   ├── BottomNavigation
│   ├── Footer
│   └── (Rutas/Páginas)
│       ├── Login
│       ├── Register
│       ├── Pantry
│       │   ├── AddIngredient
│       │   └── Scanner
│       ├── Recipes
│       ├── ShoppingList
│       └── User

```

## Instalación y uso

1. Clona el repositorio:
	```bash
	git clone https://github.com/julentcaldaw/despensa-frontend.git
	cd despensa-frontend
	```
2. Instala las dependencias:
	```bash
	npm install
	```
3. Inicia el servidor de desarrollo:
	```bash
	npm start
	```
4. Abre tu navegador en `http://localhost:8080` (o el puerto que indique la terminal).

## Scripts disponibles

- `npm start` / `npm run dev`: Inicia el servidor de desarrollo con recarga automática.
- `npm run build`: Genera una versión optimizada para producción.

## Funcionalidades principales

- Autenticación de usuario (login y registro)
- Gestión de ingredientes de la despensa
- Consulta y visualización de recetas
- Escaneo de códigos QR para añadir ingredientes
- Gestión y edición de perfil de usuario

## Cambios recientes

- Mejoras visuales en la selección de ingredientes de la despensa:
	- Los botones de ingredientes ahora tienen más padding vertical y esquinas más redondeadas para una mejor experiencia visual.
	- Se corrigieron errores de sintaxis JSX y duplicados en el componente `PantryIngredientSelector`.
	- El código del componente fue limpiado y optimizado para evitar errores de compilación.

---
Proyecto para la asignatura DAW. Cualquier contribución o sugerencia es bienvenida.