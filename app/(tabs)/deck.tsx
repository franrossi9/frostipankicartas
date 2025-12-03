import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDeck } from "@/contexts/DeckContext";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function DeckScreen() {
  const {
    mainDeck,
    discardDeck,
    disputaSocialDeck,
    currentDisputaSocial,
    firstDisputaSocial,
    gameStarted,
    drawCard,
    currentCard,
    moveToDiscard,
    removeCard,
    loading,
    initializeGame,
  } = useDeck();
  const [showCardModal, setShowCardModal] = useState(false);
  const [showDisputaSocialModal, setShowDisputaSocialModal] = useState(false);
  const [showFirstDisputaSocialModal, setShowFirstDisputaSocialModal] =
    useState(false);

  // Escuchar cambios en currentCard para mostrar el modal
  useEffect(() => {
    if (currentCard) {
      setShowCardModal(true);
    }
  }, [currentCard]);

  const handleMoveToDiscard = () => {
    if (currentCard) {
      moveToDiscard(currentCard);
      setShowCardModal(false);
      Alert.alert("Carta movida", "La carta se movió al mazo de descarte");
    }
  };

  const handleRemoveCard = () => {
    if (currentCard) {
      Alert.alert(
        "Eliminar carta",
        "¿Estás seguro de que quieres eliminar esta carta?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              removeCard(currentCard);
              setShowCardModal(false);
              Alert.alert("Carta eliminada", "La carta se eliminó del juego");
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Cargando cartas...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Gestor de Mazos
      </ThemedText>

      {!gameStarted ? (
        // Pantalla de inicio
        <View style={styles.startScreen}>
          <ThemedText type="subtitle" style={styles.startText}>
            Presiona el botón para comenzar una nueva partida
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={initializeGame}
          >
            <ThemedText style={styles.buttonText}>
              🎮 Comenzar Partida
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Indicadores de mazos - Arriba */}
          <View style={styles.deckInfo}>
            <View style={styles.deckCard}>
              <ThemedText type="subtitle" style={styles.deckCardTitle}>
                Mazo Principal
              </ThemedText>
              <ThemedText style={styles.deckCount}>
                {mainDeck.length}
              </ThemedText>
              <ThemedText style={styles.deckCardLabel}>cartas</ThemedText>
            </View>
            <View style={styles.deckCard}>
              <ThemedText type="subtitle" style={styles.deckCardTitle}>
                Descarte
              </ThemedText>
              <ThemedText style={styles.deckCount}>
                {discardDeck.length}
              </ThemedText>
              <ThemedText style={styles.deckCardLabel}>cartas</ThemedText>
            </View>
          </View>

          {/* Carta de Disputa Social en el mazo */}
          {firstDisputaSocial && (
            <TouchableOpacity
              style={styles.disputaSocialInDeck}
              onPress={() => setShowFirstDisputaSocialModal(true)}
            >
              <ThemedText
                type="subtitle"
                style={styles.disputaSocialInDeckTitle}
              >
                🎴 Disputa Social en el Mazo
              </ThemedText>
              <ThemedText style={styles.disputaSocialInDeckName}>
                {firstDisputaSocial.titulo}
              </ThemedText>
              <ThemedText style={styles.disputaSocialInDeckHint}>
                Toca para ver detalles
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Próxima Carta de Disputa Social */}
          {currentDisputaSocial && (
            <TouchableOpacity
              style={styles.disputaSocialCard}
              onPress={() => setShowDisputaSocialModal(true)}
            >
              <ThemedText type="subtitle" style={styles.disputaSocialTitle}>
                📌 Próxima Disputa Social
              </ThemedText>
              <ThemedText style={styles.disputaSocialName}>
                {currentDisputaSocial.titulo}
              </ThemedText>
              <ThemedText style={styles.disputaSocialRemaining}>
                Quedan {disputaSocialDeck.length} en el mazo
              </ThemedText>
              <ThemedText style={styles.disputaSocialHint}>
                Toca para ver detalles
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Botón de reiniciar - Abajo */}
          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={() => {
              Alert.alert(
                "Reiniciar Partida",
                "¿Estás seguro de que quieres reiniciar? Se perderá todo el progreso.",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Reiniciar",
                    style: "destructive",
                    onPress: initializeGame,
                  },
                ]
              );
            }}
          >
            <ThemedText style={styles.restartButtonText}>
              🔄 Reiniciar Partida
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modal de carta en pantalla completa */}
      <Modal
        visible={showCardModal && currentCard !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCardModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {currentCard && (
              <>
                <View style={styles.modalHeader}>
                  {currentCard.variante && (
                    <ThemedText style={styles.modalVariant}>
                      Variante {currentCard.variante}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.modalLabel}>
                    {currentCard.etiqueta}
                  </ThemedText>
                  <ThemedText style={styles.modalTitle}>
                    {currentCard.titulo}
                  </ThemedText>
                  <ThemedText style={styles.modalId}>
                    ID: {currentCard.id}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>
                    Ambientación
                  </ThemedText>
                  <ThemedText style={styles.modalAmbience}>
                    {currentCard.textoAmbientacion}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>
                    Efecto
                  </ThemedText>
                  <ThemedText style={styles.modalEffect}>
                    {currentCard.efecto}
                  </ThemedText>
                </View>

                {currentCard.type !== "disputa_social" && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalDiscardButton]}
                      onPress={handleMoveToDiscard}
                    >
                      <ThemedText style={styles.modalButtonText}>
                        📋 Mover a Descarte
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalRemoveButton]}
                      onPress={handleRemoveCard}
                    >
                      <ThemedText style={styles.modalButtonText}>
                        🗑️ Eliminar
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
                {currentCard.type === "disputa_social" && (
                  <>
                    <View style={styles.modalInfo}>
                      <ThemedText style={styles.modalInfoText}>
                        ℹ️ Esta carta se elimina automáticamente
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalCloseButton]}
                      onPress={() => setShowCardModal(false)}
                    >
                      <ThemedText style={styles.modalButtonText}>
                        ✕ Cerrar
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Modal para ver la próxima Disputa Social */}
      <Modal
        visible={showDisputaSocialModal && currentDisputaSocial !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDisputaSocialModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {currentDisputaSocial && (
              <>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalLabel}>
                    {currentDisputaSocial.etiqueta}
                  </ThemedText>
                  <ThemedText style={styles.modalTitle}>
                    {currentDisputaSocial.titulo}
                  </ThemedText>
                  <ThemedText style={styles.modalId}>
                    ID: {currentDisputaSocial.id}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>
                    Ambientación
                  </ThemedText>
                  <ThemedText style={styles.modalAmbience}>
                    {currentDisputaSocial.textoAmbientacion}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>
                    Efecto
                  </ThemedText>
                  <ThemedText style={styles.modalEffect}>
                    {currentDisputaSocial.efecto}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCloseButton]}
                  onPress={() => setShowDisputaSocialModal(false)}
                >
                  <ThemedText style={styles.modalButtonText}>
                    ✕ Cerrar
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Modal para ver la Disputa Social en el mazo */}
      <Modal
        visible={showFirstDisputaSocialModal && firstDisputaSocial !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFirstDisputaSocialModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {firstDisputaSocial && (
              <>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalLabel}>
                    {firstDisputaSocial.etiqueta}
                  </ThemedText>
                  <ThemedText style={styles.modalTitle}>
                    {firstDisputaSocial.titulo}
                  </ThemedText>
                  <ThemedText style={styles.modalId}>
                    ID: {firstDisputaSocial.id}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>
                    Ambientación
                  </ThemedText>
                  <ThemedText style={styles.modalAmbience}>
                    {firstDisputaSocial.textoAmbientacion}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>
                    Efecto
                  </ThemedText>
                  <ThemedText style={styles.modalEffect}>
                    {firstDisputaSocial.efecto}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCloseButton]}
                  onPress={() => setShowFirstDisputaSocialModal(false)}
                >
                  <ThemedText style={styles.modalButtonText}>
                    ✕ Cerrar
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  deckInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  deckCard: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    minHeight: 120,
  },
  deckCardTitle: {
    fontSize: 13,
    marginBottom: 5,
  },
  deckCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginVertical: 8,
    lineHeight: 36,
  },
  deckCardLabel: {
    fontSize: 12,
  },
  startScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  startText: {
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 40,
  },
  restartButton: {
    backgroundColor: "#FF3B30",
    marginTop: 20,
    marginBottom: 20,
  },
  restartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disputaSocialInDeck: {
    padding: 20,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
  },
  disputaSocialInDeckTitle: {
    marginBottom: 10,
    color: "#333",
  },
  disputaSocialInDeckName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
    textAlign: "center",
  },
  disputaSocialInDeckHint: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  disputaSocialCard: {
    padding: 20,
    backgroundColor: "#FFE5B4",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FF9500",
    alignItems: "center",
  },
  disputaSocialTitle: {
    marginBottom: 10,
    color: "#333",
  },
  disputaSocialName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9500",
    marginBottom: 5,
    textAlign: "center",
  },
  disputaSocialRemaining: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  disputaSocialHint: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  drawButton: {
    backgroundColor: "#007AFF",
  },
  discardButton: {
    backgroundColor: "#FF9500",
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  currentCardContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  cardTitle: {
    marginBottom: 15,
    textAlign: "center",
  },
  cardInfo: {
    marginBottom: 20,
  },
  cardVariant: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 5,
  },
  cardId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  cardAmbience: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 10,
  },
  cardEffect: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  modalVariant: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  modalId: {
    fontSize: 14,
    color: "#666",
  },
  modalInfo: {
    padding: 20,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  modalInfoText: {
    fontSize: 16,
    color: "#1976D2",
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007AFF",
  },
  modalAmbience: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  modalEffect: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalActions: {
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  modalDiscardButton: {
    backgroundColor: "#FF9500",
  },
  modalRemoveButton: {
    backgroundColor: "#FF3B30",
  },
  modalCloseButton: {
    backgroundColor: "#8E8E93",
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
