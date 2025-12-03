import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Card } from "../types/card";
import { loadAllCards } from "../utils/cardLoader";

type ActionType =
  | { type: "ADD_CARD"; card: Card }
  | { type: "DRAW_CARD"; card: Card; fromIndex: number }
  | { type: "MOVE_TO_DISCARD"; card: Card }
  | { type: "REMOVE_CARD"; card: Card };

interface DeckContextType {
  mainDeck: Card[];
  discardDeck: Card[];
  disputaSocialDeck: Card[];
  currentDisputaSocial: Card | null;
  firstDisputaSocial: Card | null;
  availableCards: Card[];
  loading: boolean;
  gameStarted: boolean;
  addCardToMainDeck: (card: Card) => void;
  drawCard: () => Card | null;
  moveToDiscard: (card: Card) => void;
  removeCard: (card: Card) => void;
  currentCard: Card | null;
  setCurrentCard: (card: Card | null) => void;
  undo: () => void;
  canUndo: boolean;
  initializeGame: () => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("useDeck debe usarse dentro de un DeckProvider");
  }
  return context;
};

interface DeckProviderProps {
  children: ReactNode;
}

export const DeckProvider: React.FC<DeckProviderProps> = ({ children }) => {
  const [mainDeck, setMainDeck] = useState<Card[]>([]);
  const [discardDeck, setDiscardDeck] = useState<Card[]>([]);
  const [disputaSocialDeck, setDisputaSocialDeck] = useState<Card[]>([]);
  const [currentDisputaSocial, setCurrentDisputaSocial] = useState<Card | null>(
    null
  );
  const [firstDisputaSocial, setFirstDisputaSocial] = useState<Card | null>(
    null
  );
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [actionHistory, setActionHistory] = useState<ActionType[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      const cards = await loadAllCards();
      setAvailableCards(cards);
      setLoading(false);
    };

    loadCards();
  }, []);

  const initializeGame = () => {
    // Separar y mezclar cartas de Disputa Social
    const disputaSocialCards = availableCards.filter(
      (card) => card.type === "disputa_social"
    );
    const shuffled = [...disputaSocialCards].sort(() => Math.random() - 0.5);

    // Tomar la primera carta de Disputa Social
    if (shuffled.length > 0) {
      const firstDisputaSocial = shuffled[0];
      setFirstDisputaSocial(firstDisputaSocial);
      setCurrentDisputaSocial(shuffled[1] || null);
      setMainDeck([firstDisputaSocial]);
      setDisputaSocialDeck(shuffled.slice(1));
    }

    // Reiniciar estados
    setDiscardDeck([]);
    setCurrentCard(null);
    setActionHistory([]);
    setGameStarted(true);
  };

  const addCardToMainDeck = (card: Card) => {
    setMainDeck((prev) => [...prev, card]);
    setActionHistory((prev) => {
      const newHistory: ActionType[] = [
        ...prev,
        { type: "ADD_CARD" as const, card },
      ];
      return newHistory.slice(-5); // Mantener solo las últimas 5 acciones
    });
  };

  const drawCard = (): Card | null => {
    if (mainDeck.length === 0) return null;

    // Barajar el mazo antes de sacar
    const shuffledDeck = [...mainDeck].sort(() => Math.random() - 0.5);
    setMainDeck(shuffledDeck);

    // Sacar la primera carta del mazo barajado
    const drawnCard = shuffledDeck[0];

    // Remover la carta del mazo
    setMainDeck((prev) => prev.slice(1));
    setCurrentCard(drawnCard);
    setActionHistory((prev) => {
      const newHistory: ActionType[] = [
        ...prev,
        { type: "DRAW_CARD" as const, card: drawnCard, fromIndex: 0 },
      ];
      return newHistory.slice(-5); // Mantener solo las últimas 5 acciones
    });

    // Si es una carta de Disputa Social, activar la lógica especial
    if (drawnCard.type === "disputa_social") {
      // Las cartas de Disputa Social se eliminan automáticamente (no van a descarte)
      // No hacer nada con currentCard, ya que se auto-elimina

      // Agregar el descarte al mazo principal y la siguiente carta de Disputa Social
      if (disputaSocialDeck.length > 0) {
        const nextDisputaSocial = disputaSocialDeck[0];
        setCurrentDisputaSocial(nextDisputaSocial);
        setMainDeck((prev) => [...prev, ...discardDeck, nextDisputaSocial]);
        setDisputaSocialDeck((prev) => prev.slice(1));
      } else {
        setMainDeck((prev) => [...prev, ...discardDeck]);
        setCurrentDisputaSocial(null);
      }
      setDiscardDeck([]);
    }

    return drawnCard;
  };

  const moveToDiscard = (card: Card) => {
    setDiscardDeck((prev) => [...prev, card]);
    setCurrentCard(null);
    setActionHistory((prev) => {
      const newHistory: ActionType[] = [
        ...prev,
        { type: "MOVE_TO_DISCARD" as const, card },
      ];
      return newHistory.slice(-5); // Mantener solo las últimas 5 acciones
    });
  };

  const removeCard = (card: Card) => {
    // Simplemente la eliminamos sin agregarla a ningún lado
    setCurrentCard(null);
    setActionHistory((prev) => {
      const newHistory: ActionType[] = [
        ...prev,
        { type: "REMOVE_CARD" as const, card },
      ];
      return newHistory.slice(-5); // Mantener solo las últimas 5 acciones
    });
  };

  const undo = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];

    switch (lastAction.type) {
      case "ADD_CARD":
        // Remover la última carta agregada al mazo principal
        setMainDeck((prev) => prev.slice(0, -1));
        break;

      case "DRAW_CARD":
        // Devolver la carta al mazo principal
        setMainDeck((prev) => [...prev, lastAction.card]);
        setCurrentCard(null);
        break;

      case "MOVE_TO_DISCARD":
        // Remover de descarte y volver a current card
        setDiscardDeck((prev) => prev.slice(0, -1));
        setCurrentCard(lastAction.card);
        break;

      case "REMOVE_CARD":
        // Recuperar la carta eliminada
        setCurrentCard(lastAction.card);
        break;
    }

    // Remover la última acción del historial
    setActionHistory((prev) => prev.slice(0, -1));
  };

  const value: DeckContextType = {
    mainDeck,
    discardDeck,
    disputaSocialDeck,
    currentDisputaSocial,
    firstDisputaSocial,
    availableCards,
    loading,
    gameStarted,
    addCardToMainDeck,
    drawCard,
    moveToDiscard,
    removeCard,
    currentCard,
    setCurrentCard,
    undo,
    canUndo: actionHistory.length > 0,
    initializeGame,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};
