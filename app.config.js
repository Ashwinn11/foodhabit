const pkg = require('./package.json');

module.exports = {
  expo: {
    name: "Gut Buddy",
    slug: "foodhabit",
    owner: "foodhabit",
    version: pkg.version,
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
        "applinks:foodhabit.com"
      ],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      entitlements: {
        "com.apple.security.application-groups": ["group.com.foodhabit.app"]
      },
      appleTeamId: "PVQK77DQWL",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    plugins: [
      "expo-apple-authentication",
      "expo-web-browser",
      "@bacons/apple-targets",
      "@react-native-firebase/app",
      ["expo-build-properties", {
        ios: {
          useFrameworks: "static",
          forceStaticLinking: ["RNFBApp", "RNFBAnalytics"]
        }
      }],
      "./plugins/withNodeModulesSymlink"
    ],
    extra: {
      eas: {
        projectId: "a729b1be-9c50-4ae8-a28a-96cbe598b18a"
      },
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    }
  }
};
