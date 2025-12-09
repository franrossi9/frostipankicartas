import { Card, CardType } from "../types/card";

// Archivos JSON

const jsonConsecuenciaLey = require("../assets/cards/cartas_consecuencia_ley_json.json");

const jsonDisputaSocial = require("../assets/cards/cartas_disputa_social_json.json");

const jsonOcaso = require("../assets/cards/cartas_ocaso_json.json");

// Mapeo de tipos de carta a archivos JSON
const JSON_FILES = {
  [CardType.CONSECUENCIA_LEY]: jsonConsecuenciaLey,
  [CardType.DISPUTA_SOCIAL]: jsonDisputaSocial,
  [CardType.OCASO]: jsonOcaso,
};

// Función para cargar cartas desde JSON
export const loadCardsFromJSON = (cardType: CardType): Card[] => {
  try {
    const jsonData = JSON_FILES[cardType];

    if (!jsonData || !Array.isArray(jsonData)) {
      console.warn(`No hay datos JSON válidos para ${cardType}`);
      return [];
    }

    // El JSON ya tiene la estructura correcta, solo validamos los campos requeridos
    return jsonData.filter(
      (card: any) => card.id && card.type && card.titulo && card.efecto
    ) as Card[];
  } catch (error) {
    console.error(`Error cargando JSON para ${cardType}:`, error);
    return [];
  }
};

// Cargar todas las cartas disponibles
export const loadAllCards = (): Card[] => {
  const consecuenciaLeyCards = loadCardsFromJSON(CardType.CONSECUENCIA_LEY);
  const disputaSocialCards = loadCardsFromJSON(CardType.DISPUTA_SOCIAL);
  const ocasoCards = loadCardsFromJSON(CardType.OCASO);

  return [...consecuenciaLeyCards, ...disputaSocialCards, ...ocasoCards];
};
