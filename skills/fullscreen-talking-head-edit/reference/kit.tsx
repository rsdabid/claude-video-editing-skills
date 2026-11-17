import React from 'react';

/* Icon + depth kit for the full-screen talking-head ("blue") edit. Remotion/React, no other deps.
   Vector icons are Lucide paths (MIT). Icons are flat Apple-style squircles with a soft top-to-bottom gradient and a
   shadow in the icon's own colour; cards are dark frosted panels. */

type IconName = 'hourglass' | 'user' | 'mic' | 'dumbbell' | 'bot' | 'sparkles' | 'gamepad' | 'house' | 'trend' | 'link' | 'lock' | 'message' | 'heart' | 'check'
  | 'mail' | 'send' | 'play' | 'briefcase' | 'bookmark' | 'arrowLeft' | 'moreV' | 'moreH' | 'phone' | 'videoCam' | 'checks';
const PATHS: Record<IconName, string[]> = {
  hourglass: ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22', 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
  mic: ['M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 19v3'],
  dumbbell: ['M14.4 14.4 9.6 9.6', 'M18.66 21.51a2 2 0 1 1-2.83-2.83l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.37-6.37a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83Z',
    'm21.5 21.5-1.4-1.4', 'M3.9 3.9 2.5 2.5', 'M6.4 12.77a2 2 0 1 1-2.83-2.83l1.77-1.77a2 2 0 1 1-2.83-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.77a2 2 0 1 1 2.83 2.83Z'],
  bot: ['M12 8V4H8', 'M4 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z', 'M2 14h2', 'M20 14h2', 'M15 13v2', 'M9 13v2'],
  sparkles: ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    'M20 3v4', 'M22 5h-4', 'M4 17v2', 'M5 18H3'],
  gamepad: ['M6 11h4', 'M8 9v4', 'M15 12h.01', 'M18 10h.01', 'M17.32 5H6.68a4 4 0 0 0-3.98 3.59l-.6 6.04A3 3 0 0 0 5.08 18c1.04 0 1.93-.6 2.38-1.5L8.5 15h7l1.05 1.5A2.7 2.7 0 0 0 18.92 18a3 3 0 0 0 2.98-3.37l-.6-6.04A4 4 0 0 0 17.32 5Z'],
  house: ['M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', 'M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'],
  trend: ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
  link: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
  lock: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  message: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  check: ['M20 6 9 17l-5-5'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
  send: ['M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11Z', 'm21.85 2.15-10.94 10.94'],
  play: ['M6 3l14 9-14 9V3Z'],
  briefcase: ['M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 'M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z'],
  bookmark: ['m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'],
  arrowLeft: ['m12 19-7-7 7-7', 'M19 12H5'],
  moreV: ['M12 5h.01', 'M12 12h.01', 'M12 19h.01'],
  moreH: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
  videoCam: ['m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5', 'M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z'],
  checks: ['M18 6 7 17l-5-5', 'm22 10-7.5 7.5L13 16'],
};
export type {IconName};

export const Ico: React.FC<{name: IconName; size: number; color?: string; width?: number; fill?: string; style?: React.CSSProperties}> = ({name, size, color = '#FFFFFF', width = 2, fill = 'none', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {PATHS[name].map((d, i) => <path key={i} d={d} />)}
  </svg>
);

/* hex -> rgba, for shadows in an object's own colour */
export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/* the card surface on the blue edit: a dark frosted panel, hairline rim, soft shadow (no 3D bevel) */
export const GLASS_BG = 'linear-gradient(180deg, rgba(44,50,104,0.94) 0%, rgba(24,28,66,0.96) 100%)';
export const GLASS_SHADOW = 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.08), 0 18px 44px rgba(0,0,0,0.38)';
export const glass = (extra: React.CSSProperties = {}): React.CSSProperties => ({background: GLASS_BG, boxShadow: GLASS_SHADOW, ...extra});

/* an Apple-style app icon */
export const Tile: React.FC<{icon: IconName; size: number; c1: string; c2: string; round?: boolean; iconColor?: string; solid?: boolean}> = ({icon, size, c1, c2, round, iconColor, solid}) => {
  const r = round ? size / 2 : size * 0.225;
  return (
    <div style={{position: 'relative', width: size, height: size, borderRadius: r, background: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 26px ${rgba(c2, 0.45)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Ico name={icon} size={size * 0.52} color={iconColor || '#FFFFFF'} width={2.2} fill={solid ? (iconColor || '#FFFFFF') : 'none'} />
    </div>
  );
};

/* a flat disc with a gentle gradient (tokens, streak days); shadow in its own colour */
export const sphere = (c1: string, c2: string): React.CSSProperties => ({
  background: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 10px 24px ${rgba(c2, 0.4)}`,
});

/* a neutral profile picture (no real client faces): the default-avatar silhouette */
export const DefaultAvatar: React.FC<{size: number; bg?: string; fg?: string}> = ({size, bg = '#6A7175', fg = '#CFD4D6'}) => (
  <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: bg, position: 'relative', flexShrink: 0}}>
    <div style={{position: 'absolute', left: '50%', top: '20%', width: '40%', height: '40%', borderRadius: '50%', background: fg, transform: 'translateX(-50%)'}} />
    <div style={{position: 'absolute', left: '50%', top: '66%', width: '76%', height: '70%', borderRadius: '50%', background: fg, transform: 'translateX(-50%)'}} />
  </div>
);

/* an account bubble: a niche tile inside an Instagram story ring */
export const RingTile: React.FC<{icon: IconName; c1: string; c2: string; size: number; ring?: boolean}> = ({icon, c1, c2, size, ring = true}) => (
  <div style={{width: size, height: size, borderRadius: '50%', padding: size * 0.045,
    background: ring ? 'conic-gradient(from 200deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)' : 'rgba(255,255,255,0.18)', boxShadow: '0 10px 22px rgba(0,0,0,0.3)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: '50%', padding: size * 0.03, background: '#000000'}}>
      <Tile icon={icon} size={size * 0.84} c1={c1} c2={c2} round solid={icon === 'sparkles'} />
    </div>
  </div>
);
