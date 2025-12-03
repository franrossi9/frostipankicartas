import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDeck } from "@/contexts/DeckContext";
import { Card, CardType } from "@/types/card";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ModalScreen() {
  const router = useRouter();
  const { availableCards, addCardToMainDeck } = useDeck();
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Para Consecuencia de Ley, agrupar por ID base (sin variante)
  // Para otros tipos, mostrar directamente
  const filteredCards = selectedType
    ? (() => {
        const cards = availableCards.filter((card) => {
          if (card.type !== selectedType) return false;
          if (!searchQuery.trim()) return true;

          // Extraer solo números del ID para buscar
          const idNumbers = card.id.replace(/\D/g, "");
          return idNumbers.includes(searchQuery);
        });

        // Si es Consecuencia de Ley, agrupar por ID base
        if (selectedType === CardType.CONSECUENCIA_LEY) {
          const grouped = new Map<string, Card>();
          cards.forEach((card) => {
            const baseId = card.id; // L01, L02, etc.
            if (!grouped.has(baseId)) {
              grouped.set(baseId, card);
            }
          });
          return Array.from(grouped.values());
        }

        return cards;
      })()
    : [];

  const handleAddCard = (card: Card) => {
    // Si es Consecuencia de Ley, seleccionar variante aleatoria
    if (card.type === CardType.CONSECUENCIA_LEY) {
      const variantsOfId = availableCards.filter(
        (c) => c.type === CardType.CONSECUENCIA_LEY && c.id === card.id
      );

      if (variantsOfId.length > 0) {
        const randomCard =
          variantsOfId[Math.floor(Math.random() * variantsOfId.length)];
        addCardToMainDeck(randomCard);
        Alert.alert(
          "Carta agregada",
          `ID ${randomCard.id} Variante ${randomCard.variante} se agregó al mazo principal`
        );
      } else {
        addCardToMainDeck(card);
        Alert.alert(
          "Carta agregada",
          `ID ${card.id} se agregó al mazo principal`
        );
      }
    } else {
      addCardToMainDeck(card);
      Alert.alert(
        "Carta agregada",
        `ID ${card.id} se agregó al mazo principal`
      );
    }
    router.back();
  };

  const getTypeName = (type: CardType): string => {
    switch (type) {
      case CardType.CONSECUENCIA_LEY:
        return "Consecuencia de Ley";
      case CardType.DISPUTA_SOCIAL:
        return "Disputa Social";
      case CardType.OCASO:
        return "Ocaso";
      default:
        return type;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Agregar Carta
      </ThemedText>

      {!selectedType ? (
        // Selección de tipo de carta
        <View style={styles.typeSelection}>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Selecciona el tipo de carta:
          </ThemedText>

          <TouchableOpacity
            style={[styles.typeButton, styles.type1Button]}
            onPress={() => setSelectedType(CardType.CONSECUENCIA_LEY)}
          >
            <ThemedText style={styles.typeButtonText}>
              {getTypeName(CardType.CONSECUENCIA_LEY)}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, styles.type2Button]}
            onPress={() => setSelectedType(CardType.DISPUTA_SOCIAL)}
          >
            <ThemedText style={styles.typeButtonText}>
              {getTypeName(CardType.DISPUTA_SOCIAL)}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, styles.type3Button]}
            onPress={() => setSelectedType(CardType.OCASO)}
          >
            <ThemedText style={styles.typeButtonText}>
              {getTypeName(CardType.OCASO)}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        // Lista de cartas del tipo seleccionado
        <View style={styles.cardListContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedType(null);
              setSearchQuery("");
            }}
          >
            <ThemedText style={styles.backButtonText}>
              ← Volver a tipos
            </ThemedText>
          </TouchableOpacity>

          <ThemedText type="subtitle" style={styles.subtitle}>
            {getTypeName(selectedType)} ({filteredCards.length} cartas)
          </ThemedText>

          {/* Buscador */}
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por número..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="numeric"
          />

          <ScrollView style={styles.scrollView}>
            {filteredCards.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                No hay cartas disponibles de este tipo
              </ThemedText>
            ) : (
              filteredCards.map((card) => (
                <TouchableOpacity
                  key={`${card.type}-${card.id}`}
                  style={styles.cardItem}
                  onPress={() => handleAddCard(card)}
                >
                  <View style={styles.cardItemContent}>
                    <ThemedText style={styles.cardItemId}>
                      ID: {card.id}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  typeSelection: {
    flex: 1,
    justifyContent: "center",
  },
  typeButton: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  type1Button: {
    backgroundColor: "#FF3B30",
  },
  type2Button: {
    backgroundColor: "#007AFF",
  },
  type3Button: {
    backgroundColor: "#34C759",
  },
  typeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#8E8E93",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
  },
  cardListContainer: {
    flex: 1,
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  scrollView: {
    flex: 1,
  },
  cardItem: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardItemContent: {
    gap: 5,
  },
  cardItemVariant: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "bold",
  },
  cardItemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardItemId: {
    fontSize: 14,
    color: "#666",
  },
  cardItemDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
