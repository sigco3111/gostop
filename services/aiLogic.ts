import { Card, Player, CardType, CollectedCards, RibbonColor } from '../types';

// Heuristic score for a card. Higher is better.
const getCardValue = (card: Card): number => {
    switch (card.type) {
        case CardType.GWANG: return 5;
        case CardType.YUL: return card.isGodori || card.isGukjin ? 4 : 3;
        case CardType.TTI: return 2;
        case CardType.PI: return card.isDoublePi ? 1.5 : 1;
        default: return 0;
    }
};

/**
 * A more strategic AI to decide which card to play.
 */
export const getAiMove = (aiPlayer: Player, opponent: Player, floorCards: Card[]): Card => {
    const { hand } = aiPlayer;
    if (hand.length === 0) throw new Error("AI has no cards to play.");

    const floorMonths = new Set(floorCards.map(c => c.month));
    const playableMatches = hand.filter(c => floorMonths.has(c.month));

    // --- Decision Logic ---

    // 1. If there are matching cards on the floor
    if (playableMatches.length > 0) {
        let bestPlay: { card: Card; score: number } | null = null;

        for (const handCard of playableMatches) {
            // Find all cards of the same month on the floor, as there could be more than one.
            const floorMatches = floorCards.filter(c => c.month === handCard.month);
            // For simplicity, we'll evaluate based on the first match. A more complex AI could evaluate picking among multiple cards.
            const floorMatch = floorMatches[0]; 
            let playScore = 0;

            // Score based on what we get
            playScore += getCardValue(handCard);
            playScore += getCardValue(floorMatch);

            // Bonus for completing or progressing a set
            const godoriCount = aiPlayer.collected.yul.filter(c => c.isGodori).length;
            if (handCard.isGodori && godoriCount === 2) playScore += 20; // High priority to complete
            if (floorMatch.isGodori && godoriCount === 2) playScore += 20;

            const redTtiCount = aiPlayer.collected.tti.filter(t => t.ribbonColor === RibbonColor.RED).length;
            if (handCard.type === CardType.TTI && handCard.ribbonColor === RibbonColor.RED && redTtiCount === 2) playScore += 15;
            if (floorMatch.type === CardType.TTI && floorMatch.ribbonColor === RibbonColor.RED && redTtiCount === 2) playScore += 15;

            // Defensive play: Check if opponent is close to a set
            const opponentRedTti = opponent.collected.tti.filter(t => t.ribbonColor === RibbonColor.RED).length;
            if(floorMatch.type === CardType.TTI && floorMatch.ribbonColor === RibbonColor.RED && opponentRedTti === 2) {
                playScore += 10; // Steal the card opponent needs
            }
            const opponentGodori = opponent.collected.yul.filter(c => c.isGodori).length;
            if (floorMatch.isGodori && opponentGodori === 2) {
                playScore += 18; // High priority to block opponent's godori
            }

            if (!bestPlay || playScore > bestPlay.score) {
                bestPlay = { card: handCard, score: playScore };
            }
        }
        return bestPlay!.card;
    }

    // 2. If no matching cards, decide what to discard
    // Discard the least valuable card that is also least likely to help the opponent
    let worstCard: { card: Card; score: number } | null = null;
    for (const handCard of hand) {
        let cardScore = getCardValue(handCard);
        
        // Penalty if opponent is collecting this month, making it a less desirable discard
        const opponentCollectsMonth = opponent.collected.pi.some(c => c.month === handCard.month) ||
                                      opponent.collected.tti.some(c => c.month === handCard.month) ||
                                      opponent.collected.yul.some(c => c.month === handCard.month);

        if (opponentCollectsMonth) {
            cardScore += 5; // Avoid giving opponent a card they might want
        }
        
        if (!worstCard || cardScore < worstCard.score) {
            worstCard = { card: handCard, score: cardScore };
        }
    }

    return worstCard!.card;
};

/**
 * AI decides whether to "Go" or "Stop".
 */
export const decideGoOrStop = (aiPlayer: Player, opponent: Player, deckSize: number): 'GO' | 'STOP' => {
    // If opponent is in "Go-bak", AI should be more aggressive
    if (opponent.isGoBak && aiPlayer.score < 10) {
        return 'GO';
    }

    // If AI has a very high score, just stop and take the win
    if (aiPlayer.score >= 10) {
        return 'STOP';
    }
    
    // If AI has already called Go twice, it's too risky.
    if (aiPlayer.goCount >= 2) {
        return 'STOP';
    }

    // If the deck is running low, stop.
    if (deckSize < 8) {
        return 'STOP';
    }

    // Check if opponent is in danger of Gwang-bak or Pi-bak
    const opponentGwangCount = opponent.collected.gwang.length;
    const winnerHasGwangScore = aiPlayer.collected.gwang.length >= 3;
    if (winnerHasGwangScore && opponentGwangCount === 0) {
        return 'STOP'; // Secure the Gwang-bak bonus
    }

    // Simple default: if score is low, go for more.
    if (aiPlayer.score < 9) {
        return 'GO';
    }
    
    return 'STOP'; // Default to safety
};
