import { useState, useEffect, useCallback, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ObstacleType = 'rock' | 'grass';
export type PipeOrientation = 'horizontal' | 'vertical';

export interface Obstacle {
  x: number;
  y: number;
  type: ObstacleType;
}

export interface PipeOpening {
  x: number;
  y: number;
  direction: Direction;
}

export interface PipeSegment {
  id: string;
  cells: Position[];
  orientation: PipeOrientation;
  openings: PipeOpening[];
  groupId: string;
}

export interface PipeGroup {
  id: string;
  segments: PipeSegment[];
}

export type DeathReason = 'wall' | 'self' | 'rock' | 'pipe' | null;

const GRID_SIZE = 20;
const BASE_SPEEDS: Record<Difficulty, number> = {
  easy: 90,
  medium: 60,
  hard: 35,
};

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

function getRandomPosition(occupied: Set<string>): Position {
  let pos: Position;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
    if (attempts > 500) break;
  } while (occupied.has(`${pos.x},${pos.y}`));
  return pos;
}

function getObstacleCount(score: number): number {
  if (score < 50) return 0;
  if (score < 100) return Math.floor(Math.random() * 2) + 2;
  if (score < 150) return Math.floor(Math.random() * 3) + 4;
  if (score < 200) return Math.floor(Math.random() * 3) + 7;
  return Math.min(14, Math.floor(Math.random() * 3) + 10);
}

function getPipeGroupCount(score: number): number {
  if (score < 30) return 0;
  if (score < 80) return 1;
  if (score < 150) return Math.floor(Math.random() * 2) + 1;
  return Math.floor(Math.random() * 2) + 2;
}

function generateObstacles(
  score: number,
  snake: Position[],
  food: Position
): { obstacles: Obstacle[]; pipeGroups: PipeGroup[] } {
  const obstacleCount = getObstacleCount(score);
  const pipeGroupCount = getPipeGroupCount(score);
  
  const obstacles: Obstacle[] = [];
  const pipeGroups: PipeGroup[] = [];
  const occupied = new Set<string>();

  snake.forEach((seg) => occupied.add(`${seg.x},${seg.y}`));
  occupied.add(`${food.x},${food.y}`);
  const head = snake[0];
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const nx = head.x + dx;
      const ny = head.y + dy;
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        occupied.add(`${nx},${ny}`);
      }
    }
  }

  const obstacleTypes: ObstacleType[] = ['rock', 'grass'];
  let attempts = 0;
  while (obstacles.length < obstacleCount && attempts < obstacleCount * 20) {
    attempts++;
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const key = `${x},${y}`;
    if (!occupied.has(key)) {
      obstacles.push({ x, y, type });
      occupied.add(key);
    }
  }

  let pipeGroupId = 0;
  for (let g = 0; g < pipeGroupCount; g++) {
    const groupId = `pg_${pipeGroupId++}`;
    const isTwoCellPipe = Math.random() < 0.4;
    
    if (isTwoCellPipe) {
      const orientation: PipeOrientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      let placed = false;
      
      for (let att = 0; att < 50 && !placed; att++) {
        const x = orientation === 'horizontal' 
          ? Math.floor(Math.random() * (GRID_SIZE - 1))
          : Math.floor(Math.random() * GRID_SIZE);
        const y = orientation === 'vertical'
          ? Math.floor(Math.random() * (GRID_SIZE - 1))
          : Math.floor(Math.random() * GRID_SIZE);
        
        const cells: Position[] = orientation === 'horizontal'
          ? [{ x, y }, { x: x + 1, y }]
          : [{ x, y }, { x, y: y + 1 }];
        
        const allFree = cells.every(c => 
          c.x >= 0 && c.x < GRID_SIZE && c.y >= 0 && c.y < GRID_SIZE && !occupied.has(`${c.x},${c.y}`)
        );
        
        if (allFree) {
          cells.forEach(c => occupied.add(`${c.x},${c.y}`));
          
          const openings: PipeOpening[] = orientation === 'horizontal'
            ? [
                { x: cells[0].x, y: cells[0].y, direction: 'RIGHT' },
                { x: cells[1].x, y: cells[1].y, direction: 'LEFT' },
              ]
            : [
                { x: cells[0].x, y: cells[0].y, direction: 'DOWN' },
                { x: cells[1].x, y: cells[1].y, direction: 'UP' },
              ];
          
          const segment: PipeSegment = {
            id: `${groupId}_0`,
            cells,
            orientation,
            openings,
            groupId,
          };
          
          pipeGroups.push({ id: groupId, segments: [segment] });
          placed = true;
        }
      }
    } else {
      const setSize = Math.random() < 0.5 ? 2 : 3;
      const segments: PipeSegment[] = [];
      let success = true;
      
      for (let s = 0; s < setSize; s++) {
        let placed = false;
        
        for (let att = 0; att < 50 && !placed; att++) {
          const x = Math.floor(Math.random() * GRID_SIZE);
          const y = Math.floor(Math.random() * GRID_SIZE);
          const key = `${x},${y}`;
          
          if (!occupied.has(key)) {
            occupied.add(key);
            
            const orientation: PipeOrientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const directions: Direction[] = orientation === 'horizontal' 
              ? ['LEFT', 'RIGHT'] 
              : ['UP', 'DOWN'];
            const openDir = directions[Math.floor(Math.random() * 2)];
            
            const cell: Position = { x, y };
            const openings: PipeOpening[] = [{ x, y, direction: openDir }];
            
            segments.push({
              id: `${groupId}_${s}`,
              cells: [cell],
              orientation,
              openings,
              groupId,
            });
            placed = true;
          }
        }
        
        if (!placed) {
          success = false;
          break;
        }
      }
      
      if (success && segments.length === setSize) {
        pipeGroups.push({ id: groupId, segments });
      } else {
        segments.forEach(seg => {
          seg.cells.forEach(c => occupied.delete(`${c.x},${c.y}`));
        });
      }
    }
  }

  return { obstacles, pipeGroups };
}

