# Sistema de Efectos de Cartas

## Descripción General

Este sistema permite definir efectos complejos de cartas de forma estructurada usando JSON, soportando:

- **Efectos simples**: Acciones directas (ganar recursos, perder ciudadanos, etc.)
- **Condicionales**: Bifurcaciones basadas en el estado del juego
- **Elecciones**: El jugador elige entre múltiples opciones
- **Iteración**: Efectos que se repiten por cada elemento
- **Composición**: Combinación de múltiples efectos en secuencia
- **Anidación**: Cualquier combinación de lo anterior

## Estructura de Tipos

### 1. Efecto Básico (`BasicEffect`)

Acción simple y directa. Solo necesitas el tipo y la descripción completa del efecto.

```typescript
{
  type: EffectType;
  cardId?: string;  // Solo para efectos de manipulación del mazo
  description: string;  // Descripción completa del efecto
  discardAfter?: boolean;  // Si true, descarta esta carta después de aplicar
  removeAfter?: boolean;  // Si true, elimina esta carta del mazo después de aplicar
}
```

**Ejemplo simple:**

```json
{
  "type": "gain_resource",
  "description": "Gana 2 carbón",
  "discardAfter": false,
  "removeAfter": false
}
```

**Ejemplo con descarte:**

```json
{
  "type": "gain_resource",
  "description": "Gana 3 carbón",
  "discardAfter": true
}
```

**Ejemplo con eliminación:**

```json
{
  "type": "gain_resource",
  "description": "Gana 5 carbón",
  "removeAfter": true
}
```

**Ejemplo con manipulación del mazo:**

```json
{
  "type": "add_card_to_deck",
  "cardId": "L05A",
  "description": "Agrega la carta L05A al mazo"
}
```

### 2. Efecto Condicional (`ConditionalEffect`)

Bifurcación simple: si se cumple una condición, hace una cosa; de lo contrario, hace otra.

```typescript
{
  condition: Condition;
  ifTrue: CardEffect;
  ifFalse?: CardEffect;
}
```

**Ejemplo:**

```json
{
  "condition": {
    "type": "has_hope",
    "value": "justicia",
    "description": "Si tienes Justicia activa"
  },
  "ifTrue": {
    "type": "change_discontent",
    "description": "-1 Descontento"
  },
  "ifFalse": {
    "type": "change_discontent",
    "description": "+1 Descontento"
  }
}
```

### 3. Efecto Multi-Condicional (`MultiConditionalEffect`)

Múltiples condiciones evaluadas en orden (if-else if-else if-else).

```typescript
{
  branches: Array<{
    condition: Condition;
    effect: CardEffect;
  }>;
  default?: CardEffect;
}
```

**Ejemplo:**

```json
{
  "branches": [
    {
      "condition": {
        "type": "compare_hope_discontent",
        "operator": "greater_than",
        "description": "Si tienes más Esperanza que Descontento"
      },
      "effect": {
        "type": "gain_resource",
        "description": "Gana 3 carbón"
      }
    },
    {
      "condition": {
        "type": "compare_hope_discontent",
        "operator": "less_than",
        "description": "Si tienes menos Esperanza que Descontento"
      },
      "effect": {
        "type": "lose_resource",
        "description": "Pierde 1 carbón"
      }
    }
  ],
  "default": {
    "type": "custom",
    "description": "No pasa nada"
  }
}
```

### 4. Efecto de Elección (`ChoiceEffect`)

El jugador elige entre múltiples opciones. Puedes especificar si la carta se descarta/elimina después de elegir, o dar comportamiento individual a cada opción.

```typescript
{
  description: string;
  minChoices: number;
  maxChoices: number;
  options: CardEffect[];
  discardAfter?: boolean;  // Descarta después de elegir (aplica a todas las opciones)
  removeAfter?: boolean;   // Elimina después de elegir (aplica a todas las opciones)
}
```

**Ejemplo - Descarte global:**

```json
{
  "description": "Elige uno:",
  "minChoices": 1,
  "maxChoices": 1,
  "options": [
    {
      "type": "gain_resource",
      "description": "Gana 3 carbón"
    },
    {
      "type": "heal",
      "description": "Cura 2"
    }
  ],
  "discardAfter": true
}
```

**Ejemplo - Comportamiento por opción:**

```json
{
  "description": "Elige uno:",
  "minChoices": 1,
  "maxChoices": 1,
  "options": [
    {
      "type": "gain_resource",
      "description": "Gana 3 carbón",
      "removeAfter": true
    },
    {
      "type": "gain_resource",
      "description": "Gana 1 carbón",
      "discardAfter": true
    }
  ]
}
```

### 5. Efecto "Por Cada" (`ForEachEffect`)

Efecto que se repite por cada elemento.

```typescript
{
  target: string;
  effect: CardEffect;
  description: string;
}
```

**Ejemplo:**

```json
{
  "target": "justicia_activa",
  "effect": {
    "type": "gain_resource",
    "description": "Gana 1 carbón"
  },
  "description": "Por cada Justicia activa"
}
```

### 6. Efecto Compuesto (`CompositeEffect`)

Múltiples efectos ejecutados en secuencia.

```typescript
{
  effects: CardEffect[];
  description?: string;
}
```

**Ejemplo:**

```json
{
  "effects": [
    {
      "type": "gain_resource",
      "description": "Gana 2 carbón"
    },
    {
      "type": "heal",
      "description": "Cura 1"
    }
  ],
  "description": "Gana carbón y luego cura"
}
```

## Tipos de Condiciones

```typescript
enum ConditionType {
  HAS_HOPE = "has_hope", // Tiene esperanza específica
  HAS_DISCONTENT = "has_discontent", // Tiene descontento específico
  HAS_BUILDING = "has_building", // Edificio construido
  HAS_LAW = "has_law", // Ley activa
  COMPARE_HOPE_DISCONTENT = "compare_hope_discontent", // Compara esperanza vs descontento
  HUNGER_LEVEL = "hunger_level", // Nivel de hambre
  STRESS_LEVEL = "stress_level", // Nivel de estrés
  RESOURCE_AMOUNT = "resource_amount", // Cantidad de recurso
  CITIZENS_TYPE = "citizens_type", // Cantidad de ciudadanos
  CUSTOM = "custom", // Personalizada
}
```

## Tipos de Efectos

```typescript
enum EffectType {
  GAIN_RESOURCE = "gain_resource",
  LOSE_RESOURCE = "lose_resource",
  GAIN_CITIZEN = "gain_citizen",
  LOSE_CITIZEN = "lose_citizen",
  GAIN_SICK = "gain_sick",
  HEAL = "heal",
  TREAT = "treat",
  CHANGE_HOPE = "change_hope",
  CHANGE_DISCONTENT = "change_discontent",
  ACTIVATE_HOPE = "activate_hope",
  ACTIVATE_DISCONTENT = "activate_discontent",
  EXHAUST_HOPE = "exhaust_hope",
  EXHAUST_DISCONTENT = "exhaust_discontent",
  CHANGE_HUNGER = "change_hunger",
  CHANGE_STRESS = "change_stress",
  BUILD_BUILDING = "build_building",
  UPGRADE_BUILDING = "upgrade_building",
  DESTROY_BUILDING = "destroy_building",
  INTRODUCE_LAW = "introduce_law",
  DISCARD_LAW = "discard_law",
  REUSE_WORKER = "reuse_worker",
  EXHAUST_WORKER = "exhaust_worker",
  DIE_CITIZEN = "die_citizen",
  PLACE_TILE = "place_tile",
  MOVE_DEVELOPMENT = "move_development",
  WORKSHOP_EFFECT = "workshop_effect",
  FLIP_DISEASE = "flip_disease",
  TAKE_FROM_MAP = "take_from_map",
  REMOVE_FROM_MAP = "remove_from_map",
  CARD_EFFECT = "card_effect",
  ADD_CARD_TO_DECK = "add_card_to_deck",
  REMOVE_CARD_FROM_DECK = "remove_card_from_deck",
  DISCARD_CARD = "discard_card",
  SHUFFLE_CARD_INTO_DECK = "shuffle_card_into_deck",
  CUSTOM = "custom",
}
```

