
import React, { useState } from 'react';
import { OpponentProfile, TournamentBracket, Participant, Match } from '../types';
import { DEFAULT_POINTS_TO_CAPITAL_RATE } from '../constants';


interface TournamentModalProps {
  type: 'intro' | 'match-intro' | 'game-over' | 'tournament-victory';
  onStart?: (rate: number) => void;
  onRestart?: () => void;
  onNextMatch?: () => void;
  opponent?: Participant;
  opponentCapital?: number;
  bracket?: TournamentBracket;
  currentRoundIndex?: number;
}

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean }> = ({ onClick, children, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-8 py-4 text-xl font-bold text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const MatchCard: React.FC<{ match: Match; isPlayerInMatch: boolean }> = ({ match, isPlayerInMatch }) => {
    const getParticipantName = (p: Participant | null) => p?.name ?? '미정';
    
    const getParticipantStyle = (p: Participant | null, isWinner: boolean) => {
        let style = "truncate";
        if (p?.id === 'player') style += ' text-yellow-300';
        if (isWinner) style += ' font-bold';
        else if (match.winner !== null) style += ' text-gray-500 line-through';
        return style;
    };

    const p1isWinner = match.winner?.id === match.p1?.id;
    const p2isWinner = match.winner?.id === match.p2?.id;

    return (
        <div className={`p-2 my-2 bg-black/30 rounded-md w-40 ${isPlayerInMatch ? 'border-2 border-yellow-400' : 'border border-gray-600'}`}>
            <p className={getParticipantStyle(match.p1, p1isWinner)}>{getParticipantName(match.p1)}</p>
            <hr className="my-1 border-gray-500" />
            <p className={getParticipantStyle(match.p2, p2isWinner)}>{getParticipantName(match.p2)}</p>
        </div>
    );
};


const BracketViewer: React.FC<{ bracket: TournamentBracket; currentRoundIndex: number }> = ({ bracket, currentRoundIndex }) => {
    return (
        <div className="flex justify-center items-start text-xs md:text-sm overflow-x-auto p-4">
            {bracket.map((round, roundIdx) => (
                <div key={round.name} className="flex flex-col justify-around items-center h-full px-2 md:px-4">
                    <h3 className={`font-bold text-lg mb-4 whitespace-nowrap ${currentRoundIndex === roundIdx ? 'text-yellow-300' : ''}`}>{round.name}</h3>
                    <div className="flex flex-col justify-around flex-grow w-full">
                        {round.matches.map((match, matchIdx) => {
                             if (roundIdx > 0 && (!match.p1 || !match.p2)) {
                                // Render placeholders for future rounds to maintain structure
                                return <div key={matchIdx} className="p-2 my-2 w-40 h-[60px] bg-black/10 rounded-md border border-dashed border-gray-700" />;
                            }
                            const isPlayerInMatch = match.p1?.id === 'player' || match.p2?.id === 'player';
                            return <MatchCard key={matchIdx} match={match} isPlayerInMatch={isPlayerInMatch} />;
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};


const TournamentModal: React.FC<TournamentModalProps> = ({ type, onStart, onRestart, onNextMatch, opponent, opponentCapital, bracket, currentRoundIndex }) => {
  const [isBracketVisible, setIsBracketVisible] = useState(false);
  const [rate, setRate] = useState(DEFAULT_POINTS_TO_CAPITAL_RATE);

  const renderContent = () => {
    switch (type) {
      case 'intro':
        return (
          <>
            <h2 className="text-4xl font-bold text-yellow-300 mb-4">토너먼트 맞고</h2>
            <p className="text-lg mb-2">16인 토너먼트에 참가하여 전국 각지의 타짜들에게 도전하세요!</p>
            <p className="text-md mb-6 text-gray-300">각 라운드에서 승리하여 정상에 올라 최후의 승자가 되십시오!</p>
            
            <div className="my-6">
                <label htmlFor="rate-input" className="block text-lg font-medium text-yellow-200 mb-2">점당 금액 설정 (원)</label>
                <input 
                    id="rate-input"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Math.max(10, parseInt(e.target.value, 10)) || 10)}
                    className="bg-gray-900/50 text-white text-center text-xl font-bold w-48 p-2 rounded-md border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                    min="10"
                    step="10"
                />
            </div>
            
            <Button onClick={() => onStart?.(rate)} className="bg-blue-600 hover:bg-blue-500">토너먼트 시작</Button>
          </>
        );
      case 'match-intro':
        if (!opponent) return null;

        if (isBracketVisible && bracket && typeof currentRoundIndex !== 'undefined') {
            return (
                <>
                    <h2 className="text-4xl font-bold text-yellow-300 mb-4">토너먼트 대진표</h2>
                    <div className="bg-black/20 rounded-lg p-2">
                      <BracketViewer bracket={bracket} currentRoundIndex={currentRoundIndex} />
                    </div>
                    <div className="mt-6">
                        <Button onClick={() => setIsBracketVisible(false)} className="bg-gray-600 hover:bg-gray-500">돌아가기</Button>
                    </div>
                </>
            );
        }

        return (
          <>
            <h2 className="text-3xl font-bold text-red-400 mb-2">
                {bracket?.[currentRoundIndex!]?.name ?? ''} 상대
            </h2>
            <h3 className="text-4xl font-bold text-white mb-2">{opponent.name}</h3>
            <p className="text-xl text-yellow-300 italic mb-4">"{opponent.title}"</p>
            <p className="text-lg mb-4 text-gray-200">{(opponent as OpponentProfile).description}</p>
            <p className="text-lg mb-6 text-yellow-200">초기 자본금: {opponentCapital?.toLocaleString()}원</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={onNextMatch} className="bg-green-600 hover:bg-green-500">대결 시작</Button>
                <Button onClick={() => setIsBracketVisible(true)} className="bg-blue-600 hover:bg-blue-500" disabled={!bracket}>대진표 보기</Button>
            </div>
          </>
        );
      case 'game-over':
        return (
          <>
            <h2 className="text-4xl font-bold text-red-500 mb-4">게임 오버</h2>
            <p className="text-lg mb-6">토너먼트에서 패배했습니다. 당신의 도전은 여기까지입니다.</p>
            <Button onClick={onRestart} className="bg-gray-600 hover:bg-gray-500">새 게임 시작</Button>
          </>
        );
      case 'tournament-victory':
        return (
          <>
            <h2 className="text-5xl font-bold text-yellow-300 mb-4">최종 우승!</h2>
            <p className="text-xl mb-6">모든 상대를 꺾고 정상에 올랐습니다. 당신은 진정한 화투의 신입니다!</p>
            <Button onClick={onRestart} className="bg-yellow-600 hover:bg-yellow-500">새로운 게임 시작</Button>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-green-900/95 border-4 border-gray-500 rounded-2xl p-6 md:p-8 text-white max-w-fit w-full text-center shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default TournamentModal;