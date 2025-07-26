import React from 'react';
import { Player } from '../types/game';
import './PlayerInfo.css';

interface PlayerInfoProps {
  players: Player[];
  currentPlayerIndex: number;
  tilesRemaining: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({
  players,
  currentPlayerIndex,
  tilesRemaining
}) => {
  const player1 = players[0];
  const player2 = players[1];

  return (
    <div className="player-info">
      {/* Player 1 Info (Left) */}
      <div className={`player-card ${currentPlayerIndex === 0 ? 'current' : ''}`}>
        <div className="player-name">
          {player1.name}
        </div>
        <div className="player-score">{player1.score}</div>
      </div>

      {/* Tiles Remaining (Center) */}
      <div className="game-info">
        <div className="tiles-remaining">
          Tiles Remaining: {tilesRemaining}
        </div>
      </div>

      {/* Player 2 Info (Right) */}
      <div className={`player-card ${currentPlayerIndex === 1 ? 'current' : ''}`}>
        <div className="player-name">
          {player2.name}
        </div>
        <div className="player-score">{player2.score}</div>
      </div>
    </div>
  );
};

export default PlayerInfo;