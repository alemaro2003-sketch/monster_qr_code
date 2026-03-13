import React, { useState, useRef, useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import MiniGame from './MiniGame';
import MazeGame from './MazeGame';
import { ACCESSORIES, Accessory, AccessoryCategory, getAccessoriesSvg } from './accessories';

const Confetti = () => {
  const colors = ['#eeaccd', '#da599c', '#9f417c', '#ffffff', '#ffd700'];
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 60 }).map((_, i) => {
      const isCircle = Math.random() > 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = `${Math.random() * 100}%`;
      const animationDuration = 2.5 + Math.random() * 2.5;
      const delay = Math.random() * 2;
      const size = 6 + Math.random() * 8;

      return (
        <motion.div
          key={i}
          initial={{ y: -50, x: 0, rotate: 0 }}
          animate={{ 
            y: '120vh', 
            x: Math.random() * 150 - 75,
            rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{ 
            duration: animationDuration, 
            delay: delay, 
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute ${isCircle ? 'rounded-full' : 'rounded-sm'} shadow-sm`}
          style={{ backgroundColor: color, left, width: size, height: size }}
        />
      );
    });
    setPieces(newPieces);
  }, []);

  return <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">{pieces}</div>;
};

export const HeartCereal = ({ x, y, rotation, isPink }: { key?: number | string, x: number, y: number, rotation: number, isPink: boolean }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(1.8)`}>
    <path 
      d="M 2,6 A 4,4 0,0,1 10,6 A 4,4 0,0,1 18,6 Q 18,12 10,18 Q 2,12 2,6 z" 
      fill={isPink ? "#ff99cc" : "#fff0b3"} 
      stroke="#d96699"
      strokeWidth="1"
    />
    <path 
      d="M 6,8 A 2,2 0,0,1 10,8 A 2,2 0,0,1 14,8 Q 14,10 10,13 Q 6,10 6,8 z" 
      fill="#cccccc" 
    />
  </g>
);

export const MonsterSVG = ({ satiety, isChewing, svgRef, equippedAccessories = {}, isEvil = false }: { satiety: number, isChewing: boolean, svgRef?: any, equippedAccessories?: Record<string, string | null>, isEvil?: boolean }) => {
  const isFull = satiety >= 100;
  const bodyColor = isEvil ? '#39ff14' : '#e63995';
  const scleraColor = isEvil ? '#ff0000' : 'white';
  const pupilColor = isEvil ? 'black' : '#06a2bf';
  const tongueColor = isEvil ? 'black' : '#8a1c59';
  
  const cereals = [];
  // Generate more cereals as satiety increases
  for (let i = 0; i < satiety * 2.5; i++) {
    const pseudoRandomX = (Math.sin(i * 1234) * 0.5 + 0.5);
    const pseudoRandomY = (Math.cos(i * 4321) * 0.5 + 0.5);
    
    // Spread cereals across the mouth width
    const x = 150 + pseudoRandomX * 200;
    // Stack cereals from bottom to top. Use a fixed simulated satiety so old cereals don't move.
    const simulatedSatiety = Math.min(100, (i / 2.5) + 10);
    const y = 420 - (pseudoRandomY * 120) * (simulatedSatiety / 100) - (i * 0.5);
    const rotation = pseudoRandomX * 360;
    const isPink = i % 2 === 0;
    
    cereals.push(
      <motion.g 
        key={i}
        initial={{ opacity: 0, y: -100, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: (i % 25) * 0.02 }}
      >
        <HeartCereal x={x} y={y} rotation={rotation} isPink={isPink} />
      </motion.g>
    );
  }

  return (
    <svg ref={svgRef} viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl overflow-visible">
      <defs>
        <clipPath id="mouthClip">
          <motion.path 
            animate={isChewing ? { 
              d: [
                "M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z",
                "M 130 290 L 370 290 L 370 330 C 370 390, 130 390, 130 330 Z",
                "M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z"
              ]
            } : {}}
            transition={{ duration: 0.3, repeat: 5 }}
            d="M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z" 
          />
        </clipPath>
      </defs>
      
      {/* Body - Domed head, tiny right-leaning tufts, expression shifted down */}
      <path 
        d="M 125 490 C 105 490, 85 470, 85 450 L 75 400 L 55 420 L 75 340 L 55 350 L 75 270 L 55 280 L 95 150 C 95 80, 115 30, 165 40 C 135 50, 125 80, 145 110 Q 217.5 70, 300 95 L 310 85 L 315 100 L 325 90 L 330 105 L 340 95 L 345 110 C 365 80, 365 50, 335 40 C 385 30, 405 80, 405 150 L 445 280 L 425 270 L 445 350 L 425 340 L 445 420 L 425 400 L 415 450 C 415 470, 395 490, 375 490 Z" 
        fill={bodyColor} 
      />

      {isEvil && (
        <g id="evil-eyebrows">
          <path d="M 160 160 L 230 190" stroke="black" strokeWidth="12" strokeLinecap="round" />
          <path d="M 340 160 L 270 190" stroke="black" strokeWidth="12" strokeLinecap="round" />
        </g>
      )}

      {/* Eyes with Blink Animation */}
      <motion.g 
        animate={isFull ? {} : { scaleY: [1, 1, 0.1, 1, 1] }} 
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.45, 0.5, 0.55, 1] }}
        style={{ transformOrigin: "250px 220px" }}
      >
        {isFull ? (
          <>
            {/* Happy Eyes (closed curves) */}
            <path d="M 170 220 Q 205 180 240 220" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
            <path d="M 260 220 Q 295 180 330 220" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Left Eye (larger, oval, slightly spaced out) */}
            <ellipse cx="205" cy="220" rx="45" ry="55" fill={scleraColor} />
            {/* Right Eye (smaller, oval, slightly spaced out) */}
            <ellipse cx="295" cy="220" rx="35" ry="45" fill={scleraColor} />
            
            {/* Irises & Pupils with Look Around Animation */}
            <motion.g
              animate={{ x: [0, 5, 5, -5, -5, 0], y: [0, 3, 3, -3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              {/* Left Iris & Pupil */}
              <ellipse cx="215" cy="220" rx="20" ry="25" fill={pupilColor} />
              <ellipse cx="220" cy="220" rx="12" ry="15" fill="black" />
              <ellipse cx="225" cy="212" rx="4" ry="5" fill="white" />
              <ellipse cx="215" cy="225" rx="1.5" ry="2" fill="white" />

              {/* Right Iris & Pupil */}
              <ellipse cx="285" cy="220" rx="16" ry="20" fill={pupilColor} />
              <ellipse cx="280" cy="220" rx="10" ry="12" fill="black" />
              <ellipse cx="285" cy="213" rx="3" ry="4" fill="white" />
              <ellipse cx="277" cy="224" rx="1" ry="1.5" fill="white" />
            </motion.g>
          </>
        )}
      </motion.g>

      {/* Mouth Background */}
      <motion.path 
        animate={isChewing ? { 
          d: [
            "M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z",
            "M 130 290 L 370 290 L 370 330 C 370 390, 130 390, 130 330 Z",
            "M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z"
          ]
        } : {}}
        transition={{ duration: 0.3, repeat: 5 }}
        d="M 130 290 L 370 290 L 370 360 C 370 450, 130 450, 130 360 Z" 
        fill="#cccccc" 
      />

      {/* Everything inside the mouth is clipped */}
      <g clipPath="url(#mouthClip)">
        {/* Tongue */}
        <motion.g animate={isChewing ? { y: [0, 10, 0] } : {}} transition={{ duration: 0.3, repeat: 5 }}>
          <motion.path 
            animate={{ 
              d: [
                "M 250 415 C 250 385, 190 385, 190 415 C 190 435, 250 445, 250 445 C 250 445, 310 435, 310 415 C 310 385, 250 385, 250 415 Z",
                "M 250 415 C 250 395, 190 395, 190 415 C 190 435, 250 445, 250 445 C 250 445, 310 435, 310 415 C 310 395, 250 395, 250 415 Z",
                "M 250 415 C 250 385, 190 385, 190 415 C 190 435, 250 445, 250 445 C 250 445, 310 435, 310 415 C 310 385, 250 385, 250 415 Z"
              ] 
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            fill={tongueColor} 
          />
        </motion.g>

        {/* Cereals */}
        <motion.g animate={isChewing ? { y: [0, 15, 0] } : {}} transition={{ duration: 0.3, repeat: 5 }}>
          {!isFull && cereals}
        </motion.g>

        {/* Top Teeth (6 teeth) - Large outer, 4 small identical inner, centered in smaller mouth */}
        <g>
          {/* Large Left */}
          <polygon points="145,290 180,290 162.5,350" fill="white" />
          {/* 4 Small Identical Inner */}
          <polygon points="180,290 215,290 197.5,325" fill="white" />
          <polygon points="215,290 250,290 232.5,325" fill="white" />
          <polygon points="250,290 285,290 267.5,325" fill="white" />
          <polygon points="285,290 320,290 302.5,325" fill="white" />
          {/* Large Right */}
          <polygon points="320,290 355,290 337.5,350" fill="white" />
        </g>

        {/* Bottom Teeth (2 teeth) - Tilted inward, adjusted for smaller mouth */}
        <motion.g animate={isChewing ? { y: [0, -30, 0] } : {}} transition={{ duration: 0.3, repeat: 5 }}>
          {/* Left Bottom Tooth - tilted inward (right) */}
          <g transform="translate(160, 435) rotate(15)">
            <polygon points="-12,0 12,0 0,-40" fill="white" />
          </g>
          {/* Right Bottom Tooth - tilted inward (left) */}
          <g transform="translate(340, 435) rotate(-15)">
            <polygon points="-12,0 12,0 0,-40" fill="white" />
          </g>
        </motion.g>
      </g>

      {/* Accessori */}
      <g dangerouslySetInnerHTML={{ __html: getAccessoriesSvg(equippedAccessories) }} />
    </svg>
  );
};

export default function App() {
  const [satiety, setSatiety] = useState(0);
  const [isChewing, setIsChewing] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [activeGame, setActiveGame] = useState<'jump' | 'maze' | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [shopMessage, setShopMessage] = useState<string | null>(null);
  const [unlockedAccessories, setUnlockedAccessories] = useState<string[]>(() => JSON.parse(localStorage.getItem('unlockedAccessories') || '[]'));
  const [equippedAccessories, setEquippedAccessories] = useState<Record<AccessoryCategory, string | null>>(() => JSON.parse(localStorage.getItem('equippedAccessories') || '{"hat":null,"glasses":null,"piercing":null,"bow":null,"neck":null,"eyes":null}'));
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('monsterPoints') || '0'));
  const [hasReached1000, setHasReached1000] = useState(() => localStorage.getItem('hasReached1000') === 'true');
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);
  const [monsterName, setMonsterName] = useState(() => localStorage.getItem('monsterName') || '');
  const [isEditingName, setIsEditingName] = useState(() => !localStorage.getItem('monsterName'));
  const count = useMotionValue(points);
  const rounded = useTransform(count, Math.round);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const animation = animate(count, points, { duration: 1.5, ease: "easeOut" });
    localStorage.setItem('monsterPoints', points.toString());
    if (points >= 1000 && !hasReached1000) {
      setHasReached1000(true);
      localStorage.setItem('hasReached1000', 'true');
      setShowUnlockMessage(true);
      setTimeout(() => setShowUnlockMessage(false), 4000);
    }
    return animation.stop;
  }, [points, hasReached1000]);

  useEffect(() => {
    localStorage.setItem('unlockedAccessories', JSON.stringify(unlockedAccessories));
  }, [unlockedAccessories]);

  useEffect(() => {
    localStorage.setItem('equippedAccessories', JSON.stringify(equippedAccessories));
  }, [equippedAccessories]);

  useEffect(() => {
    localStorage.setItem('monsterName', monsterName);
  }, [monsterName]);

  const buyAccessory = (acc: Accessory) => {
    if (points >= acc.price) {
      setPoints(p => p - acc.price);
      setUnlockedAccessories(prev => [...prev, acc.id]);
      setShopMessage(`Hai sbloccato: ${acc.name}!`);
      setTimeout(() => setShopMessage(null), 2000);
    }
  };

  const toggleEquip = (acc: Accessory) => {
    setEquippedAccessories(prev => ({
      ...prev,
      [acc.category]: prev[acc.category] === acc.id ? null : acc.id
    }));
  };

  const feedMonster = () => {
    if (satiety < 100 && !isChewing) {
      setIsChewing(true);
      const newSatiety = Math.min(satiety + 10, 100);
      setSatiety(newSatiety);
      
      if (newSatiety === 100) {
        setTimeout(() => {
          setPoints(p => p + 50);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 3000);
        }, 1500);
      }

      setTimeout(() => {
        setIsChewing(false);
      }, 1500);
    }
  };

  const handleDragEnd = (e: any, info: any) => {
    if (!isChewing && satiety < 100) {
      // Se il cucchiaio viene trascinato verso l'alto (verso il mostro) di almeno 50 pixel
      if (info.offset.y < -50) {
        feedMonster();
      }
    }
  };

  const reset = () => {
    setSatiety(0);
    setShowReward(false);
  };

  const filledBars = Math.floor(satiety / 10);
  const emptyBars = 10 - filledBars;
  const progressBar = `[${'█'.repeat(filledBars)}${'░'.repeat(emptyBars)}] ${satiety}%`;

  let monsterSays = "";
  const displayName = monsterName.trim() || "mostro";

  if (satiety === 0) {
    monsterSays = `Ciao! Io sono ${displayName}. Più punti guadagni facendo colazione e giocando, più diventerò grande e forte! Con i punti accumulati, potrai anche sbloccare fantastici accessori per personalizzare il mio look. Iniziamo?`;
  } else if (satiety < 100) {
    const messages = [
      "Gnam! Che buono questo cucchiaio di cereali! Riusciamo a farne un altro insieme?",
      "Crunch crunch! Adoro questi cereali a forma di cuoricino! Forza, il prossimo sarà ancora più gustoso!",
      "Slurp! Ancora, ancora! Un altro cucchiaio per te, un altro per me! Vai!",
      "Mmmmh! La mia bocca rosa è felicissima! Aspetto il prossimo cucchiaio!",
      "Wow! Che sapore spaziale! Siamo a buon punto! Un altro bel cucchiaio pieno!"
    ];
    monsterSays = messages[(satiety / 10 - 1) % messages.length];
  } else {
    monsterSays = "BURP! Ops, scusa! Sono pienissimo! Evviva! Abbiamo finito la colazione insieme! Sei stato un campione!";
  }

  if (activeGame === 'jump') {
    return (
      <MiniGame 
        onGameEnd={(p) => {
          setPoints(prev => prev + p);
          setActiveGame(null);
        }} 
        onClose={() => setActiveGame(null)} 
        equippedAccessories={equippedAccessories}
      />
    );
  }

  if (activeGame === 'maze') {
    return (
      <MazeGame 
        onGameEnd={(p) => {
          setPoints(prev => prev + p);
          setActiveGame(null);
        }} 
        onClose={() => setActiveGame(null)} 
        equippedAccessories={equippedAccessories}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#eeaccd] flex flex-col items-center justify-between p-2 sm:p-4 font-sans overflow-hidden touch-none">
      {satiety >= 100 && <Confetti />}

      <AnimatePresence>
        {showUnlockMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-10 z-[100] bg-[#da599c] text-white font-black px-6 py-3 rounded-full shadow-2xl border-4 border-white text-center"
          >
            🎉 Nuovi oggetti e giochi sbloccati! 🎉
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="w-full max-w-md flex flex-col h-full justify-evenly relative z-10 py-2">
        
        {/* Header with Points and Star */}
        <div className="w-full flex justify-between items-center px-4 shrink-0">
          <button 
            onClick={() => setShowShop(true)}
            className="bg-[#9f417c] hover:bg-[#7a285d] text-white font-bold py-2 px-4 text-sm rounded-full shadow-md transform transition active:scale-95 flex items-center gap-1 z-50 whitespace-nowrap"
          >
            🛍️ SHOP
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border-2 border-[#da599c] shadow-sm">
            <div className="bg-[#7a285d] rounded-full w-7 h-7 flex items-center justify-center shadow-inner">
              <span className="text-sm drop-shadow-sm">⭐</span>
            </div>
            <motion.span className="font-bold text-[#7a285d] text-lg min-w-[3ch] text-right">
              {rounded}
            </motion.span>
          </div>
        </div>

        {/* Name Area (Above Mascot) */}
        <div className="w-full px-4 shrink-0 flex justify-center z-20">
          {isEditingName ? (
            <input
              type="text"
              value={monsterName}
              onChange={(e) => setMonsterName(e.target.value)}
              onBlur={() => {
                if (monsterName.trim()) setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && monsterName.trim()) setIsEditingName(false);
              }}
              placeholder="Dai un nome al tuo mostro..."
              autoFocus
              className="w-3/4 bg-white/60 backdrop-blur-md border-2 border-white/40 rounded-2xl py-1 px-4 text-center font-bold text-[#7a285d] placeholder-[#7a285d]/50 focus:outline-none focus:ring-2 focus:ring-[#da599c] shadow-sm transition-all"
            />
          ) : (
            <div 
              onClick={() => setIsEditingName(true)}
              className="text-center cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="font-black text-2xl text-[#7a285d] drop-shadow-sm">
                {monsterName}
              </span>
            </div>
          )}
        </div>

        {/* Monster Area */}
        <div className="flex-1 flex justify-center items-center relative overflow-visible min-h-0 my-8">
          <AnimatePresence>
            {showReward && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -20 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {/* Glow effect */}
                <motion.div 
                  className="absolute w-64 h-64 bg-white/60 rounded-full blur-3xl"
                  animate={{ scale: [1, 2, 1.5], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <div className="text-4xl sm:text-5xl font-black text-[#da599c] drop-shadow-[0_4px_10px_rgba(159,65,124,0.8)] text-center relative z-10" style={{ WebkitTextStroke: '1.5px #ffffff' }}>
                  +50 <br/> Monster Points!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="w-full h-full max-w-[380px] sm:max-w-[440px] flex items-center justify-center"
            animate={
              satiety >= 100 
                ? { y: [0, -15, 0, -15, 0], rotate: [0, -4, 4, -4, 4, 0], scale: [1, 1.03, 1, 1.03, 1] } 
                : isChewing 
                  ? { scale: [1, 1.03, 1], rotate: [0, 2, -2, 0] } 
                  : { scale: [1, 1.01, 1], rotate: [0, 1, -1, 0] }
            } 
            transition={
              satiety >= 100 
                ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                : isChewing 
                  ? { repeat: Infinity, duration: 0.5 } 
                  : { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }
          >
            <MonsterSVG satiety={satiety} isChewing={isChewing} svgRef={svgRef} equippedAccessories={equippedAccessories} />
          </motion.div>
        </div>
        
        {/* Dialogue Area */}
        <div className="px-4 shrink-0 flex flex-col gap-3 relative z-20">
          
          {/* Satiety Bar */}
          <div className="bg-white rounded-xl p-2 border-2 border-[#9f417c] relative shadow-sm">
            <div className="absolute -top-3 left-4 bg-[#9f417c] text-white px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider shadow-sm">
              PROGRESSO:
            </div>
            <p className="text-sm sm:text-base font-mono text-[#7a285d] mt-1 text-center tracking-widest font-bold">
              {progressBar}
            </p>
          </div>

          {/* Il Mostro Dice */}
          <motion.div 
            key={`msg-${satiety}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#eeaccd] rounded-xl p-3 border-2 border-[#da599c] relative shadow-sm"
          >
            <div className="absolute -top-3 left-4 bg-[#da599c] text-white px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider shadow-sm uppercase">
              {monsterName.trim() ? `${monsterName} DICE:` : 'IL MOSTRO DICE:'}
            </div>
            <motion.p 
              key={`text-${satiety}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xs sm:text-sm font-medium text-[#7a285d] mt-1 leading-tight"
            >
              "{monsterSays}"
            </motion.p>
          </motion.div>

          {/* Interaction Area */}
          <div className="pt-1">
            {satiety < 100 ? (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-[#7a285d] font-bold uppercase tracking-wider text-xs sm:text-sm drop-shadow-sm text-center whitespace-nowrap">Trascina il cucchiaio per dare la pappa:</span>
                
                <div className="relative p-2 bg-[#eeaccd] rounded-full border-2 border-dashed border-[#da599c] mt-1">
                  <motion.div
                    drag
                    dragSnapToOrigin
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 1.3, rotate: -20 }}
                    className={`text-6xl sm:text-7xl cursor-grab active:cursor-grabbing drop-shadow-xl z-50 ${isChewing ? 'opacity-50 pointer-events-none' : ''}`}
                    title="Trascina il cucchiaio nella bocca del mostro!"
                  >
                    🥄
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button 
                  onClick={reset}
                  className="bg-[#da599c] hover:bg-[#9f417c] text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-1"
                >
                  <span className="text-lg">🔄</span> Ancora!
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="w-full flex justify-end px-4 shrink-0 mt-2">
          <button 
            onClick={() => setShowGameSelection(true)}
            className="bg-[#9f417c] hover:bg-[#7a285d] text-white font-bold py-2 px-4 text-sm rounded-full shadow-md transform transition active:scale-95 flex items-center gap-1.5 z-50 whitespace-nowrap"
          >
            🎮 GIOCA ORA
          </button>
        </div>
      </div>

      {/* Game Selection Modal */}
      <AnimatePresence>
        {showGameSelection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="p-4 bg-[#da599c] text-white flex justify-between items-center shadow-md">
              <h2 className="text-2xl font-black tracking-wide">GIOCHI</h2>
              <button onClick={() => setShowGameSelection(false)} className="text-white font-bold text-xl px-2">✕</button>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              {/* Game 1 */}
              <div 
                onClick={() => {
                  setActiveGame('jump');
                  setShowGameSelection(false);
                }}
                className="bg-white border-4 border-[#da599c] rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                <div className="text-6xl mb-4">☁️</div>
                <h3 className="text-2xl font-black text-[#7a285d] mb-2">Salto tra le Nuvole</h3>
                <p className="text-[#9f417c] font-medium">Salta più in alto che puoi per raccogliere cereali!</p>
              </div>

              {/* Game 2 */}
              <div 
                onClick={() => {
                  if (hasReached1000) {
                    setActiveGame('maze');
                    setShowGameSelection(false);
                  }
                }}
                className={`bg-white border-4 rounded-3xl p-6 flex flex-col items-center text-center transition-transform shadow-lg relative overflow-hidden ${hasReached1000 ? 'border-[#da599c] cursor-pointer hover:scale-105' : 'border-gray-300 opacity-80'}`}
              >
                {!hasReached1000 && (
                  <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">🔒</span>
                    <span className="font-black text-gray-600 bg-white px-4 py-1 rounded-full shadow-sm">Sbloccabile a 1000 MP</span>
                  </div>
                )}
                <div className="text-6xl mb-4">🌀</div>
                <h3 className="text-2xl font-black text-[#7a285d] mb-2">Labirinto dei Cereali</h3>
                <p className="text-[#9f417c] font-medium">Sfuggi al mostro cattivo e raccogli i cereali!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="p-4 bg-[#9f417c] text-white flex justify-between items-center shadow-md">
              <h2 className="text-2xl font-black tracking-wide">SHOP ACCESSORI</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span>⭐</span>
                  <span className="font-bold">{points} MP</span>
                </div>
                <button onClick={() => setShowShop(false)} className="text-white font-bold text-xl px-2">✕</button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4">
              {ACCESSORIES.map(acc => {
                const isUnlocked = unlockedAccessories.includes(acc.id);
                const isEquipped = equippedAccessories[acc.category] === acc.id;
                const canAfford = points >= acc.price;
                const isLockedByPoints = !hasReached1000 && ['bowtie', 'aviator', 'eyelashes', 'piercing_silver'].includes(acc.id);
                
                return (
                  <div key={acc.id} className={`border-2 rounded-2xl p-4 flex flex-col items-center text-center gap-2 relative ${isLockedByPoints ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white'}`}>
                    {isLockedByPoints && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl">
                        <span className="text-2xl mb-1">🔒</span>
                        <span className="font-bold text-[10px] text-gray-600 bg-white px-2 py-0.5 rounded-full shadow-sm">1000 MP</span>
                      </div>
                    )}
                    <div className={`w-20 h-20 mb-2 flex items-center justify-center ${isLockedByPoints ? 'grayscale opacity-50' : ''}`}>
                      <svg viewBox={acc.viewBox} className="w-full h-full drop-shadow-md overflow-visible">
                        <g dangerouslySetInnerHTML={{ __html: getAccessoriesSvg({ [acc.category]: acc.id }) }} />
                      </svg>
                    </div>
                    <div className="font-bold text-[#7a285d] text-sm">{acc.name}</div>
                    {!isUnlocked && (
                      <div className="text-xs font-bold text-[#da599c] bg-[#eeaccd]/30 px-2 py-1 rounded-full">
                        ⭐ {acc.price}
                      </div>
                    )}
                    
                    {isUnlocked ? (
                      <button 
                        onClick={() => toggleEquip(acc)}
                        disabled={isLockedByPoints}
                        className={`mt-2 w-full py-2 rounded-xl font-bold text-sm transition ${isEquipped ? 'bg-[#7a285d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {isEquipped ? 'Indossato' : 'Indossa'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => buyAccessory(acc)}
                        disabled={!canAfford || isLockedByPoints}
                        className={`mt-2 w-full py-2 rounded-xl font-bold text-sm transition ${canAfford && !isLockedByPoints ? 'bg-[#da599c] text-white hover:bg-[#9f417c]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        Acquista
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          
      <AnimatePresence>
        {shopMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#da599c] text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-2xl z-[70]"
          >
            {shopMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
