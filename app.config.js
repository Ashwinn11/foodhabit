module.exports = {
  expo: {
    name: "Gut Scan",
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
      supportsTablet: false,
      bundleIdentifier: "com.foodhabit.app",
      usesAppleSignIn: true,
      associatedDomains: [
        "applinks:foodhabit.com",
        "applinks:foodhabit.com"
      ],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
    },
    plugins: [
      "expo-apple-authentication",
      "expo-web-browser"
    ],
    extra: {
      eas: {
        projectId: "a729b1be-9c50-4ae8-a28a-96cbe598b18a"
      },
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    }
  }
};
