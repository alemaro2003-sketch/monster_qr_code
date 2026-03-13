import React, { useEffect, useRef, useState } from 'react';
import { getAccessoriesSvg } from './accessories';

const getMonsterSvgStr = (equippedAccessories: Record<string, string | null>) => {
  const accessoriesSvg = getAccessoriesSvg(equippedAccessories);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><clipPath id="mouthClip"><path d="M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z" /></clipPath></defs><path d="M 125 490 C 105 490, 85 470, 85 450 L 75 400 L 55 420 L 75 340 L 55 350 L 75 270 L 55 280 L 95 150 C 95 80, 115 30, 165 40 C 135 50, 125 80, 145 110 Q 217.5 70, 300 95 L 310 85 L 315 100 L 325 90 L 330 105 L 340 95 L 345 110 C 365 80, 365 50, 335 40 C 385 30, 405 80, 405 150 L 445 280 L 425 270 L 445 350 L 425 340 L 445 420 L 425 400 L 415 450 C 415 470, 395 490, 375 490 Z" fill="#e63995" /><ellipse cx="205" cy="220" rx="45" ry="55" fill="white" /><ellipse cx="295" cy="220" rx="35" ry="45" fill="white" /><ellipse cx="215" cy="220" rx="20" ry="25" fill="#06a2bf" /><ellipse cx="220" cy="220" rx="12" ry="15" fill="black" /><ellipse cx="225" cy="212" rx="4" ry="5" fill="white" /><ellipse cx="215" cy="225" rx="1.5" ry="2" fill="white" /><ellipse cx="285" cy="220" rx="16" ry="20" fill="#06a2bf" /><ellipse cx="280" cy="220" rx="10" ry="12" fill="black" /><ellipse cx="285" cy="213" rx="3" ry="4" fill="white" /><ellipse cx="277" cy="224" rx="1" ry="1.5" fill="white" /><path d="M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z" fill="#cccccc" /><g clip-path="url(#mouthClip)"><path d="M 250 415 C 250 385, 190 385, 190 415 C 190 435, 250 445, 250 445 C 250 445, 310 435, 310 415 C 310 385, 250 385, 250 415 Z" fill="#8a1c59" /><polygon points="145,290 180,290 162.5,350" fill="white" /><polygon points="180,290 215,290 197.5,325" fill="white" /><polygon points="215,290 250,290 232.5,325" fill="white" /><polygon points="250,290 285,290 267.5,325" fill="white" /><polygon points="285,290 320,290 302.5,325" fill="white" /><polygon points="320,290 355,290 337.5,350" fill="white" /><g transform="translate(160, 435) rotate(15)"><polygon points="-12,0 12,0 0,-40" fill="white" /></g><g transform="translate(340, 435) rotate(-15)"><polygon points="-12,0 12,0 0,-40" fill="white" /></g></g>${accessoriesSvg}</svg>`;
};

const cerealSvgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g transform="translate(20, 20) scale(1.8) translate(-10, -10)"><path d="M 2,6 A 4,4 0,0,1 10,6 A 4,4 0,0,1 18,6 Q 18,12 10,18 Q 2,12 2,6 z" fill="#ff99cc" stroke="#d96699" stroke-width="1" /><path d="M 6,8 A 2,2 0,0,1 10,8 A 2,2 0,0,1 14,8 Q 14,10 10,13 Q 6,10 6,8 z" fill="#cccccc" /></g></svg>`;

const loadImage = (svg: string) => {
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svg);
  return img;
};

