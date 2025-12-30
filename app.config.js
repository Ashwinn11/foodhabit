module.exports = {
  expo: {
    name: "Food Habit",
    slug: "foodhabit",
    owner: "foodhabit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "foodhabit",
    newArchEnabled: true,
    splash: {
      image: "./assets/background.png",
      resizeMode: "contain",
      backgroundColor: "#2E2345"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.foodhabit.app",
      usesAppleSignIn: true,
      associatedDomains: [
        "applinks:foodhabit.com",
        "applinks:foodhabit.com"
      ],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "GutScan needs camera access to scan your meals and analyze their gut health impact.",
        NSPhotoLibraryUsageDescription: "GutScan needs photo library access to select meal images for analysis."
      },
      config: {
        usesNonExemptEncryption: false
      }
    },
    plugins: [
      "expo-apple-authentication",
      "expo-web-browser",
      "expo-font",
      [
        "expo-camera",
        {
          cameraPermission: "Allow GutScan to access your camera to scan meals"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow GutScan to access your photos to select meal images"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "a729b1be-9c50-4ae8-a28a-96cbe598b18a"
      },
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    }
  }
};
