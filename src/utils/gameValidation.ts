import { BoardSquare, PlacedTile } from '../types/game';
import { 
  ValidationResult, 
  WordInfo, 
  getAllWordsFormed, 
  isValidWord, 
  areNewTilesConnected, 
  isFirstMoveCenterRequired, 
  doesWordCrossCenter, 
  calculateWordScore 
} from './wordValidation';

export const validateMove = (
  board: BoardSquare[][],
  placedTiles: PlacedTile[],
  originalBoard?: BoardSquare[][]
): ValidationResult => {
  const errors: string[] = [];
  let totalScore = 0;
  // Use the true original board for connection and first-move checks
  const boardForChecks = originalBoard || board;

  // No tiles placed
  if (placedTiles.length === 0) {
    return {
      isValid: false,
      errors: ['No tiles were placed'],
      words: [],
      totalScore: 0
    };
  }

  // Check if new tiles are properly connected using the board with new tiles
  if (!areNewTilesConnected(board, placedTiles, originalBoard)) {
    errors.push('Tiles must be placed in a straight line and form a connected word');
  }

  // Check first move requirements using the original board state
  if (isFirstMoveCenterRequired(boardForChecks)) {
    const crossesCenter = placedTiles.some(
      ({ position }) => position.row === 7 && position.col === 7
    );
    
    if (!crossesCenter) {
      errors.push('First word must cross the center star');
    }
  } else {
    // Not first move - check if new tiles connect to existing tiles on the original board
    const connectsToExisting = placedTiles.some(({ position }) => {
      const adjacentPositions = [
        { row: position.row - 1, col: position.col },
        { row: position.row + 1, col: position.col },
        { row: position.row, col: position.col - 1 },
        { row: position.row, col: position.col + 1 }
      ];
      
      return adjacentPositions.some(pos => {
        if (pos.row < 0 || pos.row >= 15 || pos.col < 0 || pos.col >= 15) return false;
        // Check for a tile on the original board that isn't one of the new tiles
        return boardForChecks[pos.row][pos.col].tile;
      });
    });

    if (!connectsToExisting) {
      errors.push('New tiles must connect to existing words on the board');
    }
  }
  
  // Get all words formed by this move
  const allFormedWords = getAllWordsFormed(board, placedTiles);
  
  if (allFormedWords.length === 0) {
    errors.push('No words were formed by this move.');
    return {
      isValid: false,
      errors,
      words: [],
      totalScore: 0
    };
  }
  
  // Filter for words that contain at least one newly placed tile
  const wordsWithNewTiles = allFormedWords.filter(word => 
    word.tiles.some(tile => placedTiles.some(pt => pt.position.row === tile.position.row && pt.position.col === tile.position.col))
  );

  if (wordsWithNewTiles.length === 0) {
    errors.push('New tiles must form at least one word.');
    return {
      isValid: false,
      errors,
      words: [],
      totalScore: 0
    };
  }

  // Validate each word in the dictionary and calculate scores
  const validatedWords: WordInfo[] = [];
  
  for (const word of wordsWithNewTiles) { // Iterate over words that contain new tiles
    const isWordValid = isValidWord(word.word);
    
    if (!isWordValid) {
      errors.push(`"${word.word}" is not a valid word`);
    } else {
      const score = calculateWordScore(word, board);
      validatedWords.push({
        ...word,
        score
      });
      totalScore += score;
    }
  }
  
  // Bonus points for using all 7 tiles (bingo)
  if (placedTiles.length === 7) {
    totalScore += 50;
  }
  
  const isValid = errors.length === 0 && validatedWords.length > 0;
  
  return {
    isValid,
    errors,
    words: validatedWords,
    totalScore
  };
};