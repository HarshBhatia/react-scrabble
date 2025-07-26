import React from 'react';
import { BoardSquare as BoardSquareType, Tile } from '../types/game';
import { ValidationResult } from '../utils/wordValidation';
import BoardSquare from './BoardSquare';
import './GameBoard.css';

interface GameBoardProps {
  board: BoardSquareType[][];
  onSquareClick: (row: number, col: number) => void;
  onTileDrop: (tile: Tile, row: number, col: number) => void;
  onTileRemove: (row: number, col: number) => void;
  canRemoveTile: (row: number, col: number) => boolean;
  realtimeValidation: ValidationResult | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onSquareClick, onTileDrop, onTileRemove, canRemoveTile, realtimeValidation }) => {
  return (
    <div className="game-board">
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => (
          <BoardSquare
            key={`${rowIndex}-${colIndex}`}
            square={square}
            onClick={() => onSquareClick(rowIndex, colIndex)}
            onDrop={onTileDrop}
            onTileRemove={onTileRemove}
            canRemoveTile={canRemoveTile(rowIndex, colIndex)}
            isPartofValidWord={realtimeValidation?.isValid && realtimeValidation.words.some(word => word.tiles.some(t => t.position.row === rowIndex && t.position.col === colIndex))}
            isPartofInvalidWord={!realtimeValidation?.isValid && realtimeValidation?.errors.length > 0 && board[rowIndex][colIndex].tile && canRemoveTile(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;