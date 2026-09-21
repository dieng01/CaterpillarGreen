import { useRef, useCallback, useEffect, useState } from 'react';
import { useSnakeGame, Direction, Difficulty, ObstacleType, PipeSegment, DeathReason } from './hooks/useSnakeGame';

// SVG Snake Head Sprite (now a caterpillar head)
function SnakeHeadSprite({ direction }: { direction: Direction }) {
  const rotation = { RIGHT: 0, DOWN: 90, LEFT: 180, UP: 270 }[direction];

  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)` }}>
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="#22c55e" />
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="url(#snakeGradient)" />
      <ellipse cx="26" cy="38" rx="4" ry="3" fill="#16a34a" opacity="0.5" />
      <ellipse cx="38" cy="38" rx="4" ry="3" fill="#16a34a" opacity="0.5" />
      <ellipse cx="32" cy="44" rx="4" ry="3" fill="#16a34a" opacity="0.5" />
      <ellipse cx="22" cy="26" rx="7" ry="8" fill="white" />
      <ellipse cx="42" cy="26" rx="7" ry="8" fill="white" />
      <ellipse cx="24" cy="26" rx="4" ry="5" fill="#1e293b" />
      <ellipse cx="44" cy="26" rx="4" ry="5" fill="#1e293b" />
      <circle cx="25" cy="24" r="2" fill="white" />
      <circle cx="45" cy="24" r="2" fill="white" />
      <path d="M 32 48 L 32 56 L 29 60 M 32 56 L 35 60" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="32" r="1.5" fill="#166534" />
      <circle cx="36" cy="32" r="1.5" fill="#166534" />
      <defs>
        <radialGradient id="snakeGradient" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.3" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Triangle Snake Tail Sprite
function SnakeTailSprite({ direction }: { direction: Direction }) {
  const rotation = { RIGHT: 0, DOWN: 90, LEFT: 180, UP: 270 }[direction];

  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)` }}>
      <polygon
        points="8,16 56,32 8,48"
        fill="#22c55e"
        stroke="#16a34a"
        strokeWidth="2"
      />
      <polygon
        points="12,20 48,32 12,44"
        fill="#4ade80"
        opacity="0.4"
      />
    </svg>
  );
}

// Rock Icon (SVG)
function RockIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path
        d="M 12 48 L 8 36 L 14 24 L 24 18 L 36 14 L 48 18 L 54 28 L 56 40 L 50 50 L 38 54 L 22 52 Z"
        fill="#6b7280"
        stroke="#4b5563"
        strokeWidth="2"
      />
      <path
        d="M 18 28 L 24 22 L 34 18 L 42 20 L 38 26 L 26 28 Z"
        fill="#9ca3af"
        opacity="0.6"
      />
      <path
        d="M 20 48 L 38 50 L 48 46 L 50 50 L 38 54 L 22 52 Z"
        fill="#374151"
        opacity="0.5"
      />
      <path d="M 30 28 L 32 38 L 28 44" stroke="#4b5563" strokeWidth="1.5" fill="none" />
      <path d="M 40 24 L 42 32" stroke="#4b5563" strokeWidth="1" fill="none" />
    </svg>
  );
}

// Pipe Icon (SVG) - Horizontal
function PipeIconH({ isOpenLeft, isOpenRight }: { isOpenLeft: boolean; isOpenRight: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect x="2" y="14" width="60" height="36" rx="6" fill="#16a34a" />
      <rect x="2" y="14" width="60" height="14" rx="6" fill="#22c55e" opacity="0.6" />
      <circle cx="16" cy="32" r="3" fill="#15803d" />
      <circle cx="32" cy="32" r="3" fill="#15803d" />
      <circle cx="48" cy="32" r="3" fill="#15803d" />
      {isOpenLeft && (
        <>
          <rect x="-2" y="10" width="14" height="44" rx="4" fill="#15803d" />
          <rect x="0" y="12" width="10" height="40" rx="3" fill="#000000" opacity="0.9" />
          <rect x="2" y="14" width="6" height="36" rx="2" fill="#1a1a1a" />
        </>
      )}
      {isOpenRight && (
        <>
          <rect x="52" y="10" width="14" height="44" rx="4" fill="#15803d" />
          <rect x="54" y="12" width="10" height="40" rx="3" fill="#000000" opacity="0.9" />
          <rect x="56" y="14" width="6" height="36" rx="2" fill="#1a1a1a" />
        </>
      )}
      {!isOpenLeft && (
        <>
          <rect x="0" y="12" width="8" height="40" rx="4" fill="#15803d" />
          <rect x="2" y="14" width="4" height="36" rx="2" fill="#0f5132" />
        </>
      )}
      {!isOpenRight && (
        <>
          <rect x="56" y="12" width="8" height="40" rx="4" fill="#15803d" />
          <rect x="58" y="14" width="4" height="36" rx="2" fill="#0f5132" />
        </>
      )}
    </svg>
  );
}

