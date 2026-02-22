const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const CLANG_FIX = `
    # Allow Firebase pods to include non-modular React-Core headers inside framework modules
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end`;

const withFirebaseFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      let podfile = fs.readFileSync(podfilePath, "utf8");

      // Required when using use_frameworks! :linkage => :static with react-native-firebase
      if (!podfile.includes("$RNFirebaseAsStaticFramework")) {
        podfile = podfile.replace(
          "target 'GutBuddy' do",
          "$RNFirebaseAsStaticFramework = true\n\ntarget 'GutBuddy' do"
        );
      }

      // Remove any standalone post_install block previously added by this plugin
      podfile = podfile.replace(
        /\npost_install do \|installer\|\n  installer\.pods_project\.targets\.each[\s\S]*?\nend\n/,
        "\n"
      );

      // Inject the CLANG fix inside the existing post_install block, after react_native_post_install
      if (!podfile.includes("CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES")) {
        podfile = podfile.replace(
          /(:ccache_enabled => ccache_enabled\?[^\n]*\n\s*\))/,
          `$1${CLANG_FIX}`
        );
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};

module.exports = withFirebaseFix;
