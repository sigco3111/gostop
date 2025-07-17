
import React from 'react';
import { Card as CardType, CardType as EnumCardType } from '../types';

interface CardProps {
  card?: CardType;
  onClick?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  isFaceDown?: boolean;
  className?: string;
  isPlayable?: boolean;
  isHighlighted?: boolean;
}

const getKoreanCardType = (type: EnumCardType) => {
  switch (type) {
    case EnumCardType.GWANG: return '광';
    case EnumCardType.YUL: return '열끗';
    case EnumCardType.TTI: return '띠';
    case EnumCardType.PI: return '피';
    default: return type;
  }
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, isSelectable, isSelected, isFaceDown = false, className = '', isPlayable = false, isHighlighted = false }) => {
  const baseStyle = "w-[60px] h-[95px] md:w-[70px] md:h-[110px] rounded-md border-2 shadow-lg transition-all duration-200 text-center relative overflow-hidden";
  const selectableStyle = isSelectable ? "cursor-pointer hover:scale-105 hover:-translate-y-2" : "";
  const selectedStyle = isSelected ? "border-yellow-400 scale-105 -translate-y-2 ring-4 ring-yellow-400" : "border-black";
  const playableStyle = isPlayable && !isSelected ? 'ring-4 ring-green-400 shadow-lg shadow-green-400/50' : '';
  const highlightStyle = isHighlighted ? 'highlighted-card' : '';
  
  const bgStyle = isFaceDown ? 'bg-red-800 border-red-900' : 'bg-[#FDF6E3] border-red-700';

  const title = !isFaceDown && card ? `${card.month}월 - ${getKoreanCardType(card.type)}` : '카드 뒷면';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${bgStyle} ${selectableStyle} ${playableStyle} ${selectedStyle} ${className} ${highlightStyle}`}
      title={title}
      aria-label={title}
      data-card-id={card?.id}
    >
      {isFaceDown ? (
        <div className="w-full h-full flex items-center justify-center p-1">
            <div className="w-full h-full bg-red-900/70 rounded-sm">
              {/* Card back design */}
            </div>
        </div>
      ) : card ? (
        <img src={card.image} alt={title} className="w-full h-full object-cover" />
      ) : null}
    </div>
  );
};

export default CardComponent;