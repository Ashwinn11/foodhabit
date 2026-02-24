const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Fixes react-native-firebase iOS build failures on RN 0.81+ (Expo SDK 54).
 *
 * Two issues:
 * 1. RCT_USE_PREBUILT_RNCORE=1 (default in RN 0.81) puts React headers in a
 *    non-standard location that Firebase can't find. Setting it to 0 restores
 *    the expected header paths.
 *
 * 2. With useFrameworks: static, the compiler errors on non-modular includes
 *    (React headers inside Firebase framework modules). Allowing them fixes it.
 *
 * See: https://github.com/invertase/react-native-firebase/issues/8883
 */
const withFirebaseFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      let podfile = fs.readFileSync(podfilePath, "utf8");

      // 1. Set $RNFirebaseAsStaticFramework for static linkage
      if (!podfile.includes("$RNFirebaseAsStaticFramework")) {
        podfile = podfile.replace(
          /target ['"]GutBuddy['"] do/,
          "$RNFirebaseAsStaticFramework = true\n\ntarget 'GutBuddy' do"
        );
      }

      // 2. Disable prebuilt RN Core so Firebase can find React headers.
      //    Insert after the ENV ||= lines but before prepare_react_native_project!
      //    so it overrides the RCT_USE_PREBUILT_RNCORE ||= '1' assignment above it.
      if (!podfile.includes("RCT_USE_PREBUILT_RNCORE = '0'")) {
        podfile = podfile.replace(
          "prepare_react_native_project!",
          "ENV['RCT_USE_PREBUILT_RNCORE'] = '0'\n\nprepare_react_native_project!"
        );
      }

      // 3. Allow non-modular React headers inside Firebase framework modules.
      //    Inject into the post_install block, after react_native_post_install(...).
      if (!podfile.includes("CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES")) {
        const clangFix = [
          "    installer.pods_project.targets.each do |target|",
          "      target.build_configurations.each do |config|",
          "        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
          "      end",
          "    end",
        ].join("\n");

        // Find the closing ) of react_native_post_install and insert after it
        podfile = podfile.replace(
          /(\s+react_native_post_install\([\s\S]*?\n\s+\))/,
          `$1\n${clangFix}`
        );
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};

module.exports = withFirebaseFix;
