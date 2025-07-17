

export enum CardType {
  GWANG = 'gwang',
  YUL = 'yul',
  TTI = 'tti',
  PI = 'pi',
}

export enum RibbonColor {
  RED = 'red',
  BLUE = 'blue',
  GRASS = 'grass',
}

export interface Card {
  id: number;
  month: number;
  type: CardType;
  image: string;
  isDoublePi?: boolean;
  isGodori?: boolean;
  isGukjin?: boolean; // Special 9 Yul
  ribbonColor?: RibbonColor;
}

export interface CollectedCards {
  [CardType.GWANG]: Card[];
  [CardType.YUL]: Card[];
  [CardType.TTI]: Card[];
  [CardType.PI]: Card[];
}

export interface AchievedSet {
  name: string;
  cardIds: number[];
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  collected: CollectedCards;
  score: number;
  goCount: number;
  isGoBak: boolean;
  capital: number;
  achievedSets: AchievedSet[];
}

export interface OpponentProfile {
  id: number;
  name: string;
  title: string;
  description: string;
}


export enum GamePhase {
  TOURNAMENT_INTRO = 'tournament_intro',
  MATCH_INTRO = 'match_intro',
  PLAYING = 'playing',
  GO_OR_STOP = 'go_or_stop',
  ROUND_OVER = 'round_over',
  GAME_OVER = 'game_over',
  TOURNAMENT_COMPLETE = 'tournament_complete',
}

export interface RoundOutcome {
  winner: Player | null;
  loser: Player | null;
  isDraw: boolean;
  capitalChange: number;
  breakdown?: {
    baseScore: number;
    goCount: number;
    isGoBak: boolean;
    isGwangBak: boolean;
    isPiBak: boolean;
  };
}

// New types for the tournament bracket
export type Participant = Omit<OpponentProfile, 'capital'> | {
  id: 'player';
  name: string;
  title: string;
};

export interface Match {
  p1: Participant | null;
  p2: Participant | null;
  winner: Participant | null;
}

export interface BracketRound {
  name: string;
  matches: Match[];
}

export type TournamentBracket = BracketRound[];

export interface SavedGameState {
  phase: GamePhase;
  humanPlayer: Player;
  currentOpponent: Player;
  deck: Card[];
  floorCards: Card[];
  currentPlayerId: number;
  roundOutcome: RoundOutcome | null;
  bracket: TournamentBracket | null;
  currentRoundIndex: number;
  pointsToCapitalRate: number;
}