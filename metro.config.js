const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'],
    extraNodeModules: {
      '@react-native-async-storage/async-storage': require.resolve(
        '@react-native-async-storage/async-storage',
      ),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
