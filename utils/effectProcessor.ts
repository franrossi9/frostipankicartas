import {
  BasicEffect,
  CardEffect,
  ComparisonOperator,
  Condition,
  ConditionType,
  EffectType,
  isBasicEffect,
  isChoiceEffect,
  isCompositeEffect,
  isConditionalEffect,
  isForEachEffect,
  isMultiConditionalEffect,
} from "../types/card";

/**
 * Helper para procesar y evaluar efectos de cartas
 */

// ============================================
// EVALUACIÓN DE CONDICIONES
// ============================================

export interface GameState {
  // Esperanza
  hopeTokens: {
    justicia: { active: number; exhausted: number };
    cuidado: { active: number; exhausted: number };
    motivacion: { active: number; exhausted: number };
  };
  // Descontento
  discontentTokens: {
    codicia: { active: number; exhausted: number };
    ira: { active: number; exhausted: number };
    apatia: { active: number; exhausted: number };
  };
  // Recursos
  resources: {
    carbon: number;
    madera: number;
    comida: number;
  };
  // Ciudadanos
  citizens: {
    trabajadores: number;
    ingenieros: number;
    ninos: number;
    trabajadoresEnfermos: number;
    ingenierosEnfermos: number;
    ninosEnfermos: number;
  };
  // Métricas
  hunger: number;
  stress: number;
  // Edificios construidos
  buildings: string[];
  // Leyes activas
  laws: string[];
  // Datos temporales de la ronda
  roundData?: {
    ninosUsados?: number;
    trabajadoresUsados?: number;
  };
}

/**
 * Evalúa si una condición se cumple dado el estado del juego
 */
export function evaluateCondition(
  condition: Condition,
  gameState: GameState
): boolean {
  switch (condition.type) {
    case ConditionType.HAS_HOPE: {
      const hopeType = condition.value as keyof typeof gameState.hopeTokens;
      return gameState.hopeTokens[hopeType]?.active > 0;
    }

    case ConditionType.HAS_DISCONTENT: {
      const discontentType =
        condition.value as keyof typeof gameState.discontentTokens;
      return gameState.discontentTokens[discontentType]?.active > 0;
    }

    case ConditionType.HAS_BUILDING: {
      return gameState.buildings.includes(condition.value as string);
    }

    case ConditionType.HAS_LAW: {
      return gameState.laws.includes(condition.value as string);
    }

    case ConditionType.COMPARE_HOPE_DISCONTENT: {
      const totalHope = Object.values(gameState.hopeTokens).reduce(
        (sum, token) => sum + token.active,
        0
      );
      const totalDiscontent = Object.values(gameState.discontentTokens).reduce(
        (sum, token) => sum + token.active,
        0
      );
      return compareValues(
        totalHope,
        totalDiscontent,
        condition.operator || ComparisonOperator.EQUAL
      );
    }

    case ConditionType.HUNGER_LEVEL: {
      return compareValues(
        gameState.hunger,
        condition.value as number,
        condition.operator || ComparisonOperator.EQUAL
      );
    }

    case ConditionType.STRESS_LEVEL: {
      return compareValues(
        gameState.stress,
        condition.value as number,
        condition.operator || ComparisonOperator.EQUAL
      );
    }

    case ConditionType.RESOURCE_AMOUNT: {
      const resourceType =
        condition.compareWith as keyof typeof gameState.resources;
      const resourceAmount = gameState.resources[resourceType] || 0;
      return compareValues(
        resourceAmount,
        condition.value as number,
        condition.operator || ComparisonOperator.EQUAL
      );
    }

    case ConditionType.CITIZENS_TYPE: {
      const citizenType =
        condition.compareWith as keyof typeof gameState.citizens;
      const citizenAmount = gameState.citizens[citizenType] || 0;
      return compareValues(
        citizenAmount,
        condition.value as number,
        condition.operator || ComparisonOperator.EQUAL
      );
    }

    case ConditionType.CUSTOM: {
      // Para condiciones personalizadas, necesitarás implementar lógica específica
      // o retornar true y manejarla manualmente
      console.warn(
        "Condición personalizada no implementada:",
        condition.description
      );
      return false;
    }

    default:
      console.warn("Tipo de condición desconocido:", condition.type);
      return false;
  }
}

/**
 * Compara dos valores según un operador
 */
