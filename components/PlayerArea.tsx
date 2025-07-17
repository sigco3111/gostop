


import React, { useMemo } from 'react';
import { Player, Card, CardType, RibbonColor, GamePhase, AchievedSet } from '../types';
import CardComponent from './Card';

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  onCardSelect: (card: Card) => void;
  selectedCardId?: number;
  isHuman: boolean;
  playableCardIds?: Set<number>;
  hasForcedMatch?: boolean;
  isAutoPlayActive?: boolean;
  onToggleAutoPlay?: () => void;
  isProcessing?: boolean;
  phase?: GamePhase;
}

const getPiCount = (piCards: Card[], yulCards: Card[]) => {
    let count = piCards.reduce((acc, card) => acc + (card.isDoublePi ? 2 : 1), 0);
    // As per existing logic in App.tsx, Gukjin adds 2 to pi count.
    if (yulCards.some(c => c.isGukjin)) {
        count += 2;
    }
    return count;
};

const ScorePile: React.FC<{ cards: Card[]; title: string; highlightedCardIds: Set<number> }> = ({ cards, title, highlightedCardIds }) => (
  <div>
    <h4 className="text-xs font-bold text-yellow-200 mb-1">{title}</h4>
    <div className="flex flex-wrap gap-1 bg-black/30 p-1 rounded min-h-[50px]">
      {cards.map(card => <CardComponent 
          key={card.id} 
          card={card} 
          className="!w-[30px] !h-[47px] md:!w-[40px] md:!h-[62px]"
          isHighlighted={highlightedCardIds.has(card.id)}
        />)}
    </div>
  </div>
);

const StatusIndicator: React.FC<{ text: string; color: string; active: boolean; tooltip: string }> = ({ text, color, active, tooltip }) => {
  if (!active) return null;
  return (
    <span
      className={`px-2 py-1 text-xs font-bold text-white rounded-md shadow-md ${color} animate-fade-in`}
      title={tooltip}
    >
      {text}
    </span>
  );
};

const PlayerArea: React.FC<PlayerAreaProps> = ({ player, isCurrentPlayer, onCardSelect, selectedCardId, isHuman, playableCardIds, hasForcedMatch, isAutoPlayActive, onToggleAutoPlay, isProcessing, phase }) => {
  const { gwang, yul, tti, pi } = player.collected;
  
  const highlightedCardIds = useMemo(() => new Set(player.achievedSets?.flatMap(set => set.cardIds) ?? []), [player.achievedSets]);

  const hasGodori = yul.filter(c => c.isGodori).length === 3;
  const isGwangBakDanger = gwang.length === 0;
  const piCount = getPiCount(pi, yul);
  const isPiBakDanger = piCount <= 4;

  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${isCurrentPlayer ? 'bg-yellow-500/30 shadow-2xl' : 'bg-black/20'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{player.name}</h3>
          <p className="text-sm text-yellow-200">자본금: {player.capital.toLocaleString()}원</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
                {isHuman && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white select-none">AI 자동</span>
                    <label
                      htmlFor="autoplay-toggle"
                      className="relative inline-flex items-center cursor-pointer"
                      title={isAutoPlayActive ? 'AI 자동 플레이 끄기' : 'AI 자동 플레이 켜기'}
                    >
                      <input
                        type="checkbox"
                        id="autoplay-toggle"
                        className="sr-only peer"
                        checked={isAutoPlayActive}
                        onChange={onToggleAutoPlay}
                        disabled={isProcessing}
                      />
                      <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>
                )}
                <div className="text-lg font-bold text-yellow-300 text-right">
                  <p>점수: {player.score}</p>
                  {player.goCount > 0 && <p>({player.goCount}고)</p>}
                </div>
            </div>
            {/* Status Indicators */}
            <div className="flex gap-2 h-6 items-center">
                <StatusIndicator 
                    active={hasGodori} 
                    text="고도리" 
                    color="bg-blue-600"
                    tooltip="고도리 달성! (5점)" 
                />
                <StatusIndicator 
                    active={player.isGoBak} 
                    text="고박" 
                    color="bg-red-700"
                    tooltip="고박 상태: 상대가 '고'를 외친 후 이기면 점수 2배" 
                />
                <StatusIndicator 
                    active={isGwangBakDanger} 
                    text="광박?" 
                    color="bg-purple-700"
                    tooltip="광박 위험: 광 없이 상대가 광으로 승리 시 점수 2배" 
                />
                <StatusIndicator 
                    active={isPiBakDanger} 
                    text="피박?" 
                    color="bg-orange-600"
                    tooltip="피박 위험: 피 4장 이하로 패배 시 점수 2배" 
                />
            </div>
        </div>
      </div>

      {/* Collected Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <ScorePile cards={gwang} title={`광 (${gwang.length})`} highlightedCardIds={highlightedCardIds} />
        <ScorePile cards={yul} title={`열끗 (${yul.length})`} highlightedCardIds={highlightedCardIds} />
        <ScorePile cards={tti} title={`띠 (${tti.length})`} highlightedCardIds={highlightedCardIds} />
        <ScorePile cards={pi} title={`피 (${getPiCount(pi, yul)})`} highlightedCardIds={highlightedCardIds} />
      </div>

      {/* Hand */}
      <div className="bg-black/30 p-2 rounded min-h-[120px] md:min-h-[140px]">
        <h4 className="text-xs font-bold text-yellow-200 mb-1">패 ({player.hand.length})</h4>
        <div className="flex justify-center items-center flex-wrap gap-2">
          {player.hand.map(card => (
            isHuman ? (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => onCardSelect(card)}
                isSelectable={isCurrentPlayer && !isAutoPlayActive}
                isSelected={card.id === selectedCardId}
                isPlayable={isCurrentPlayer && !!hasForcedMatch && playableCardIds?.has(card.id)}
              />
            ) : (
              <CardComponent key={card.id} isFaceDown={true} />
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerArea;