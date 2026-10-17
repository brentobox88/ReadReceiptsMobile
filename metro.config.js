const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Firebase fix for Expo SDK 53:
// Metro's package exports resolution breaks firebase/auth subpath imports.
defaultConfig.resolver.unstable_enablePackageExports = false;
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig;