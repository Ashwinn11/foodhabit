const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withFirebaseFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      let podfile = fs.readFileSync(podfilePath, "utf8");

      // Add use_modular_headers! before the target block
      if (!podfile.includes("use_modular_headers!")) {
        podfile = podfile.replace(
          "target 'GutBuddy' do",
          "use_modular_headers!\n\ntarget 'GutBuddy' do"
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
};

module.exports = withFirebaseFix;
