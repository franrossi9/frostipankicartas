export enum CardType {
  CONSECUENCIA_LEY = "consecuencia_ley",
  DISPUTA_SOCIAL = "disputa_social",
  OCASO = "ocaso",
}

// ============================================
// SISTEMA DE EFECTOS
// ============================================

// Tipos de condiciones posibles
export enum ConditionType {
  HAS_HOPE = "has_hope", // Tiene esperanza específica activa
  HAS_DISCONTENT = "has_discontent", // Tiene descontento específico activo
  HAS_BUILDING = "has_building", // Edificio construido
  HAS_LAW = "has_law", // Ley activa
  COMPARE_HOPE_DISCONTENT = "compare_hope_discontent", // Comparar cantidad de esperanza vs descontento
  HUNGER_LEVEL = "hunger_level", // Nivel de hambre
  STRESS_LEVEL = "stress_level", // Nivel de estrés
  RESOURCE_AMOUNT = "resource_amount", // Cantidad de recurso
  CITIZENS_TYPE = "citizens_type", // Cantidad de ciudadanos de cierto tipo
  CUSTOM = "custom", // Condición personalizada con texto libre
}

// Operadores de comparación
export enum ComparisonOperator {
  EQUAL = "equal",
  NOT_EQUAL = "not_equal",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  GREATER_OR_EQUAL = "greater_or_equal",
  LESS_OR_EQUAL = "less_or_equal",
}

// Condición base
export interface Condition {
  type: ConditionType;
  operator?: ComparisonOperator;
  value?: string | number; // El valor a comparar (ej: "justicia", "refugio_infantil", 2)
  compareWith?: string; // Para comparaciones entre dos valores (ej: "esperanza" vs "descontento")
  description: string; // Descripción legible de la condición
}

// Tipos de efectos básicos
export enum EffectType {
  GAIN_RESOURCE = "gain_resource", // Ganar recurso (carbón, madera, comida, etc.)
  LOSE_RESOURCE = "lose_resource", // Perder recurso
  GAIN_CITIZEN = "gain_citizen", // Ganar ciudadano (trabajador, ingeniero, niño)
  LOSE_CITIZEN = "lose_citizen", // Perder ciudadano
  GAIN_SICK = "gain_sick", // Ganar ciudadano enfermo
  HEAL = "heal", // Curar ciudadanos
  TREAT = "treat", // Tratar enfermos
  CHANGE_HOPE = "change_hope", // Cambiar esperanza (+/-)
  CHANGE_DISCONTENT = "change_discontent", // Cambiar descontento (+/-)
  ACTIVATE_HOPE = "activate_hope", // Activar ficha de esperanza
  ACTIVATE_DISCONTENT = "activate_discontent", // Activar ficha de descontento
  EXHAUST_HOPE = "exhaust_hope", // Agotar esperanza
  EXHAUST_DISCONTENT = "exhaust_discontent", // Agotar descontento
  CHANGE_HUNGER = "change_hunger", // Cambiar nivel de hambre
  CHANGE_STRESS = "change_stress", // Cambiar nivel de estrés
  BUILD_BUILDING = "build_building", // Construir edificio
  UPGRADE_BUILDING = "upgrade_building", // Mejorar edificio
  DESTROY_BUILDING = "destroy_building", // Destruir edificio
  INTRODUCE_LAW = "introduce_law", // Introducir nueva ley
  DISCARD_LAW = "discard_law", // Descartar ley
  REUSE_WORKER = "reuse_worker", // Reutilizar trabajador
  EXHAUST_WORKER = "exhaust_worker", // Agotar trabajador/ingeniero/niño
  DIE_CITIZEN = "die_citizen", // Ciudadano muere
  PLACE_TILE = "place_tile", // Colocar loseta de mapa
  MOVE_DEVELOPMENT = "move_development", // Mover ficha de desarrollo
  WORKSHOP_EFFECT = "workshop_effect", // Efecto de taller
  FLIP_DISEASE = "flip_disease", // Voltear marcador de enfermedad
  TAKE_FROM_MAP = "take_from_map", // Tomar recurso del mapa
  REMOVE_FROM_MAP = "remove_from_map", // Eliminar recurso del mapa
  CARD_EFFECT = "card_effect", // Efecto especial de carta (overlay, etc.)
  ADD_CARD_TO_DECK = "add_card_to_deck", // Agregar una carta al mazo por ID
  REMOVE_CARD_FROM_DECK = "remove_card_from_deck", // Eliminar esta carta del mazo
  DISCARD_CARD = "discard_card", // Descartar esta carta (moverla a la pila de descartes)
  SHUFFLE_CARD_INTO_DECK = "shuffle_card_into_deck", // Barajar una carta específica en el mazo
  CUSTOM = "custom", // Efecto personalizado con descripción
}

// Efecto básico individual
export interface BasicEffect {
  type: EffectType;
  cardId?: string; // ID de la carta (solo para efectos de mazo)
  description: string; // Descripción completa del efecto para mostrar al usuario
  discardAfter?: boolean; // Si true, descarta esta carta después de aplicar el efecto
  removeAfter?: boolean; // Si true, elimina esta carta del mazo después de aplicar el efecto
}

// Efecto con condición (bifurcación simple)
export interface ConditionalEffect {
  condition: Condition;
  ifTrue: CardEffect; // Efecto si se cumple la condición
  ifFalse?: CardEffect; // Efecto si no se cumple (opcional)
  discardAfter?: boolean; // Si true, descarta esta carta después de aplicar
  removeAfter?: boolean; // Si true, elimina esta carta después de aplicar
}

// Efecto multi-condicional (múltiples ramas: if-else if-else if-else)
export interface MultiConditionalEffect {
  branches: {
    condition: Condition;
    effect: CardEffect;
  }[];
  default?: CardEffect; // Efecto por defecto si ninguna condición se cumple
  discardAfter?: boolean; // Si true, descarta esta carta después de aplicar
  removeAfter?: boolean; // Si true, elimina esta carta después de aplicar
}

// Efecto de elección múltiple (el jugador elige)
export interface ChoiceEffect {
  description: string; // Texto que se muestra al jugador (ej: "Elige uno:")
  minChoices: number; // Mínimo de opciones a elegir (normalmente 1)
  maxChoices: number; // Máximo de opciones a elegir
  options: CardEffect[]; // Las opciones disponibles
  discardAfter?: boolean; // Si true, descarta esta carta después de elegir
  removeAfter?: boolean; // Si true, elimina esta carta después de elegir
}

// Efecto por cada (iterativo)
export interface ForEachEffect {
  target: string; // Qué se itera (ej: "cada esperanza activa", "cada niño usado")
  effect: CardEffect; // Efecto que se aplica por cada uno
  description: string;
  discardAfter?: boolean; // Si true, descarta esta carta después de iterar
  removeAfter?: boolean; // Si true, elimina esta carta después de iterar
}

// Efecto compuesto (múltiples efectos en secuencia)
export interface CompositeEffect {
  effects: CardEffect[]; // Lista de efectos a aplicar en orden
  description?: string; // Descripción opcional del conjunto
  discardAfter?: boolean; // Si true, descarta esta carta después de aplicar todos los efectos
  removeAfter?: boolean; // Si true, elimina esta carta después de aplicar todos los efectos
}

// Unión de todos los tipos de efectos posibles
export type CardEffect =
  | BasicEffect
  | ConditionalEffect
  | MultiConditionalEffect
  | ChoiceEffect
  | ForEachEffect
  | CompositeEffect;

// Helper para identificar el tipo de efecto
export function isBasicEffect(effect: CardEffect): effect is BasicEffect {
  return (
    "type" in effect &&
    Object.values(EffectType).includes((effect as BasicEffect).type)
  );
}

export function isConditionalEffect(
  effect: CardEffect
): effect is ConditionalEffect {
  return "condition" in effect && "ifTrue" in effect;
}

export function isMultiConditionalEffect(
  effect: CardEffect
): effect is MultiConditionalEffect {
  return (
    "branches" in effect &&
    Array.isArray((effect as MultiConditionalEffect).branches)
  );
}

export function isChoiceEffect(effect: CardEffect): effect is ChoiceEffect {
  return "options" in effect && Array.isArray((effect as ChoiceEffect).options);
}

export function isForEachEffect(effect: CardEffect): effect is ForEachEffect {
  return "target" in effect && "effect" in effect && "description" in effect;
}

export function isCompositeEffect(
  effect: CardEffect
): effect is CompositeEffect {
  return (
    "effects" in effect && Array.isArray((effect as CompositeEffect).effects)
  );
}

// ============================================
// INTERFAZ DE CARTA
// ============================================

export interface Card {
  id: string;
  type: CardType;
  etiqueta: string;
  titulo: string;
  textoAmbientacion: string;
  efecto: string; // Texto del efecto (para mostrar al usuario)
  efectoEstructurado?: CardEffect; // Efecto estructurado (para procesar lógica)
  variante?: string; // Solo para Consecuencia Ley
  [key: string]: any;
}

export interface Deck {
  cards: Card[];
}
