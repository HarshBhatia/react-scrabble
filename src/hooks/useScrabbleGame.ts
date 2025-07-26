import { useState, useCallback, useEffect } from 'react';
import { GameState, BoardSquare, Tile, Player, PlacedTile } from '../types/game';
import { BOARD_SIZE, LETTER_DISTRIBUTION, PREMIUM_SQUARES, RACK_SIZE } from '../constants/scrabble';
import { validateMove } from '../utils/gameValidation';

const createInitialBoard = (): BoardSquare[][] => {
  const board: BoardSquare[][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let multiplier: BoardSquare['multiplier'] = 'normal';
      
      if (row === 7 && col === 7) {
        multiplier = 'center';
      } else if (PREMIUM_SQUARES['triple-word'].some(([r, c]) => r === row && c === col)) {
        multiplier = 'triple-word';
      } else if (PREMIUM_SQUARES['double-word'].some(([r, c]) => r === row && c === col)) {
        multiplier = 'double-word';
      } else if (PREMIUM_SQUARES['triple-letter'].some(([r, c]) => r === row && c === col)) {
        multiplier = 'triple-letter';
      } else if (PREMIUM_SQUARES['double-letter'].some(([r, c]) => r === row && c === col)) {
        multiplier = 'double-letter';
      }
      
      board[row][col] = {
        tile: null,
        multiplier,
        row,
        col
      };
    }
  }
  
  return board;
};

const createTileBag = (): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;
  
  (Object.entries(LETTER_DISTRIBUTION) as Array<[string, { count: number; value: number }]>).forEach(([letter, { count, value }]) => {
    for (let i = 0; i < count; i++) {
      tiles.push({
        id: `tile-${id++}`,
        letter,
        value
      });
    }
  });
  
  // Shuffle the tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  return tiles;
};

const drawTiles = (tileBag: Tile[], count: number): { drawnTiles: Tile[], remainingBag: Tile[] } => {
  const drawnTiles = tileBag.slice(0, count);
  const remainingBag = tileBag.slice(count);
  return { drawnTiles, remainingBag };
};

