import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = { color: string; size?: number };

export const HomeIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3z" fill={color} />
  </Svg>
);

export const ScanIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 3H5C3.9 3 3 3.9 3 5v4M15 3h4c1.1 0 2 .9 2 2v4M3 15v4c0 1.1.9 2 2 2h4M21 15v4c0 1.1-.9 2-2 2h-4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GutIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2c-4.4 0-8 3.6-8 8 0 2.5 1.1 4.8 2.9 6.3L9 20a1 1 0 001 1h4a1 1 0 001-1l2.1-3.7C18.9 14.8 20 12.5 20 10c0-4.4-3.6-8-8-8z"
      fill={color}
    />
  </Svg>
);

export const ProfileIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.3 0-8 2.7-8 4v1h16v-1c0-1.3-2.7-4-8-4z"
      fill={color}
    />
  </Svg>
);

export const CameraIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 3L7 6H4C2.9 6 2 6.9 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-3l-2-3H9zm3 15a5 5 0 110-10 5 5 0 010 10z"
      fill={color}
    />
  </Svg>
);

export const WarningIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2L1 21h22L12 2zm0 15h-2v-5h2v5zm0 4h-2v-2h2v2z"
      fill={color}
    />
  </Svg>
);

export const CheckIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
      fill={color}
    />
  </Svg>
);