export default function MiniGame({ onGameEnd, onClose, equippedAccessories }: { onGameEnd: (points: number) => void, onClose: () => void, equippedAccessories: Record<string, string | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const jumpTriggerRef = useRef(false);
  const isSpeedingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const monsterImg = loadImage(getMonsterSvgStr(equippedAccessories));
    const cerealImg = loadImage(cerealSvgStr);

    let animationFrameId: number;
    
    // Game state
    const player = {
      x: Math.min(100, window.innerWidth * 0.1),
      y: 0,
      width: 80,
      height: 80,
      vy: 0,
      gravity: 0.8,
      jumpPower: -15,
      doubleJumpPower: -14,
      jumps: 0
    };

    let obstacles: any[] = [];
    let cereals: any[] = [];
    let clouds: any[] = [];
    let platforms: any[] = [];
    
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: 50 + Math.random() * (window.innerHeight / 3),
        width: 80 + Math.random() * 80,
        height: 30 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.5
      });
    }

    let gameSpeed = 6;
    let currentScore = 0;
    let currentTimeLeft = 30;
    let lastSecond = performance.now();
    let frameCount = 0;
    let hitTimer = 0;
    let slowdownTimer = 0;

    const spawnEntity = () => {
      frameCount++;
      const speedMult = isSpeedingRef.current ? 2 : 1;
      const groundY = canvas.height - 100;
      
      // Spawn platform
      if (frameCount % Math.floor(120 / speedMult) === 0 && Math.random() > 0.4) {
        platforms.push({
          x: canvas.width,
          y: groundY - 90 - Math.random() * 60,
          width: 120 + Math.random() * 80,
          height: 20
        });
      }

      // Spawn obstacle
      if (frameCount % Math.floor(80 / speedMult) === 0 && Math.random() > 0.3) {
        obstacles.push({
          x: canvas.width,
          y: groundY - 50,
          width: 35,
          height: 50,
          hit: false
        });
      }
      
      // Spawn cereal
      if (frameCount % Math.floor(50 / speedMult) === 0 && Math.random() > 0.2) {
        const onPlatform = platforms.length > 0 && Math.random() > 0.5;
        const baseY = onPlatform ? platforms[platforms.length - 1].y : groundY;
        cereals.push({
          x: canvas.width,
          y: baseY - 40 - Math.random() * 80,
          width: 35,
          height: 35,
          collected: false
        });
      }
    };

    const update = (time: number) => {
      if (currentTimeLeft <= 0) {
        setGameOver(true);
        setScore(currentScore);
        return;
      }

      if (time - lastSecond > 1000) {
        currentTimeLeft--;
        setTimeLeft(currentTimeLeft);
        lastSecond = time;
      }

      const groundY = canvas.height - 100;
      const speedMult = isSpeedingRef.current ? 2 : 1;
      let currentSpeed = gameSpeed * speedMult;

      if (slowdownTimer > 0) {
        slowdownTimer--;
        currentSpeed *= 0.4;
      }
      if (hitTimer > 0) {
        hitTimer--;
      }

      // Update clouds
      for (let i = 0; i < clouds.length; i++) {
        clouds[i].x -= clouds[i].speed * speedMult;
        if (clouds[i].x + clouds[i].width + clouds[i].height < 0) {
          clouds[i].x = canvas.width + clouds[i].height;
          clouds[i].y = 50 + Math.random() * (canvas.height / 3);
        }
      }

      // Player physics
      player.vy += player.gravity;
      player.y += player.vy;

      let currentGroundY = groundY;
      let onGround = false;

      // Check platform collisions (only when falling)
      if (player.vy >= 0) {
        for (const plat of platforms) {
          if (
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height >= plat.y &&
            player.y + player.height - player.vy <= plat.y + 15
          ) {
            currentGroundY = plat.y;
            onGround = true;
            break;
          }
        }
      }

      if (player.y > currentGroundY - player.height) {
        player.y = currentGroundY - player.height;
        player.vy = 0;
        player.jumps = 0;
        onGround = true;
      }

      if (jumpTriggerRef.current) {
        if (onGround || player.jumps === 0) {
          player.vy = player.jumpPower;
          player.jumps = 1;
        } else if (player.jumps === 1) {
          player.vy = player.doubleJumpPower;
          player.jumps = 2;
        }
        jumpTriggerRef.current = false;
      }

      // Spawn
      spawnEntity();

      // Update entities
      for (let i = platforms.length - 1; i >= 0; i--) {
        platforms[i].x -= currentSpeed;
        if (platforms[i].x + platforms[i].width < 0) {
          platforms.splice(i, 1);
        }
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= currentSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1);
        } else if (!obstacles[i].hit) {
          // Collision (make hitbox slightly smaller than visual for fairness)
          const hitMargin = 10;
          if (
            player.x + hitMargin < obstacles[i].x + obstacles[i].width &&
            player.x + player.width - hitMargin > obstacles[i].x &&
            player.y + hitMargin < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
          ) {
            obstacles[i].hit = true;
            currentScore = Math.max(0, currentScore - 5);
            setScore(currentScore);
            hitTimer = 30;
            slowdownTimer = 60;
          }
        }
      }

      for (let i = cereals.length - 1; i >= 0; i--) {
        cereals[i].x -= currentSpeed;
        if (cereals[i].x + cereals[i].width < 0) {
          cereals.splice(i, 1);
        } else if (!cereals[i].collected) {
          // Collision
          if (
            player.x < cereals[i].x + cereals[i].width &&
            player.x + player.width > cereals[i].x &&
            player.y < cereals[i].y + cereals[i].height &&
            player.y + player.height > cereals[i].y
          ) {
            cereals[i].collected = true;
            currentScore += 10;
            setScore(currentScore);
          }
        }
      }

      // Draw
      ctx.fillStyle = '#eeaccd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clouds
      for (const cloud of clouds) {
        const gradient = ctx.createLinearGradient(0, cloud.y - cloud.height, 0, cloud.y + cloud.height/2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#da599c');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.height/2, Math.PI/2, Math.PI*1.5);
        ctx.lineTo(cloud.x + cloud.width, cloud.y - cloud.height/2);
        ctx.arc(cloud.x + cloud.width, cloud.y, cloud.height/2, Math.PI*1.5, Math.PI/2);
        ctx.lineTo(cloud.x, cloud.y + cloud.height/2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(cloud.x + cloud.width*0.3, cloud.y - cloud.height*0.3, cloud.height*0.6, 0, Math.PI*2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(cloud.x + cloud.width*0.7, cloud.y - cloud.height*0.4, cloud.height*0.7, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Ground
      ctx.fillStyle = '#da599c';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.fillStyle = '#9f417c';
      ctx.fillRect(0, groundY, canvas.width, 10);

      // Player
      if (monsterImg.complete) {
        if (hitTimer > 0) {
          ctx.globalAlpha = (Math.floor(hitTimer / 4) % 2 === 0) ? 0.3 : 0.8;
          const offsetX = (Math.random() - 0.5) * 4;
          ctx.drawImage(monsterImg, player.x + offsetX, player.y, player.width, player.height);
          ctx.globalAlpha = 1.0;
        } else {
          ctx.drawImage(monsterImg, player.x, player.y, player.width, player.height);
        }
      }

      // Platforms
      for (const plat of platforms) {
        ctx.fillStyle = '#da599c';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 10);
        ctx.fill();
        ctx.fillStyle = '#eeaccd';
        ctx.beginPath();
        ctx.roundRect(plat.x + 2, plat.y + 2, plat.width - 4, 6, 4);
        ctx.fill();
      }

      // Obstacles
      for (const obs of obstacles) {
        ctx.globalAlpha = obs.hit ? 0.5 : 1.0;
        
        ctx.fillStyle = '#7a285d';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.fill();
        
        ctx.fillStyle = '#9f417c';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y + 10);
        ctx.lineTo(obs.x + obs.width - 5, obs.y + obs.height);
        ctx.lineTo(obs.x + 5, obs.y + obs.height);
        ctx.fill();

        ctx.globalAlpha = 1.0;
      }

      // Cereals
      for (const cer of cereals) {
        if (!cer.collected) {
          if (cerealImg.complete) {
            ctx.drawImage(cerealImg, cer.x, cer.y, cer.width, cer.height);
          }
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleJumpStart = (e: React.SyntheticEvent) => { e.preventDefault(); jumpTriggerRef.current = true; };
  const handleJumpEnd = (e: React.SyntheticEvent) => { e.preventDefault(); };
  const handleSpeedStart = (e: React.SyntheticEvent) => { e.preventDefault(); isSpeedingRef.current = true; };
  const handleSpeedEnd = (e: React.SyntheticEvent) => { e.preventDefault(); isSpeedingRef.current = false; };

  return (
    <div className="fixed inset-0 bg-[#eeaccd] z-50 flex flex-col font-sans touch-none">
      {/* Top UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="bg-white px-4 py-2 rounded-full border-2 border-[#da599c] text-[#7a285d] font-bold text-xl shadow-md">
          ⏱ {timeLeft}s
        </div>
        <div className="bg-white px-4 py-2 rounded-full border-2 border-[#da599c] text-[#7a285d] font-bold text-xl shadow-md">
          ⭐ {score}
        </div>
      </div>

      {/* Game Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block"
      />

      {/* Controls */}
      {!gameOver && (
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex gap-2 sm:gap-4 z-10">
          <button 
            onPointerDown={handleJumpStart}
            onPointerUp={handleJumpEnd}
            onPointerLeave={handleJumpEnd}
            onContextMenu={(e) => e.preventDefault()}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-[#da599c]/70 active:bg-[#9f417c] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl shadow-md border-2 border-white/50 select-none touch-none backdrop-blur-sm"
          >
            ⬆️
          </button>
          <button 
            onPointerDown={handleSpeedStart}
            onPointerUp={handleSpeedEnd}
            onPointerLeave={handleSpeedEnd}
            onContextMenu={(e) => e.preventDefault()}
            className="h-14 sm:h-16 px-4 sm:px-6 bg-[#da599c]/70 active:bg-[#9f417c] rounded-full flex items-center justify-center text-white text-sm sm:text-xl font-bold shadow-md border-2 border-white/50 select-none touch-none backdrop-blur-sm"
          >
            SPEED ⚡
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-[#7a285d]/80 flex flex-col items-center justify-center z-20 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-[#da599c]">
            <h2 className="text-4xl font-black text-[#da599c] mb-2">Tempo Scaduto!</h2>
            <p className="text-2xl text-[#7a285d] font-bold mb-8">Hai raccolto: <br/><span className="text-5xl">{score}</span><br/> Monster Points!</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  onGameEnd(score);
                  onClose();
                }}
                className="w-full py-4 bg-[#da599c] hover:bg-[#9f417c] text-white rounded-full font-bold text-xl shadow-md transition transform hover:scale-105"
              >
                Riscatta e Torna all'App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
