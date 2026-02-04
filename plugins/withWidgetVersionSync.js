const { withXcodeProject } = require("@expo/config-plugins");

/**
 * This config plugin syncs the GutHealthWidget extension's build version
 * with the main app's build version during EAS builds.
 *
 * Without this, the widget would have CURRENT_PROJECT_VERSION = 1 while
 * the main app (managed by EAS) might have a different version, causing
 * App Store rejection due to version mismatch.
 */
const withWidgetVersionSync = (config) => {
  return withXcodeProject(config, async (config) => {
    const project = config.modResults;

    // Get the build number from EAS or use the version from app.json
    const buildNumber =
      process.env.EAS_BUILD_IOS_BUILD_NUMBER ||
      config.ios?.buildNumber ||
      "1";

    // Find all native targets and update widget extensions
    const pbxNativeTargetSection = project.pbxNativeTargetSection();

    for (const key in pbxNativeTargetSection) {
      const target = pbxNativeTargetSection[key];

      // Skip non-objects (sometimes there are string entries)
      if (typeof target !== "object" || !target.name) continue;

      // Check if this is a widget extension
      if (
        target.productType === '"com.apple.product-type.app-extension"' ||
        target.name.includes("Widget")
      ) {
        console.log(
          `[withWidgetVersionSync] Syncing version for target: ${target.name}`
        );

        // Get the configuration list for this target
        const configurationListId = target.buildConfigurationList;
        const configurationList =
          project.pbxXCConfigurationList()[configurationListId];

        if (configurationList && configurationList.buildConfigurations) {
          for (const configRef of configurationList.buildConfigurations) {
            const buildConfig =
              project.pbxXCBuildConfigurationSection()[configRef.value];

            if (buildConfig && buildConfig.buildSettings) {
              // Update the build version to match the main app
              buildConfig.buildSettings.CURRENT_PROJECT_VERSION = buildNumber;

              // Also sync the marketing version if available from app.json
              if (config.version) {
                buildConfig.buildSettings.MARKETING_VERSION = config.version;
              }

              console.log(
                `[withWidgetVersionSync] Set ${buildConfig.name} CURRENT_PROJECT_VERSION = ${buildNumber}`
              );
            }
          }
        }
      }
    }

    return config;
  });
};

module.exports = withWidgetVersionSync;
