# Resumen de Estructura de Efectos

Esta es una guía rápida de referencia para crear efectos de cartas en formato JSON.

## Estructura Base de una Carta

```json
{
  "id": "L01A",
  "type": "consecuencia_ley" | "disputa_social" | "ocaso",
  "variante": "A",  // Solo para consecuencia_ley
  "etiqueta": "ANOCHECER",
  "titulo": "ACCIDENTES LABORALES",
  "textoAmbientacion": "Los niños están ahora expuestos...",
  "efecto": "Texto del efecto para mostrar (formato legible)",
  "efectoEstructurado": { /* CardEffect */ }
}
```

## Tipos de Efectos (CardEffect)

### 1. BasicEffect (Efecto Básico)

**Campos:**

- `type` (requerido): Tipo de efecto (ver lista abajo)
- `description` (requerido): Texto completo del efecto
- `cardId` (opcional): ID de carta (solo para efectos de mazo)
- `discardAfter` (opcional): Boolean - Descarta la carta después
- `removeAfter` (opcional): Boolean - Elimina la carta después

**Ejemplo:**

```json
{
  "type": "gain_resource",
  "description": "Gana 2 carbón",
  "discardAfter": true
}
```

### 2. ConditionalEffect (If-Else)

**Campos:**

- `condition` (requerido): Objeto Condition
- `ifTrue` (requerido): CardEffect a aplicar si se cumple
- `ifFalse` (opcional): CardEffect a aplicar si no se cumple
- `discardAfter` (opcional): Boolean
- `removeAfter` (opcional): Boolean

**Ejemplo:**

```json
{
  "condition": {
    "type": "has_hope",
    "value": "justicia",
    "description": "Si tienes Justicia activa"
  },
  "ifTrue": {
    "type": "gain_resource",
    "description": "Gana 2 carbón"
  },
  "ifFalse": {
    "type": "lose_resource",
    "description": "Pierde 1 carbón"
  },
  "discardAfter": true
}
```

### 3. MultiConditionalEffect (If-ElseIf-ElseIf-Else)

**Campos:**

- `branches` (requerido): Array de objetos {condition, effect}
- `default` (opcional): CardEffect si ninguna condición se cumple
- `discardAfter` (opcional): Boolean
- `removeAfter` (opcional): Boolean

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
        "description": "Pierde 2 carbón"
      }
    }
  ],
  "default": {
    "type": "custom",
    "description": "No pasa nada"
  }
}
```

### 4. ChoiceEffect (Elección del Jugador)

**Campos:**

- `description` (requerido): Texto a mostrar ("Elige uno:")
- `minChoices` (requerido): Número mínimo de opciones a elegir
- `maxChoices` (requerido): Número máximo de opciones a elegir
- `options` (requerido): Array de CardEffect
- `discardAfter` (opcional): Boolean - Aplica a todas las opciones
- `removeAfter` (opcional): Boolean - Aplica a todas las opciones

**Ejemplo:**

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
      "type": "heal",
      "description": "Cura 2",
      "discardAfter": true
    }
  ]
}
```

### 5. ForEachEffect (Iterativo)

**Campos:**

- `target` (requerido): Qué se itera (ver lista de targets abajo)
- `effect` (requerido): CardEffect que se aplica por cada uno
- `description` (requerido): Descripción del efecto iterativo
- `discardAfter` (opcional): Boolean
- `removeAfter` (opcional): Boolean

**Ejemplo:**

```json
{
  "target": "justicia_activa",
  "effect": {
    "type": "gain_resource",
    "description": "Gana 1 carbón"
  },
  "description": "Por cada Justicia activa",
  "discardAfter": true
}
```

### 6. CompositeEffect (Múltiples Efectos)

**Campos:**

