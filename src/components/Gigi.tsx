import React from 'react';

// Import all mascot variants
import MascotHappyClap from './mascots/HappyClap';
import MascotHappyCrown from './mascots/HappyCrown';
import MascotHappyCute from './mascots/HappyCute';
import MascotHappyBalloon from './mascots/HappyBalloon';
import MascotSadCry from './mascots/SadCry';
import MascotSadFrustrate from './mascots/SadFrustrate';
import MascotSadSick from './mascots/SadSick';
import MascotShockAwe from './mascots/ShockAwe';

export type GigiEmotion = 
  | 'happy-clap'
  | 'happy-crown'
  | 'happy-cute'
  | 'happy-balloon'
  | 'sad-cry'
  | 'sad-frustrate'
  | 'sad-sick'
  | 'shock-awe';

export type GigiSize = 'sm' | 'md' | 'lg' | 'xl';

interface GigiProps {
  emotion?: GigiEmotion;
  size?: GigiSize;
  animated?: boolean; // For future animation support
}

const SIZE_MAP = {
  sm: 100,
  md: 160,
  lg: 220,
  xl: 300,
};

export default function Gigi({ 
  emotion = 'happy-clap', 
  size = 'md',
  animated = true, // Animation is now enabled by default
}: GigiProps) {
  const pixelSize = SIZE_MAP[size];

  const renderMascot = () => {
    switch (emotion) {
      case 'happy-clap':
        return <MascotHappyClap size={pixelSize} animated={animated} />;
      
      case 'happy-crown':
        return <MascotHappyCrown size={pixelSize} animated={animated} />;
      
      case 'happy-cute':
        return <MascotHappyCute size={pixelSize} animated={animated} />;
      
      case 'happy-balloon':
        return <MascotHappyBalloon size={pixelSize} animated={animated} />;
      
      case 'sad-cry':
        return <MascotSadCry size={pixelSize} animated={animated} />;
      
      case 'sad-frustrate':
        return <MascotSadFrustrate size={pixelSize} animated={animated} />;
      
      case 'sad-sick':
        return <MascotSadSick size={pixelSize} animated={animated} />;
      
      case 'shock-awe':
        return <MascotShockAwe size={pixelSize} animated={animated} />;
      
      default:
        return <MascotHappyClap size={pixelSize} animated={animated} />;
    }
  };

  return renderMascot();
}
