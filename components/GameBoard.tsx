
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../types';
import CardComponent from './Card';

interface GameBoardProps {
  floorCards: Card[];
  deckSize: number;
  lastActionMessage: string | null;
  animation: { key: number; type: 'play' | 'flip'; card: Card; targetCardId?: number } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ floorCards, deckSize, lastActionMessage, animation }) => {
  const [animationPosition, setAnimationPosition] = useState<{ top: string; left: string } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animation) {
      setAnimationPosition(null);
      return;
    }

    const boardElement = boardRef.current;
    if (!boardElement) return;

    let targetElement: HTMLElement | null = null;
    if (animation.targetCardId) {
      targetElement = boardElement.querySelector(`[data-card-id='${animation.targetCardId}']`);
    }

    if (targetElement) {
      const boardRect = boardElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      
      const top = targetRect.top - boardRect.top + targetRect.height / 2;
      const left = targetRect.left - boardRect.left + targetRect.width / 2;
      
      setAnimationPosition({ top: `${top}px`, left: `${left}px` });
    } else {
      // Default to center if no target
      setAnimationPosition({ top: '50%', left: '50%' });
    }
  }, [animation]);

  return (
    <div ref={boardRef} className="bg-green-700/80 p-4 rounded-xl shadow-inner border-4 border-green-900/50 flex-grow flex flex-col justify-center items-center min-h-[300px] md:min-h-[400px] my-4 relative">
      {lastActionMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white text-3xl font-bold p-6 rounded-lg z-20 animate-pulse">
              {lastActionMessage}
          </div>
      )}
      
      {/* Animation Overlay */}
      {animation && animationPosition && (
        <div
          key={animation.key}
          className="absolute z-30"
          style={{
            top: animationPosition.top,
            left: animationPosition.left,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {animation.type === 'play' && (
            <CardComponent card={animation.card} className="animate-play-card" />
          )}
          {animation.type === 'flip' && (
            <div className="flip-card-container">
              <div className="card-flipper">
                <div className="card-back">
                  <CardComponent isFaceDown={true} />
                </div>
                <div className="card-front">
                  <CardComponent card={animation.card} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floor Cards */}
      <div className="flex-grow w-full flex justify-center items-center flex-wrap gap-3 p-4">
        {floorCards.length > 0 ? (
            floorCards.map(card => <CardComponent key={card.id} card={card} />)
        ) : (
            <p className="text-green-200 italic">판에 카드가 없습니다</p>
        )}
      </div>

      {/* Deck */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <CardComponent isFaceDown={true} />
          <span className="text-white font-bold text-lg">{deckSize}</span>
      </div>
    </div>
  );
};

export default GameBoard;
