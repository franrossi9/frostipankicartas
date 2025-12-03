import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Bienvenido a Frostipan
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Gestor de Mazos de Cartas
        </ThemedText>
        <View style={styles.instructions}>
          <ThemedText style={styles.instructionText}>
            🎴 Usa la pestaña "Mazo" para gestionar tus cartas
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            ➕ Agrega cartas de 3 tipos diferentes
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            🎲 Saca cartas aleatorias del mazo
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            📋 Organiza tu mazo principal y descarte
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.7,
  },
  instructions: {
    gap: 16,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
