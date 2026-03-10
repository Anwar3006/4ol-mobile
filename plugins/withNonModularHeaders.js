const {withXcodeProject, withPodfile} = require('@expo/config-plugins');

/**
 * Expo config plugin to allow non-modular headers in the framework module.
 */
const withNonModularHeaders = config => {
  // 1. Update Xcode project settings for the main app target
  config = withXcodeProject(config, config => {
    const xcodeProject = config.modResults;
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();

    for (const key in buildConfigurations) {
      const buildConfig = buildConfigurations[key];
      if (typeof buildConfig === 'object' && buildConfig.buildSettings) {
        buildConfig.buildSettings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES';
        buildConfig.buildSettings['GCC_WARN_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'NO';

        const otherWarningFlags = buildConfig.buildSettings['OTHER_CFLAGS'] || [];
        const flagsList = Array.isArray(otherWarningFlags) ? [...otherWarningFlags] : [otherWarningFlags];
        if (!flagsList.includes('-Wno-non-modular-include-in-framework-module')) {
          flagsList.push('-Wno-non-modular-include-in-framework-module');
          buildConfig.buildSettings['OTHER_CFLAGS'] = flagsList;
        }
      }
    }
    return config;
  });

  // 2. Update Podfile to handle non-modular headers
  config = withPodfile(config, config => {
    let podfileContent = config.modResults.contents;

    // A. Add/Update post_install fix
    const fixMarker = '# NON_MODULAR_HEADERS_FIX_START';
    const fixMarkerEnd = '# NON_MODULAR_HEADERS_FIX_END';
    const fixContent = `
    # NON_MODULAR_HEADERS_FIX_START
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['GCC_WARN_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'NO'

        # This is often needed for React Native 0.70+ with static frameworks
        if target.name.include?('react-native-google-maps') || target.name.include?('react-native-maps')
          config.build_settings['DEFINES_MODULE'] = 'NO'
        else
          config.build_settings['DEFINES_MODULE'] = 'YES'
        end
        
        cflags = config.build_settings['OTHER_CFLAGS'] || ['$(inherited)']
        if cflags.is_a?(String)
          cflags = [cflags]
        end
        unless cflags.include?('-Wno-non-modular-include-in-framework-module')
          cflags << '-Wno-non-modular-include-in-framework-module'
        end
        config.build_settings['OTHER_CFLAGS'] = cflags
      end
    end
    # NON_MODULAR_HEADERS_FIX_END
`;

    // Remove old fix if present
    if (podfileContent.includes(fixMarker)) {
      const regex = new RegExp(`${fixMarker}[\\s\\S]*?${fixMarkerEnd}`, 'g');
      podfileContent = podfileContent.replace(regex, '');
    }
    // Also remove the one without markers if it was there from previous version
    podfileContent = podfileContent.replace(/installer\.pods_project\.targets\.each do \|target\|[\s\S]*?config\.build_settings\['GCC_WARN_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'\] = 'NO'\s+end\s+end/g, '');

    // Insert new fix
    if (podfileContent.includes('post_install do |installer|')) {
      podfileContent = podfileContent.replace(
        'post_install do |installer|',
        `post_install do |installer|${fixContent}`
      );
    }

    // B. Force modular_headers => false for specific problematic pods
    const problematicPods = [
      'react-native-maps', 
      'react-native-google-maps', 
      'GoogleMaps', 
      'Google-Maps-iOS-Utils'
    ];

    problematicPods.forEach(podName => {
      // Find pod 'name' line, matching both modern 'path:' and old ':path =>'
      const podRegex = new RegExp(`(pod\\s+['"]${podName}['"][^\\n]*)`, 'g');
      if (podfileContent.match(podRegex)) {
        podfileContent = podfileContent.replace(podRegex, (match) => {
          if (match.includes('modular_headers')) {
            return match; // Already has it
          }
          // Remove any trailing whitespace/newline from match
          const trimmed = match.trim();
          return `${trimmed}, :modular_headers => false`;
        });
      }
    });

    config.modResults.contents = podfileContent;
    return config;
  });

  return config;
};

module.exports = withNonModularHeaders;