## Gestión del Ciclo de Vida de las Cartas

Cada efecto puede especificar qué hacer con la carta después de aplicarse mediante dos flags booleanos:

### `discardAfter` - Descartar Carta

Cuando es `true`, la carta se mueve a la pila de descartes después de aplicar el efecto. La carta puede volver a aparecer si el mazo se mezcla con los descartes.

```json
{
  "type": "gain_resource",
  "description": "Gana 3 carbón",
  "discardAfter": true
}
```

### `removeAfter` - Eliminar Carta

Cuando es `true`, la carta se elimina permanentemente del juego. No volverá a aparecer.

```json
{
  "type": "gain_resource",
  "description": "Gana 5 carbón",
  "removeAfter": true
}
```

### Comportamiento por Defecto

Si ambos flags son `false` o no están presentes, la carta permanece en juego según la lógica del mazo (puede quedarse en juego, barajarse automáticamente, etc.).

### Prioridad

Si ambos flags son `true`, `removeAfter` tiene prioridad (la carta se elimina, no se descarta).

### Aplicación en Estructuras Complejas

- **En `ChoiceEffect`**: El flag se puede poner a nivel de la elección (aplica a todas las opciones) o en cada opción individual
- **En `ConditionalEffect`**: El flag se aplica después de ejecutar la rama correspondiente
- **En `CompositeEffect`**: El flag se aplica después de ejecutar todos los efectos en secuencia
- **En `ForEachEffect`**: El flag se aplica después de completar todas las iteraciones

## Enfoque Simplificado

El sistema está diseñado para ser **simple y enfocado**:

- **Los efectos de juego (recursos, ciudadanos, etc.) se manejan fuera de la app** - Solo necesitas mostrar la descripción al usuario
- **La app solo gestiona las interacciones y el mazo de cartas**:
  - Mostrar opciones al jugador
  - Capturar las elecciones del usuario
  - Manipular el mazo (agregar/eliminar/barajar/descartar cartas)

Por eso, los efectos solo necesitan:

- `type`: El tipo de efecto (para saber si hay que manipular el mazo)
- `cardId`: Solo cuando se manipula una carta específica
- `description`: El texto completo para mostrar al usuario

## Ejemplos de Uso

### Ejemplo 1: Efecto Simple con Condición

**Texto de carta:** "Si tienes Justicia activa, elige 1 o 2 opciones. De lo contrario, pierde 1 trabajador"

```json
{
  "condition": {
    "type": "has_hope",
    "value": "justicia",
    "description": "Si tienes Justicia activa"
  },
  "ifTrue": {
    "description": "Elige 1 o 2 opciones:",
    "minChoices": 1,
    "maxChoices": 2,
    "options": [
      {
        "type": "gain_resource",
        "description": "Gana 2 carbón"
      },
      {
        "type": "heal",
        "description": "Cura 3"
      }
    ]
  },
  "ifFalse": {
    "type": "lose_citizen",
    "description": "Pierde 1 trabajador"
  }
}
```

### Ejemplo 2: Multi-Condicional (Más/Menos/Empate)

**Texto:** "Si tienes más Esperanza que Descontento: Gana 3 carbón. Si tienes menos: Pierde 2 trabajadores. Si están empatados: No pasa nada"

```json
{
  "branches": [
    {
      "condition": {
        "type": "compare_hope_discontent",
        "operator": "greater_than",
        "description": "Si tienes más Esperanza que Descontento"
      },
      "effect": {
        "type": "gain_resource",
        "description": "Gana 3 carbón"
      }
    },
    {
      "condition": {
        "type": "compare_hope_discontent",
        "operator": "less_than",
        "description": "Si tienes menos Esperanza que Descontento"
      },
      "effect": {
        "type": "lose_citizen",
        "description": "Pierde 2 trabajadores"
      }
    }
  ],
  "default": {
    "type": "custom",
    "description": "No pasa nada"
  }
}
```

