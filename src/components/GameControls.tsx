import React from 'react';
import './GameControls.css';

interface GameControlsProps {
  onSubmitWord: () => void;
  onPassTurn: () => void;
  onShuffleRack: () => void;
  onRecallTiles: () => void;
  onNewGame: () => void; // New prop for starting a new game
  canSubmit: boolean;
  canRecall: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onSubmitWord,
  onPassTurn,
  onShuffleRack,
  onRecallTiles,
  onNewGame,
  canSubmit,
  canRecall
}) => {
  return (
    <div className="game-controls">
      <div className="main-actions">
        <button
          className="control-button submit"
          onClick={onSubmitWord}
          disabled={!canSubmit}
        >
          Submit Word
        </button>
      </div>
      <div className="secondary-actions">
        <button
          className="control-button pass"
          onClick={onPassTurn}
        >
          Pass Turn
        </button>
        <button
          className="control-button shuffle"
          onClick={onShuffleRack}
        >
          Shuffle Tiles
        </button>
        <button
          className="control-button recall"
          onClick={onRecallTiles}
          disabled={!canRecall}
        >
          Recall All Tiles
        </button>
        <button
          className="control-button new-game"
          onClick={onNewGame}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameControls;