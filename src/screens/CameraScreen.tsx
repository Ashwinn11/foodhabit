import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { IconContainer, Typography, Button, Card } from '../components';
import { colors, spacing, radii } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useGutStore } from '../store';

type CameraScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { setCapturedPhotoUri } = useGutStore();

  // Handle permission states
  if (!permission) {
    return (
      <View style={styles.container}>
        <Typography variant="body" color={colors.white}>Loading camera...</Typography>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Card variant="white" style={styles.permissionCard} padding="2xl">
          <IconContainer
            name="camera"
            size={80}
            iconSize={64}
            color={colors.pink}
            backgroundColor="transparent"
            borderWidth={0}
            shadow={false}
            style={styles.permissionIcon}
          />
          <Typography variant="h2" style={{ marginBottom: spacing.md }}>Camera Access</Typography>
          <Typography variant="body" align="center" color={colors.black + '99'} style={{ marginBottom: spacing.xl }}>
            We need camera access to let you take photos of your meals and track your gut health journey!
          </Typography>
          <Button 
            title="Enable Camera"
            onPress={requestPermission}
            color={colors.pink}
            style={{ marginBottom: spacing.md, width: '100%' }}
          />
          <Button 
            title="Maybe Later"
            onPress={() => navigation.goBack()}
            variant="ghost"
            color={colors.black + '66'}
          />
        </Card>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo) {
          setCapturedPhoto(photo.uri);
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      // Store the photo URI in the global store
      setCapturedPhotoUri(capturedPhoto);
    }
    navigation.goBack();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  // Show preview if photo is captured
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
        
        <View style={styles.previewControls}>
          <Button 
            title="Retake"
            onPress={retakePhoto}
            icon="refresh"
            variant="ghost"
            color={colors.white}
            style={styles.retakeButton}
          />
          
          <Button 
            title="Use Photo"
            onPress={confirmPhoto}
            icon="checkmark"
            color={colors.pink}
            style={styles.confirmButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      />
      
      {/* Overlay controls - outside CameraView */}
      <View style={styles.overlayContainer}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
            <IconContainer
              name="close"
              size={32}
              iconSize={28}
              color={colors.white}
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
            />
          </Pressable>
          
          <Pressable style={styles.flipButton} onPress={toggleCameraFacing}>
            <IconContainer
              name="camera-reverse"
              size={32}
              iconSize={28}
              color={colors.white}
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
            />
          </Pressable>
        </View>
        
        {/* Bottom hint */}
        <View style={styles.hintContainer}>
          <Typography variant="body" color={colors.white} style={styles.hintText}>
            Take a photo of your meal
          </Typography>
        </View>
        
        {/* Capture button */}
        <View style={styles.captureContainer}>
          <Pressable style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionCard: {
    alignItems: 'center',
  },
  permissionIcon: {
    marginBottom: spacing.lg,
  },
  // Camera controls
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: spacing['4xl'],
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  // Preview styles
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewControls: {
    position: 'absolute',
    bottom: 60,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retakeButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  confirmButton: {
    backgroundColor: colors.pink,
  },
});
