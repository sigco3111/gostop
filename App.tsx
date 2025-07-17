

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GamePhase, Player, Card, CollectedCards, CardType, RibbonColor, RoundOutcome, OpponentProfile, TournamentBracket, Participant, Match, SavedGameState, AchievedSet } from './types';
import { CARDS, TOURNAMENT_OPPONENTS, BASE_STARTING_CAPITAL, CAPITAL_INCREMENT_PER_ROUND, DEFAULT_POINTS_TO_CAPITAL_RATE } from './constants';
import PlayerArea from './components/PlayerArea';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import ScoreBreakdownModal from './components/ScoreBreakdownModal';
import TournamentModal from './components/TournamentModal';
import { getAiMove, decideGoOrStop } from './services/aiLogic';

const LOCAL_STORAGE_KEY = 'goStopGameState';
const WINNING_SCORE = 7;
const ROUND_NAMES = ['16강', '8강', '4강', '결승'];

const loadInitialState = (): SavedGameState | null => {
  try {
    const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      if (savedState && typeof savedState.phase === 'string') {
        return savedState;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to load or parse game state, starting fresh.", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};

const createNewPlayer = (id: number, name: string, capital: number): Player => ({
  id,
  name,
  hand: [],
  collected: { gwang: [], yul: [], tti: [], pi: [] },
  score: 0,
  goCount: 0,
  isGoBak: false,
  capital,
  achievedSets: [],
});

const getPiCount = (piCards: Card[], yulCards: Card[]) => {
    let count = piCards.reduce((acc, card) => acc + (card.isDoublePi ? 2 : 1), 0);
    if (yulCards.some(c => c.isGukjin)) {
        count += 2;
    }
    return count;
};


const App: React.FC = () => {
  const [initialData] = useState(loadInitialState);

  const [phase, setPhase] = useState<GamePhase>(initialData?.phase ?? GamePhase.TOURNAMENT_INTRO);
  const [humanPlayer, setHumanPlayer] = useState<Player>(initialData?.humanPlayer ?? createNewPlayer(0, '플레이어', BASE_STARTING_CAPITAL));
  const [currentOpponent, setCurrentOpponent] = useState<Player | null>(initialData?.currentOpponent ?? null);
  
  const [bracket, setBracket] = useState<TournamentBracket | null>(initialData?.bracket ?? null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(initialData?.currentRoundIndex ?? 0);
  
  const [deck, setDeck] = useState<Card[]>(initialData?.deck ?? []);
  const [floorCards, setFloorCards] = useState<Card[]>(initialData?.floorCards ?? []);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(initialData?.currentPlayerId ?? 0);
  const [roundOutcome, setRoundOutcome] = useState<RoundOutcome | null>(initialData?.roundOutcome ?? null);
  const [pointsToCapitalRate, setPointsToCapitalRate] = useState<number>(initialData?.pointsToCapitalRate ?? DEFAULT_POINTS_TO_CAPITAL_RATE);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [animation, setAnimation] = useState<{key: number, type: 'play' | 'flip', card: Card, targetCardId?: number} | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | undefined>();
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);

  useEffect(() => {
    if (currentOpponent && phase !== GamePhase.TOURNAMENT_INTRO && phase !== GamePhase.GAME_OVER && phase !== GamePhase.TOURNAMENT_COMPLETE) {
      const gameState: SavedGameState = {
        phase,
        humanPlayer,
        currentOpponent,
        deck,
        floorCards,
        currentPlayerId,
        roundOutcome,
        bracket,
        currentRoundIndex,
        pointsToCapitalRate,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [phase, humanPlayer, currentOpponent, deck, floorCards, currentPlayerId, roundOutcome, bracket, currentRoundIndex, pointsToCapitalRate]);

  const showActionMessage = useCallback((message: string, duration: number = 2000) => {
    setLastActionMessage(message);
    setTimeout(() => setLastActionMessage(null), duration);
  }, []);

  const handleResetGame = useCallback(() => {
      if (window.confirm("정말로 게임을 초기화하고 처음부터 시작하시겠습니까? 모든 진행 상황이 사라집니다.")) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          window.location.reload();
      }
  }, []);

  const startTournament = useCallback((rate: number) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const newHumanPlayer = createNewPlayer(0, '플레이어', BASE_STARTING_CAPITAL);
    setHumanPlayer(newHumanPlayer);
    setPointsToCapitalRate(rate);

    const playerParticipant: Participant = { id: 'player', name: '플레이어', title: '도전자' };
    const allParticipants: Participant[] = [playerParticipant, ...TOURNAMENT_OPPONENTS].sort(() => Math.random() - 0.5);

    const roundOf16: Match[] = [];
    for (let i = 0; i < 16; i += 2) {
        roundOf16.push({ p1: allParticipants[i], p2: allParticipants[i+1], winner: null });
    }
    
    const newBracket: TournamentBracket = [
        { name: ROUND_NAMES[0], matches: roundOf16 },
        { name: ROUND_NAMES[1], matches: Array(8).fill({ p1: null, p2: null, winner: null }) },
        { name: ROUND_NAMES[2], matches: Array(4).fill({ p1: null, p2: null, winner: null }) },
        { name: ROUND_NAMES[3], matches: Array(2).fill({ p1: null, p2: null, winner: null }) },
    ];
    
    setBracket(newBracket);
    setCurrentRoundIndex(0);
    setCurrentOpponent(null);
    setRoundOutcome(null);
    setPhase(GamePhase.MATCH_INTRO);
    setIsAutoPlayActive(false);
  }, []);
  
  const startNewRound = useCallback((player1: Player, player2: Player) => {
    const shuffledDeck = [...CARDS].sort(() => Math.random() - 0.5);
    
    const resetPlayer = (p: Player): Player => ({ ...p, hand: [], collected: { gwang: [], yul: [], tti: [], pi: [] }, score: 0, goCount: 0, isGoBak: false, achievedSets: [] });

    const newPlayer1 = resetPlayer(player1);
    const newPlayer2 = resetPlayer(player2);

    newPlayer1.hand = shuffledDeck.splice(0, 10);
    newPlayer2.hand = shuffledDeck.splice(0, 10);
    const newFloorCards = shuffledDeck.splice(0, 8);
    
    setHumanPlayer(newPlayer1);
    setCurrentOpponent(newPlayer2);
    setFloorCards(newFloorCards);
    setDeck(shuffledDeck);
    setCurrentPlayerId(0);
    setRoundOutcome(null);
    setPhase(GamePhase.PLAYING);

    const monthCounts = newFloorCards.reduce((acc, card) => {
        acc[card.month] = (acc[card.month] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);
    const isNagari = Object.values(monthCounts).some(count => count === 4);

    if (isNagari) {
        setIsProcessing(true);
        showActionMessage("나가리! 판을 다시 시작합니다.", 3000);
        setTimeout(() => startNewRound(player1, player2), 3000);
        return;
    } else {
        setIsProcessing(false);
    }
  }, [showActionMessage]);
  
  const getCurrentPlayerMatch = useCallback((br: TournamentBracket | null, rIndex: number) => {
    if (!br || !br[rIndex]) return null;
    
    const playerMatchIndex = br[rIndex].matches.findIndex(m => m.p1?.id === 'player' || m.p2?.id === 'player');
    if (playerMatchIndex === -1) return null;
    
    const match = br[rIndex].matches[playerMatchIndex];
    const opponent = match.p1?.id === 'player' ? match.p2 : match.p1;
    const playerInfo = match.p1?.id === 'player' ? match.p1 : match.p2;

    return { match, opponent, playerInfo, playerMatchIndex };
  }, []);

  const startNewMatch = useCallback(() => {
    const matchInfo = getCurrentPlayerMatch(bracket, currentRoundIndex);
    if (!matchInfo || !matchInfo.opponent) {
        console.error("Could not find next opponent in bracket.");
        startTournament(pointsToCapitalRate); // Fallback
        return;
    }
    
    const opponentProfile = matchInfo.opponent;
    const opponentCapital = BASE_STARTING_CAPITAL + (currentRoundIndex * CAPITAL_INCREMENT_PER_ROUND);
    const newOpponent = createNewPlayer(1, opponentProfile.name, opponentCapital);
    const playerWithCurrentCapital = { ...humanPlayer, capital: humanPlayer.capital };

    setCurrentOpponent(newOpponent);
    startNewRound(playerWithCurrentCapital, newOpponent);
  }, [bracket, currentRoundIndex, humanPlayer, startNewRound, startTournament, getCurrentPlayerMatch, pointsToCapitalRate]);

  const calculateScoreAndSets = useCallback((collected: CollectedCards): { score: number; sets: AchievedSet[] } => {
    let score = 0;
    const sets: AchievedSet[] = [];
    const { gwang, yul, tti, pi } = collected;

    // Gwang
    const nonRainGwang = gwang.filter(c => c.month !== 12);
    if (gwang.length === 5) {
        score += 15;
        sets.push({ name: 'ogwang', cardIds: gwang.map(c => c.id) });
    } else if (gwang.length === 4) {
        score += 4;
        sets.push({ name: 'sagwang', cardIds: gwang.map(c => c.id) });
    } else if (gwang.length === 3) {
        score += nonRainGwang.length === 3 ? 3 : 2;
        sets.push({ name: 'samgwang', cardIds: gwang.map(c => c.id) });
    }
    
    // Yul
    const godoriCards = yul.filter(c => c.isGodori);
    if (godoriCards.length === 3) {
        score += 5;
        sets.push({ name: 'godori', cardIds: godoriCards.map(c => c.id) });
    }
    if (yul.length >= 5) score += yul.length - 4;

    // Tti
    const redTti = tti.filter(c => c.ribbonColor === RibbonColor.RED);
    const blueTti = tti.filter(c => c.ribbonColor === RibbonColor.BLUE);
    const grassTti = tti.filter(c => c.ribbonColor === RibbonColor.GRASS);
    if (redTti.length === 3) {
        score += 3;
        sets.push({ name: 'hongdan', cardIds: redTti.map(c => c.id) });
    }
    if (blueTti.length === 3) {
        score += 3;
        sets.push({ name: 'cheongdan', cardIds: blueTti.map(c => c.id) });
    }
    if (grassTti.length === 3) {
        score += 3;
        sets.push({ name: 'chodan', cardIds: grassTti.map(c => c.id) });
    }
    if (tti.length >= 5) score += tti.length - 4;
    
    // Pi
    let piCount = getPiCount(pi, yul);
    if (piCount >= 10) score += piCount - 9;
    
    return { score, sets };
  }, []);
  
  const nextTurn = useCallback(() => {
    setCurrentPlayerId(prev => (prev + 1) % 2);
  }, []);
  
  const handleStop = useCallback(() => {
    if (!currentOpponent) return;
    const winner = currentPlayerId === 0 ? humanPlayer : currentOpponent;
    const loser = currentPlayerId === 0 ? currentOpponent : humanPlayer;
    let finalScore = winner.score;

    // Check for Gwang score contribution
    let gwangScore = 0;
    const { gwang } = winner.collected;
    const nonRainGwang = gwang.filter(c => c.month !== 12);
    if (gwang.length >= 3) {
      if (gwang.length === 5) gwangScore = 15;
      else if (gwang.length === 4) gwangScore = 4;
      else if (gwang.length === 3) gwangScore = nonRainGwang.length === 3 ? 3 : 2;
    }
    const winnerScoredWithGwang = gwangScore > 0;
    
    // Check for "bak" conditions
    const isGoBak = loser.isGoBak;
    const isGwangBak = winnerScoredWithGwang && loser.collected.gwang.length === 0;
    const loserPiCount = getPiCount(loser.collected.pi, loser.collected.yul);
    const isPiBak = loserPiCount <= 4;

    const multipliers = {
        go: winner.goCount > 0 ? winner.goCount + 1 : 1,
        goBak: isGoBak ? 2 : 1,
        gwangBak: isGwangBak ? 2 : 1,
        piBak: isPiBak ? 2 : 1,
    };

    finalScore *= multipliers.go;
    finalScore *= multipliers.goBak;
    finalScore *= multipliers.gwangBak;
    finalScore *= multipliers.piBak;

    setRoundOutcome({ 
        winner, 
        loser, 
        isDraw: false, 
        capitalChange: finalScore * pointsToCapitalRate,
        breakdown: {
            baseScore: winner.score,
            goCount: winner.goCount,
            isGoBak,
            isGwangBak,
            isPiBak,
        }
    });
    setPhase(GamePhase.ROUND_OVER);
  }, [humanPlayer, currentOpponent, currentPlayerId, pointsToCapitalRate]);

  const handleGo = useCallback(() => {
    if(!currentOpponent) return;
    const players = [humanPlayer, currentOpponent];
    const newPlayers = players.map(p => p.id === currentPlayerId ? {...p, goCount: p.goCount + 1} : {...p, isGoBak: true});
    setHumanPlayer(newPlayers.find(p => p.id === 0)!);
    setCurrentOpponent(newPlayers.find(p => p.id === 1)!);
    setPhase(GamePhase.PLAYING);
    nextTurn();
  }, [currentPlayerId, nextTurn, humanPlayer, currentOpponent]);
  
 const processMatchState = useCallback(() => {
    if (!roundOutcome || !currentOpponent || !bracket) return;

    let updatedHuman = { ...humanPlayer };
    let updatedOpponent = { ...currentOpponent };

    // 1. Apply capital changes based on the round outcome.
    if (!roundOutcome.isDraw && roundOutcome.winner) {
        const capitalChange = roundOutcome.capitalChange;
        if (roundOutcome.winner.id === 0) { // Human won the round
            updatedHuman.capital += capitalChange;
            updatedOpponent.capital -= capitalChange;
        } else { // Opponent won the round
            updatedHuman.capital -= capitalChange;
            updatedOpponent.capital += capitalChange;
        }
    }
    
    // 2. Check if the player is bankrupt (Game Over condition).
    if (updatedHuman.capital <= 0) {
        setPhase(GamePhase.GAME_OVER);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
    }

    // 3. Update player state.
    setHumanPlayer(updatedHuman);
    
    // 4. Check if the opponent is bankrupt (Match Win condition).
    if (updatedOpponent.capital <= 0) {
        // Player won the match, advance in bracket
        const nextRoundIndex = currentRoundIndex + 1;
        if (nextRoundIndex >= ROUND_NAMES.length) {
            setPhase(GamePhase.TOURNAMENT_COMPLETE);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return;
        }

        const matchInfo = getCurrentPlayerMatch(bracket, currentRoundIndex);
        if (!matchInfo) {
            startTournament(pointsToCapitalRate); // Should not happen
            return;
        }
        
        const { playerInfo, playerMatchIndex } = matchInfo;
        const newBracket = JSON.parse(JSON.stringify(bracket));
        
        // Mark winner of player's match
        newBracket[currentRoundIndex].matches[playerMatchIndex].winner = playerInfo;

        // Simulate winner of adjacent match to find next opponent
        const adjacentMatchIndex = playerMatchIndex % 2 === 0 ? playerMatchIndex + 1 : playerMatchIndex - 1;
        const adjacentMatch = newBracket[currentRoundIndex].matches[adjacentMatchIndex];
        if (adjacentMatch) {
            adjacentMatch.winner = adjacentMatch.p1; // Simple simulation: p1 always wins
        }
        
        // Create the match for the next round
        const nextMatchParentIndex = Math.floor(playerMatchIndex / 2);
        const p1 = newBracket[currentRoundIndex].matches[nextMatchParentIndex * 2].winner;
        const p2 = newBracket[currentRoundIndex].matches[nextMatchParentIndex * 2 + 1].winner;
        newBracket[nextRoundIndex].matches[nextMatchParentIndex] = { p1, p2, winner: null };

        setBracket(newBracket);
        setCurrentRoundIndex(nextRoundIndex);
        setPhase(GamePhase.MATCH_INTRO);
    } else {
        // 5. If no one is bankrupt, start a new round in the same match.
        startNewRound(updatedHuman, updatedOpponent);
    }
}, [roundOutcome, humanPlayer, currentOpponent, bracket, currentRoundIndex, getCurrentPlayerMatch, startNewRound, startTournament, pointsToCapitalRate]);

  const stealPi = useCallback((fromPlayer: Player, toPlayer: Player): [Player, Player] => {
      const opponentPi = [...fromPlayer.collected.pi];
      if (opponentPi.length === 0) {
          return [fromPlayer, toPlayer];
      }
      
      const singlePiIndex = opponentPi.findIndex(p => !p.isDoublePi);
      const stolenPi = singlePiIndex !== -1 
          ? opponentPi.splice(singlePiIndex, 1)[0]
          : opponentPi.splice(0, 1)[0];

      const updatedFromPlayer = { ...fromPlayer, collected: { ...fromPlayer.collected, pi: opponentPi } };
      const updatedToPlayer = { ...toPlayer, collected: { ...toPlayer.collected, pi: [...toPlayer.collected.pi, stolenPi] } };

      return [updatedFromPlayer, updatedToPlayer];
  }, []);

  const runTurnSequence = useCallback((playedCard: Card) => {
    setIsProcessing(true);
    setSelectedCardId(playedCard.id);

    const players = [humanPlayer, currentOpponent!];
    let player = players.find(p => p.id === currentPlayerId)!;
    let opponent = players.find(p => p.id !== currentPlayerId)!;
    
    player = { ...player, hand: player.hand.filter(c => c.id !== playedCard.id) };
    if (player.id === 0) setHumanPlayer(player); else setCurrentOpponent(player);
    
    const playTarget = floorCards.find(c => c.month === playedCard.month);
    setAnimation({ key: Date.now(), type: 'play', card: playedCard, targetCardId: playTarget?.id });

    setTimeout(() => {
        if (deck.length === 0) {
            setRoundOutcome({ winner: null, loser: null, isDraw: true, capitalChange: 0 });
            setPhase(GamePhase.ROUND_OVER);
            setIsProcessing(false);
            return;
        }

        const flippedCard = deck[0];
        const newDeck = deck.slice(1);
        const potentialFloorForFlip = [...floorCards, playedCard];
        const flipTarget = potentialFloorForFlip.find(c => c.month === flippedCard.month);
        setAnimation({ key: Date.now() + 1, type: 'flip', card: flippedCard, targetCardId: flipTarget?.id });

        setTimeout(() => {
            let tempFloor = [...floorCards];
            let captured: Card[] = [];
            let message = "";

            const handMatches = tempFloor.filter(c => c.month === playedCard.month);
            const isPpeok = handMatches.length === 1 && flippedCard.month === playedCard.month;
            const isJjok = handMatches.length === 0 && flippedCard.month === playedCard.month;

            if (isPpeok) {
                message = "뻑!";
                tempFloor.push(playedCard, flippedCard);
            } else if (isJjok) {
                message = "쪽!";
                captured.push(playedCard, flippedCard);
                [opponent, player] = stealPi(opponent, player);
            } else {
                // Hand play
                if (handMatches.length > 0) {
                    if (handMatches.length === 2) {
                        message = "따닥!";
                        [opponent, player] = stealPi(opponent, player);
                    } else {
                        message = "착!";
                    }
                    captured.push(playedCard, ...handMatches);
                    tempFloor = tempFloor.filter(c => c.month !== playedCard.month);
                } else {
                    tempFloor.push(playedCard);
                }

                // Deck flip
                const flipMatches = tempFloor.filter(c => c.month === flippedCard.month);
                if (flipMatches.length > 0) {
                    if (!message) message = "착!";
                    captured.push(flippedCard, ...flipMatches);
                    tempFloor = tempFloor.filter(c => c.month !== flippedCard.month);
                } else {
                    tempFloor.push(flippedCard);
                }
            }
            
            if (message) showActionMessage(message);

            const newCollected = { ...player.collected };
            captured.forEach(c => { newCollected[c.type as CardType].push(c); });
            
            const { score: newScore, sets: newSets } = calculateScoreAndSets(newCollected);
            const finalPlayer = { ...player, collected: newCollected, score: newScore, achievedSets: newSets };
            
            if (finalPlayer.id === 0) {
                setHumanPlayer(finalPlayer);
                setCurrentOpponent(opponent);
            } else {
                setCurrentOpponent(finalPlayer);
                setHumanPlayer(opponent);
            }
            
            setFloorCards(tempFloor);
            setDeck(newDeck);
            setAnimation(null);
            setSelectedCardId(undefined);

            if (finalPlayer.score >= WINNING_SCORE) {
                setPhase(GamePhase.GO_OR_STOP);
            } else {
                if (newDeck.length === 0) {
                    setRoundOutcome({ winner: null, loser: null, isDraw: true, capitalChange: 0 });
                    setPhase(GamePhase.ROUND_OVER);
                } else {
                    nextTurn();
                }
            }
            setIsProcessing(false);
        }, 500);
    }, 400);
  }, [humanPlayer, currentOpponent, currentPlayerId, floorCards, deck, calculateScoreAndSets, nextTurn, showActionMessage, stealPi]);

  const playableInfo = useMemo(() => {
    if (phase !== GamePhase.PLAYING || currentPlayerId !== 0 || isProcessing || isAutoPlayActive) return { ids: new Set<number>(), hasForcedMatch: false };
    const hand = humanPlayer.hand;
    if (!hand || hand.length === 0) return { ids: new Set<number>(), hasForcedMatch: false };
    const floorMonths = new Set(floorCards.map(card => card.month));
    const matchingCardsInHand = hand.filter(card => floorMonths.has(card.month));
    if (matchingCardsInHand.length > 0) return { ids: new Set(matchingCardsInHand.map(card => card.id)), hasForcedMatch: true };
    return { ids: new Set(hand.map(card => card.id)), hasForcedMatch: false };
  }, [humanPlayer, floorCards, phase, currentPlayerId, isProcessing, isAutoPlayActive]);

  const handleToggleAutoPlay = useCallback(() => setIsAutoPlayActive(prev => !prev), []);
  const handleCardSelect = useCallback((card: Card) => {
    if (isProcessing || !playableInfo.ids.has(card.id) || isAutoPlayActive) return;
    runTurnSequence(card);
  }, [isProcessing, playableInfo, runTurnSequence, isAutoPlayActive]);

  useEffect(() => {
    if (phase === GamePhase.PLAYING && currentPlayerId === 0 && isAutoPlayActive && !isProcessing && humanPlayer.hand.length > 0 && currentOpponent) {
      const performAutoPlayMove = () => {
        showActionMessage("AI가 자동으로 플레이합니다.", 1200);
        setTimeout(() => {
            const cardToPlay = getAiMove(humanPlayer, currentOpponent, floorCards);
            showActionMessage(`AI가 ${cardToPlay?.month}월 카드를 냈습니다.`, 1500);
            setTimeout(() => runTurnSequence(cardToPlay), 500);
        }, 1200);
      };
      const timeoutId = setTimeout(performAutoPlayMove, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [phase, currentPlayerId, isAutoPlayActive, isProcessing, humanPlayer, currentOpponent, floorCards, runTurnSequence, showActionMessage]);

  useEffect(() => {
    if (phase === GamePhase.PLAYING && currentPlayerId === 1 && currentOpponent && deck.length > 0 && !isProcessing) {
      const performAiMove = () => {
        if (currentOpponent.hand.length === 0) return;
        showActionMessage("상대가 생각 중...", 1000);
        setTimeout(() => {
            const cardToPlay = getAiMove(currentOpponent, humanPlayer, floorCards);
            showActionMessage(`상대가 ${cardToPlay?.month}월 카드를 냈습니다.`, 1500);
            setTimeout(() => runTurnSequence(cardToPlay), 500);
        }, 1000);
      };
      const timeoutId = setTimeout(performAiMove, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [phase, currentPlayerId, currentOpponent, deck, humanPlayer, floorCards, isProcessing, runTurnSequence, showActionMessage]);

  useEffect(() => {
    if (phase === GamePhase.GO_OR_STOP && currentPlayerId === 1 && currentOpponent) {
      const aiDecision = () => {
        const decision = decideGoOrStop(currentOpponent, humanPlayer, deck.length);
        if (decision === 'GO') {
            showActionMessage("상대가 '고'를 결정했습니다!", 1500);
            setTimeout(handleGo, 1500);
        } else {
            showActionMessage("상대가 '스톱'을 결정했습니다!", 1500);
            setTimeout(handleStop, 1500);
        }
      };
      const timeoutId = setTimeout(aiDecision, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [phase, currentPlayerId, currentOpponent, humanPlayer, deck.length, handleGo, handleStop, showActionMessage]);

  const opponentInfo = useMemo(() => {
      if (phase !== GamePhase.MATCH_INTRO || !bracket) return null;
      return getCurrentPlayerMatch(bracket, currentRoundIndex)?.opponent;
  }, [phase, bracket, currentRoundIndex, getCurrentPlayerMatch]);

  const opponentCapitalForIntro = useMemo(() => {
    if (phase !== GamePhase.MATCH_INTRO || typeof currentRoundIndex !== 'number') return 0;
    return BASE_STARTING_CAPITAL + (currentRoundIndex * CAPITAL_INCREMENT_PER_ROUND);
  }, [phase, currentRoundIndex]);


  if (!currentOpponent && phase !== GamePhase.TOURNAMENT_INTRO) {
    return (
        <div className="min-h-screen flex flex-col p-2 md:p-4 text-white font-sans bg-green-800">
            {phase === GamePhase.MATCH_INTRO && bracket && opponentInfo && (
                <TournamentModal 
                    type="match-intro" 
                    onNextMatch={startNewMatch} 
                    opponent={opponentInfo}
                    opponentCapital={opponentCapitalForIntro}
                    bracket={bracket}
                    currentRoundIndex={currentRoundIndex}
                />
            )}
        </div>
    );
  }

  if (phase === GamePhase.TOURNAMENT_INTRO) {
      return (
          <div className="min-h-screen flex flex-col p-2 md:p-4 text-white font-sans bg-green-800">
              <TournamentModal type="intro" onStart={startTournament} />
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col p-2 md:p-4 text-white font-sans">
      <header className="text-center mb-4 relative">
        <h1 className="text-4xl font-bold text-yellow-300 drop-shadow-lg">토너먼트 맞고</h1>
        <p className="text-lg text-yellow-100">{bracket?.[currentRoundIndex]?.name ?? '로딩 중...'} (점당 {pointsToCapitalRate.toLocaleString()}원)</p>
        
        {![GamePhase.TOURNAMENT_INTRO, GamePhase.GAME_OVER, GamePhase.TOURNAMENT_COMPLETE].includes(phase) && (
            <button
                onClick={handleResetGame}
                className="absolute top-0 right-0 bg-red-800 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-150"
                title="현재 게임을 포기하고 처음부터 다시 시작합니다."
            >
                게임 초기화
            </button>
        )}
      </header>

      <main className="flex-grow flex flex-col">
        <PlayerArea 
            player={currentOpponent!} 
            isCurrentPlayer={currentPlayerId === 1} 
            onCardSelect={() => {}} 
            isHuman={false}
            isProcessing={isProcessing}
            phase={phase}
        />
        <GameBoard floorCards={floorCards} deckSize={deck.length} lastActionMessage={lastActionMessage} animation={animation} />
        <PlayerArea 
            player={humanPlayer} 
            isCurrentPlayer={currentPlayerId === 0} 
            onCardSelect={handleCardSelect} 
            selectedCardId={selectedCardId} 
            isHuman={true} 
            playableCardIds={playableInfo.ids} 
            hasForcedMatch={playableInfo.hasForcedMatch} 
            isAutoPlayActive={isAutoPlayActive}
            onToggleAutoPlay={handleToggleAutoPlay}
            isProcessing={isProcessing}
            phase={phase}
        />
      </main>

      <footer>
        <GameControls phase={phase} currentPlayerId={currentPlayerId} onGo={handleGo} onStop={handleStop} />
      </footer>
      
      {phase === GamePhase.ROUND_OVER && roundOutcome && <ScoreBreakdownModal outcome={roundOutcome} onClose={processMatchState} pointsToCapitalRate={pointsToCapitalRate} />}
      
      {phase === GamePhase.GAME_OVER && <TournamentModal type="game-over" onRestart={() => setPhase(GamePhase.TOURNAMENT_INTRO)} />}
      {phase === GamePhase.TOURNAMENT_COMPLETE && <TournamentModal type="tournament-victory" onRestart={() => setPhase(GamePhase.TOURNAMENT_INTRO)} />}
      {phase === GamePhase.MATCH_INTRO && bracket && opponentInfo && (
        <TournamentModal 
            type="match-intro" 
            onNextMatch={startNewMatch} 
            opponent={opponentInfo}
            opponentCapital={opponentCapitalForIntro}
            bracket={bracket}
            currentRoundIndex={currentRoundIndex}
        />
      )}
    </div>
  );
};

export default App;