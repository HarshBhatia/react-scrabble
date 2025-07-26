import React from 'react';
import GameBoard from './components/GameBoard';
import PlayerRack from './components/PlayerRack';
import PlayerInfo from './components/PlayerInfo';
import GameControls from './components/GameControls';
import ValidationMessage from './components/ValidationMessage';
import WordSuccessModal from './components/WordSuccessModal';
import PlayerNameInput from './components/PlayerNameInput';
import { useScrabbleGame } from './hooks/useScrabbleGame';
import './App.css';

function App() {
    const {
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
    } = useScrabbleGame();

    if (!gameStarted || !gameState) {
        return (
            <div className="App">
                <PlayerNameInput onStartGame={startGame} />
            </div>
        );
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    return (
        <div className="App">
            <header className="App-header">
                <h1>Scrabble React</h1>
            </header>
            <main>
                <PlayerInfo
                    players={gameState.players}
                    currentPlayerIndex={gameState.currentPlayerIndex}
                    tilesRemaining={gameState.tileBag.length}
                />

                <GameBoard
                    board={gameState.board}
                    onSquareClick={placeTile}
                    onTileDrop={handleTileDrop}
                    onTileRemove={() => {}} // Not used since we handle via drag
                    canRemoveTile={canRemoveTile}
                    realtimeValidation={realtimeValidation}
                />

                <PlayerRack
                    tiles={currentPlayer.rack}
                    selectedTile={selectedTile}
                    onTileClick={selectTileFromRack}
                    onTileReturn={handleTileReturn}
                    isShuffling={isShuffling}
                />
                
                <ValidationMessage 
                    error={validationError}
                    isValidating={isValidating}
                />
                
                <GameControls
                    onSubmitWord={submitWord}
                    onPassTurn={passTurn}
                    onShuffleRack={shuffleRack}
                    onRecallTiles={recallAllTiles}
                    onNewGame={newGame}
                    canSubmit={placedTiles.length > 0 && !isValidating}
                    canRecall={placedTiles.length > 0}
                />
            </main>
            <footer>
                <p>&copy; 2024 Scrabble React</p>
            </footer>

            {successModalData && (
                <WordSuccessModal
                    show={showSuccessModal}
                    playerName={successModalData.playerName}
                    words={successModalData.words}
                    points={successModalData.points}
                    onClose={handleCloseSuccessModal}
                />
            )}
        </div>
    );
}

export default App;