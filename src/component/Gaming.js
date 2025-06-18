import React, { useState, useEffect, useCallback } from 'react';
import { Bomb, Gem, DollarSign, RotateCcw, Play } from 'lucide-react';
import "./styling.css";

const GRID_SIZE = 25;
const DEFAULT_MINES = 5;

const MinesGame = () => {
  const [gameState, setGameState] = useState('idle');       
  const [grid, setGrid] = useState([]);
  const [minePositions, setMinePositions] = useState(new Set());
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [mineCount, setMineCount] = useState(DEFAULT_MINES);
  const [betAmount, setBetAmount] = useState(1.00);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gemsFound, setGemsFound] = useState(0);

  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill().map((_, index) => ({
      id: index,
      isRevealed: false,
      isMine: false,
      isGem: false
    }));
    setGrid(newGrid);
    setRevealedCells(new Set());
    setMinePositions(new Set());
    setGemsFound(0);
    setCurrentMultiplier(1.0);
    setTotalWinnings(0);
  }, []);

  const placeMines = useCallback(() => {
    const positions = new Set();
    while (positions.size < mineCount) {
      const randomPos = Math.floor(Math.random() * GRID_SIZE);
      positions.add(randomPos);
    }
    setMinePositions(positions);
    
    setGrid(prevGrid => 
      prevGrid.map((cell, index) => ({
        ...cell,
        isMine: positions.has(index),
        isGem: !positions.has(index)
      }))
    );
  }, [mineCount]);

  const startGame = () => {
    setGameState('playing');
    initializeGrid();
    placeMines();
  };

  const calculateMultiplier = (gems, totalMines) => {
    if (gems === 0) return 1.0;
    const safeSpots = GRID_SIZE - totalMines;
    const remaining = safeSpots - gems;
    return Number((1 + (gems * 0.25) + (gems / Math.max(remaining, 1)) * 0.1).toFixed(2));
  };

  const handleCellClick = (cellId) => {
    if (gameState !== 'playing' || revealedCells.has(cellId)) return;

    const newRevealedCells = new Set([...revealedCells, cellId]);
    setRevealedCells(newRevealedCells);

    if (minePositions.has(cellId)) {
      setGameState('lost');
      setTotalWinnings(0);
      // Reveal all mines
      setRevealedCells(new Set([...Array(GRID_SIZE).keys()]));
    } else {
      // Found a gem
      const newGemsFound = gemsFound + 1;
      setGemsFound(newGemsFound);
      
      const newMultiplier = calculateMultiplier(newGemsFound, mineCount);
      setCurrentMultiplier(newMultiplier);
      setTotalWinnings(betAmount * newMultiplier);

      // Check if won (all safe spots revealed)
      if (newRevealedCells.size === GRID_SIZE - mineCount) {
        setGameState('won');
      }
    }
  };

  // Cash out current winnings
  const cashOut = () => {
    if (gameState === 'playing' && gemsFound > 0) {
      setGameState('won');
      // In a real game, this would transfer winnings to user's balance
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('idle');
    initializeGrid();
  };

  // Initialize on component mount
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const getCellContent = (cell, index) => {
    if (!revealedCells.has(index)) {
      return null; // Hidden cell
    }
    
    if (cell.isMine) {
      return <Bomb className="cell-icon bomb" />;
    } else {
      return <Gem className="cell-icon gem" />;
    }
  };

  const getCellClasses = (cell, index) => {
    const isRevealed = revealedCells.has(index);
    const isMine = cell.isMine && isRevealed;
    const isGem = !cell.isMine && isRevealed;
    
    let classes = "grid-cell ";
    
    if (!isRevealed) {
      classes += "hidden ";
    } else if (isMine) {
      classes += "mine ";
    } else if (isGem) {
      classes += "gem ";
    }
    
    return classes.trim();
  };

  return (
    <div className="mines-game">
      <div className="mines-game-container">
        {/* Header */}
        <div className="header">
          <h1 className="title">
            MINES
          </h1>
          <p className="subtitle">Find the gems, avoid the mines!</p>
        </div>

        <div className="main-grid">
          {/* Game Controls */}
          <div className="controls-section">
            {/* Bet Settings */}
            <div className="card">
              <h3 className="card-title">Game Settings</h3>
              
              <div className="form-group">
                <div className="form-field">
                  <label className="label">Bet Amount</label>
                  <div className="input-with-icon">
                    <DollarSign className="input-icon" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                      className="input"
                      min="0.01"
                      step="0.01"
                      disabled={gameState === 'playing'}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="label">Number of Mines</label>
                  <select
                    value={mineCount}
                    onChange={(e) => setMineCount(parseInt(e.target.value))}
                    className="select"
                    disabled={gameState === 'playing'}
                  >
                    {[1, 3, 5, 7, 10, 15].map(num => (
                      <option key={num} value={num}>{num} mines</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="card">
              <h3 className="card-title">Game Stats</h3>
              
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label">Gems Found:</span>
                  <span className="stat-value green">{gemsFound}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Multiplier:</span>
                  <span className="stat-value yellow">{currentMultiplier}x</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Potential Win:</span>
                  <span className="stat-value green">${totalWinnings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {gameState === 'idle' && (
                <button
                  onClick={startGame}
                  className="button button-green"
                >
                  <Play className="button-icon" />
                  <span>Start Game</span>
                </button>
              )}

              {gameState === 'playing' && gemsFound > 0 && (
                <button
                  onClick={cashOut}
                  className="button button-yellow"
                >
                  Cash Out ${totalWinnings.toFixed(2)}
                </button>
              )}

              {(gameState === 'won' || gameState === 'lost') && (
                <button
                  onClick={resetGame}
                  className="button button-blue"
                >
                  <RotateCcw className="button-icon" />
                  <span>New Game</span>
                </button>
              )}
            </div>

            {/* Game Status Messages */}
            {gameState === 'won' && (
              <div className="status-message success">
                <h4 className="status-title success">🎉 You Won!</h4>
                <p className="status-text success">You successfully found {gemsFound} gems!</p>
                <p className="status-text success-light">Winnings: ${totalWinnings.toFixed(2)}</p>
              </div>
            )}

            {gameState === 'lost' && (
              <div className="status-message error">
                <h4 className="status-title error">💥 Game Over!</h4>
                <p className="status-text error">You hit a mine!</p>
                <p className="status-text error-light">Better luck next time!</p>
              </div>
            )}
          </div>

          {/* Game Grid */}
          <div className="game-section">
            <div className="card">
              <div className="game-grid-container">
                {grid.map((cell, index) => (
                  <button
                    key={cell.id}
                    onClick={() => handleCellClick(index)}
                    className={getCellClasses(cell, index)}
                    disabled={gameState !== 'playing' || revealedCells.has(index)}
                  >
                    {getCellContent(cell, index)}
                  </button>
                ))}
              </div>
              
              {gameState === 'idle' && (
                <div className="game-instructions">
                  <p>Set your bet and click "Start Game" to begin!</p>
                </div>
              )}
              
              {gameState === 'playing' && (
                <div className="game-instructions">
                  <p>Click on cells to reveal gems. Avoid the mines!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;