function compareValues(
  a: number,
  b: number,
  operator: ComparisonOperator
): boolean {
  switch (operator) {
    case ComparisonOperator.EQUAL:
      return a === b;
    case ComparisonOperator.NOT_EQUAL:
      return a !== b;
    case ComparisonOperator.GREATER_THAN:
      return a > b;
    case ComparisonOperator.LESS_THAN:
      return a < b;
    case ComparisonOperator.GREATER_OR_EQUAL:
      return a >= b;
    case ComparisonOperator.LESS_OR_EQUAL:
      return a <= b;
    default:
      return false;
  }
}

// ============================================
// RESOLUCIÓN DE EFECTOS
// ============================================

export type EffectResolutionCallback = (
  effect: BasicEffect,
  gameState: GameState
) => Promise<void>;

export type DeckManipulationCallback = (
  effectType: EffectType,
  cardId?: string
) => Promise<void>;

export type ChoiceCallback = (
  options: CardEffect[],
  min: number,
  max: number
) => Promise<CardEffect[]>;

/**
 * Resuelve un efecto de carta de forma recursiva
 * @param effect - El efecto a resolver
 * @param gameState - Estado actual del juego
 * @param onResolveBasicEffect - Callback para aplicar efectos básicos
 * @param onMakeChoice - Callback para que el jugador elija opciones
 */
export async function resolveEffect(
  effect: CardEffect,
  gameState: GameState,
  onResolveBasicEffect: EffectResolutionCallback,
  onMakeChoice: ChoiceCallback
): Promise<void> {
  // Efecto básico
  if (isBasicEffect(effect)) {
    await onResolveBasicEffect(effect, gameState);
    return;
  }

  // Efecto condicional (if-else)
  if (isConditionalEffect(effect)) {
    const conditionMet = evaluateCondition(effect.condition, gameState);
    const effectToResolve = conditionMet ? effect.ifTrue : effect.ifFalse;
    if (effectToResolve) {
      await resolveEffect(
        effectToResolve,
        gameState,
        onResolveBasicEffect,
        onMakeChoice
      );
    }
    return;
  }

  // Efecto multi-condicional (if-else if-else if)
  if (isMultiConditionalEffect(effect)) {
    for (const branch of effect.branches) {
      if (evaluateCondition(branch.condition, gameState)) {
        await resolveEffect(
          branch.effect,
          gameState,
          onResolveBasicEffect,
          onMakeChoice
        );
        return;
      }
    }
    // Si ninguna condición se cumplió, usar el efecto por defecto
    if (effect.default) {
      await resolveEffect(
        effect.default,
        gameState,
        onResolveBasicEffect,
        onMakeChoice
      );
    }
    return;
  }

  // Efecto de elección
  if (isChoiceEffect(effect)) {
    const chosenEffects = await onMakeChoice(
      effect.options,
      effect.minChoices,
      effect.maxChoices
    );
    for (const chosen of chosenEffects) {
      await resolveEffect(
        chosen,
        gameState,
        onResolveBasicEffect,
        onMakeChoice
      );
    }
    return;
  }

  // Efecto "por cada" (iterativo)
  if (isForEachEffect(effect)) {
    const count = getIterationCount(effect.target, gameState);
    for (let i = 0; i < count; i++) {
      await resolveEffect(
        effect.effect,
        gameState,
        onResolveBasicEffect,
        onMakeChoice
      );
    }
    return;
  }

  // Efecto compuesto (múltiples efectos en secuencia)
  if (isCompositeEffect(effect)) {
    for (const subEffect of effect.effects) {
      await resolveEffect(
        subEffect,
        gameState,
        onResolveBasicEffect,
        onMakeChoice
      );
    }
    return;
  }

  console.warn("Tipo de efecto desconocido:", effect);
}

/**
 * Obtiene la cantidad de iteraciones para un efecto "por cada"
 */
