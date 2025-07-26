import React, { useState } from 'react';
import './PlayerNameInput.css';

interface PlayerNameInputProps {
  onStartGame: (playerNames: string[]) => void;
}

const PlayerNameInput: React.FC<PlayerNameInputProps> = ({ onStartGame }) => {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame([player1Name.trim() || 'Player 1', player2Name.trim() || 'Player 2']);
  };

  return (
    <div className="player-name-input-container">
      <div className="player-name-input-card">
        <h2>Enter Player Names</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="player1">Player 1 Name:</label>
            <input
              type="text"
              id="player1"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Player 1"
            />
          </div>
          <div className="input-group">
            <label htmlFor="player2">Player 2 Name:</label>
            <input
              type="text"
              id="player2"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Player 2"
            />
          </div>
          <button type="submit" className="start-game-button">Start Game</button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameInput;
