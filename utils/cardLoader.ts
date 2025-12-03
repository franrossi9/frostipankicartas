import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { Card, CardType } from "../types/card";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const csvConsecuenciaLey = require("../assets/cards/cartas_consecuencia_ley.csv");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csvDisputaSocial = require("../assets/cards/cartas_disputa_social.csv");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csvOcaso = require("../assets/cards/cartas_ocaso.csv");

// Parser de CSV con soporte para punto y coma
const parseCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(";").map((h) => h.trim().replace(/"/g, ""));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(";")
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    data.push(row);
  }

  return data;
};

// Mapeo de tipos de carta a archivos CSV
const CSV_FILES = {
  [CardType.CONSECUENCIA_LEY]: csvConsecuenciaLey,
  [CardType.DISPUTA_SOCIAL]: csvDisputaSocial,
  [CardType.OCASO]: csvOcaso,
};

// Función para leer el contenido del archivo CSV
const readCSVFile = async (cardType: CardType): Promise<string> => {
  try {
    const asset = Asset.fromModule(CSV_FILES[cardType]);
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error("No se pudo obtener la URI local del archivo");
    }

    const csvContent = await FileSystem.readAsStringAsync(asset.localUri);
    return csvContent;
  } catch (error) {
    console.error(`Error leyendo archivo CSV para ${cardType}:`, error);
    return "";
  }
};

// Función para cargar los CSV
export const loadCardsFromCSV = async (cardType: CardType): Promise<Card[]> => {
  try {
    const csvContent = await readCSVFile(cardType);
    if (!csvContent) {
      console.warn(`No hay datos CSV para ${cardType}`);
      return [];
    }

    const parsed = parseCSV(csvContent);

    return parsed.map((row) => ({
      id: row.ID || row.id || "",
      type: cardType,
      etiqueta: row.Etiqueta || "",
      titulo: row["Título"] || row.Titulo || "",
      textoAmbientacion:
        row["Texto de Ambientación"] || row.TextoAmbientacion || "",
      efecto: row.Efecto || "",
      variante: row.Variante || undefined,
    }));
  } catch (error) {
    console.error(`Error cargando CSV para ${cardType}:`, error);
    return [];
  }
};

// Cargar todas las cartas disponibles
export const loadAllCards = async (): Promise<Card[]> => {
  const [consecuenciaLeyCards, disputaSocialCards, ocasoCards] =
    await Promise.all([
      loadCardsFromCSV(CardType.CONSECUENCIA_LEY),
      loadCardsFromCSV(CardType.DISPUTA_SOCIAL),
      loadCardsFromCSV(CardType.OCASO),
    ]);

  return [...consecuenciaLeyCards, ...disputaSocialCards, ...ocasoCards];
};
