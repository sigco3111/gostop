
import React from 'react';
import { GamePhase } from '../types';

interface GameControlsProps {
  phase: GamePhase;
  onGo: () => void;
  onStop: () => void;
  currentPlayerId: number;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string }> = ({ onClick, children, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-8 py-4 text-xl font-bold text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const GameControls: React.FC<GameControlsProps> = ({ phase, onGo, onStop, currentPlayerId }) => {
  const isHumanTurnToDecide = phase === GamePhase.GO_OR_STOP && currentPlayerId === 0;
  
  if (!isHumanTurnToDecide) {
    return <div className="min-h-[100px]"></div>;
  }
  
  return (
    <div className="flex justify-center items-center gap-4 p-4 min-h-[100px]">
      <Button onClick={onGo} className="bg-green-600 hover:bg-green-500">고!</Button>
      <Button onClick={onStop} className="bg-red-600 hover:bg-red-500">스톱!</Button>
    </div>
  );
};

export default GameControls;
