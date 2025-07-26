import React from 'react';
import './GameControls.css';

interface GameControlsProps {
  onSubmitWord: () => void;
  onPassTurn: () => void;
  onShuffleRack: () => void;
  onRecallTiles: () => void;
  canSubmit: boolean;
  canRecall: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onSubmitWord,
  onPassTurn,
  onShuffleRack,
  onRecallTiles,
  canSubmit,
  canRecall
}) => {
  return (
    <div className="game-controls">
      <button
        className="control-button submit"
        onClick={onSubmitWord}
        disabled={!canSubmit}
      >
        Submit Word
      </button>
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
    </div>
  );
};

export default GameControls;