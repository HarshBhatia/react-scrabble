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
  return (
    <div className="player-info">
      <div className="players-section">
        <h2>Players</h2>
        <div className="players-list">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`player-card ${index === currentPlayerIndex ? 'current' : ''}`}
            >
              <div className="player-name">
                {player.name}
                {index === currentPlayerIndex && <span className="current-indicator"> (Current Turn)</span>}
              </div>
              <div className="player-score">Score: {player.score}</div>
              <div className="player-tiles">Tiles: {player.rack.length}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="game-info">
        <div className="tiles-remaining">
          Tiles Remaining: {tilesRemaining}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;