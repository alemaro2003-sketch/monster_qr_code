import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { MonsterSVG, HeartCereal } from './App';

interface MazeGameProps {
  onGameEnd: (points: number) => void;
  onClose: () => void;
  equippedAccessories: Record<string, string | null>;
}

const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1],
];

const ROWS = MAZE.length;
const COLS = MAZE[0].length;
const PLAYER_SPEED = 4.5;
const ENEMY_SPEED = 3.2;

function findPath(sx: number, sy: number, gx: number, gy: number) {
  const queue = [{x: sx, y: sy, path: [] as {x: number, y: number}[]}];
  const visited = new Set([`${sx},${sy}`]);
  const dirs = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === gx && curr.y === gy) return curr.path;
    
    for (const d of dirs) {
      const nx = curr.x + d.x;
      const ny = curr.y + d.y;
      if (MAZE[ny] && MAZE[ny][nx] === 0 && !visited.has(`${nx},${ny}`)) {
        visited.add(`${nx},${ny}`);
        queue.push({x: nx, y: ny, path: [...curr.path, {x: nx, y: ny}]});
      }
    }
  }
  return [];
}

export default function MazeGame({ onGameEnd, onClose, equippedAccessories }: MazeGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  const [cereals, setCereals] = useState<{x: number, y: number}[]>([]);
  const { width, height } = useWindowSize();
  
  const playerElRef = useRef<HTMLDivElement>(null);
  const enemyElRef = useRef<HTMLDivElement>(null);
  
  const playerState = useRef({ x: 1, y: 1, targetX: 1, targetY: 1, vx: 0, vy: 0, nextVx: 0, nextVy: 0 });
  const enemyState = useRef({ x: 9, y: 9, targetX: 9, targetY: 9 });
  const playerHistory = useRef<{x: number, y: number}[]>([]);
  const enemyHistory = useRef<{x: number, y: number}[]>([]);
  const cerealsRef = useRef<{x: number, y: number}[]>([]);
  const isHitRef = useRef(false);
  const reqRef = useRef<number>();
  const lastTimeRef = useRef(performance.now());
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameWonRef = useRef(false);
  const timeLeftRef = useRef(30);
  const [hitFeedback, setHitFeedback] = useState<{x: number, y: number, id: number} | null>(null);

  // Initialize cereals
  useEffect(() => {
    const newCereals: {x: number, y: number}[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (MAZE[y][x] === 0 && Math.random() > 0.6 && !(x === 1 && y === 1) && !(x === 9 && y === 9)) {
          newCereals.push({ x, y });
        }
      }
    }
    cerealsRef.current = newCereals;
    setCereals(newCereals);
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver || gameWon) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          setGameOver(true);
          gameOverRef.current = true;
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, gameWon]);

  // Game Loop
  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1); // cap dt at 100ms
      lastTimeRef.current = time;

      if (gameOverRef.current || gameWonRef.current) {
        reqRef.current = requestAnimationFrame(loop);
        return;
      }
      
      let p = playerState.current;
      let e = enemyState.current;

      // Player Movement
      const cx = Math.round(p.x);
      const cy = Math.round(p.y);
      const isCenterX = Math.abs(p.x - cx) < 0.2;
      const isCenterY = Math.abs(p.y - cy) < 0.2;

      // Allow instant reverse
      if (p.nextVx !== 0 && Math.sign(p.targetX - p.x) === -p.nextVx) {
        p.targetX = cx + p.nextVx;
        p.targetY = cy;
        p.vx = p.nextVx;
        p.vy = 0;
      } else if (p.nextVy !== 0 && Math.sign(p.targetY - p.y) === -p.nextVy) {
        p.targetX = cx;
        p.targetY = cy + p.nextVy;
        p.vx = 0;
        p.vy = p.nextVy;
      } 
      // Allow turning if close to center
      else if (isCenterX && isCenterY) {
        if (p.nextVx !== 0 || p.nextVy !== 0) {
          if (MAZE[cy + p.nextVy] && MAZE[cy + p.nextVy][cx + p.nextVx] === 0) {
            // Snap to center when turning
            if (p.nextVx !== 0) p.y = cy;
            if (p.nextVy !== 0) p.x = cx;
            p.targetX = cx + p.nextVx;
            p.targetY = cy + p.nextVy;
            p.vx = p.nextVx;
            p.vy = p.nextVy;
          }
        }
      }

      // If we reached target, try to continue in current direction
      if (p.x === p.targetX && p.y === p.targetY) {
        let moved = false;
        if (p.nextVx !== 0 || p.nextVy !== 0) {
          if (MAZE[cy + p.nextVy] && MAZE[cy + p.nextVy][cx + p.nextVx] === 0) {
            p.targetX = cx + p.nextVx;
            p.targetY = cy + p.nextVy;
            p.vx = p.nextVx;
            p.vy = p.nextVy;
            moved = true;
          }
        }
        if (!moved && (p.vx !== 0 || p.vy !== 0)) {
          if (MAZE[cy + p.vy] && MAZE[cy + p.vy][cx + p.vx] === 0) {
            p.targetX = cx + p.vx;
            p.targetY = cy + p.vy;
          } else {
            p.vx = 0;
            p.vy = 0;
          }
        }
      }

      if (p.x !== p.targetX || p.y !== p.targetY) {
        p.vx = Math.sign(p.targetX - p.x);
        p.vy = Math.sign(p.targetY - p.y);
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = PLAYER_SPEED * dt;
        
        if (moveDist >= dist) {
          p.x = p.targetX;
          p.y = p.targetY;
        } else {
          p.x += (dx / dist) * moveDist;
          p.y += (dy / dist) * moveDist;
        }
      }

      const lastHist = playerHistory.current[playerHistory.current.length - 1];
      if (!lastHist || Math.hypot(lastHist.x - p.x, lastHist.y - p.y) > 1.0) {
        playerHistory.current.push({x: p.x, y: p.y});
        if (playerHistory.current.length > 8) playerHistory.current.shift();
      }

      const lastEHist = enemyHistory.current[enemyHistory.current.length - 1];
      if (!lastEHist || Math.hypot(lastEHist.x - e.x, lastEHist.y - e.y) > 1.0) {
        enemyHistory.current.push({x: e.x, y: e.y});
        if (enemyHistory.current.length > 5) enemyHistory.current.shift();
      }

      // Enemy Movement (starts after 2 seconds)
      if (timeLeftRef.current <= 28 && !isHitRef.current) {
        if (e.x === e.targetX && e.y === e.targetY) {
          const path = findPath(e.x, e.y, Math.round(p.x), Math.round(p.y));
          if (path.length > 1) {
            e.targetX = path[1].x;
            e.targetY = path[1].y;
          } else if (path.length === 1) {
            e.targetX = path[0].x;
            e.targetY = path[0].y;
          }
        }

        if (e.x !== e.targetX || e.y !== e.targetY) {
          const dx = e.targetX - e.x;
          const dy = e.targetY - e.y;
          const dist = Math.hypot(dx, dy);
          const moveDist = ENEMY_SPEED * dt;
          
          if (moveDist >= dist) {
            e.x = e.targetX;
            e.y = e.targetY;
          } else {
            e.x += (dx / dist) * moveDist;
            e.y += (dy / dist) * moveDist;
          }
        }
      }

      // Update DOM
      if (playerElRef.current) {
        playerElRef.current.style.left = `${(p.x / COLS) * 100}%`;
        playerElRef.current.style.top = `${(p.y / ROWS) * 100}%`;
      }
      if (enemyElRef.current) {
        enemyElRef.current.style.left = `${(e.x / COLS) * 100}%`;
        enemyElRef.current.style.top = `${(e.y / ROWS) * 100}%`;
      }

      // Cereals Collision
      const cerealX = Math.round(p.x);
      const cerealY = Math.round(p.y);
      const cIndex = cerealsRef.current.findIndex(c => c.x === cerealX && c.y === cerealY);
      if (cIndex !== -1) {
        cerealsRef.current.splice(cIndex, 1);
        setCereals([...cerealsRef.current]);
        scoreRef.current += 10;
        setScore(scoreRef.current);
        
        if (cerealsRef.current.length === 0) {
          setGameWon(true);
          gameWonRef.current = true;
          return;
        }
      }

      // Enemy Collision (Instant Game Over)
      const dist = Math.hypot(p.x - e.x, p.y - e.y);
      if (dist < 0.8 && !gameOverRef.current) {
        setGameOver(true);
        gameOverRef.current = true;
        return;
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, []);

  const handleDir = (vx: number, vy: number) => {
    playerState.current.nextVx = vx;
    playerState.current.nextVy = vy;
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleDir(0, -1);
      if (e.key === 'ArrowDown') handleDir(0, 1);
      if (e.key === 'ArrowLeft') handleDir(-1, 0);
      if (e.key === 'ArrowRight') handleDir(1, 0);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (gameOver || gameWon) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
        {gameWon && <Confetti width={width} height={height} colors={['#facc15', '#f472b6', '#38bdf8']} />}
        <h2 className="text-5xl font-black text-[#da599c] mb-6 drop-shadow-md text-center">
          {gameWon ? "HAI BATTUTO IL MOSTRO!" : (timeLeft <= 0 ? "Tempo Scaduto!" : "GAME OVER")}
        </h2>
        <p className="text-2xl font-bold text-[#7a285d] mb-10">Punti raccolti: {score}</p>
        <div className="flex flex-col gap-4 w-full max-w-xs z-10">
          <button 
            onClick={() => {
              onGameEnd(score);
              onClose();
            }}
            className="bg-[#da599c] hover:bg-[#9f417c] text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl w-full"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-white z-50 flex flex-col items-center justify-between p-4 ${flashRed ? 'bg-red-100' : ''} touch-none`}>
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-2 shrink-0">
        <div className="bg-[#da599c] text-white font-bold py-2 px-4 rounded-full">
          Tempo: {timeLeft}s
        </div>
        <div className="bg-[#9f417c] text-white font-bold py-2 px-4 rounded-full">
          Punti: {score}
        </div>
      </div>

      {/* Maze */}
      <div className="flex-1 w-full max-w-md flex items-center justify-center relative min-h-0">
        <div 
          className="grid gap-0 border-4 border-[#7a285d] bg-[#f0f0f0] relative"
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: '100%',
            aspectRatio: `${COLS}/${ROWS}`
          }}
        >
          {MAZE.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`} 
                className={`w-full h-full ${cell === 1 ? 'bg-[#da599c]' : 'bg-white'}`}
              />
            ))
          )}

          {/* Cereals */}
          {cereals.map((c, i) => (
            <div 
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                left: `${(c.x / COLS) * 100}%`,
                top: `${(c.y / ROWS) * 100}%`,
                width: `${(1 / COLS) * 100}%`,
                height: `${(1 / ROWS) * 100}%`,
              }}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm scale-[0.6] overflow-visible">
                <HeartCereal x={2} y={2} rotation={0} isPink={i % 2 === 0} />
              </svg>
            </div>
          ))}

          {/* Player */}
          <div 
            ref={playerElRef}
            className="absolute flex items-center justify-center pointer-events-none z-20"
            style={{
              width: `${(1 / COLS) * 100}%`,
              height: `${(1 / ROWS) * 100}%`,
            }}
          >
            <motion.div 
              className="w-[220%] h-[220%]"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              <MonsterSVG satiety={0} isChewing={false} equippedAccessories={equippedAccessories} />
            </motion.div>
          </div>

          {/* Enemy */}
          {!gameWon && (
            <div 
              ref={enemyElRef}
              className="absolute flex items-center justify-center pointer-events-none z-10"
              style={{
                width: `${(1 / COLS) * 100}%`,
                height: `${(1 / ROWS) * 100}%`,
              }}
            >
              <motion.div 
                className="w-[220%] h-[220%]"
                animate={timeLeft <= 28 ? { y: [0, -5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <MonsterSVG satiety={0} isChewing={false} isEvil={true} />
              </motion.div>
            </div>
          )}

          {/* Hit Feedback */}
          {hitFeedback && (
            <motion.div
              key={hitFeedback.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -40, scale: 1.5 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute z-50 text-red-600 font-black text-2xl drop-shadow-md pointer-events-none"
              style={{
                left: `${(hitFeedback.x / COLS) * 100}%`,
                top: `${(hitFeedback.y / ROWS) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              -20
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="w-full max-w-[220px] grid grid-cols-3 gap-2 mt-4 shrink-0 pb-4 mx-auto">
        <div />
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleDir(0, -1); }} 
          className="bg-[#da599c] active:bg-[#9f417c] text-white p-4 rounded-xl flex justify-center items-center shadow-md select-none touch-manipulation"
        >
          <span className="text-2xl">⬆️</span>
        </button>
        <div />
        
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleDir(-1, 0); }} 
          className="bg-[#da599c] active:bg-[#9f417c] text-white p-4 rounded-xl flex justify-center items-center shadow-md select-none touch-manipulation"
        >
          <span className="text-2xl">⬅️</span>
        </button>
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#f0f0f0] opacity-30" />
        </div>
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleDir(1, 0); }} 
          className="bg-[#da599c] active:bg-[#9f417c] text-white p-4 rounded-xl flex justify-center items-center shadow-md select-none touch-manipulation"
        >
          <span className="text-2xl">➡️</span>
        </button>

        <div />
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleDir(0, 1); }} 
          className="bg-[#da599c] active:bg-[#9f417c] text-white p-4 rounded-xl flex justify-center items-center shadow-md select-none touch-manipulation"
        >
          <span className="text-2xl">⬇️</span>
        </button>
        <div />
      </div>
    </div>
  );
}
