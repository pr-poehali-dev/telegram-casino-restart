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
    { id: 'ladder' as GameType, title: 'Лесенка', icon: '🪜', description: 'Поднимайся выше и умножай выигрыш' },
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
  };

  const cashout = () => {
    const win = Math.floor(bet * currentMultiplier);
    setBalance(balance + win);
    setIsPlaying(false);
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
          isPlaying={isPlaying}
          multiplier={currentMultiplier}
          setMultiplier={setCurrentMultiplier}
          onGameOver={() => setIsPlaying(false)}
          bombCount={bombCount}
        />}
        {gameType === 'ladder' && <LadderGame 
          isPlaying={isPlaying}
          multiplier={currentMultiplier}
          setMultiplier={setCurrentMultiplier}
          onGameOver={() => setIsPlaying(false)}
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
      const allRevealed = bombs.map((b, i) => b || revealed[i]);
      setRevealed(allRevealed);
      setTimeout(() => {
        onGameOver();
        setRevealed(Array(25).fill(false));
        setBombs([]);
        setGameOver(false);
      }, 1500);
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
          className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all hover-scale
            ${revealed[i] 
              ? bombs[i] 
                ? 'bg-destructive/20 border-destructive' 
                : 'bg-primary/20 border-primary'
              : 'bg-card border-border hover:border-primary/50'
            }
            ${!isPlaying || gameOver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {revealed[i] && (bombs[i] ? '💣' : '🎯')}
        </button>
      ))}
    </div>
  );
};

const LadderGame = ({ 
  isPlaying, 
  multiplier, 
  setMultiplier,
  onGameOver 
}: { 
  isPlaying: boolean;
  multiplier: number;
  setMultiplier: (v: number) => void;
  onGameOver: () => void;
}) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [revealed, setRevealed] = useState<(number | null)[]>(Array(10).fill(null));

  const handleClick = (level: number, position: number) => {
    if (!isPlaying || level !== currentLevel) return;
    
    const isMine = Math.random() < 0.3;
    const newRevealed = [...revealed];
    newRevealed[level] = position;
    setRevealed(newRevealed);

    if (isMine) {
      onGameOver();
    } else {
      setMultiplier(multiplier + 0.4);
      setCurrentLevel(level + 1);
    }
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, level) => (
        <div key={level} className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, pos) => (
            <button
              key={pos}
              onClick={() => handleClick(level, pos)}
              disabled={!isPlaying || level !== currentLevel}
              className={`py-4 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all hover-scale
                ${revealed[level] === pos
                  ? 'bg-primary/20 border-primary'
                  : level < currentLevel
                    ? 'bg-card/50 border-border/50 opacity-50'
                    : level === currentLevel
                      ? 'bg-card border-border hover:border-primary/50 cursor-pointer'
                      : 'bg-card/30 border-border/30 opacity-30 cursor-not-allowed'
                }
              `}
            >
              {revealed[level] === pos && '⭐'}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Index;