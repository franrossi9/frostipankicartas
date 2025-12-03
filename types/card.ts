export enum CardType {
  CONSECUENCIA_LEY = "consecuencia_ley",
  DISPUTA_SOCIAL = "disputa_social",
  OCASO = "ocaso",
}

export interface Card {
  id: string;
  type: CardType;
  etiqueta: string;
  titulo: string;
  textoAmbientacion: string;
  efecto: string;
  variante?: string; // Solo para Consecuencia Ley
  [key: string]: any;
}

export interface Deck {
  cards: Card[];
}