### Ejemplo 3: Elección con Condiciones Internas

**Texto:** "Elige uno: A) Si tienes Cuidado: Cura 5, de lo contrario Cura 2. B) Gana 3 carbón"

```json
{
  "description": "Elige uno:",
  "minChoices": 1,
  "maxChoices": 1,
  "options": [
    {
      "condition": {
        "type": "has_hope",
        "value": "cuidado",
        "description": "Si tienes Cuidado activo"
      },
      "ifTrue": {
        "type": "heal",
        "description": "Cura 5"
      },
      "ifFalse": {
        "type": "heal",
        "description": "Cura 2"
      }
    },
    {
      "type": "gain_resource",
      "description": "Gana 3 carbón"
    }
  ]
}
```

### Ejemplo 4: Efecto Iterativo con Condición

**Carta L01A del juego real:**

```json
{
  "condition": {
    "type": "has_hope",
    "value": "cuidado",
    "description": "Si tienes Cuidado activo"
  },
  "ifTrue": {
    "target": "niño_usado_esta_ronda",
    "effect": {
      "type": "gain_sick",
      "description": "Gana 1 Niño enfermo"
    },
    "description": "Por cada Meeple de Niño usado esta Ronda"
  },
  "ifFalse": {
    "target": "niño_usado_esta_ronda",
    "effect": {
      "type": "gain_sick",
      "description": "Gana 2 Niños enfermos"
    },
    "description": "Por cada Meeple de Niño usado esta Ronda"
  }
}
```

## Flujo Simplificado en tu App

### Responsabilidades de la App

Tu app solo necesita manejar:

1. **Mostrar opciones al jugador** - Presentar las descripciones de los efectos
2. **Capturar elecciones** - Cuando el jugador selecciona una opción
3. **Manipular el mazo** - Agregar/eliminar/barajar/descartar cartas

**No necesitas implementar la lógica de recursos, ciudadanos, etc.** - Eso se maneja fuera de la app.

### Ejemplo de Flujo

```typescript
// 1. El jugador roba una carta
const card = deck.drawCard();

// 2. Muestra el efecto
showCardEffect(card.efectoEstructurado);

// 3. Si hay opciones, el jugador elige
if (isChoiceEffect(card.efectoEstructurado)) {
  const selectedOption = await showChoiceModal(card.efectoEstructurado.options);

  // 4. Procesa acciones del mazo
  if (selectedOption.type === "add_card_to_deck") {
    deck.addCard(selectedOption.cardId);
  } else if (selectedOption.type === "shuffle_card_into_deck") {
    deck.shuffleCard(card);
  }

  // 5. Muestra la descripción del efecto al jugador
  showEffectDescription(selectedOption.description);

  // 6. Gestiona el ciclo de vida de la carta según los flags
  if (selectedOption.removeAfter) {
    deck.removeCard(card.id);
  } else if (selectedOption.discardAfter) {
    deck.discardCard(card);
  } else if (card.efectoEstructurado.removeAfter) {
    deck.removeCard(card.id);
  } else if (card.efectoEstructurado.discardAfter) {
    deck.discardCard(card);
  }
} else {
  // Para efectos sin elección
  showEffectDescription(card.efectoEstructurado.description);

  // Gestiona el ciclo de vida de la carta
  if (card.efectoEstructurado.removeAfter) {
    deck.removeCard(card.id);
  } else if (card.efectoEstructurado.discardAfter) {
    deck.discardCard(card);
  }
}
```

## Cómo Implementar en tu App

### 1. Cargar JSON en lugar de CSV

Cambia `cardLoader.ts` para leer archivos JSON con esta estructura:

```json
{
  "id": "L01A",
  "type": "consecuencia_ley",
  "variante": "A",
  "etiqueta": "ANOCHECER",
  "titulo": "ACCIDENTES LABORALES",
  "textoAmbientacion": "Los niños están expuestos...",
  "efecto": "Texto legible del efecto para mostrar",
  "efectoEstructurado": {
    /* objeto CardEffect */
  }
}
```

