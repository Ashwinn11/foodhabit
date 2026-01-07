import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Text, Modal, Container } from '../components';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!permission) {
    return <Container safeArea={false}><></></Container>;
  }

  if (!permission.granted) {
    return (
      <Container center>
        <Ionicons name="camera-outline" size={64} color={theme.colors.brand.cream} />
        <Text variant="title2" weight="semiBold" style={styles.permissionText}>
          Camera Access Required
        </Text>
        <Text variant="body" style={styles.permissionSubtext}>
          We need camera access to scan your meals
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text variant="body" weight="semiBold" style={styles.permissionButtonText}>
            Continue
          </Text>
        </TouchableOpacity>
      </Container>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Reduced for faster processing - sufficient for AI
        });
        setPhoto(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        setErrorMessage('Failed to take picture');
        setErrorModalVisible(true);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Match camera quality for consistency
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
  };

  const handleUsePicture = () => {
    // Replace Camera with Result so Camera is removed from stack
    navigation.replace('Result', { photoUri: photo });
  };

  if (photo) {
    return (
      <Container safeArea={false} style={styles.fullScreen}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.preview} resizeMode="contain" />
        </View>
        
        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={32} color={theme.colors.text.white} />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text variant="body" weight="semiBold" style={styles.retakeText}>
              Retake
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.useButton} onPress={handleUsePicture}>
            <Text variant="body" weight="bold" style={styles.useText}>
              Use Photo
            </Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea={false} style={styles.fullScreen}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      
      {/* Top Bar - Absolute positioned */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={32} color={theme.colors.text.white} />
        </TouchableOpacity>
        <Text variant="title3" weight="semiBold" style={styles.title}>
          Scan Your Meal
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Center Guide - Absolute positioned */}
      <View style={styles.centerGuide}>
        <View style={styles.guideBox} />
        <Text variant="body" style={styles.guideText}>
          Center your food in the frame
        </Text>
      </View>

      {/* Bottom Controls - Absolute positioned */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Ionicons name="images-outline" size={32} color={theme.colors.text.white} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <View style={{ width: 60 }} />
      </View>

      {/* Error Modal */}
      <Modal
          visible={errorModalVisible}
          title="Error"
          message={errorMessage}
          primaryButtonText="OK"
          onPrimaryPress={() => setErrorModalVisible(false)}
          onClose={() => setErrorModalVisible(false)}
          variant="error"
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text.white,
  },
  centerGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  guideBox: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.xl,
    borderStyle: 'dashed',
  },
  guideText: {
    color: theme.colors.text.white,
    marginTop: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.text.white,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.brand.cream,
  },
  retakeButton: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  retakeText: {
    color: theme.colors.text.white,
  },
  useButton: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['3xl'],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.brand.cream,
  },
  useText: {
    color: theme.colors.brand.black,
  },
  permissionText: {
    color: theme.colors.text.white,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
  permissionSubtext: {
    color: theme.colors.text.white,
    opacity: 0.7,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing['3xl'],
  },
  permissionButton: {
    marginTop: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['3xl'],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.brand.cream,
  },
  permissionButtonText: {
    color: theme.colors.brand.black,
  },
});