function getIterationCount(target: string, gameState: GameState): number {
  // Esperanza activa
  if (target === "justicia_activa") return gameState.hopeTokens.justicia.active;
  if (target === "cuidado_activa") return gameState.hopeTokens.cuidado.active;
  if (target === "motivacion_activa")
    return gameState.hopeTokens.motivacion.active;

  // Descontento activo
  if (target === "codicia_activa")
    return gameState.discontentTokens.codicia.active;
  if (target === "ira_activa") return gameState.discontentTokens.ira.active;
  if (target === "apatia_activa")
    return gameState.discontentTokens.apatia.active;

  // Datos de ronda
  if (target === "niño_usado_esta_ronda")
    return gameState.roundData?.ninosUsados || 0;
  if (target === "trabajador_usado_esta_ronda")
    return gameState.roundData?.trabajadoresUsados || 0;

  // Total de esperanza/descontento
  if (target === "esperanza_activa_total") {
    return Object.values(gameState.hopeTokens).reduce(
      (sum, token) => sum + token.active,
      0
    );
  }
  if (target === "descontento_activo_total") {
    return Object.values(gameState.discontentTokens).reduce(
      (sum, token) => sum + token.active,
      0
    );
  }

  console.warn("Target de iteración desconocido:", target);
  return 0;
}

// ============================================
// HELPERS DE TEXTO
// ============================================

/**
 * Convierte un efecto estructurado a texto legible (para mostrar al jugador)
 */
export function effectToText(effect: CardEffect, indent: number = 0): string {
  const prefix = "  ".repeat(indent);

  if (isBasicEffect(effect)) {
    return `${prefix}${effect.description}`;
  }

  if (isConditionalEffect(effect)) {
    let text = `${prefix}${effect.condition.description}:\n`;
    text += effectToText(effect.ifTrue, indent + 1);
    if (effect.ifFalse) {
      text += `\n${prefix}En caso contrario:\n`;
      text += effectToText(effect.ifFalse, indent + 1);
    }
    return text;
  }

  if (isMultiConditionalEffect(effect)) {
    let text = "";
    effect.branches.forEach((branch, index) => {
      const condPrefix = index === 0 ? "" : "De lo contrario, ";
      text += `${prefix}${condPrefix}${branch.condition.description}:\n`;
      text += effectToText(branch.effect, indent + 1);
      if (index < effect.branches.length - 1) text += "\n";
    });
    if (effect.default) {
      text += `\n${prefix}De lo contrario:\n`;
      text += effectToText(effect.default, indent + 1);
    }
    return text;
  }

  if (isChoiceEffect(effect)) {
    let text = `${prefix}${effect.description}\n`;
    effect.options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C...
      text += `${prefix}${letter}) ${effectToText(option, 0).trim()}\n`;
    });
    return text.trimEnd();
  }

  if (isForEachEffect(effect)) {
    return `${prefix}${effect.description}: ${effectToText(
      effect.effect,
      0
    ).trim()}`;
  }

  if (isCompositeEffect(effect)) {
    return effect.effects
      .map((e) => effectToText(e, indent))
      .join(`\n${prefix}Luego: `);
  }

  return `${prefix}[Efecto desconocido]`;
}

/**
 * Valida que un efecto estructurado sea válido
 */
export function validateEffect(effect: CardEffect): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (isBasicEffect(effect)) {
    if (!effect.type || !Object.values(EffectType).includes(effect.type)) {
      errors.push(`Tipo de efecto inválido: ${effect.type}`);
    }
    if (!effect.description) {
      errors.push("Efecto básico sin descripción");
    }
  } else if (isConditionalEffect(effect)) {
    if (!effect.condition) {
      errors.push("Efecto condicional sin condición");
    }
    if (!effect.ifTrue) {
      errors.push("Efecto condicional sin rama 'ifTrue'");
    }
  } else if (isMultiConditionalEffect(effect)) {
    if (!effect.branches || effect.branches.length === 0) {
      errors.push("Efecto multi-condicional sin ramas");
    }
  } else if (isChoiceEffect(effect)) {
    if (!effect.options || effect.options.length === 0) {
      errors.push("Efecto de elección sin opciones");
    }
    if (effect.minChoices > effect.maxChoices) {
      errors.push("minChoices no puede ser mayor que maxChoices");
    }
  } else if (isForEachEffect(effect)) {
    if (!effect.target) {
      errors.push("Efecto 'por cada' sin target");
    }
    if (!effect.effect) {
      errors.push("Efecto 'por cada' sin efecto interno");
    }
  } else if (isCompositeEffect(effect)) {
    if (!effect.effects || effect.effects.length === 0) {
      errors.push("Efecto compuesto sin sub-efectos");
    }
  } else {
    errors.push("Tipo de efecto no reconocido");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
