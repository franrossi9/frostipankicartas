# Gestor de Mazos de Cartas 🎴

Una aplicación móvil desarrollada con Expo para gestionar mazos de cartas. Permite mantener un mazo principal y un mazo de descarte, agregar cartas desde diferentes tipos, y administrar cartas individualmente.

## Características

- **Mazo Principal**: Gestiona tu colección principal de cartas
- **Mazo de Descarte**: Almacena cartas descartadas
- **3 Tipos de Cartas**: Soporta tres categorías diferentes de cartas cargadas desde archivos CSV
- **Sacar Cartas**: Extrae cartas aleatorias del mazo principal
- **Gestión de Cartas**: Mueve cartas al descarte o elimínalas permanentemente

## Instalación

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la app

   ```bash
   npx expo start
   ```

Puedes abrir la app en:

- [Expo Go](https://expo.dev/go) en tu teléfono
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

## Uso de la App

### Pantalla Principal

- **Contadores de Mazos**: Visualiza cuántas cartas hay en el mazo principal y en el descarte
- **Botón "Agregar Carta"**: Abre el menú para seleccionar y agregar cartas al mazo principal
- **Botón "Sacar Carta del Mazo"**: Extrae una carta aleatoria del mazo principal
- **Información de Carta**: Cuando sacas una carta, puedes:
  - Moverla al mazo de descarte
  - Eliminarla permanentemente del juego

### Agregar Cartas

1. Toca el botón "Agregar Carta"
2. Selecciona uno de los tres tipos de carta
3. Elige la carta específica de la lista
4. La carta se agregará automáticamente al mazo principal

## Configuración de Cartas

Actualmente, las cartas están definidas en el código en `utils/cardLoader.ts`. Para usar cartas personalizadas:

1. Edita la función `getCSVData` en `utils/cardLoader.ts`
2. Modifica los datos CSV para cada tipo de carta
3. El formato es: `id,name,description`
4. Puedes agregar más columnas según necesites

### Ejemplo de Datos de Carta

```typescript
id,name,description
1,Carta Especial,Una carta muy poderosa
2,Carta Normal,Una carta común
```

### Próximas Mejoras

- Cargar cartas desde archivos CSV externos
- Persistencia de mazos entre sesiones
- Historial de cartas jugadas
- Mezclar el mazo de descarte de vuelta al mazo principal

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
