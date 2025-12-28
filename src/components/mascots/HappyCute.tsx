import React, { useEffect, useRef } from 'react';
import { ViewStyle, Animated } from 'react-native';
import Svg, { Path, G, Ellipse, Circle } from 'react-native-svg';
import MascotWrapper from './MascotWrapper';

interface MascotProps {
  size?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export default function HappyCute({ size = 160, style, animated = true }: MascotProps) {
  // SVG will render at 85% of the container size for consistent visual appearance
  const svgSize = size * 0.85;

  // Animation values for each heart
  const heart1Anim = useRef(new Animated.Value(0)).current;
  const heart2Anim = useRef(new Animated.Value(0)).current;
  const heart3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Create floating animation for each heart with different delays
    const createFloatingAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 3500, // Slightly slower for more grace
              useNativeDriver: false,
            }),
          ]),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );
    };

    // Start animations with staggered delays
    const anim1 = createFloatingAnimation(heart1Anim, 0);
    const anim2 = createFloatingAnimation(heart2Anim, 1200);
    const anim3 = createFloatingAnimation(heart3Anim, 2400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [animated, heart1Anim, heart2Anim, heart3Anim]);

  // Color mapping from original SVG classes
  const colors = {
    cls1: '#a40634',  // Dark maroon - outlines, details, feet
    cls2: '#ff2242',  // Bright red - hearts fill
    cls3: '#ff9796',  // Light pink - body highlight
    cls4: '#d34059',  // Medium pink - hand detail
    cls5: '#fff',     // White - eye highlights
    cls6: '#fe537a',  // Pink - blush cheeks
    cls7: '#fd7270',  // Coral/salmon - main body, arm
    cls8: '#5e041c',  // Very dark red - eyes
    cls9: '#fcbdcf',  // Light pink - body shine spot
  };

  return (
    <MascotWrapper size={size} style={style}>
      {/* MAIN BODY SVG */}
      <Svg 
        viewBox="0 0 345.89 434.18" 
        width={svgSize} 
        height={svgSize}
        style={{ overflow: 'visible' }} 
      >
        <G>
          {/* Left foot - cls-1 */}
          <G>
            <Path d="M156.42,424.53c-2.96-2.8-6.76-5.16-17.26-3.51-10.25,1.62-11.87,10.36-10.8,11.96,1.06,1.59,24.96,1.6,29.21,0,4.52-1.71.42-6.97-1.14-8.45Z" fill={colors.cls1}/>
            <Path d="M152.92,427.04c-.8,0-1.57-.43-1.98-1.18-16.29-30.13-15.5-63.84-15.45-65.06.04-1.24,1.09-2.23,2.32-2.16,1.24.04,2.21,1.08,2.17,2.32-.01.29-.76,33.76,14.91,62.76.59,1.09.18,2.46-.91,3.05-.34.18-.71.27-1.07.27Z" fill={colors.cls1}/>
          </G>
          {/* Right foot - cls-1 */}
          <G>
            <Path d="M233.22,424.53c2.96-2.8,6.76-5.16,17.26-3.51,10.25,1.62,11.87,10.36,10.8,11.96-1.06,1.59-24.96,1.6-29.21,0-4.52-1.71-.42-6.97,1.14-8.45Z" fill={colors.cls1}/>
            <Path d="M236.73,427.04c-.36,0-.73-.09-1.07-.27-1.09-.59-1.5-1.95-.91-3.05,15.59-28.84,9.31-55.64,9.25-55.91-.29-1.2.44-2.42,1.65-2.72,1.2-.29,2.42.45,2.72,1.65.28,1.16,6.74,28.76-9.66,59.11-.41.75-1.18,1.18-1.98,1.18Z" fill={colors.cls1}/>
          </G>
          
          {/* Arm - cls-7 (coral) */}
          <Path d="M71.56,130.69s-43.19-24.95-34.78-46.33c6.13-15.58,22.06-17.41,28.51-11.39,8.27,7.73,18.68,18.37,29.22,24.22l-22.95,33.5Z" fill={colors.cls7}/>
          
          {/* Arm detail/hand - cls-4 and cls-1 */}
          <G>
            <Path d="M55.27,88.83c-4.63,4.7-11,6.73-13.41,4.36-2.41-2.37-.81-8.61,3.82-13.31,4.63-4.7,10.52-6.09,12.93-3.72,2.41,2.37,1.28,7.96-3.34,12.66Z" fill={colors.cls4}/>
            <Path d="M55.27,88.83c-4.63,4.7-11.21,6.93-13.41,4.36-1.37-1.61,3.96-.56,10.4-7,5.8-5.8,5.25-10.96,6.35-10.02,2.59,2.18,1.28,7.96-3.34,12.66Z" fill={colors.cls1}/>
          </G>
          
          {/* Arm outline - cls-1 */}
          <Path d="M72.24,133.67l-1.8-1.04c-1.83-1.06-44.76-26.18-35.74-49.1,3.2-8.13,9.38-13.77,16.97-15.49,5.79-1.31,11.6-.05,15.17,3.28h0c1.28,1.19,2.61,2.46,3.98,3.76,7.56,7.18,16.12,15.32,24.79,20.13l2.16,1.2-25.52,37.25ZM52.65,72.43c-6.11,1.38-11.13,6.03-13.78,12.75-6.69,16.99,24.18,37.58,32.03,42.48l20.38-29.75c-8.4-5.14-16.43-12.77-23.58-19.56-1.36-1.3-2.68-2.55-3.95-3.74h0c-.12-.11-3.88-3.82-11.11-2.18Z" fill={colors.cls1}/>
          
          {/* Main body - cls-7 (coral) */}
          <Path d="M160.94,52.9c-85.69,15.57-123.62,110.53-95.05,205.37,4.89,16.24,8.46,24.94,13.34,38.81,1.92,5.46,5.75,17.77-5.8,30.6-15.25,16.95-23.61,27.67-22.2,44.81,1.4,17.14,16.09,34.18,19.07,37.81,1.72,2.09,9.78,8.89,22.66.38,14.6-9.66,9.86-18.76,8.39-20.9-2.68-3.91-9.06-9.41-6.51-17.79,3.09-10.17,14.04-25.17,50.03-9.28,26.4,11.65,56.29,14.36,80.73,10.2,60.38-10.26,101.49-66.69,94.9-165.88-5.9-88.69-63.35-171.61-159.55-154.13Z" fill={colors.cls7}/>
          
          {/* Body highlight - cls-3 (light pink) */}
          <Path d="M160.94,52.9c-85.69,15.57-123.62,110.53-95.05,205.37,4.89,16.24,8.46,24.94,13.34,38.81,1.92,5.46,5.75,17.77-5.8,30.6-15.25,16.95-23.61,27.67-22.2,44.81.98,12.05,8.53,24.04,13.96,31.36.62-4.16,3.88-8.53,11.71-13.43,14.23-8.91,2.47-16.81,6.67-31.64,4.33-15.26,28.5-27.93,48.92-21.38,27.48,8.82,56.29,14.36,80.73,10.2,60.38-10.26,101.49-66.69,94.9-165.88-1.52-22.89-6.49-45.39-14.66-65.89-26.64-45.07-71.88-73.96-132.52-62.94Z" fill={colors.cls3}/>
          
          {/* Tail/leg detail - cls-4 and cls-1 */}
          <G>
            <Path d="M81.36,394.21c6.27-4.17,13.86-4.95,16.01-1.74s-1.11,9.81-7.38,13.98c-6.27,4.17-13.18,4.35-15.32,1.13-2.14-3.22.43-9.2,6.69-13.37Z" fill={colors.cls4}/>
            <Path d="M81.36,394.21c6.27-4.17,14.15-5.13,16.01-1.74,1.16,2.12-4.56-.3-13.26,5.39-7.83,5.12-8.43,11.02-9.44,9.72-2.38-3.04.43-9.2,6.69-13.37Z" fill={colors.cls1}/>
          </G>
          
          {/* Body outline - cls-1 */}
          <Path d="M80.85,417.05c-.57,0-7.65.28-12.7-5.83-11.79-14.2-18.23-27.17-19.16-38.55-1.48-18.12,7.62-29.65,22.77-46.49,11.02-12.24,6.9-23.95,5.35-28.35-1.4-3.97-2.69-7.52-3.93-10.94-3.05-8.4-5.94-16.33-9.44-27.97-16.5-54.77-11.55-109.74,13.59-150.82,19.05-31.12,47.82-50.98,83.21-57.41l.4,2.21-.4-2.21c37.21-6.76,71.55,1.11,99.32,22.76,35.66,27.81,59.17,77.69,62.88,133.43,3.16,47.54-4.67,88.21-22.66,117.61-16.99,27.77-42.62,45.28-74.1,50.63-26.86,4.56-56.75.79-82.01-10.36-15.82-6.98-28.11-8.56-36.53-4.7-6.35,2.91-9.19,8.45-10.44,12.59-1.75,5.75,1.52,9.86,4.41,13.48.78.98,5.23,5.53,3.86,12.53-.98,5.01-4.7,9.69-11.06,13.89-5,3.31-9.51,4.51-13.35,4.51ZM185.96,52.83c-8.02,0-16.24.76-24.62,2.28-34.09,6.2-61.82,25.33-80.18,55.33-24.11,39.4-29.02,94.42-13.12,147.17,3.47,11.52,6.33,19.4,9.36,27.73,1.25,3.44,2.54,7,3.95,10.98,1.62,4.61,6.55,18.62-6.25,32.85-15.68,17.42-22.92,27.35-21.64,43.12.85,10.44,6.96,22.57,18.14,36.05.47.57,7.13,9.03,20.11.44,5.32-3.52,8.39-7.22,9.13-11.01.91-4.65-1.94-7.58-2.97-8.87-3.04-3.82-7.63-9.58-5.19-17.59,1.53-5.02,5-11.75,12.87-15.36,9.64-4.42,23.17-2.85,40.22,4.68,24.48,10.8,53.43,14.46,79.44,10.04,64.33-10.93,99.11-72.06,93.03-163.51-3.62-54.48-26.48-103.15-61.16-130.19-20.49-15.98-44.74-24.16-71.13-24.16Z" fill={colors.cls1}/>
          
          {/* Body shine spot - cls-9 */}
          <Path d="M112.98,97.02c-14.06-6.48-47.57,57.03-30.77,68.95,16.8,11.92,49.81-60.18,30.77-68.95Z" fill={colors.cls9}/>
          
          {/* Left blush cheek - cls-6 */}
          <Ellipse cx="134.23" cy="243.47" rx="15.93" ry="15.4" fill={colors.cls6}/>
          
          {/* Right blush cheek - cls-6 */}
          <Path d="M265.41,221.17c-1.42-8.39-9.61-13.99-18.29-12.52s-14.55,9.47-13.13,17.85c1.43,8.39,9.61,13.99,18.29,12.52,8.68-1.47,14.55-9.47,13.13-17.85Z" fill={colors.cls6}/>
          
          {/* Face detail - smile lines (LEFT) - cls-1 */}
          <G>
            <Path d="M151.95,310.07c-1.35,0-2.71-.07-4.1-.21-14.34-1.5-27.12-10.91-38-27.96-.67-1.05-.36-2.44.69-3.1,1.05-.67,2.44-.36,3.1.69,10.11,15.84,21.78,24.56,34.68,25.91,20.17,2.12,36.82-14.56,36.99-14.73.87-.88,2.29-.9,3.18-.03.89.87.9,2.29.03,3.18-.69.7-16.23,16.26-36.56,16.26Z" fill={colors.cls1}/>
            <Path d="M185.69,295.26s9.5-4.12,13.48-13.12c3.47-7.85-1.76-12.65-6.22-11.18-5.3,1.74-9.83,22.45-9.83,22.45l2.57,1.85Z" fill={colors.cls1}/>
          </G>
          
          {/* Face detail - smile lines (RIGHT) - cls-1 */}
          <G>
            <Path d="M241.72,294.71c-13.49,0-24.55-5.33-25.21-5.66-1.11-.55-1.57-1.89-1.02-3.01.55-1.11,1.9-1.57,3.01-1.03.21.1,21.5,10.33,39.8,1.67,11.72-5.55,19.84-17.62,24.15-35.9.29-1.21,1.49-1.96,2.7-1.67,1.21.28,1.96,1.49,1.67,2.7-4.64,19.69-13.6,32.79-26.63,38.94-6.18,2.91-12.56,3.94-18.47,3.94Z" fill={colors.cls1}/>
            <Path d="M219.66,289.49s-10.33-.75-17.06-7.93c-5.87-6.26-2.52-12.52,2.18-12.61,5.57-.11,16.7,17.94,16.7,17.94l-1.82,2.59Z" fill={colors.cls1}/>
          </G>

          {/* Nose/mouth curl - cls-1 */}
          <Path d="M191.8,248.72c-15.68,0-21.79-13.83-21.86-13.99-.49-1.14.04-2.46,1.18-2.95,1.14-.48,2.46.04,2.95,1.18h0c.24.56,6.1,13.59,21.89,10.9,15.7-2.67,16.29-17.32,16.31-17.94.03-1.22,1.03-2.19,2.25-2.19.02,0,.04,0,.06,0,1.24.03,2.22,1.05,2.19,2.29,0,.19-.64,18.97-20.05,22.27-1.73.29-3.37.43-4.92.43Z" fill={colors.cls1}/>
          
          {/* Left eye - cls-8 (very dark) with cls-5 (white) highlights */}
          <G>
            <Path d="M121.14,194.54c2.41-9.58,12.14-15.4,21.72-12.98,9.58,2.41,15.4,12.14,12.98,21.72s-12.14,15.4-21.72,12.98c-9.58-2.41-15.4-12.14-12.98-21.72Z" fill={colors.cls8}/>
            <Path d="M126.21,196.33c-.44-2.6,1.31-5.06,3.9-5.5s5.06,1.31,5.5,3.9-1.31,5.06-3.91,5.5c-2.6.44-5.06-1.31-5.5-3.9Z" fill={colors.cls5}/>
            <Path d="M147.84,198.92c.9-3.4,2.66-5.88,3.93-5.54s1.58,3.36.68,6.76-2.66,5.88-3.93,5.54c-1.27-.34-1.58-3.36-.68-6.76Z" fill={colors.cls5}/>
          </G>
          
          {/* Right eye - cls-8 (very dark) with cls-5 (white) highlights */}
          <G>
            <Circle cx="230.53" cy="183.25" r="17.89" fill={colors.cls8}/>
            <Path d="M218.27,180.69c-.44-2.6,1.31-5.06,3.91-5.5s5.06,1.31,5.5,3.91-1.31,5.06-3.9,5.5c-2.6.44-5.06-1.31-5.5-3.9Z" fill={colors.cls5}/>
            <Path d="M239.9,183.28c.9-3.4,2.66-5.88,3.93-5.54s1.58,3.36.68,6.76-2.66,5.88-3.93,5.54c-1.27-.34-1.58-3.36-.68-6.76Z" fill={colors.cls5}/>
          </G>
        </G>
      </Svg>

      {/* 
          ANIMATED HEARTS - Rendered OUTSIDE the main SVG 
          to allow them to float across the whole screen 
          without being clipped by the mascot's viewBox.
      */}
      
      {/* Heart 1 (bottom left) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: (svgSize * 40) / 345.89, 
          top: (svgSize * 180) / 434.18, 
          transform: [
            { translateY: heart1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -800] }) },
            { rotate: heart1Anim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-15deg', '0deg', '15deg', '0deg'] }) },
          ],
          opacity: heart1Anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.8, 0] }),
        }}
      >
        <Svg width={svgSize * 0.12} height={svgSize * 0.12} viewBox="0 0 48 48">
           {/* Clean, standard heart path with mascot-style outline */}
           <Path 
             d="M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z" 
             fill={colors.cls2} 
             stroke={colors.cls1}
             strokeWidth="3"
           />
        </Svg>
      </Animated.View>

      {/* Heart 2 (top center) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: (svgSize * 160) / 345.89,
          top: (svgSize * 5) / 434.18,
          transform: [
            { translateY: heart2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -800] }) },
            { rotate: heart2Anim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '15deg', '0deg', '-15deg', '0deg'] }) },
          ],
          opacity: heart2Anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.8, 0] }),
        }}
      >
        <Svg width={svgSize * 0.14} height={svgSize * 0.14} viewBox="0 0 48 48">
           <Path 
             d="M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z" 
             fill={colors.cls2} 
             stroke={colors.cls1}
             strokeWidth="3"
           />
        </Svg>
      </Animated.View>

      {/* Heart 3 (top right) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: (svgSize * 300) / 345.89,
          top: (svgSize * 80) / 434.18,
          transform: [
            { translateY: heart3Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -800] }) },
            { rotate: heart3Anim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-10deg', '0deg', '10deg', '0deg'] }) },
          ],
          opacity: heart3Anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.8, 0] }),
        }}
      >
        <Svg width={svgSize * 0.12} height={svgSize * 0.12} viewBox="0 0 48 48">
           <Path 
             d="M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z" 
             fill={colors.cls2} 
             stroke={colors.cls1}
             strokeWidth="3"
           />
        </Svg>
      </Animated.View>
    </MascotWrapper>
  );
}
