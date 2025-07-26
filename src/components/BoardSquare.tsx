import React, { useState } from 'react';
import { BoardSquare as BoardSquareType, Tile } from '../types/game';

interface BoardSquareProps {
  square: BoardSquareType;
  onClick: () => void;
  onDrop: (tile: Tile, row: number, col: number) => void;
  onTileRemove: (row: number, col: number) => void;
  canRemoveTile: boolean;
}

const BoardSquare: React.FC<BoardSquareProps> = ({ square, onClick, onDrop, onTileRemove, canRemoveTile }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getSquareClass = () => {
    const baseClass = 'board-square';
    const multiplierClass = `${baseClass}--${square.multiplier}`;
    const dragOverClass = isDragOver ? 'drag-over' : '';
    return `${baseClass} ${multiplierClass} ${dragOverClass}`.trim();
  };

  const getMultiplierText = () => {
    switch (square.multiplier) {
      case 'triple-word': return 'TW';
      case 'double-word': return 'DW';
      case 'triple-letter': return 'TL';
      case 'double-letter': return 'DL';
      case 'center': return '★';
      default: return '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!square.tile) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (square.tile) return; // Can't drop on occupied square

    try {
      const tileData = e.dataTransfer.getData('application/json');
      const parsedData = JSON.parse(tileData);
      
      // Only handle tiles from rack, not from board
      if (parsedData.fromBoard) {
        return; // Board tiles should be handled by rack drop zone
      }
      
      onDrop(parsedData, square.row, square.col);
    } catch (error) {
      console.error('Error parsing dropped tile data:', error);
    }
  };

  const handleTileDragStart = (e: React.DragEvent<HTMLDivElement>, tile: Tile) => {
    if (!canRemoveTile) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...tile,
      fromBoard: true,
      boardPosition: { row: square.row, col: square.col }
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.transform = 'scale(0.9)';
  };

  const handleTileDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div
      className={getSquareClass()}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {square.tile ? (
        <div 
          className={`tile ${canRemoveTile ? 'removable' : ''}`}
          draggable={canRemoveTile}
          onDragStart={(e) => handleTileDragStart(e, square.tile!)}
          onDragEnd={handleTileDragEnd}
        >
          <span className="tile-letter">{square.tile.letter}</span>
          <span className="tile-value">{square.tile.value}</span>
        </div>
      ) : (
        <span className="multiplier-text">{getMultiplierText()}</span>
      )}
    </div>
  );
};

export default BoardSquare;