import React from 'react';
import { View } from 'react-native';

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
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'confused' 
  | 'love' 
  | 'crown' 
  | 'balloon' 
  | 'ill'
  | 'clap'
  | 'cute'
  | 'cry'
  | 'frustrate'
  | 'sick'
  | 'shock'
  // Legacy mappings
  | 'neutral' 
  | 'excited' 
  | 'worried' 
  | 'thinking';

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
  emotion = 'happy', 
  size = 'md',
  animated = false, // Will be used when we add animations
}: GigiProps) {
  const pixelSize = SIZE_MAP[size];

  const renderMascot = () => {
    // Map emotions to mascot components
    // Structure ready for adding animated prop to each component
    switch (emotion) {
      case 'happy':
      case 'neutral':
        return <MascotHappyClap size={pixelSize} animated={animated} />;
      
      case 'clap':
        return <MascotHappyClap size={pixelSize} animated={animated} />;
      
      case 'crown':
        return <MascotHappyCrown size={pixelSize} animated={animated} />;
      
      case 'cute':
      case 'love':
      case 'excited':
        return <MascotHappyCute size={pixelSize} animated={animated} />;
      
      case 'balloon':
        return <MascotHappyBalloon size={pixelSize} animated={animated} />;
      
      case 'sad':
      case 'cry':
        return <MascotSadCry size={pixelSize} animated={animated} />;
      
      case 'angry':
      case 'frustrate':
        return <MascotSadFrustrate size={pixelSize} animated={animated} />;
      
      case 'ill':
      case 'sick':
        return <MascotSadSick size={pixelSize} animated={animated} />;
      
      case 'confused':
      case 'thinking':
      case 'worried':
      case 'shock':
        return <MascotShockAwe size={pixelSize} animated={animated} />;
      
      default:
        return <MascotHappyClap size={pixelSize} animated={animated} />;
    }
  };

  return (
    <View style={{ width: pixelSize, height: pixelSize, alignItems: 'center', justifyContent: 'center' }}>
      {renderMascot()}
    </View>
  );
}
