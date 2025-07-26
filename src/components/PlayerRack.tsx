import React, { useState, useEffect } from 'react';
import { Tile } from '../types/game';
import './PlayerRack.css';

interface PlayerRackProps {
  tiles: Tile[];
  selectedTile: Tile | null;
  onTileClick: (tile: Tile) => void;
  onTileReturn: (tileData: any) => void;
  isShuffling?: boolean;
}

const PlayerRack: React.FC<PlayerRackProps> = ({ tiles, selectedTile, onTileClick, onTileReturn, isShuffling }) => {
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isShuffling) {
      // Add all tiles to animating set
      const tileIds = new Set(tiles.map(tile => tile.id));
      setAnimatingTiles(tileIds);

      // Remove animation after delay
      const timeout = setTimeout(() => {
        setAnimatingTiles(new Set());
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isShuffling, tiles]);
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tile: Tile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tile));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);

    // Add visual feedback to the original tile
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.transform = 'scale(0.9)';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleRackDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRackDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const tileData = e.dataTransfer.getData('application/json');
      const parsedData = JSON.parse(tileData);
      
      // Only handle tiles being returned from the board
      if (parsedData.fromBoard) {
        onTileReturn(parsedData);
      }
    } catch (error) {
      console.error('Error parsing dropped tile data:', error);
    }
  };

  return (
    <div 
      className="player-rack"
      onDragOver={handleRackDragOver}
      onDrop={handleRackDrop}
    >
      <h3>Your Tiles</h3>
      <div className="rack-tiles">
        {tiles.map((tile, index) => (
          <div
            key={tile.id}
            className={`rack-tile ${selectedTile?.id === tile.id ? 'selected' : ''} ${animatingTiles.has(tile.id) ? 'shuffling' : ''}`}
            onClick={() => onTileClick(tile)}
            draggable
            onDragStart={(e) => handleDragStart(e, tile)}
            onDragEnd={handleDragEnd}
            style={{
              animationDelay: animatingTiles.has(tile.id) ? `${index * 0.1}s` : '0s'
            }}
          >
            <span className="tile-letter">{tile.letter || '?'}</span>
            <span className="tile-value">{tile.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerRack;