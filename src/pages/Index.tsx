import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

type GameType = 'sapper' | 'ladder';

const Index = () => {
  const [balance, setBalance] = useState(1000);
  const [userId] = useState('#1000');
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [bet, setBet] = useState(10);

  const games = [
    { id: 'sapper' as GameType, title: 'Сапёр', icon: '🎯', description: 'Открывай клетки, избегай бомбы! Настраивай сложность от 3 до 15 бомб' },
    { id: 'ladder' as GameType, title: 'Лесенка', icon: '🪜', description: 'Собирай звёзды, избегай падающих камней! Выбери сложность от 3 до 7 камней' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <header className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🦆</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">DuckCasino</h1>
                <Icon name="CheckCircle2" className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Icon name="Shield" className="w-5 h-5" />
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-6 animate-scale-in">
          <Card className="p-4 bg-card border-2 border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon name="User" className="w-4 h-4" />
              <span className="text-sm">ID</span>
            </div>
            <div className="text-xl font-bold text-primary">{userId}</div>
          </Card>
          
          <Card className="p-4 bg-card border-2 border-primary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon name="Coins" className="w-4 h-4" />
              <span className="text-sm">Баланс</span>
            </div>
            <div className="text-xl font-bold text-primary">{balance}</div>
          </Card>
        </div>

        {!currentGame ? (
          <div className="space-y-4 animate-fade-in">
            {games.map((game, index) => (
              <Card 
                key={game.id} 
                className="p-6 bg-card border-2 border-border hover:border-primary/50 transition-all cursor-pointer hover-scale"
                onClick={() => setCurrentGame(game.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{game.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2 text-foreground">{game.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{game.description}</p>
                  </div>
                  <Icon name="ChevronRight" className="w-6 h-6 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <GameView 
            gameType={currentGame} 
            bet={bet} 
            setBet={setBet}
            balance={balance}
            setBalance={setBalance}
            onBack={() => setCurrentGame(null)}
          />
        )}
      </div>
    </div>
  );
};

const GameView = ({ 
  gameType, 
  bet, 
  setBet, 
  balance, 
  setBalance,
  onBack 
}: { 
  gameType: GameType;
  bet: number;
  setBet: (v: number) => void;
  balance: number;
  setBalance: (v: number) => void;
  onBack: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [bombCount, setBombCount] = useState(3);
  const [stoneCount, setStoneCount] = useState(3);
  const [gameKey, setGameKey] = useState(0);

  const gameConfig = {
    sapper: { title: 'Сапёр', icon: '🎯' },
    ladder: { title: 'Лесенка', icon: '🪜' },
  };

  const config = gameConfig[gameType];

  const startGame = () => {
    if (bet > balance) return;
    setBalance(balance - bet);
    setIsPlaying(true);
    setCurrentMultiplier(1);
    setGameKey(prev => prev + 1);
  };

  const cashout = () => {
    const win = Math.floor(bet * currentMultiplier);
    setBalance(balance + win);
    setIsPlaying(false);
    setCurrentMultiplier(1);
    setGameKey(prev => prev + 1);
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setCurrentMultiplier(1);
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-2 text-muted-foreground hover:text-foreground"
      >
        <Icon name="ChevronLeft" className="w-4 h-4 mr-1" />
        Назад
      </Button>

      <Card className="p-6 bg-card border-2 border-border">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">{config.icon}</span>
          <h2 className="text-3xl font-bold text-foreground">{config.title}</h2>
        </div>

        {gameType === 'sapper' && <SapperGame 
          key={gameKey}
          isPlaying={isPlaying}
          multiplier={currentMultiplier}
          setMultiplier={setCurrentMultiplier}
          onGameOver={handleGameOver}
          bombCount={bombCount}
        />}
        {gameType === 'ladder' && <LadderGame 
          key={gameKey}
          isPlaying={isPlaying}
          multiplier={currentMultiplier}
          setMultiplier={setCurrentMultiplier}
          onGameOver={handleGameOver}
          stoneCount={stoneCount}
        />}

        {!isPlaying ? (
          <div className="space-y-4 mt-6">
            <div>
              <label className="flex items-center gap-2 text-sm mb-2">
                <span>Ставка</span>
                <span className="text-primary">⭐</span>
              </label>
              <Input
                type="number"
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className="text-lg font-bold bg-background border-2 border-border"
              />
            </div>

            {gameType === 'sapper' && (
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Количество бомб 💣</span>
                  <span className="text-primary font-bold">{bombCount}</span>
                </label>
                <Input
                  type="range"
                  min="3"
                  max="15"
                  value={bombCount}
                  onChange={(e) => setBombCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Легко (×1.2)</span>
                  <span>Сложно (×3.0)</span>
                </div>
              </div>
            )}

            {gameType === 'ladder' && (
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Количество камней 🪨</span>
                  <span className="text-primary font-bold">{stoneCount}</span>
                </label>
                <Input
                  type="range"
                  min="3"
                  max="7"
                  value={stoneCount}
                  onChange={(e) => setStoneCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Легко (×1.1)</span>
                  <span>Сложно (×1.6)</span>
                </div>
              </div>
            )}

            <Button 
              onClick={startGame}
              disabled={bet > balance}
              className="w-full py-6 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Начать игру
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="text-center p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Текущий множитель</div>
              <div className="text-3xl font-bold text-primary">×{currentMultiplier.toFixed(2)}</div>
              <div className="text-sm text-foreground mt-2">Возможный выигрыш: {Math.floor(bet * currentMultiplier)} ⭐</div>
            </div>
            <Button 
              onClick={cashout}
              className="w-full py-6 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Забрать выигрыш
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const SapperGame = ({ 
  isPlaying, 
  multiplier, 
  setMultiplier,
  onGameOver,
  bombCount 
}: { 
  isPlaying: boolean;
  multiplier: number;
  setMultiplier: (v: number) => void;
  onGameOver: () => void;
  bombCount: number;
}) => {
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [bombs, setBombs] = useState<boolean[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [explodingCells, setExplodingCells] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isPlaying && bombs.length === 0) {
      const b = Array(25).fill(false);
      const positions = new Set<number>();
      while (positions.size < bombCount) {
        positions.add(Math.floor(Math.random() * 25));
      }
      positions.forEach(p => b[p] = true);
      setBombs(b);
    }
  }, [isPlaying, bombs.length, bombCount]);

  const calculateMultiplier = (openedSafe: number) => {
    const totalCells = 25;
    const safeCells = totalCells - bombCount;
    const baseMultiplier = 1 + (bombCount / 10);
    const progressMultiplier = 1 + (openedSafe / safeCells) * baseMultiplier;
    return Number(progressMultiplier.toFixed(2));
  };

  const handleClick = (index: number) => {
    if (!isPlaying || revealed[index] || gameOver) return;
    
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (bombs[index]) {
      setGameOver(true);
      setExplodingCells(new Set([index]));
      
      setTimeout(() => {
        const allRevealed = bombs.map((b, i) => b || revealed[i]);
        setRevealed(allRevealed);
        
        setTimeout(() => {
          onGameOver();
        }, 1500);
      }, 600);
    } else {
      const openedSafe = newRevealed.filter((r, i) => r && !bombs[i]).length;
      const newMultiplier = calculateMultiplier(openedSafe);
      setMultiplier(newMultiplier);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 25 }).map((_, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          disabled={!isPlaying || gameOver}
          className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all hover-scale relative overflow-hidden
            ${revealed[i] 
              ? bombs[i] 
                ? 'bg-destructive/20 border-destructive' 
                : 'bg-primary/20 border-primary'
              : 'bg-card border-border hover:border-primary/50'
            }
            ${!isPlaying || gameOver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${explodingCells.has(i) ? 'animate-explosion' : ''}
          `}
        >
          {revealed[i] && (bombs[i] ? '💣' : '🎯')}
          {explodingCells.has(i) && (
            <>
              <div className="absolute inset-0 bg-destructive/60 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">💥</div>
            </>
          )}
        </button>
      ))}
    </div>
  );
};

const LadderGame = ({ 
  isPlaying, 
  multiplier, 
  setMultiplier,
  onGameOver,
  stoneCount
}: { 
  isPlaying: boolean;
  multiplier: number;
  setMultiplier: (v: number) => void;
  onGameOver: () => void;
  stoneCount: number;
}) => {
  const [currentLevel, setCurrentLevel] = useState(10);
  const [playerPosition, setPlayerPosition] = useState(10);
  const [stones, setStones] = useState<boolean[][]>([]);
  const [revealedStones, setRevealedStones] = useState<Set<number>>(new Set());
  const [revealedStars, setRevealedStars] = useState<Set<number>>(new Set());
  const [fallingStones, setFallingStones] = useState<Set<number>>(new Set());
  const cellsPerRow = 20;
  const totalRows = 11;

  useEffect(() => {
    if (isPlaying && stones.length === 0) {
      const newStones: boolean[][] = [];
      for (let row = 0; row < totalRows; row++) {
        const rowStones = Array(cellsPerRow).fill(false);
        const positions = new Set<number>();
        while (positions.size < stoneCount) {
          positions.add(Math.floor(Math.random() * cellsPerRow));
        }
        positions.forEach(p => rowStones[p] = true);
        newStones.push(rowStones);
      }
      setStones(newStones);
    }
  }, [isPlaying, stones.length, stoneCount]);

  const calculateMultiplier = (level: number) => {
    const progress = (10 - level) / 10;
    const baseMultiplier = 1 + (stoneCount / 10);
    return Number((1 + progress * baseMultiplier).toFixed(2));
  };

  const handleClick = (position: number) => {
    if (!isPlaying || currentLevel <= 0) return;
    
    const adjacentPositions = [position - 1, position, position + 1].filter(p => p >= 0 && p < cellsPerRow);
    const canMove = adjacentPositions.includes(playerPosition);
    
    if (!canMove) return;

    const nextRow = currentLevel - 1;
    const cellId = nextRow * cellsPerRow + position;

    if (stones[nextRow]?.[position]) {
      setFallingStones(new Set([cellId]));
      setTimeout(() => {
        setRevealedStones(new Set([...revealedStones, cellId]));
        setFallingStones(new Set());
        setTimeout(() => {
          onGameOver();
        }, 500);
      }, 600);
      return;
    }

    setCurrentLevel(nextRow);
    setPlayerPosition(position);
    setRevealedStars(new Set([...revealedStars, cellId]));
    setMultiplier(calculateMultiplier(nextRow));
  };

  const getMultiplierForRow = (rowIndex: number) => {
    const progress = (10 - rowIndex) / 10;
    const baseMultiplier = 1 + (stoneCount / 10);
    return Number((1 + progress * baseMultiplier).toFixed(2));
  };

  return (
    <div className="bg-gradient-to-b from-card/80 to-background/50 p-4 rounded-lg border-2 border-border relative overflow-hidden">
      <div className="space-y-[2px]">
        {Array.from({ length: totalRows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-[2px] items-center">
            <div className="w-12 text-xs text-muted-foreground font-bold text-right mr-2">
              ×{getMultiplierForRow(rowIndex)}
            </div>
            {Array.from({ length: cellsPerRow }).map((_, colIndex) => {
              const cellId = rowIndex * cellsPerRow + colIndex;
              const isPlayerHere = rowIndex === currentLevel && colIndex === playerPosition;
              const hasStone = stones[rowIndex]?.[colIndex];
              const isStoneRevealed = revealedStones.has(cellId);
              const isStarRevealed = revealedStars.has(cellId);
              const isFalling = fallingStones.has(cellId);
              const isNextRow = rowIndex === currentLevel - 1;
              const adjacentPositions = [playerPosition - 1, playerPosition, playerPosition + 1];
              const isClickable = isNextRow && adjacentPositions.includes(colIndex);
              const isPastRow = rowIndex > currentLevel;
              const isFutureRow = rowIndex < currentLevel && !isStarRevealed && !isStoneRevealed;

              return (
                <button
                  key={colIndex}
                  onClick={() => handleClick(colIndex)}
                  disabled={!isPlaying || !isClickable}
                  className={`h-7 flex-1 rounded-sm flex items-center justify-center text-sm font-bold transition-all relative
                    ${isPlayerHere ? 'bg-primary text-primary-foreground scale-110 z-10' : ''}
                    ${isStoneRevealed ? 'bg-muted-foreground/80' : ''}
                    ${isStarRevealed ? 'bg-primary/40' : ''}
                    ${isPastRow && !isPlayerHere && !isStarRevealed && !isStoneRevealed ? 'bg-muted/20' : ''}
                    ${isFutureRow ? 'bg-card/60' : ''}
                    ${isNextRow && !isClickable && !isStarRevealed && !isStoneRevealed ? 'bg-destructive/15' : ''}
                    ${isClickable && !isPlayerHere && !isStarRevealed && !isStoneRevealed ? 'bg-primary/10 hover:bg-primary/30 cursor-pointer' : ''}
                    ${!isClickable && !isPlayerHere && !isStarRevealed && !isStoneRevealed ? 'cursor-default' : ''}
                    ${isFalling ? 'animate-stone-fall' : ''}
                  `}
                >
                  {isPlayerHere && <span className="text-base">👤</span>}
                  {isStoneRevealed && <span className="animate-pulse">🪨</span>}
                  {isStarRevealed && <span>⭐</span>}
                  {isFalling && (
                    <div className="absolute inset-0 flex items-start justify-center animate-stone-drop">
                      <span className="text-lg">🪨</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;