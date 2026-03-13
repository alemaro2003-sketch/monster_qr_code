export type AccessoryCategory = 'hat' | 'glasses' | 'piercing' | 'bow' | 'neck' | 'eyes';

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  viewBox: string;
}

export const ACCESSORIES: Accessory[] = [
  { id: 'beanie', name: 'Berretto Fluo', category: 'hat', price: 150, viewBox: '120 10 260 120' },
  { id: 'tophat', name: 'Cilindro', category: 'hat', price: 150, viewBox: '150 -10 200 120' },
  { id: 'snapback', name: 'Snapback Jeans', category: 'hat', price: 180, viewBox: '100 10 300 120' },
  { id: 'aviator', name: 'Occhiali Aviator', category: 'glasses', price: 100, viewBox: '130 180 240 110' },
  { id: 'oval', name: 'Occhiali Ovali', category: 'glasses', price: 100, viewBox: '120 150 260 140' },
  { id: 'piercing_gold', name: 'Piercing Oro', category: 'piercing', price: 80, viewBox: '95 60 50 50' },
  { id: 'piercing_silver', name: 'Piercing Argento', category: 'piercing', price: 80, viewBox: '95 60 50 50' },
  { id: 'flower_earrings', name: 'Orecchini Fiore', category: 'piercing', price: 120, viewBox: '80 60 340 60' },
  { id: 'bows', name: 'Fiocchi Gialli', category: 'bow', price: 120, viewBox: '60 80 380 120' },
  { id: 'bowtie', name: 'Papillon Nero', category: 'neck', price: 150, viewBox: '180 440 140 60' },
  { id: 'eyelashes', name: 'Ciglia Finte', category: 'eyes', price: 150, viewBox: '130 110 230 90' },
];

