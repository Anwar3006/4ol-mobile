import { Stack } from "expo-router";

export default function PublicScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="GetStarted" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      <Stack.Screen name="VerifyPhoneNumber" options={{ headerShown: false }} />
      <Stack.Screen name="OtpVerification" options={{ headerShown: false }} />
      <Stack.Screen name="BusinessAuth" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" options={{ headerShown: false }} />
    </Stack>
  );
}