// Pipe Icon (SVG) - Vertical
function PipeIconV({ isOpenTop, isOpenBottom }: { isOpenTop: boolean; isOpenBottom: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect x="14" y="2" width="36" height="60" rx="6" fill="#16a34a" />
      <rect x="14" y="2" width="14" height="60" rx="6" fill="#22c55e" opacity="0.6" />
      <circle cx="32" cy="16" r="3" fill="#15803d" />
      <circle cx="32" cy="32" r="3" fill="#15803d" />
      <circle cx="32" cy="48" r="3" fill="#15803d" />
      {isOpenTop && (
        <>
          <rect x="10" y="-2" width="44" height="14" rx="4" fill="#15803d" />
          <rect x="12" y="0" width="40" height="10" rx="3" fill="#000000" opacity="0.9" />
          <rect x="14" y="2" width="36" height="6" rx="2" fill="#1a1a1a" />
        </>
      )}
      {isOpenBottom && (
        <>
          <rect x="10" y="52" width="44" height="14" rx="4" fill="#15803d" />
          <rect x="12" y="54" width="40" height="10" rx="3" fill="#000000" opacity="0.9" />
          <rect x="14" y="56" width="36" height="6" rx="2" fill="#1a1a1a" />
        </>
      )}
      {!isOpenTop && (
        <>
          <rect x="12" y="0" width="40" height="8" rx="4" fill="#15803d" />
          <rect x="14" y="2" width="36" height="4" rx="2" fill="#0f5132" />
        </>
      )}
      {!isOpenBottom && (
        <>
          <rect x="12" y="56" width="40" height="8" rx="4" fill="#15803d" />
          <rect x="14" y="58" width="36" height="4" rx="2" fill="#0f5132" />
        </>
      )}
    </svg>
  );
}

// Grass Icon
function GrassIcon() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-900 rounded-sm border border-green-600/30 relative overflow-hidden">
      <div className="absolute inset-0 flex items-end justify-around pb-0.5">
        <div className="w-0.5 h-2/3 bg-green-500/70 rounded-t-full transform -rotate-6" />
        <div className="w-0.5 h-3/4 bg-green-400/60 rounded-t-full transform rotate-3" />
        <div className="w-0.5 h-1/2 bg-green-500/70 rounded-t-full transform -rotate-12" />
        <div className="w-0.5 h-2/3 bg-green-400/60 rounded-t-full transform rotate-6" />
        <div className="w-0.5 h-3/4 bg-green-500/70 rounded-t-full transform -rotate-3" />
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-yellow-400/10 animate-pulse" />
    </div>
  );
}

// Helper: get pipe rendering info for a cell
function getPipeInfoForCell(
  x: number,
  y: number,
  pipeGroups: { id: string; segments: PipeSegment[] }[]
): { segment: PipeSegment; group: { id: string; segments: PipeSegment[] } } | null {
  for (const group of pipeGroups) {
    for (const segment of group.segments) {
      if (segment.cells.some(c => c.x === x && c.y === y)) {
        return { segment, group };
      }
    }
  }
  return null;
}