- `effects` (requerido): Array de CardEffect
- `description` (opcional): Descripción del conjunto
- `discardAfter` (opcional): Boolean
- `removeAfter` (opcional): Boolean

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
    },
    {
      "type": "change_discontent",
      "description": "-1 Descontento"
    }
  ],
  "removeAfter": true
}
```

## Objeto Condition

**Campos:**

- `type` (requerido): Tipo de condición (ver lista abajo)
- `operator` (opcional): Operador de comparación
- `value` (opcional): Valor a comparar
- `compareWith` (opcional): Para comparaciones entre dos valores
- `description` (requerido): Texto legible de la condición

### Tipos de Condiciones (ConditionType)

| Tipo                      | Descripción                       | value                             | compareWith                | operator |
| ------------------------- | --------------------------------- | --------------------------------- | -------------------------- | -------- |
| `has_hope`                | Tiene esperanza específica activa | "justicia"/"cuidado"/"motivacion" | -                          | -        |
| `has_discontent`          | Tiene descontento específico      | "codicia"/"ira"/"apatia"          | -                          | -        |
| `has_building`            | Edificio construido               | ID del edificio                   | -                          | -        |
| `has_law`                 | Ley activa                        | ID de la ley                      | -                          | -        |
| `compare_hope_discontent` | Compara esperanza vs descontento  | -                                 | -                          | ✓        |
| `hunger_level`            | Nivel de hambre                   | Número                            | -                          | ✓        |
| `stress_level`            | Nivel de estrés                   | Número                            | -                          | ✓        |
| `resource_amount`         | Cantidad de recurso               | Número                            | "carbon"/"madera"/"comida" | ✓        |
| `citizens_type`           | Cantidad de ciudadanos            | Número                            | Tipo de ciudadano          | ✓        |
| `custom`                  | Condición personalizada           | -                                 | -                          | -        |

### Operadores de Comparación (ComparisonOperator)

- `equal` - Igual a
- `not_equal` - Diferente de
- `greater_than` - Mayor que
- `less_than` - Menor que
- `greater_or_equal` - Mayor o igual que
- `less_or_equal` - Menor o igual que

## Tipos de Efectos Básicos (EffectType)

### Recursos

- `gain_resource` - Ganar recurso
- `lose_resource` - Perder recurso
- `take_from_map` - Tomar recurso del mapa
- `remove_from_map` - Eliminar recurso del mapa

### Ciudadanos

- `gain_citizen` - Ganar ciudadano
- `lose_citizen` - Perder ciudadano
- `die_citizen` - Ciudadano muere
- `gain_sick` - Ganar ciudadano enfermo
- `heal` - Curar ciudadanos
- `treat` - Tratar enfermos

### Esperanza/Descontento

- `change_hope` - Cambiar esperanza (+/-)
- `change_discontent` - Cambiar descontento (+/-)
- `activate_hope` - Activar ficha de esperanza
- `activate_discontent` - Activar ficha de descontento
- `exhaust_hope` - Agotar esperanza
- `exhaust_discontent` - Agotar descontento

### Métricas

- `change_hunger` - Cambiar nivel de hambre
- `change_stress` - Cambiar nivel de estrés

### Edificios

- `build_building` - Construir edificio
- `upgrade_building` - Mejorar edificio
- `destroy_building` - Destruir edificio

### Leyes

- `introduce_law` - Introducir nueva ley
- `discard_law` - Descartar ley

### Trabajadores

- `reuse_worker` - Reutilizar trabajador
- `exhaust_worker` - Agotar trabajador/ingeniero/niño

### Mapa

- `place_tile` - Colocar loseta de mapa
- `move_development` - Mover ficha de desarrollo

### Otros

- `workshop_effect` - Efecto de taller
- `flip_disease` - Voltear marcador de enfermedad
- `card_effect` - Efecto especial de carta

### Manipulación del Mazo

- `add_card_to_deck` - Agregar carta al mazo (requiere `cardId`)
- `remove_card_from_deck` - Eliminar esta carta del mazo
- `discard_card` - Descartar esta carta
- `shuffle_card_into_deck` - Barajar esta carta en el mazo

### Personalizado

- `custom` - Efecto personalizado con descripción

## Targets para ForEachEffect

### Esperanza

- `justicia_activa` - Por cada Justicia activa
- `cuidado_activa` - Por cada Cuidado activo
- `motivacion_activa` - Por cada Motivación activa
- `esperanza_activa_total` - Por cada ficha de Esperanza activa

### Descontento

- `codicia_activa` - Por cada Codicia activa
- `ira_activa` - Por cada Ira activa
- `apatia_activa` - Por cada Apatía activa
- `descontento_activo_total` - Por cada ficha de Descontento activa

### Ronda

- `niño_usado_esta_ronda` - Por cada niño usado en esta ronda
- `trabajador_usado_esta_ronda` - Por cada trabajador usado

## Flags de Ciclo de Vida

### `discardAfter`

- **Valor:** `true` | `false`
- **Efecto:** La carta se mueve a la pila de descartes
- **Puede volver:** Sí, si el mazo se mezcla con los descartes

### `removeAfter`

- **Valor:** `true` | `false`
- **Efecto:** La carta se elimina permanentemente del juego
- **Puede volver:** No

### Prioridad

Si ambos están en `true`, `removeAfter` tiene prioridad.

### Ubicación de los Flags

Los flags pueden estar en:

- **BasicEffect**: A nivel del efecto individual
- **ChoiceEffect**: A nivel global (aplica a todas las opciones) O en cada opción individual
- **ConditionalEffect**: Se aplica después de ejecutar la rama
- **MultiConditionalEffect**: Se aplica después de ejecutar la rama que coincide
- **CompositeEffect**: Se aplica después de todos los efectos
- **ForEachEffect**: Se aplica después de todas las iteraciones

## Ejemplos Rápidos

### Simple

```json
{
  "type": "gain_resource",
  "description": "Gana 2 carbón",
  "discardAfter": true
}
```

### Condicional Simple

```json
{
  "condition": {
    "type": "has_hope",
    "value": "justicia",
    "description": "Si tienes Justicia activa"
  },
  "ifTrue": { "type": "heal", "description": "Cura 3" },
  "ifFalse": { "type": "gain_sick", "description": "Gana 1 enfermo" },
  "discardAfter": true
}
```

### Elección

```json
{
  "description": "Elige uno:",
  "minChoices": 1,
  "maxChoices": 1,
  "options": [
    { "type": "gain_resource", "description": "Gana 2 carbón" },
    { "type": "heal", "description": "Cura 2" }
  ],
  "discardAfter": true
}
```

### Elección con Flags Individuales

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

### Multi-Condicional (Más/Menos/Empate)

```json
{
  "branches": [
    {
      "condition": {
        "type": "compare_hope_discontent",
        "operator": "greater_than",
        "description": "Si tienes más Esperanza"
      },
      "effect": { "type": "gain_resource", "description": "Gana 3 carbón" }
    },
    {
      "condition": {
        "type": "compare_hope_discontent",
        "operator": "less_than",
        "description": "Si tienes menos Esperanza"
      },
      "effect": { "type": "lose_resource", "description": "Pierde 2 carbón" }
    }
  ],
  "default": { "type": "custom", "description": "No pasa nada" }
}
```

### Iterativo

```json
{
  "target": "justicia_activa",
  "effect": { "type": "gain_resource", "description": "Gana 1 carbón" },
  "description": "Por cada Justicia activa",
  "discardAfter": true
}
```

### Múltiples Efectos

```json
{
  "effects": [
    { "type": "gain_resource", "description": "Gana 2 carbón" },
    { "type": "heal", "description": "Cura 1" },
    { "type": "change_discontent", "description": "-1 Descontento" }
  ],
  "removeAfter": true
}
```

### Combinación Compleja

```json
{
  "condition": {
    "type": "has_hope",
    "value": "justicia",
    "description": "Si tienes Justicia activa"
  },
  "ifTrue": {
    "description": "Elige 1 o 2:",
    "minChoices": 1,
    "maxChoices": 2,
    "options": [
      { "type": "gain_resource", "description": "Gana 2 carbón" },
      { "type": "heal", "description": "Cura 3" }
    ],
    "discardAfter": true
  },
  "ifFalse": {
    "type": "lose_citizen",
    "description": "Pierde 1 trabajador",
    "removeAfter": true
  }
}
```

### Manipulación del Mazo

```json
{
  "description": "Elige uno:",
  "minChoices": 1,
  "maxChoices": 1,
  "options": [
    {
      "effects": [
        { "type": "gain_resource", "description": "Gana 3 carbón" },
        { "type": "remove_card_from_deck", "description": "Elimina esta carta" }
      ]
    },
    {
      "effects": [
        { "type": "gain_resource", "description": "Gana 1 carbón" },
        { "type": "shuffle_card_into_deck", "description": "Baraja esta carta" }
      ]
    }
  ]
}
```

## Plantilla Completa de Carta

```json
{
  "id": "L01A",
  "type": "consecuencia_ley",
  "variante": "A",
  "etiqueta": "ANOCHECER",
  "titulo": "ACCIDENTES LABORALES",
  "textoAmbientacion": "Texto narrativo de la carta...",
  "efecto": "Texto legible: Si tienes Cuidado activo: ...",
  "efectoEstructurado": {
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
    },
    "discardAfter": true
  }
}
```

## Validación Rápida

### ✅ Todo BasicEffect debe tener:

- `type`
- `description`

### ✅ Todo ConditionalEffect debe tener:

- `condition` con `type` y `description`
- `ifTrue`

### ✅ Todo ChoiceEffect debe tener:

- `description`
- `minChoices` ≤ `maxChoices`
- `options` (array no vacío)

### ✅ Todo ForEachEffect debe tener:

- `target`
- `effect`
- `description`

### ✅ Todo CompositeEffect debe tener:

- `effects` (array no vacío)

## Notas Importantes

1. **Anidación**: Cualquier `CardEffect` puede contener otro `CardEffect`, permitiendo estructuras infinitamente complejas
2. **Flags vs Efectos Explícitos**: Usa `discardAfter`/`removeAfter` para simplicidad, o efectos explícitos (`discard_card`/`remove_card_from_deck`) para mayor control
3. **Prioridad**: Los flags en efectos individuales tienen prioridad sobre los flags globales
4. **Descripción**: Siempre incluye una `description` clara, es lo que ve el usuario
5. **cardId**: Solo necesario para `add_card_to_deck`, opcional para otros efectos de mazo
