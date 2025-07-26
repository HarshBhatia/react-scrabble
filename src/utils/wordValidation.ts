import { BoardSquare, PlacedTile, Position, Direction } from '../types/game';import { BOARD_SIZE } from '../constants/scrabble';import dictionary from '../constants/dictionary.txt?raw';const WORD_LIST = new Set(dictionary.split('\n').map(word => word.trim().toUpperCase()));export interface WordInfo {  word: string;  startPosition: Position;  direction: Direction;  tiles: { position: Position; letter: string; isNew: boolean }[];  score: number;}export interface ValidationResult {  isValid: boolean;  errors: string[];  words: WordInfo[];  totalScore: number;}export const isValidWord = (word: string): boolean => {  const upperWord = word.toUpperCase();  return WORD_LIST.has(upperWord);};

export const getAdjacentPositions = (row: number, col: number): Position[] => {
  const positions: Position[] = [];
  
  // Up, Down, Left, Right
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
      positions.push({ row: newRow, col: newCol });
    }
  }
  
  return positions;
};

export const findWord = (
  board: BoardSquare[][],
  startRow: number,
  startCol: number,
  direction: Direction,
  newTiles: Set<string>
): WordInfo | null => {
  const tiles: { position: Position; letter: string; isNew: boolean }[] = [];
  let currentRow = startRow;
  let currentCol = startCol;
  
  // Move to the beginning of the word
  while (true) {
    const prevRow = direction === 'horizontal' ? currentRow : currentRow - 1;
    const prevCol = direction === 'horizontal' ? currentCol - 1 : currentCol;
    
    if (prevRow < 0 || prevCol < 0 || prevRow >= BOARD_SIZE || prevCol >= BOARD_SIZE) break;
    if (!board[prevRow][prevCol].tile) break;
    
    currentRow = prevRow;
    currentCol = prevCol;
  }
  
  const startPosition = { row: currentRow, col: currentCol };
  
  // Collect all tiles in the word
  while (currentRow < BOARD_SIZE && currentCol < BOARD_SIZE && board[currentRow][currentCol].tile) {
    const tile = board[currentRow][currentCol].tile!;
    const posKey = `${currentRow}-${currentCol}`;
    const isNew = newTiles.has(posKey);
    
    tiles.push({
      position: { row: currentRow, col: currentCol },
      letter: tile.letter,
      isNew
    });
    
    if (direction === 'horizontal') {
      currentCol++;
    } else {
      currentRow++;
    }
  }
  
  if (tiles.length < 2) return null; // Single letters don't count as words
  
  const word = tiles.map(t => t.letter).join('');
  
  return {
    word,
    startPosition,
    direction,
    tiles,
    score: 0 // Will be calculated separately
  };
};

export const getAllWordsFormed = (
  board: BoardSquare[][],
  placedTiles: PlacedTile[]
): WordInfo[] => {
  const words: WordInfo[] = [];
  const newTilePositions = new Set(
    placedTiles.map(({ position }) => `${position.row}-${position.col}`)
  );
  const processedWords = new Set<string>();
  
  // Check each newly placed tile for words formed
  for (const { position } of placedTiles) {
    const { row, col } = position;
    
    // Check horizontal word
    const horizontalWord = findWord(board, row, col, 'horizontal', newTilePositions);
    if (horizontalWord) {
      const wordKey = `${horizontalWord.startPosition.row}-${horizontalWord.startPosition.col}-horizontal`;
      if (!processedWords.has(wordKey)) {
        words.push(horizontalWord);
        processedWords.add(wordKey);
      }
    }
    
    // Check vertical word
    const verticalWord = findWord(board, row, col, 'vertical', newTilePositions);
    if (verticalWord) {
      const wordKey = `${verticalWord.startPosition.row}-${verticalWord.startPosition.col}-vertical`;
      if (!processedWords.has(wordKey)) {
        words.push(verticalWord);
        processedWords.add(wordKey);
      }
    }
  }
  
  return words.filter(word => word.tiles.some(tile => tile.isNew)); // Only words with new tiles
};

export const isFirstMoveCenterRequired = (board: BoardSquare[][]): boolean => {
  // Check if the center square (7,7) is empty - if so, this is the first move
  return !board[7][7].tile;
};

export const doesWordCrossCenter = (word: WordInfo): boolean => {
  return word.tiles.some(tile => tile.position.row === 7 && tile.position.col === 7);
};

export const areNewTilesConnected = (
  board: BoardSquare[][],
  placedTiles: PlacedTile[],
  originalBoard?: BoardSquare[][]
): boolean => {
  if (placedTiles.length === 0) return true;
  
  // Use original board for connection checking if provided, otherwise use the board with new tiles
  const boardForConnection = originalBoard || board;
  
  if (placedTiles.length === 1) {
    // Single tile must be adjacent to existing tile (unless it's the first move)
    const { position } = placedTiles[0];
    if (isFirstMoveCenterRequired(boardForConnection)) {
      return position.row === 7 && position.col === 7; // First move must be on center
    }
    
    const adjacentPositions = getAdjacentPositions(position.row, position.col);
    return adjacentPositions.some(pos => {
      const tile = boardForConnection[pos.row][pos.col].tile;
      // Make sure we're not counting the newly placed tile itself
      return tile && !placedTiles.some(p => p.position.row === pos.row && p.position.col === pos.col);
    });
  }
  
  // Multiple tiles must form a straight line (horizontal or vertical)
  const positions = placedTiles.map(t => t.position);
  const allSameRow = positions.every(p => p.row === positions[0].row);
  const allSameCol = positions.every(p => p.col === positions[0].col);
  
  if (!allSameRow && !allSameCol) return false;
  
  // Check if tiles are contiguous (allowing for existing tiles in between)
  if (allSameRow) {
    const cols = positions.map(p => p.col).sort((a, b) => a - b);
    const row = positions[0].row;
    
    for (let col = cols[0]; col <= cols[cols.length - 1]; col++) {
      if (!board[row][col].tile) return false; // Gap in the word
    }
  } else {
    const rows = positions.map(p => p.row).sort((a, b) => a - b);
    const col = positions[0].col;
    
    for (let row = rows[0]; row <= rows[rows.length - 1]; row++) {
      if (!board[row][col].tile) return false; // Gap in the word
    }
  }
  
  return true;
};

export const calculateWordScore = (
  word: WordInfo,
  board: BoardSquare[][]
): number => {
  let score = 0;
  let wordMultiplier = 1;
  
  for (const tile of word.tiles) {
    const { position, letter, isNew } = tile;
    const square = board[position.row][position.col];
    const tileValue = square.tile?.value || 0;
    
    let letterScore = tileValue;
    
    // Apply premium squares only for newly placed tiles
    if (isNew) {
      switch (square.multiplier) {
        case 'double-letter':
          letterScore *= 2;
          break;
        case 'triple-letter':
          letterScore *= 3;
          break;
        case 'double-word':
        case 'center':
          wordMultiplier *= 2;
          break;
        case 'triple-word':
          wordMultiplier *= 3;
          break;
      }
    }
    
    score += letterScore;
  }
  
  return score * wordMultiplier;
};