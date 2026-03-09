const { withXcodeProject } = require("@expo/config-plugins");

/**
 * Expo config plugin to allow non-modular headers in the framework module.
 * This is necessary when using `useFrameworks: "static"` with libraries 
 * like `react-native-maps` that have non-modular imports.
 */
const withNonModularHeaders = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();

    for (const key in buildConfigurations) {
      const buildConfig = buildConfigurations[key];
      if (typeof buildConfig === "object" && buildConfig.buildSettings) {
        // Set CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES to YES
        buildConfig.buildSettings["CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"] = "YES";
      }
    }

    return config;
  });
};

module.exports = withNonModularHeaders;
