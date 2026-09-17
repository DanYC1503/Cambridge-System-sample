import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useState } from "react";
import { useRouter } from "expo-router";

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { saveGoogleTokens } from "../api/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        await saveGoogleTokens(response);

        router.replace("/home");
      } else {
        Alert.alert(
          "Google Sign-In",
          "Sign-in was cancelled."
        );
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert(
              "Google Sign-In",
              "Sign-in was cancelled."
            );
            break;

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              "Google Sign-In",
              "Google Play Services is not available."
            );
            break;

          default:
            Alert.alert(
              "Google Sign-In",
              "Google Sign-In failed. Please try again."
            );
        }
      } else {
        Alert.alert(
          "Google Sign-In",
          "An unexpected error occurred."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 30,
        }}
      >
        Cambridge Assistance
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
        />
      )}
    </View>
  );
}