function getHighScore(difficulty: Difficulty): number {
  try {
    const stored = localStorage.getItem(`snake-highscore-${difficulty}`);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function setHighScoreStorage(difficulty: Difficulty, score: number): void {
  try {
    localStorage.setItem(`snake-highscore-${difficulty}`, score.toString());
  } catch {
    // silently fail
  }
}

function findPipeEntry(
  pos: Position,
  moveDir: Direction,
  pipeGroups: PipeGroup[]
): { segment: PipeSegment; opening: PipeOpening; group: PipeGroup } | null {
  for (const group of pipeGroups) {
    for (const segment of group.segments) {
      for (const opening of segment.openings) {
        if (opening.x === pos.x && opening.y === pos.y) {
          if (moveDir === opening.direction) {
            return { segment, opening, group };
          }
        }
      }
    }
  }
  return null;
}

function findPipeExit(
  entry: { segment: PipeSegment; opening: PipeOpening; group: PipeGroup },
  moveDir: Direction
): Position | null {
  const { segment, group } = entry;
  
  if (segment.cells.length === 2) {
    const otherCell = segment.cells.find(
      c => !(c.x === entry.opening.x && c.y === entry.opening.y)
    );
    return otherCell || null;
  } else {
    const otherSegments = group.segments.filter(s => s.id !== segment.id);
    if (otherSegments.length === 0) return null;
    
    const target = otherSegments[Math.floor(Math.random() * otherSegments.length)];
    return target.cells[0];
  }
}

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(() => getRandomPosition(new Set()));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [highScore, setHighScoreState] = useState(() => getHighScore('medium'));
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [pipeGroups, setPipeGroups] = useState<PipeGroup[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [grassBoostActive, setGrassBoostActive] = useState(false);
  const [deathReason, setDeathReason] = useState<DeathReason>(null);

  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
  const foodRef = useRef<Position>(food);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const pipeGroupsRef = useRef<PipeGroup[]>([]);
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const speedMultiplierRef = useRef(1.0);
  const grassBoostUntilRef = useRef<number>(0);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { pipeGroupsRef.current = pipeGroups; }, [pipeGroups]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { speedMultiplierRef.current = speedMultiplier; }, [speedMultiplier]);

  useEffect(() => {
    setHighScoreState(getHighScore(difficulty));
  }, [difficulty]);

  const getEffectiveSpeed = useCallback(() => {
    const baseSpeed = BASE_SPEEDS[difficulty];
    const permanentMultiplier = speedMultiplierRef.current;
    const isGrassBoosted = Date.now() < grassBoostUntilRef.current;
    const grassMultiplier = isGrassBoosted ? 0.75 : 1.0;
    return baseSpeed * permanentMultiplier * grassMultiplier;
  }, [difficulty]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    const newFood = getRandomPosition(new Set());
    setFood(newFood);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setObstacles([]);
    setPipeGroups([]);
    setSpeedMultiplier(1.0);
    setGrassBoostActive(false);
    setDeathReason(null);
    setStatus('idle');
    snakeRef.current = INITIAL_SNAKE;
    foodRef.current = newFood;
    obstaclesRef.current = [];
    pipeGroupsRef.current = [];
    scoreRef.current = 0;
    statusRef.current = 'idle';
    speedMultiplierRef.current = 1.0;
    grassBoostUntilRef.current = 0;
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (OPPOSITE[newDir] !== current) {
      directionRef.current = newDir;
      setDirection(newDir);
    }
  }, []);

  const moveSnake = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const currentObstacles = obstaclesRef.current;
    const currentPipeGroups = pipeGroupsRef.current;
    const dir = directionRef.current;
    const head = currentSnake[0];
    
    let newHead: Position;
    switch (dir) {
      case 'UP':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'LEFT':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    if (
      newHead.x < 0 || newHead.x >= GRID_SIZE ||
      newHead.y < 0 || newHead.y >= GRID_SIZE
    ) {
      setStatus('gameover');
      statusRef.current = 'gameover';
      setDeathReason('wall');
      return;
    }

    if (currentSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      setStatus('gameover');
      statusRef.current = 'gameover';
      setDeathReason('self');
      return;
    }

    const pipeEntry = findPipeEntry(newHead, dir, currentPipeGroups);
    if (pipeEntry) {
      const exitPos = findPipeExit(pipeEntry, dir);
      if (exitPos) {
        newHead = exitPos;
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          currentSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setStatus('gameover');
          statusRef.current = 'gameover';
          setDeathReason('pipe');
          return;
        }
      }
    } else {
      const isPipeCell = currentPipeGroups.some(group =>
        group.segments.some(seg =>
          seg.cells.some(cell => cell.x === newHead.x && cell.y === newHead.y)
        )
      );
      if (isPipeCell) {
        setStatus('gameover');
        statusRef.current = 'gameover';
        setDeathReason('pipe');
        return;
      }
    }

    const hitObstacle = currentObstacles.find(
      (obs) => obs.x === newHead.x && obs.y === newHead.y
    );
    
    if (hitObstacle && hitObstacle.type === 'rock') {
      setStatus('gameover');
      statusRef.current = 'gameover';
      setDeathReason('rock');
      return;
    }

    if (hitObstacle && hitObstacle.type === 'grass') {
      grassBoostUntilRef.current = Date.now() + 5000;
      setGrassBoostActive(true);
    }

    const newSnake = [newHead, ...currentSnake];

    if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
      const newScore = scoreRef.current + 10;
      setScore(newScore);
      scoreRef.current = newScore;

      const currentHigh = getHighScore(difficulty);
      if (newScore > currentHigh) {
        setHighScoreStorage(difficulty, newScore);
        setHighScoreState(newScore);
      }

      const newMultiplier = speedMultiplierRef.current * 1.02;
      setSpeedMultiplier(newMultiplier);
      speedMultiplierRef.current = newMultiplier;

      const occupiedSet = new Set<string>();
      newSnake.forEach((seg) => occupiedSet.add(`${seg.x},${seg.y}`));
      currentObstacles.forEach((obs) => occupiedSet.add(`${obs.x},${obs.y}`));
      currentPipeGroups.forEach(group => {
        group.segments.forEach(seg => {
          seg.cells.forEach(c => occupiedSet.add(`${c.x},${c.y}`));
        });
      });
      const newFood = getRandomPosition(occupiedSet);
      setFood(newFood);
      foodRef.current = newFood;

      const { obstacles: newObstacles, pipeGroups: newPipeGroups } = generateObstacles(newScore, newSnake, newFood);
      setObstacles(newObstacles);
      obstaclesRef.current = newObstacles;
      setPipeGroups(newPipeGroups);
      pipeGroupsRef.current = newPipeGroups;
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;
  }, [difficulty]);

  useEffect(() => {
    if (status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      lastMoveTimeRef.current = 0;
      return;
    }

    let animFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (statusRef.current !== 'playing') return;

      if (!lastMoveTimeRef.current) {
        lastMoveTimeRef.current = timestamp;
      }

      const effectiveSpeed = getEffectiveSpeed();
      const elapsed = timestamp - lastMoveTimeRef.current;

      if (grassBoostUntilRef.current > 0 && Date.now() >= grassBoostUntilRef.current) {
        grassBoostUntilRef.current = 0;
        setGrassBoostActive(false);
      }

      if (elapsed >= effectiveSpeed) {
        moveSnake();
        lastMoveTimeRef.current = timestamp;
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);
    gameLoopRef.current = animFrameId;

    return () => {
      cancelAnimationFrame(animFrameId);
      gameLoopRef.current = null;
    };
  }, [status, difficulty, moveSnake, getEffectiveSpeed]);

  const startGame = useCallback(() => {
    if (status === 'gameover' || status === 'idle') {
      resetGame();
      setTimeout(() => {
        setStatus('playing');
        statusRef.current = 'playing';
      }, 0);
    } else if (status === 'paused') {
      setStatus('playing');
      statusRef.current = 'playing';
    } else {
      setStatus('playing');
      statusRef.current = 'playing';
    }
  }, [status, resetGame]);

  const pauseGame = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
      statusRef.current = 'paused';
    }
  }, [status]);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
      statusRef.current = 'paused';
    } else if (status === 'paused') {
      setStatus('playing');
      statusRef.current = 'playing';
    }
  }, [status]);

  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (statusRef.current === 'idle' || statusRef.current === 'gameover') {
            startGame();
          } else {
            togglePause();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (statusRef.current === 'playing') {
            pauseGame();
          }
          break;
        case 'f':
        case 'F':
          // Fullscreen toggle handled in App component
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, startGame, togglePause, pauseGame]);

  return {
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
    gridSize: GRID_SIZE,
    startGame,
    pauseGame,
    togglePause,
    resetGame,
    changeDirection,
    changeDifficulty,
  };
}
