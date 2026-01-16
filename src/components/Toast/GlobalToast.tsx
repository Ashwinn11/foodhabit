import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/useUIStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../../theme/theme';

export const GlobalToast: React.FC = () => {
  const { toastVisible, toastOptions } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toastVisible) {
      setIsMounted(true);
      translateY.value = withSpring(insets.top + spacing.md, {
        damping: 12,
        stiffness: 90,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(-120, { 
        duration: 300, 
        easing: Easing.out(Easing.quad) 
      }, (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
        }
      });
    }
  }, [toastVisible, insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isMounted) return null;

    const getBackgroundColor = () => {

      switch (toastOptions.type) {

        case 'error': return '#FF5252';

        case 'info': return colors.blue;

        case 'success':

        default: return colors.pink;

      }

    };

  

    const getBorderColor = () => {

      switch (toastOptions.type) {

        case 'error': return '#D32F2F';

        case 'info': return '#4FC3F7';

        case 'success':

        default: return '#FF4D77'; // Slightly darker pink for border

      }

    };

  

    return (

      <Animated.View 

        style={[

          styles.container, 

          { 

            width: width - spacing.xl * 2,

            backgroundColor: getBackgroundColor(),

            borderColor: getBorderColor(),

          }, 

          animatedStyle

        ]}

      >

              <View style={styles.content}>

                {toastOptions.icon && (

                  <Ionicons 

                    name={toastOptions.icon} 

                    size={24} 

                    color={toastOptions.iconColor || colors.white} 

                    style={styles.icon} 

                  />

                )}

                <Text style={styles.message}>{toastOptions.message}</Text>

              </View>

        

      </Animated.View>

    );

  };

  

  const styles = StyleSheet.create({

    container: {

      position: 'absolute',

      top: 0,

      alignSelf: 'center',

      paddingVertical: spacing.md,

      paddingHorizontal: spacing.lg,

      borderRadius: radii.xl,

      borderWidth: 2,

      zIndex: 9999,

      ...shadows.md,

    },

    content: {

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

    },

    icon: {

      marginRight: spacing.sm,

    },

    message: {

      fontFamily: fonts.bodyBold,

      fontSize: fontSizes.md,

      color: colors.white,

      textAlign: 'center',

    },

  });

  