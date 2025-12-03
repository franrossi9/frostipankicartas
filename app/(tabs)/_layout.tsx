import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useDeck } from "@/contexts/DeckContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { undo, canUndo, drawCard, gameStarted } = useDeck();
  const router = useRouter();

  const handleUndo = () => {
    if (canUndo) {
      undo();
      Alert.alert("Deshecho", "Última acción deshecha correctamente");
    } else {
      Alert.alert("Sin acciones", "No hay acciones para deshacer");
    }
  };

  const handleAddCard = () => {
    router.push("/modal");
  };

  const handleDrawCard = () => {
    if (!gameStarted) {
      Alert.alert("Partida no iniciada", "Debes comenzar una partida primero");
      return;
    }
    const card = drawCard();
    if (!card) {
      Alert.alert("Mazo vacío", "No hay cartas en el mazo principal");
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Deshacer",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name="arrow.uturn.backward"
              color={canUndo ? (focused ? color : "white") : "#999"}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleUndo();
          },
        }}
      />
      <Tabs.Screen
        name="deck"
        options={{
          title: "Mazo",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={32}
              name="square.stack.3d.up.fill"
              color={focused ? color : "white"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="draw"
        options={{
          title: "Sacar Carta",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="hand-pointing-right"
              size={28}
              color={gameStarted ? (focused ? color : "white") : "#999"}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleDrawCard();
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Agregar",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name="plus.circle.fill"
              color={focused ? color : "white"}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleAddCard();
          },
        }}
      />
    </Tabs>
  );
}
