module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@react-native-firebase/app": "./src/mocks/firebase.js",
            "@react-native-firebase/messaging": "./src/mocks/firebase-messaging.js",
            "@notifee/react-native": "./src/mocks/notifee.js"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ],
  };
};