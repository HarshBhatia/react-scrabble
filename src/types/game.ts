export interface Tile {
  letter: string;
  value: number;
  id: string;
}

export interface BoardSquare {
  tile: Tile | null;
  multiplier: 'normal' | 'double-letter' | 'triple-letter' | 'double-word' | 'triple-word' | 'center';
  row: number;
  col: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  rack: Tile[];
}

export interface GameState {
  board: BoardSquare[][];
  players: Player[];
  currentPlayerIndex: number;
  tileBag: Tile[];
  gameStarted: boolean;
  gameOver: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface PlacedTile {
  tile: Tile;
  position: Position;
}

export type Direction = 'horizontal' | 'vertical';