### 2. Procesar Efectos

```typescript
import { resolveEffect, GameState } from './utils/effectProcessor';

// Estado del juego
const gameState: GameState = {
  hopeTokens: { justicia: { active: 1, exhausted: 0 }, ... },
  discontentTokens: { ... },
  resources: { carbon: 10, madera: 5, comida: 8 },
  // ... resto del estado
};

// Resolver el efecto de una carta
await resolveEffect(
  card.efectoEstructurado,
  gameState,
  async (basicEffect, state) => {
    // Para efectos de manipulación del mazo
    switch (basicEffect.type) {
      case EffectType.ADD_CARD_TO_DECK:
        deck.addCard(basicEffect.cardId);
        break;
      case EffectType.REMOVE_CARD_FROM_DECK:
        deck.removeCurrentCard();
        break;
      case EffectType.DISCARD_CARD:
        deck.discardCurrentCard();
        break;
      case EffectType.SHUFFLE_CARD_INTO_DECK:
        deck.shuffleCardIntoDeck(currentCard);
        break;
      // Para otros efectos, solo muestra la descripción al usuario
      default:
        showEffectDescription(basicEffect.description);
    }
  },
  async (options, min, max) => {
    // Aquí muestras las opciones al jugador y retornas su elección
    return await showChoiceModal(options, min, max);
  }
);
```

### 3. Convertir Efecto a Texto

```typescript
import { effectToText } from "./utils/effectProcessor";

// Generar texto legible del efecto estructurado
const textoEfecto = effectToText(card.efectoEstructurado);
console.log(textoEfecto);
```

### 4. Validar Efectos

```typescript
import { validateEffect } from "./utils/effectProcessor";

const validation = validateEffect(card.efectoEstructurado);
if (!validation.valid) {
  console.error("Errores en el efecto:", validation.errors);
}
```

## Migración desde CSV

1. Convierte tus CSV a JSON
2. Para cada carta, parsea el texto del efecto y crea el objeto `efectoEstructurado`
3. Puedes mantener el campo `efecto` como string para mostrar al usuario
4. El campo `efectoEstructurado` se usa para la lógica del juego

## Ventajas del Sistema

✅ **Flexible**: Soporta efectos simples y complejos  
✅ **Anidable**: Combina condiciones, elecciones e iteraciones  
✅ **Type-safe**: TypeScript valida la estructura  
✅ **Legible**: Convierte JSON a texto automáticamente  
✅ **Extensible**: Fácil agregar nuevos tipos de efectos  
✅ **Testeable**: Puedes probar efectos sin UI

## Manipulación del Mazo

Hay **dos formas** de manipular el mazo después de aplicar un efecto:

### Opción 1: Usando Flags `discardAfter` / `removeAfter`

Más simple y directo para efectos que siempre descartan/eliminan la carta:

```json
{
  "type": "gain_resource",
  "description": "Gana 3 carbón",
  "discardAfter": true
}
```

### Opción 2: Usando Efectos Explícitos de Mazo

Más flexible, permite combinaciones complejas o acciones condicionales:

```json
{
  "effects": [
    {
      "type": "gain_resource",
      "description": "Gana 3 carbón"
    },
    {
      "type": "discard_card",
      "description": "Descarta esta carta"
    }
  ]
}
```

**Cuándo usar cada uno:**

- **Flags**: Cuando el descarte/eliminación es simple y directo
- **Efectos explícitos**: Cuando necesitas más control o lógica compleja

El sistema incluye estos efectos explícitos para manipular el mazo:

### Agregar Carta al Mazo

Agrega una carta específica al mazo por su ID.

```json
{
  "type": "add_card_to_deck",
  "cardId": "L05A",
  "description": "Agrega la carta L05A al mazo"
}
```

### Barajar Carta en el Mazo

Baraja una carta específica de vuelta en el mazo (útil cuando se extrae una carta temporalmente).

```json
{
  "type": "shuffle_card_into_deck",
  "target": "L02A",
  "description": "Baraja esta carta de nuevo en el mazo de Anochecer"
}
```

**Ejemplo del juego (Carta L02B):**

```json
{
  "condition": {
    "type": "has_building",
    "value": "refugio_infantil",
    "description": "Si el Refugio Infantil está construido"
  },
  "ifTrue": {
    "description": "Elige uno:",
    "minChoices": 1,
    "maxChoices": 1,
    "options": [
      {
        "type": "move_development",
        "description": "Mueve la ficha de Desarrollo 1 espacio hacia atrás"
      },
      {
        "type": "upgrade_building",
        "description": "Mejora un Edificio Pequeño pagando su coste"
      }
    ]
  },
  "ifFalse": {
    "effects": [
      {
        "type": "change_hope",
        "amount": -2,
        "description": "-2 Esperanza"
      },
      {
        "type": "shuffle_card_into_deck",
        "description": "Baraja esta carta de nuevo en el mazo de Anochecer"
      }
    ]
  }
}
```

### Eliminar Carta del Mazo

Elimina permanentemente una carta del mazo (la carta ya no estará disponible).

```json
{
  "type": "remove_card_from_deck",
  "description": "Elimina esta carta del juego"
}
```

### Descartar Carta

Mueve la carta a la pila de descartes (puede volver a salir si el mazo se baraja).

```json
{
  "type": "discard_card",
  "description": "Coloca esta carta en la pila de descartes"
}
```

**Ejemplo del juego (Carta L05A):**

```json
{
  "type": "card_effect",
  "modifier": "overlay",
  "target": "comidas_calientes",
  "description": "Coloca esta carta sobre la carta de Ley de Alojamientos Abarrotados. Al final de la Fase de Noche: Si hay Meeples sin lugar cálido: +1 Descontento. Luego coloca esta carta en la pila de descartes."
}
```

### Ejemplo Complejo: Elección con Eliminación de Carta

**Texto:** "Elige uno: A) Gana 3 carbón y elimina esta carta. B) Gana 1 carbón y barájala de nuevo"

```json
{
  "description": "Elige uno:",
  "minChoices": 1,
  "maxChoices": 1,
  "options": [
    {
      "effects": [
        {
          "type": "gain_resource",
          "target": "carbón",
          "amount": 3,
          "description": "Gana 3 carbón"
        },
        {
          "type": "remove_card_from_deck",
          "description": "Elimina esta carta del mazo"
        }
      ]
    },
    {
      "effects": [
        {
          "type": "gain_resource",
          "target": "carbón",
          "amount": 1,
          "description": "Gana 1 carbón"
        },
        {
          "type": "shuffle_card_into_deck",
          "description": "Baraja esta carta de nuevo en el mazo"
        }
      ]
    }
  ]
}
```

### Ejemplo con Condición y Descarte

**Texto:** "Si tienes Justicia activa: Gana 2 carbón. De lo contrario: Pierde 1 trabajador. Luego descarta esta carta."

```json
{
  "effects": [
    {
      "condition": {
        "type": "has_hope",
        "value": "justicia",
        "description": "Si tienes Justicia activa"
      },
      "ifTrue": {
        "type": "gain_resource",
        "target": "carbón",
        "amount": 2,
        "description": "Gana 2 carbón"
      },
      "ifFalse": {
        "type": "lose_citizen",
        "target": "trabajador",
        "amount": 1,
        "description": "Pierde 1 trabajador"
      }
    },
    {
      "type": "discard_card",
      "description": "Descarta esta carta"
    }
  ]
}
```

## Próximos Pasos

1. Convertir CSV a JSON con efectos estructurados
2. Implementar los callbacks de resolución de efectos
3. Crear UI para mostrar opciones al jugador
4. Integrar con el sistema de estado del juego
5. Implementar la lógica de manipulación del mazo (agregar/eliminar/descartar/barajar)