// Render a pipe cell
function PipeCell({ x, y, pipeGroups }: { x: number; y: number; pipeGroups: { id: string; segments: PipeSegment[] }[] }) {
  const info = getPipeInfoForCell(x, y, pipeGroups);
  if (!info) return null;

  const { segment } = info;
  const cellOpening = segment.openings.find(o => o.x === x && o.y === y);

  if (segment.cells.length === 2) {
    if (segment.orientation === 'horizontal') {
      const isOpenLeft = cellOpening?.direction === 'RIGHT';
      const isOpenRight = cellOpening?.direction === 'LEFT';
      return <PipeIconH isOpenLeft={isOpenLeft} isOpenRight={isOpenRight} />;
    } else {
      const isOpenTop = cellOpening?.direction === 'DOWN';
      const isOpenBottom = cellOpening?.direction === 'UP';
      return <PipeIconV isOpenTop={isOpenTop} isOpenBottom={isOpenBottom} />;
    }
  } else {
    if (segment.orientation === 'horizontal') {
      const isOpenLeft = cellOpening?.direction === 'RIGHT';
      const isOpenRight = cellOpening?.direction === 'LEFT';
      return <PipeIconH isOpenLeft={isOpenLeft} isOpenRight={isOpenRight} />;
    } else {
      const isOpenTop = cellOpening?.direction === 'DOWN';
      const isOpenBottom = cellOpening?.direction === 'UP';
      return <PipeIconV isOpenTop={isOpenTop} isOpenBottom={isOpenBottom} />;
    }
  }
}