export const useScrabbleGame = () => {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      const savedGameState = localStorage.getItem('scrabbleGameState');
      return savedGameState ? JSON.parse(savedGameState) : null;
    } catch (error) {
      console.error("Error loading game state from localStorage:", error);
      return null;
    }
  });
  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const savedGameStarted = localStorage.getItem('scrabbleGameStarted');
      return savedGameStarted ? JSON.parse(savedGameStarted) : false;
    } catch (error) {
      console.error("Error loading gameStarted from localStorage:", error);
      return false;
    }
  });

  const startGame = useCallback((playerNames: string[]) => {
    const tileBag = createTileBag();
    const { drawnTiles: player1Tiles, remainingBag: bagAfterPlayer1 } = drawTiles(tileBag, RACK_SIZE);
    const { drawnTiles: player2Tiles, remainingBag: finalBag } = drawTiles(bagAfterPlayer1, RACK_SIZE);
    
    setGameState({
      board: createInitialBoard(),
      players: [
        {
          id: 'player1',
          name: playerNames[0],
          score: 0,
          rack: player1Tiles
        },
        {
          id: 'player2',
          name: playerNames[1],
          score: 0,
          rack: player2Tiles
        }
      ],
      currentPlayerIndex: 0,
      tileBag: finalBag,
      gameStarted: true,
      gameOver: false
    });
    setGameStarted(true);
  }, []);

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ playerName: string; words: string; points: number } | null>(null);
  const [realtimeValidation, setRealtimeValidation] = useState<ValidationResult | null>(null);

  const placeTile = useCallback((row: number, col: number, tile?: Tile) => {
    if (!gameState) return; // Add null check
    const tileToPlace = tile || selectedTile;
    if (!tileToPlace || gameState.board[row][col].tile) return;

    setGameState(prev => {
      const newBoard = prev.board.map(boardRow => 
        boardRow.map(square => ({ ...square }))
      );
      
      newBoard[row][col] = {
        ...newBoard[row][col],
        tile: tileToPlace
      };

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const newRack = currentPlayer.rack.filter(rackTile => rackTile.id !== tileToPlace.id);

      const newPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayerIndex 
          ? { ...player, rack: newRack }
          : player
      );

      return {
        ...prev,
        board: newBoard,
        players: newPlayers
      };
    });

    setPlacedTiles(prev => [...prev, { tile: tileToPlace, position: { row, col } }]);
    if (!tile) {
      setSelectedTile(null); // Only clear selection if placed via click, not drag
    }
  }, [selectedTile, gameState]);

  const handleTileReturn = useCallback((tileData: any) => {
    if (!tileData.fromBoard || !tileData.boardPosition) return;

    const { row, col } = tileData.boardPosition;
    const tile = { ...tileData };
    delete tile.fromBoard;
    delete tile.boardPosition;

    // Check if this tile was placed in the current turn
    const wasPlacedThisTurn = placedTiles.some(
      placedTile => placedTile.position.row === row && placedTile.position.col === col
    );

    if (!wasPlacedThisTurn) return; // Can't remove tiles from previous turns

    setGameState(prev => {
      const newBoard = prev.board.map(boardRow => 
        boardRow.map(square => ({ ...square }))
      );
      
      // Remove tile from board
      newBoard[row][col] = {
        ...newBoard[row][col],
        tile: null
      };

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const newRack = [...currentPlayer.rack, tile];

      const newPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayerIndex 
          ? { ...player, rack: newRack }
          : player
      );

      return {
        ...prev,
        board: newBoard,
        players: newPlayers
      };
    });

    // Remove from placed tiles tracking
    setPlacedTiles(prev => prev.filter(
      placedTile => !(placedTile.position.row === row && placedTile.position.col === col)
    ));
    
    setSelectedTile(null);
  }, [placedTiles]);

  const handleTileDrop = useCallback((droppedItem: any, toRow: number, toCol: number) => {
    if (!gameState) return; // Add null check
    const tile = { ...droppedItem };
    const { fromBoard, boardPosition } = droppedItem;

    // If the target square is already occupied by a tile placed this turn,
    // do nothing to prevent overwriting.
    if (placedTiles.some(p => p.position.row === toRow && p.position.col === toCol)) {
      return;
    }

    // If the tile was dragged from another board square
    if (fromBoard && boardPosition) {
      // First, execute the logic to return the tile from its original position.
      // This function handles removing it from the board and from placedTiles array.
      handleTileReturn(tile);
    }

    // Next, place the tile in the new destination square.
    // This function handles placing it on the board and adding it to placedTiles.
    placeTile(toRow, toCol, tile);

    setSelectedTile(null); // Clear any selection after the drop
  }, [placeTile, handleTileReturn, placedTiles]);

  const canRemoveTile = useCallback((row: number, col: number) => {
    return placedTiles.some(
      placedTile => placedTile.position.row === row && placedTile.position.col === col
    );
  }, [placedTiles]);

  const selectTileFromRack = useCallback((tile: Tile) => {
    setSelectedTile(selectedTile?.id === tile.id ? null : tile);
  }, [selectedTile]);

  const submitWord = useCallback(() => {
    if (placedTiles.length === 0) return;
    if (isValidating) return;
    if (!gameState) return; // Add null check for gameState

    setIsValidating(true);
    setValidationError(null);

    try {
      // The current gameState.board already includes the visually placed tiles.
      const currentBoard = gameState.board;

      // The "original" board is the state before any tiles were placed in this turn.
      // We can reconstruct it by removing the currently placed tiles from the current board.
      const originalBoard = currentBoard.map(row => row.map(square => ({ ...square })));
      placedTiles.forEach(({ position }) => {
        originalBoard[position.row][position.col].tile = null;
      });

      // Validate the move using the current board state, the list of new tiles,
      // and the reconstructed original board.
      const validation = validateMove(currentBoard, placedTiles, originalBoard);

      if (!validation.isValid) {
        setValidationError(validation.errors.join(', '));
        setIsValidating(false);
        return;
      }

      console.log("Validation result before setting modal data:", validation);

      // Valid move - update game state
      setGameState(prev => {
        if (!prev) return prev; // Ensure prev is not null
        const newBoard = prev.board.map(row => 
          row.map(square => ({ ...square }))
        );
        
        // Place tiles on board permanently
        placedTiles.forEach(({ tile, position }) => {
          newBoard[position.row][position.col] = {
            ...newBoard[position.row][position.col],
            tile
          };
        });

        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const tilesNeeded = Math.min(placedTiles.length, prev.tileBag.length);
        const { drawnTiles, remainingBag } = drawTiles(prev.tileBag, tilesNeeded);
        
        const newRack = [...currentPlayer.rack, ...drawnTiles];
        const newPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { ...player, rack: newRack, score: player.score + validation.totalScore }
            : player
        );

        // Set modal data and show modal
        setSuccessModalData({
          playerName: currentPlayer.name,
          words: validation.words.map(w => w.word).join(', '), // Join all valid words
          points: validation.totalScore
        });
        setShowSuccessModal(true);

        return {
          ...prev,
          board: newBoard,
          players: newPlayers,
          tileBag: remainingBag,
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
        };
      });

      setPlacedTiles([]);
      setSelectedTile(null);
      
    } catch (error) {
      setValidationError('Error validating word. Please try again.');
      console.error('Word validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [placedTiles, gameState, isValidating]);

  const passTurn = useCallback(() => {
    if (!gameState) return; // Add null check for gameState
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
    }));
    setSelectedTile(null);
    setValidationError(null);
  }, []);

  const shuffleRack = useCallback(() => {
    if (!gameState) return; // Add null check for gameState
    setIsShuffling(true);

    // Brief delay to show animation before actual shuffle
    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev; // Add null check for prev
        if (!prev.players) { // Explicitly check if players array is null/undefined
          console.error("prev.players is null/undefined in shuffleRack setGameState callback.", prev);
          return prev; // Return prev to avoid further errors
        }
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const shuffledRack = [...currentPlayer.rack];
        
        for (let i = shuffledRack.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledRack[i], shuffledRack[j]] = [shuffledRack[j], shuffledRack[i]];
        }

        const newPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { ...player, rack: shuffledRack }
            : player
        );

        return {
          ...prev,
          players: newPlayers
        };
      });

      // Reset shuffle animation state
      setTimeout(() => {
        setIsShuffling(false);
      }, 100);
    }, 200);
  }, [gameState]);

  const recallAllTiles = useCallback(() => {
    if (placedTiles.length === 0) return;

    setGameState(prev => {
      const newBoard = prev.board.map(boardRow => 
        boardRow.map(square => ({ ...square }))
      );
      
      // Remove all placed tiles from board
      placedTiles.forEach(({ position }) => {
        newBoard[position.row][position.col] = {
          ...newBoard[position.row][col],
          tile: null
        };
      });

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const tilesToReturn = placedTiles.map(({ tile }) => tile);
      const newRack = [...currentPlayer.rack, ...tilesToReturn];

      const newPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayerIndex 
          ? { ...player, rack: newRack }
          : player
      );

      return {
        ...prev,
        board: newBoard,
        players: newPlayers
      };
    });

    setPlacedTiles([]);
    setSelectedTile(null);
    setValidationError(null);
  }, [placedTiles]);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    setSuccessModalData(null);
  }, []);

  // Real-time validation effect
  useEffect(() => {
    if (!gameState) return; // Add this null check
    if (placedTiles.length > 0) {
      try {
        // Reconstruct the original board state for validation
        const originalBoard = gameState.board.map(row => row.map(square => ({ ...square })));
        placedTiles.forEach(({ position }) => {
          originalBoard[position.row][position.col].tile = null;
        });

        const validation = validateMove(gameState.board, placedTiles, originalBoard);
        setRealtimeValidation(validation);
        setValidationError(validation.isValid ? null : validation.errors.join(', '));
      } catch (error) {
        console.error("Real-time validation error:", error);
        setRealtimeValidation(null);
        setValidationError("Error during real-time validation.");
      }
    } else {
      setRealtimeValidation(null);
      setValidationError(null);
    }
  }, [placedTiles, gameState]);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    try {
      if (gameState) {
        localStorage.setItem('scrabbleGameState', JSON.stringify(gameState));
      } else {
        localStorage.removeItem('scrabbleGameState');
      }
    } catch (error) {
      console.error("Error saving game state to localStorage:", error);
    }
  }, [gameState]);

  // Save gameStarted to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scrabbleGameStarted', JSON.stringify(gameStarted));
    } catch (error) {
      console.error("Error saving gameStarted to localStorage:", error);
    }
  }, [gameStarted]);

  const newGame = useCallback(() => {
    localStorage.removeItem('scrabbleGameState');
    localStorage.removeItem('scrabbleGameStarted');
    setGameState(null);
    setGameStarted(false);
    setSelectedTile(null);
    setPlacedTiles([]);
    setIsShuffling(false);
    setValidationError(null);
    setIsValidating(false);
    setShowSuccessModal(false);
    setSuccessModalData(null);
    setRealtimeValidation(null);
  }, []);

  return {
    gameState,
    selectedTile,
    placedTiles,
    isShuffling,
    validationError,
    isValidating,
    showSuccessModal,
    successModalData,
    realtimeValidation,
    placeTile,
    handleTileDrop,
    handleTileReturn,
    canRemoveTile,
    selectTileFromRack,
    submitWord,
    passTurn,
    shuffleRack,
    recallAllTiles,
    handleCloseSuccessModal,
    startGame,
    gameStarted,
    newGame
  };
};