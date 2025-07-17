

import React from 'react';
import { Player, Card, CollectedCards, RibbonColor, RoundOutcome } from '../types';
import CardComponent from './Card';

const getPiCount = (piCards: Card[], yulCards: Card[]) => {
    let count = piCards.reduce((acc, card) => acc + (card.isDoublePi ? 2 : 1), 0);
    if (yulCards.some(c => c.isGukjin)) {
        count += 2;
    }
    return count;
};

const calculateScoreBreakdown = (collected: CollectedCards) => {
    const breakdown: { category: string; points: number; cards: Card[] }[] = [];
    const { gwang, yul, tti, pi } = collected;

    // Gwang
    const nonRainGwang = gwang.filter(c => c.month !== 12);
    if (gwang.length === 5) breakdown.push({ category: '오광', points: 15, cards: gwang });
    else if (gwang.length === 4) breakdown.push({ category: '사광', points: 4, cards: gwang });
    else if (gwang.length === 3) {
        if (nonRainGwang.length === 3) {
            breakdown.push({ category: '비 없는 삼광', points: 3, cards: gwang });
        } else {
            breakdown.push({ category: '비 포함 삼광', points: 2, cards: gwang });
        }
    }

    // Yul
    const godoriCards = yul.filter(c => c.isGodori);
    if (godoriCards.length === 3) {
        breakdown.push({ category: '고도리', points: 5, cards: godoriCards });
    }
    if (yul.length >= 5) {
        breakdown.push({ category: `열끗 5장 이상 (${yul.length}장)`, points: yul.length - 4, cards: yul });
    }

    // Tti
    const redTti = tti.filter(c => c.ribbonColor === RibbonColor.RED);
    const blueTti = tti.filter(c => c.ribbonColor === RibbonColor.BLUE);
    const grassTti = tti.filter(c => c.ribbonColor === RibbonColor.GRASS);
    if (redTti.length === 3) breakdown.push({ category: '홍단', points: 3, cards: redTti });
    if (blueTti.length === 3) breakdown.push({ category: '청단', points: 3, cards: blueTti });
    if (grassTti.length === 3) breakdown.push({ category: '초단', points: 3, cards: grassTti });
    if (tti.length >= 5) {
        breakdown.push({ category: `띠 5장 이상 (${tti.length}장)`, points: tti.length - 4, cards: tti });
    }

    // Pi
    const piCount = getPiCount(pi, yul);
    if (piCount >= 10) {
        breakdown.push({ category: `피 (${piCount}장)`, points: piCount - 9, cards: pi });
    }

    return breakdown;
};

interface ScoreBreakdownModalProps {
    outcome: RoundOutcome;
    onClose: () => void;
    pointsToCapitalRate: number;
}

const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ outcome, onClose, pointsToCapitalRate }) => {
    const renderModalContent = () => {
        if (outcome.isDraw || !outcome.winner || !outcome.loser) {
            return (
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-300 mb-6">무승부!</h2>
                    <p className="text-lg mb-8">덱이 비었고 아무도 승리 점수에 도달하지 못했습니다.</p>
                </div>
            );
        }

        const { winner, loser, capitalChange, breakdown: outcomeBreakdown } = outcome;
        const scoreBreakdown = calculateScoreBreakdown(winner.collected);
        
        const multipliers = [];
        if (outcomeBreakdown) {
            if (outcomeBreakdown.goCount >= 1) {
                multipliers.push({ reason: `${outcomeBreakdown.goCount}고`, multiplier: `x${outcomeBreakdown.goCount + 1}` });
            }
            if (outcomeBreakdown.isGoBak) {
                multipliers.push({ reason: '고박', multiplier: 'x2' });
            }
            if (outcomeBreakdown.isGwangBak) {
                multipliers.push({ reason: '광박', multiplier: 'x2' });
            }
            if (outcomeBreakdown.isPiBak) {
                multipliers.push({ reason: '피박', multiplier: 'x2' });
            }
        }
        
        const baseScore = outcomeBreakdown ? outcomeBreakdown.baseScore : winner.score;
        const finalScore = capitalChange / (pointsToCapitalRate || 1);
        const winnerNewCapital = winner.capital + capitalChange;
        const loserNewCapital = loser.capital - capitalChange;

        return (
            <>
                <h2 className="text-4xl font-bold text-yellow-300 text-center mb-2">라운드 종료!</h2>
                <h3 className="text-2xl text-center mb-6">{winner.name} 승리!</h3>
                
                <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
                    {scoreBreakdown.length > 0 ? scoreBreakdown.map((item, index) => (
                        <div key={index} className="bg-black/30 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-semibold text-yellow-200">{item.category}</h4>
                                <span className="text-lg font-bold">{item.points}점</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {item.cards.map(card => <CardComponent key={card.id} card={card} className="!w-[40px] !h-[62px]" />)}
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 italic">점수 조합이 없습니다.</p>
                    )}
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg space-y-2 text-lg">
                    <div className="flex justify-between font-semibold">
                        <span>기본 점수:</span>
                        <span>{baseScore}</span>
                    </div>
                    {multipliers.map((m, i) => (
                        <div key={i} className="flex justify-between text-cyan-300">
                            <span>{m.reason}:</span>
                            <span>{m.multiplier}</span>
                        </div>
                    ))}
                    <hr className="border-yellow-400/50 my-2" />
                    <div className="flex justify-between text-2xl font-bold text-yellow-300">
                        <span>최종 점수:</span>
                        <span>{finalScore}</span>
                    </div>
                     <div className={`flex justify-between text-2xl font-bold ${winner.id === 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <span>획득/손실 자본:</span>
                        <span>{winner.id === 0 ? '+' : '-'}{capitalChange.toLocaleString()}원</span>
                    </div>
                </div>
                
                <div className="mt-4 text-center text-md">
                    <p>{winner.name} 갱신된 자본: {winnerNewCapital.toLocaleString()}원</p>
                    <p>{loser.name} 갱신된 자본: {loserNewCapital.toLocaleString()}원</p>
                </div>

            </>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <div className="bg-green-900/95 border-4 border-yellow-400 rounded-2xl p-6 md:p-8 text-white max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                {renderModalContent()}
                <div className="text-center mt-8">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-xl font-bold text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 bg-blue-600 hover:bg-blue-500"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoreBreakdownModal;