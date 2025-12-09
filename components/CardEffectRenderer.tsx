import {
  CardEffect,
  isBasicEffect,
  isChoiceEffect,
  isCompositeEffect,
  isConditionalEffect,
  isForEachEffect,
  isMultiConditionalEffect,
} from "@/types/card";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

interface CardEffectRendererProps {
  effect: CardEffect;
  onEffectSelected?: (effect: CardEffect) => void;
  depth?: number;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export const CardEffectRenderer: React.FC<CardEffectRendererProps> = ({
  effect,
  onEffectSelected,
  depth = 0,
  scrollViewRef,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<
    "true" | "false" | "default" | string | null
  >(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const indentStyle = { marginLeft: depth * 16 };

  // Efecto Básico
  if (isBasicEffect(effect)) {
    return (
      <View style={[styles.effectContainer, indentStyle]}>
        <ThemedText style={styles.effectText}>{effect.description}</ThemedText>
        {(effect.discardAfter || effect.removeAfter) && (
          <ThemedText style={styles.lifecycleText}>
            {effect.removeAfter ? "🗑️ Eliminar carta" : "📤 Descartar carta"}
          </ThemedText>
        )}
      </View>
    );
  }

  // Efecto Condicional (If-Else)
  if (isConditionalEffect(effect)) {
    return (
      <View style={[styles.conditionalContainer, indentStyle]}>
        <ThemedText style={styles.conditionTitle}>
          {effect.condition.description}
        </ThemedText>

        <View style={styles.conditionButtons}>
          <TouchableOpacity
            style={[
              styles.conditionButton,
              selectedCondition === "true" && styles.conditionButtonSelected,
            ]}
            onPress={() => {
              setSelectedCondition("true");
              if (onEffectSelected) {
                onEffectSelected(effect.ifTrue);
              }
            }}
          >
            <ThemedText style={styles.conditionButtonText}>
              ✓ Sí se cumple
            </ThemedText>
          </TouchableOpacity>

          {effect.ifFalse && (
            <TouchableOpacity
              style={[
                styles.conditionButton,
                selectedCondition === "false" && styles.conditionButtonSelected,
              ]}
              onPress={() => {
                setSelectedCondition("false");
                if (onEffectSelected) {
                  onEffectSelected(effect.ifFalse!);
                }
              }}
            >
              <ThemedText style={styles.conditionButtonText}>
                ✗ No se cumple
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {selectedCondition === "true" && (
          <View
            style={styles.selectedEffect}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              if (scrollViewRef?.current && layout.y) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: layout.y - 20,
                    animated: true,
                  });
                }, 100);
              }
            }}
          >
            <ThemedText style={styles.selectedLabel}>
              → Efecto seleccionado:
            </ThemedText>
            <CardEffectRenderer
              effect={effect.ifTrue}
              onEffectSelected={onEffectSelected}
              depth={depth + 1}
            />
          </View>
        )}