function App() {
  const {
    snake,
    food,
    direction,
    status,
    score,
    difficulty,
    highScore,
    obstacles,
    pipeGroups,
    speedMultiplier,
    grassBoostActive,
    deathReason,
    gridSize,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
    changeDifficulty,
  } = useSnakeGame();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detect new high score
  useEffect(() => {
    if (status === 'gameover' && score > 0 && score >= highScore) {
      setShowNewHighScore(true);
      const timer = setTimeout(() => setShowNewHighScore(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, score, highScore]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {
        // Fallback: some browsers may not support it
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Keyboard shortcut for fullscreen (F key)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        // Don't trigger if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleFullscreen]);

  // Touch/swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipe = 30;
      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    },
    [changeDirection]
  );

  const handleDPad = useCallback(
    (dir: Direction) => {
      if (status === 'playing') changeDirection(dir);
    },
    [status, changeDirection]
  );

  const getCellContent = (x: number, y: number): string => {
    const isHead = snake[0].x === x && snake[0].y === y;
    const isTail = snake.length > 1 && snake[snake.length - 1].x === x && snake[snake.length - 1].y === y;
    const isBody = snake.length > 2 && snake.slice(1, -1).some((seg) => seg.x === x && seg.y === y);
    const isFood = food.x === x && food.y === y;
    const obstacle = obstacles.find((obs) => obs.x === x && obs.y === y);
    const pipeInfo = getPipeInfoForCell(x, y, pipeGroups);

    if (isHead) return 'head';
    if (isTail) return 'tail';
    if (isBody) return 'body';
    if (isFood) return 'food';
    if (pipeInfo) return 'pipe';
    if (obstacle) return `obstacle_${obstacle.type}`;
    return 'empty';
  };

  const getBodyIndex = (x: number, y: number) => {
    return snake.findIndex((seg) => seg.x === x && seg.y === y);
  };

  const getTailDirection = (): Direction => {
    if (snake.length < 2) return direction;
    const tail = snake[snake.length - 1];
    const prev = snake[snake.length - 2];
    if (tail.x < prev.x) return 'LEFT';
    if (tail.x > prev.x) return 'RIGHT';
    if (tail.y < prev.y) return 'UP';
    return 'DOWN';
  };

  // Get death reason message
  const getDeathReasonMessage = (reason: DeathReason): string => {
    switch (reason) {
      case 'wall': return '🧱 Hit the wall';
      case 'self': return '🐛 Ate yourself';
      case 'rock': return '🪨 Crashed into a rock';
      case 'pipe': return '🔧 Wrong pipe entry';
      default: return '💀 Game Over';
    }
  };

  // Get sarcastic remark based on score and death reason
  const getSarcasticRemark = (score: number, reason: DeathReason): string => {
    const remarks: { [key: string]: string[] } = {
      wall: [
        'Did you forget the walls exist?',
        'The wall wins again. Shocking.',
        'Maybe try staying inside the lines?',
        'Walls: 1, You: 0',
        'Pro tip: walls are solid. Who knew?',
      ],
      self: [
        'Cannibalism? Bold choice.',
        'Even caterpillars need personal space.',
        'Your caterpillar has trust issues.',
        'Auto-cannibalism: 10/10 creativity, 0/10 execution.',
        'Did you forget which end was which?',
      ],
      rock: [
        'Rocks are hard. News at 11.',
        'That rock saw you coming.',
        'Maybe avoid the immovable objects?',
        'Rocks: still hard. You: still dead.',
        'Newton called. He says rocks win.',
      ],
      pipe: [
        'Wrong way! Did you skip the tutorial?',
        'Pipes have openings for a reason.',
        'Even plumbers are disappointed.',
        'That pipe was closed for a reason.',
        'Reading comprehension: could be better.',
      ],
    };

    if (score < 30) {
      return [
        'My grandma plays better. And she\'s a toaster.',
        'Is this your first time using a keyboard?',
        'I\'ve seen snails move faster.',
        'The caterpillar died of embarrassment.',
        'Have you tried not dying?',
      ][Math.floor(Math.random() * 5)];
    }

    if (score < 100) {
      return [
        'Not terrible. Just... not good.',
        'You\'re getting there. Slowly.',
        'A valiant effort. For a beginner.',
        'Almost respectable. Almost.',
        'Keep practicing. Or don\'t.',
      ][Math.floor(Math.random() * 5)];
    }

    if (score < 200) {
      return [
        'Okay, you\'re not completely hopeless.',
        'Not bad for a human.',
        'I\'m almost impressed. Almost.',
        'You lasted longer than I expected.',
        'The caterpillar is proud. Barely.',
      ][Math.floor(Math.random() * 5)];
    }

    return [
      'Fine, you\'re good. Happy now?',
      'Okay, I admit it. That was decent.',
      'You\'re making me look bad.',
      'The caterpillar salutes you. Reluctantly.',
      'Impressive. Don\'t let it go to your head.',
    ][Math.floor(Math.random() * 5)];
  };

  const difficulties: { key: Difficulty; label: string; emoji: string }[] = [
    { key: 'easy', label: 'Easy', emoji: '🐢' },
    { key: 'medium', label: 'Medium', emoji: '🐛' },
    { key: 'hard', label: 'Hard', emoji: '⚡' },
  ];

  const speedPercent = Math.round((speedMultiplier - 1) * 100);
  const totalPipeCount = pipeGroups.reduce((acc, g) => acc + g.segments.length, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-2 sm:p-4 pb-72 sm:pb-8 md:pb-4 select-none ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Header */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mb-2 sm:mb-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-2 tracking-tight">
          <span className="text-green-400">🐛</span> Caterpillar Green
        </h1>

        {/* Score Board */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 border border-white/10">
          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-purple-300 uppercase tracking-wider font-medium">Score</div>
            <div className="text-lg sm:text-2xl font-bold text-white tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-purple-300 uppercase tracking-wider font-medium">Best</div>
            <div className="text-lg sm:text-2xl font-bold text-yellow-400 tabular-nums">{highScore}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-purple-300 uppercase tracking-wider font-medium">Speed</div>
            <div className={`text-lg sm:text-2xl font-bold tabular-nums ${grassBoostActive ? 'text-yellow-300 animate-pulse' : 'text-cyan-400'}`}>
              {speedPercent > 0 ? `+${speedPercent}%` : '1x'}
              {grassBoostActive && '⚡'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-purple-300 uppercase tracking-wider font-medium">Hazards</div>
            <div className="text-lg sm:text-2xl font-bold text-red-400 tabular-nums">{obstacles.length + totalPipeCount}</div>
          </div>
        </div>

        {/* Grass Boost Indicator */}
        {grassBoostActive && (
          <div className="mt-1 sm:mt-2 text-center bg-yellow-500/20 border border-yellow-400/40 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 animate-pulse">
            <span className="text-yellow-300 font-bold text-xs sm:text-sm">⚡ GRASS BOOST ACTIVE! +25% Speed ⚡</span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div
        ref={boardRef}
        className={`game-board relative w-full max-w-[min(90vw,calc(100vh-280px))] sm:max-w-[min(80vw,calc(100vh-260px))] md:max-w-[min(70vw,calc(100vh-240px))] lg:max-w-[min(60vw,700px)] aspect-square rounded-xl sm:rounded-2xl border-2 shadow-2xl overflow-hidden touch-none transition-all duration-300 ${
          grassBoostActive
            ? 'bg-slate-800/80 border-yellow-400/60 shadow-yellow-500/30'
            : 'bg-slate-800/80 border-purple-500/30 shadow-purple-500/20'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 grid opacity-10"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => (
            <div key={i} className="border border-white/5" />
          ))}
        </div>

        {/* Game cells */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const cellType = getCellContent(x, y);
            const bodyIdx = getBodyIndex(x, y);

            return (
              <div key={i} className="relative flex items-center justify-center p-[1px]">
                {cellType === 'head' && (
                  <div className="w-full h-full animate-pulse-subtle transition-all duration-75">
                    <SnakeHeadSprite direction={direction} />
                  </div>
                )}
                {cellType === 'tail' && (
                  <div className="w-full h-full transition-all duration-75">
                    <SnakeTailSprite direction={getTailDirection()} />
                  </div>
                )}
                {cellType === 'body' && (
                  <div
                    className="w-full h-full rounded-sm transition-all duration-75"
                    style={{
                      backgroundColor: `hsl(${140 + bodyIdx * 2}, 70%, ${55 - bodyIdx * 0.5}%)`,
                      opacity: Math.max(0.5, 1 - bodyIdx * 0.02),
                    }}
                  />
                )}
                {cellType === 'food' && (
                  <div className="w-full h-full rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-bounce-food" />
                )}
                {cellType === 'pipe' && (
                  <div className="animate-obstacle-appear w-full h-full">
                    <PipeCell x={x} y={y} pipeGroups={pipeGroups} />
                  </div>
                )}
                {cellType === 'obstacle_rock' && (
                  <div className="animate-obstacle-appear w-full h-full">
                    <RockIcon />
                  </div>
                )}
                {cellType === 'obstacle_grass' && (
                  <div className="animate-obstacle-appear w-full h-full">
                    <GrassIcon />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Direction indicator */}
        {status === 'playing' && (
          <div className="absolute top-2 right-2 text-white/30 text-lg">
            {direction === 'UP' && '↑'}
            {direction === 'DOWN' && '↓'}
            {direction === 'LEFT' && '←'}
            {direction === 'RIGHT' && '→'}
          </div>
        )}

        {/* Overlay: Idle */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🐛</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Ready to Play?</h2>
            <p className="text-purple-200 text-xs sm:text-sm mb-1 text-center px-3 sm:px-4">
              Arrow keys, WASD, or swipe to control
            </p>
            <div className="text-[10px] sm:text-xs text-purple-300/80 text-center px-4 sm:px-6 mb-3 sm:mb-4 space-y-0.5">
              <p>🍎 Every 10 pts → Speed +2%</p>
              <p>🌿 Grass → +25% speed for 5s</p>
              <p>🪨 Rocks are deadly!</p>
              <p>🔧 Enter pipe openings to teleport</p>
              <p>⚠️ Wrong pipe entry = death!</p>
            </div>
            <button
              onClick={startGame}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              Start Game
            </button>
            <p className="text-purple-300/60 text-[10px] sm:text-xs mt-2 sm:mt-3">or press Space</p>
          </div>
        )}

        {/* Overlay: Paused */}
        {status === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⏸️</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Paused</h2>
            <button
              onClick={togglePause}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              Resume
            </button>
            <p className="text-purple-300/60 text-[10px] sm:text-xs mt-2 sm:mt-3">or press Space</p>
          </div>
        )}

        {/* Overlay: Game Over */}
        {status === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10 px-4">
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">💀</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Game Over!</h2>
            
            {deathReason && (
              <p className="text-red-400 font-semibold text-sm sm:text-base mb-2">
                {getDeathReasonMessage(deathReason)}
              </p>
            )}
            
            {showNewHighScore && (
              <div className="text-yellow-400 font-bold text-base sm:text-lg animate-pulse mb-2">
                🏆 New High Score! 🏆
              </div>
            )}
            
            <p className="text-purple-200 mb-1 text-sm sm:text-base">
              Score: <span className="text-white font-bold">{score}</span>
            </p>
            <p className="text-purple-300 text-xs sm:text-sm mb-1">
              Speed: <span className="text-cyan-400 font-bold">+{speedPercent}%</span>
            </p>
            <p className="text-purple-300 text-xs sm:text-sm mb-2 sm:mb-3">
              Hazards: <span className="text-red-400 font-bold">{obstacles.length + totalPipeCount}</span>
            </p>
            
            <p className="text-yellow-300/90 italic text-xs sm:text-sm mb-3 sm:mb-4 text-center max-w-xs">
              "{getSarcasticRemark(score, deathReason)}"
            </p>
            
            <button
              onClick={() => { resetGame(); setTimeout(startGame, 50); }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              Play Again
            </button>
            <p className="text-purple-300/60 text-[10px] sm:text-xs mt-2 sm:mt-3">or press Space</p>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mt-2 sm:mt-4 space-y-2 sm:space-y-3 mb-4 md:mb-0">
        {/* Action Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {status === 'idle' && (
            <button onClick={startGame} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base">
              <span>▶</span> Start
            </button>
          )}
          {status === 'playing' && (
            <button onClick={togglePause} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base">
              <span>⏸</span> Pause
            </button>
          )}
          {status === 'paused' && (
            <>
              <button onClick={togglePause} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base">
                <span>▶</span> Resume
              </button>
              <button onClick={resetGame} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base">
                <span>↺</span> Restart
              </button>
            </>
          )}
          {status === 'gameover' && (
            <button onClick={() => { resetGame(); setTimeout(startGame, 50); }} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base">
              <span>↺</span> Restart
            </button>
          )}
          {(status === 'playing' || status === 'paused') && (
            <button onClick={resetGame} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base">
              <span>↺</span> Restart
            </button>
          )}
          
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
                <span className="hidden sm:inline">Exit</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>

        {/* Legend */}
        {(obstacles.length > 0 || totalPipeCount > 0) && (
          <div className="flex justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-purple-200 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-500" />
              <span>Rock ☠️</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-800" />
              <span>Grass ⚡+25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-600" />
              <span>Pipe 🔀</span>
            </div>
          </div>
        )}

        {/* Rules Summary */}
        <div className="flex justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-purple-300/60 flex-wrap">
          <span>🍎 +10pts → Speed +2%</span>
          <span>🌿 Grass → +25% for 5s</span>
          <span>🔧 Pipe opening → Teleport</span>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {difficulties.map((d) => (
            <button
              key={d.key}
              onClick={() => { if (status === 'idle' || status === 'gameover') changeDifficulty(d.key); }}
              disabled={status === 'playing' || status === 'paused'}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                difficulty === d.key
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30 scale-105'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              } ${status === 'playing' || status === 'paused' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {d.emoji} {d.label}
            </button>
          ))}
        </div>

        {/* Keyboard hints */}
        <div className="hidden md:flex justify-center gap-4 text-xs text-purple-300/60">
          <span>↑↓←→ or WASD: Move</span>
          <span>Space: Pause/Start</span>
          <span>F: Fullscreen</span>
          <span>Esc: Pause</span>
        </div>
      </div>

      {/* Mobile/Tablet Circular D-Pad - Fixed at bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:hidden z-50">
        <div className="grid grid-cols-3 gap-2 w-56 sm:w-64">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('UP'); }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl transition-all active:scale-90 shadow-lg border border-white/30"
          >
            ↑
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('LEFT'); }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl transition-all active:scale-90 shadow-lg border border-white/30"
          >
            ←
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('DOWN'); }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl transition-all active:scale-90 shadow-lg border border-white/30"
          >
            ↓
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad('RIGHT'); }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl transition-all active:scale-90 shadow-lg border border-white/30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
