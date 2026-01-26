/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "GutHealthWidget",
  bundleIdentifier: "com.foodhabit.app.GutHealthWidget",
  deploymentTarget: "16.0",
  frameworks: ["WidgetKit", "SwiftUI"],
  supportedFamilies: ["systemSmall", "systemMedium", "systemLarge"],
  entitlements: {
    "com.apple.security.application-groups": ["group.com.foodhabit.app"],
  },
};
