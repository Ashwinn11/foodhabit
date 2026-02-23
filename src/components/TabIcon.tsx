import React from 'react';
import { Home, ScanLine, BookOpen, User } from 'lucide-react-native';

export const HomeIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Home size={size} color={color} strokeWidth={1.5} />
);

export const ScanIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <ScanLine size={size} color={color} strokeWidth={1.5} />
);

export const GutIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <BookOpen size={size} color={color} strokeWidth={1.5} />
);

export const ProfileIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <User size={size} color={color} strokeWidth={1.5} />
);
