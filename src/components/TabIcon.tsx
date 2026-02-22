import React from 'react';
import { Home, ScanLine, Activity, User, Camera, AlertTriangle, Check } from 'lucide-react-native';

type P = { color: string; size?: number };

export const HomeIcon    = ({ color, size = 22 }: P) => <Home      color={color} size={size} strokeWidth={2} />;
export const ScanIcon    = ({ color, size = 22 }: P) => <ScanLine  color={color} size={size} strokeWidth={2} />;
export const GutIcon     = ({ color, size = 22 }: P) => <Activity  color={color} size={size} strokeWidth={2} />;
export const ProfileIcon = ({ color, size = 22 }: P) => <User      color={color} size={size} strokeWidth={2} />;
export const CameraIcon  = ({ color, size = 20 }: P) => <Camera    color={color} size={size} strokeWidth={2} />;
export const WarningIcon = ({ color, size = 20 }: P) => <AlertTriangle color={color} size={size} strokeWidth={2} />;
export const CheckIcon   = ({ color, size = 20 }: P) => <Check     color={color} size={size} strokeWidth={2.5} />;
