const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withNodeModulesSymlink = (config) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const iosDir = config.modRequest.platformProjectRoot;
      const nodeModulesLink = path.join(iosDir, "node_modules");
      const targetPath = "../node_modules";

      // Check if symlink exists
      try {
        const stats = fs.lstatSync(nodeModulesLink);
        if (stats.isSymbolicLink()) {
          // Symlink exists, verify it points to the right place
          const linkTarget = fs.readlinkSync(nodeModulesLink);
          if (linkTarget === targetPath) {
            // All good, symlink is correct
            return config;
          } else {
            // Wrong target, remove and recreate
            fs.unlinkSync(nodeModulesLink);
          }
        } else {
          // It's a directory, not a symlink - remove it
          console.warn("Found ios/node_modules directory instead of symlink, removing...");
          require("child_process").execSync(`rm -rf "${nodeModulesLink}"`);
        }
      } catch (e) {
        // Symlink doesn't exist, which is fine - we'll create it
      }

      // Create the symlink
      try {
        fs.symlinkSync(targetPath, nodeModulesLink);
        console.log("✅ Created ios/node_modules symlink");
      } catch (e) {
        console.error("❌ Failed to create symlink:", e.message);
      }

      return config;
    },
  ]);
};

module.exports = withNodeModulesSymlink;
