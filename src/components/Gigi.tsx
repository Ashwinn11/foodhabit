import React from 'react';
import { View } from 'react-native';
import { 
  GigiHappy, 
  GigiSad, 
  GigiAngry, 
  GigiConfused, 
  GigiLove, 
  GigiCrown, 
  GigiBalloon, 
  GigiIll 
} from './GigiEmotions';

export type GigiEmotion = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'confused' 
  | 'love' 
  | 'crown' 
  | 'balloon' 
  | 'ill'
  // Legacy mappings
  | 'neutral' 
  | 'excited' 
  | 'worried' 
  | 'sick' 
  | 'thinking';

export type GigiSize = 'sm' | 'md' | 'lg' | 'xl';

interface GigiProps {
  emotion?: GigiEmotion;
  size?: GigiSize;
  animated?: boolean; // Kept for prop compatibility, but ignored
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
}: GigiProps) {
  const pixelSize = SIZE_MAP[size];

  const renderMascot = () => {
    switch (emotion) {
      case 'happy':
      case 'neutral': 
        return <GigiHappy size={pixelSize} />;
      case 'sad':
        return <GigiSad size={pixelSize} />;
      case 'angry':
        return <GigiAngry size={pixelSize} />;
      case 'confused':
      case 'thinking':
      case 'worried':
        return <GigiConfused size={pixelSize} />;
      case 'love':
      case 'excited':
        return <GigiLove size={pixelSize} />;
      case 'crown':
        return <GigiCrown size={pixelSize} />;
      case 'balloon':
        return <GigiBalloon size={pixelSize} />;
      case 'ill':
      case 'sick':
        return <GigiIll size={pixelSize} />;
      default:
        return <GigiHappy size={pixelSize} />;
    }
  };

  return (
    <View style={{ width: pixelSize, height: pixelSize, alignItems: 'center', justifyContent: 'center' }}>
      {renderMascot()}
    </View>
  );
}