        {selectedCondition === "false" && effect.ifFalse && (
          <View
            style={styles.selectedEffect}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              if (scrollViewRef?.current && layout.y) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: layout.y - 20,
                    animated: true,
                  });
                }, 100);
              }
            }}
          >
            <ThemedText style={styles.selectedLabel}>
              → Efecto seleccionado:
            </ThemedText>
            <CardEffectRenderer
              effect={effect.ifFalse}
              onEffectSelected={onEffectSelected}
              depth={depth + 1}
            />
          </View>
        )}

        {(effect.discardAfter || effect.removeAfter) && (
          <ThemedText style={styles.lifecycleText}>
            {effect.removeAfter
              ? "🗑️ Eliminar carta después"
              : "📤 Descartar carta después"}
          </ThemedText>
        )}
      </View>
    );
  }

  // Efecto Multi-Condicional
  if (isMultiConditionalEffect(effect)) {
    const handleBranchToggle = (index: number) => {
      const currentSelected = selectedOptions.includes(index)
        ? selectedOptions.filter((i) => i !== index)
        : [...selectedOptions, index];

      setSelectedOptions(currentSelected);

      if (onEffectSelected) {
        currentSelected.forEach((idx) => {
          onEffectSelected(effect.branches[idx].effect);
        });
      }
    };

    return (
      <View style={[styles.multiConditionalContainer, indentStyle]}>
        {effect.description && (
          <ThemedText style={styles.sectionTitle}>
            {effect.description}
          </ThemedText>
        )}
        <ThemedText style={styles.conditionSubtitle}>
          Selecciona todas las condiciones que se cumplen:
        </ThemedText>

        {effect.branches.map((branch, index) => {
          const isSelected = selectedOptions.includes(index);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.branchButton,
                isSelected && styles.branchButtonSelected,
              ]}
              onPress={() => handleBranchToggle(index)}
            >
              <View style={styles.branchHeader}>
                <ThemedText
                  style={[
                    styles.branchTitle,
                    isSelected && styles.branchTitleSelected,
                  ]}
                >
                  {branch.condition.description}
                </ThemedText>
                {isSelected && (
                  <ThemedText style={styles.branchCheck}>✓</ThemedText>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {effect.default && (
          <TouchableOpacity
            style={[
              styles.branchButton,
              styles.defaultBranch,
              selectedCondition === "default" && styles.branchButtonSelected,
            ]}
            onPress={() => {
              setSelectedCondition("default" as any);
              setSelectedOptions([]);
              if (onEffectSelected) {
                onEffectSelected(effect.default!);
              }
            }}
          >
            <ThemedText style={styles.branchTitle}>
              De lo contrario / Empate
            </ThemedText>
          </TouchableOpacity>
        )}

        {selectedOptions.length > 0 && (
          <View
            style={styles.selectedEffectsContainer}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              if (scrollViewRef?.current && layout.y) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: layout.y - 20,
                    animated: true,
                  });
                }, 100);
              }
            }}
          >
            <ThemedText style={styles.selectedLabel}>
              → Efectos a realizar ({selectedOptions.length}):
            </ThemedText>
            {selectedOptions.map((idx) => (
              <View key={idx} style={styles.multiSelectedEffect}>
                <ThemedText style={styles.multiEffectLabel}>
                  • {effect.branches[idx].condition.description}:
                </ThemedText>
                <CardEffectRenderer
                  effect={effect.branches[idx].effect}
                  onEffectSelected={onEffectSelected}
                  depth={depth + 1}
                  scrollViewRef={scrollViewRef}
                />
              </View>
            ))}
          </View>
        )}

        {selectedCondition === "default" && effect.default && (
          <View
            style={styles.selectedEffect}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              if (scrollViewRef?.current && layout.y) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: layout.y - 20,
                    animated: true,
                  });
                }, 100);
              }
            }}
          >
            <ThemedText style={styles.selectedLabel}>
              → Efecto seleccionado:
            </ThemedText>
            <CardEffectRenderer
              effect={effect.default}
              onEffectSelected={onEffectSelected}
              depth={depth + 1}
              scrollViewRef={scrollViewRef}
            />
          </View>
        )}
      </View>
    );
  }

  // Efecto de Elección
  if (isChoiceEffect(effect)) {
    const handleOptionToggle = (index: number) => {
      const newSelected = selectedOptions.includes(index)
        ? selectedOptions.filter((i) => i !== index)
        : [...selectedOptions, index];

      // Validar límites de elección
      if (newSelected.length > effect.maxChoices) {
        // Si ya alcanzó el máximo, reemplazar el primero
        newSelected.shift();
      }

      setSelectedOptions(newSelected);

      if (onEffectSelected) {
        newSelected.forEach((idx) => {
          onEffectSelected(effect.options[idx]);
        });
      }
    };

    return (
      <View style={[styles.choiceContainer, indentStyle]}>
        <ThemedText style={styles.choiceTitle}>{effect.description}</ThemedText>
        <ThemedText style={styles.choiceHint}>
          Elige entre {effect.minChoices} y {effect.maxChoices} opción(es)
        </ThemedText>

        {effect.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const optionLabel = String.fromCharCode(65 + index); // A, B, C...

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleOptionToggle(index)}
            >
              <View style={styles.optionHeader}>
                <ThemedText style={styles.optionLabel}>
                  {optionLabel})
                </ThemedText>
                {isSelected && (
                  <ThemedText style={styles.optionCheck}>✓</ThemedText>
                )}
              </View>
              <View
                onLayout={(event) => {
                  if (isSelected) {
                    const layout = event.nativeEvent.layout;
                    if (scrollViewRef?.current && layout.y) {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({
                          y: layout.y - 20,
                          animated: true,
                        });
                      }, 100);
                    }
                  }
                }}
              >
                <CardEffectRenderer
                  effect={option}
                  depth={0}
                  scrollViewRef={scrollViewRef}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        {selectedOptions.length > 0 &&
          selectedOptions.length < effect.minChoices && (
            <ThemedText style={styles.warningText}>
              ⚠️ Debes elegir al menos {effect.minChoices} opción(es)
            </ThemedText>
          )}

        {(effect.discardAfter || effect.removeAfter) && (
          <ThemedText style={styles.lifecycleText}>
            {effect.removeAfter
              ? "🗑️ Eliminar carta después de elegir"
              : "📤 Descartar carta después de elegir"}
          </ThemedText>
        )}
      </View>
    );
  }

  // Efecto "Por Cada"
  if (isForEachEffect(effect)) {
    return (
      <View style={[styles.forEachContainer, indentStyle]}>
        <ThemedText style={styles.forEachTitle}>
          🔁 {effect.description}
        </ThemedText>
        <View style={styles.forEachEffect}>
          <CardEffectRenderer
            effect={effect.effect}
            onEffectSelected={onEffectSelected}
            depth={depth + 1}
            scrollViewRef={scrollViewRef}
          />
        </View>
      </View>
    );
  }

  // Efecto Compuesto
  if (isCompositeEffect(effect)) {
    return (
      <View style={[styles.compositeContainer, indentStyle]}>
        {effect.description && (
          <ThemedText style={styles.compositeTitle}>
            {effect.description}
          </ThemedText>
        )}
        {effect.effects.map((subEffect, index) => (
          <View key={index} style={styles.compositeEffect}>
            {index > 0 && (
              <ThemedText style={styles.compositeConnector}>
                ↓ Luego:
              </ThemedText>
            )}
            <CardEffectRenderer
              effect={subEffect}
              onEffectSelected={onEffectSelected}
              depth={depth}
              scrollViewRef={scrollViewRef}
            />
          </View>
        ))}
        {(effect.discardAfter || effect.removeAfter) && (
          <ThemedText style={styles.lifecycleText}>
            {effect.removeAfter
              ? "🗑️ Eliminar carta al final"
              : "📤 Descartar carta al final"}
          </ThemedText>
        )}
      </View>
    );
  }

  return (
    <ThemedText style={styles.errorText}>
      Tipo de efecto no reconocido
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  effectContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 4,
  },
  effectText: {
    fontSize: 14,
    lineHeight: 20,
  },
  lifecycleText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
    opacity: 0.7,
  },
  conditionalContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  conditionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2196f3",
    alignItems: "center",
  },
  conditionButtonSelected: {
    backgroundColor: "#2196f3",
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedEffect: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#90caf9",
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1976d2",
  },
  multiConditionalContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  conditionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
    opacity: 0.8,
  },
  branchButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ff9800",
    marginVertical: 4,
  },
  branchButtonSelected: {
    backgroundColor: "#ff9800",
  },
  defaultBranch: {
    borderColor: "#757575",
    borderStyle: "dashed",
  },
  branchTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  branchTitleSelected: {
    color: "#fff",
  },
  branchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  branchCheck: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  selectedEffectsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#ff9800",
  },
  multiSelectedEffect: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  multiEffectLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#e65100",
  },
  choiceContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#f3e5f5",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#9c27b0",
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  choiceHint: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#9c27b0",
    marginVertical: 6,
  },
  optionButtonSelected: {
    backgroundColor: "#9c27b0",
    borderColor: "#7b1fa2",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  optionCheck: {
    fontSize: 20,
    color: "#4caf50",
  },
  warningText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 8,
    fontWeight: "500",
  },
  forEachContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  forEachTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  forEachEffect: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#81c784",
  },
  compositeContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#fce4ec",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#e91e63",
  },
  compositeTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  compositeEffect: {
    marginVertical: 4,
  },
  compositeConnector: {
    fontSize: 13,
    fontWeight: "600",
    marginVertical: 8,
    color: "#c2185b",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    fontStyle: "italic",
  },
});