export const getAccessoriesSvg = (equippedAccessories: Record<string, string | null>) => {
  let svg = '';
  
  if (equippedAccessories.piercing === 'piercing_gold') {
    svg += `<path d="M 105 85 C 105 105, 135 105, 135 85 C 135 75, 125 70, 120 70" fill="none" stroke="#ffd700" stroke-width="6" stroke-linecap="round" />`;
  } else if (equippedAccessories.piercing === 'piercing_silver') {
    svg += `<path d="M 105 85 C 105 105, 135 105, 135 85 C 135 75, 125 70, 120 70" fill="none" stroke="#e0e0e0" stroke-width="6" stroke-linecap="round" />`;
  } else if (equippedAccessories.piercing === 'flower_earrings') {
    svg += `
    <g transform="translate(125, 85) scale(1.5)">
      <g transform="translate(-10, 0)">
        <circle cx="0" cy="-8" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="0" cy="8" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="-8" cy="0" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="8" cy="0" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="-6" cy="-6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="6" cy="6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="-6" cy="6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="6" cy="-6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="0" cy="0" r="7" fill="#ffcc00" />
      </g>
    </g>
    <g transform="translate(375, 85) scale(1.5)">
      <g transform="translate(10, 0)">
        <circle cx="0" cy="-8" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="0" cy="8" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="-8" cy="0" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="8" cy="0" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="-6" cy="-6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="6" cy="6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="-6" cy="6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="6" cy="-6" r="6" fill="white" stroke="#e0e0e0" stroke-width="0.5" />
        <circle cx="0" cy="0" r="7" fill="#ffcc00" />
      </g>
    </g>`;
  }

  if (equippedAccessories.hat === 'beanie') {
    svg += `<path d="M 140 110 C 140 30, 360 30, 360 110 Q 250 80, 140 110 Z" fill="#39ff14" />`;
    svg += `<ellipse cx="250" cy="35" rx="20" ry="20" fill="#39ff14" />`;
  } else if (equippedAccessories.hat === 'tophat') {
    svg += `<g>
      <rect x="190" y="0" width="120" height="90" fill="#222" rx="5" />
      <rect x="160" y="80" width="180" height="15" fill="#111" rx="5" />
      <rect x="190" y="60" width="120" height="20" fill="#da599c" />
    </g>`;
  } else if (equippedAccessories.hat === 'snapback') {
    svg += `<g>
      <path d="M 120 100 Q 250 100, 380 100 L 380 110 Q 250 110, 120 110 Z" fill="#2c3e50" />
      <path d="M 150 100 C 150 20, 350 20, 350 100 Z" fill="#34495e" />
      <path d="M 170 100 C 170 40, 330 40, 330 100" fill="none" stroke="#2c3e50" stroke-width="2" stroke-dasharray="4 4" />
      <circle cx="250" cy="25" r="5" fill="#2c3e50" />
    </g>`;
  }

  if (equippedAccessories.glasses === 'aviator') {
    svg += `<g>
      <path d="M 150 210 Q 205 190, 245 210 Q 250 270, 205 280 Q 140 270, 150 210 Z" fill="rgba(0,0,0,0.7)" stroke="#7a285d" stroke-width="4" />
      <path d="M 255 210 Q 295 190, 350 210 Q 360 270, 295 280 Q 250 270, 255 210 Z" fill="rgba(0,0,0,0.7)" stroke="#7a285d" stroke-width="4" />
      <path d="M 245 210 Q 250 200, 255 210" fill="none" stroke="#7a285d" stroke-width="4" />
      <path d="M 235 220 Q 250 215, 265 220" fill="none" stroke="#7a285d" stroke-width="2" />
      <path d="M 165 220 Q 180 210, 195 220" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />
      <path d="M 305 220 Q 320 210, 335 220" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />
    </g>`;
  } else if (equippedAccessories.glasses === 'oval') {
    svg += `<g>
      <path d="M 155 220 Q 130 200, 120 180" fill="none" stroke="#00e5ff" stroke-width="6" stroke-linecap="round" />
      <path d="M 335 220 Q 370 200, 380 180" fill="none" stroke="#00e5ff" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="205" cy="220" rx="50" ry="60" fill="rgba(0,0,0,0.3)" stroke="#00e5ff" stroke-width="8" />
      <ellipse cx="295" cy="220" rx="40" ry="50" fill="rgba(0,0,0,0.3)" stroke="#00e5ff" stroke-width="8" />
      <path d="M 250 200 Q 250 200, 260 200" fill="none" stroke="#00e5ff" stroke-width="8" stroke-linecap="round" />
    </g>`;
  }

  if (equippedAccessories.eyes === 'eyelashes') {
    svg += `<g>
      <!-- Left Eye -->
      <path d="M 175 180 Q 150 160 140 145 Q 155 165 178 175 Z" fill="#111" />
      <path d="M 165 195 Q 135 185 125 170 Q 140 185 168 190 Z" fill="#111" />
      <path d="M 162 210 Q 130 210 120 200 Q 135 210 165 205 Z" fill="#111" />
      
      <!-- Right Eye -->
      <path d="M 315 180 Q 340 160 350 145 Q 335 165 312 175 Z" fill="#111" />
      <path d="M 325 195 Q 355 185 365 170 Q 350 185 322 190 Z" fill="#111" />
      <path d="M 328 210 Q 360 210 370 200 Q 355 210 325 205 Z" fill="#111" />
    </g>`;
  }

  if (equippedAccessories.bow === 'bows') {
    svg += `<g transform="translate(115, 130) rotate(-15) scale(2.5)">
      <path d="M 0 0 L -15 -10 L -15 10 Z" fill="#ffcc00" />
      <path d="M 0 0 L 15 -10 L 15 10 Z" fill="#ffcc00" />
      <circle cx="0" cy="0" r="5" fill="#ff9900" />
    </g>
    <g transform="translate(385, 130) rotate(15) scale(2.5)">
      <path d="M 0 0 L -15 -10 L -15 10 Z" fill="#ffcc00" />
      <path d="M 0 0 L 15 -10 L 15 10 Z" fill="#ffcc00" />
      <circle cx="0" cy="0" r="5" fill="#ff9900" />
    </g>`;
  }

  if (equippedAccessories.neck === 'bowtie') {
    svg += `<g transform="translate(250, 465) scale(1.5)">
      <path d="M 0 0 L -25 -15 L -25 15 Z" fill="#1a1a1a" />
      <path d="M 0 0 L 25 -15 L 25 15 Z" fill="#1a1a1a" />
      <rect x="-6" y="-8" width="12" height="16" rx="3" fill="#0d0d0d" />
    </g>`;
  }

  return svg;
};
