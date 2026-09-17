import * as SecureStore from "expo-secure-store";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const ID_TOKEN_KEY = "google_id_token";
const USER_KEY = "google_user";

// --------------------------------------------------
// Save Google credentials after sign-in
// --------------------------------------------------

export async function saveGoogleTokens(response) {
  const { user, idToken } = response.data;

  console.log("========== GOOGLE SIGN IN ==========");
  console.log("User:", user?.email);
  console.log("ID token received:", !!idToken);

  if (!idToken) {
    throw new Error("Google did not return an ID token");
  }

  await SecureStore.setItemAsync(
    ID_TOKEN_KEY,
    idToken
  );

  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify(user)
  );

  console.log("✅ Google credentials saved");
  console.log("==================================");
}

// --------------------------------------------------
// Check existing authentication
// --------------------------------------------------

export async function hasValidGoogleAuth() {
  const idToken = await SecureStore.getItemAsync(
    ID_TOKEN_KEY
  );

  if (!idToken) {
    return false;
  }

  return !isJwtExpired(idToken);
}

// --------------------------------------------------
// Get stored ID token
// --------------------------------------------------

export async function getGoogleIdToken() {
  const idToken = await SecureStore.getItemAsync(
    ID_TOKEN_KEY
  );

  if (!idToken) {
    return null;
  }

  if (isJwtExpired(idToken)) {
    await signOutGoogle();
    return null;
  }

  return idToken;
}

// --------------------------------------------------
// Get stored user
// --------------------------------------------------

export async function getStoredGoogleUser() {
  const raw = await SecureStore.getItemAsync(
    USER_KEY
  );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --------------------------------------------------
// Sign out
// --------------------------------------------------

export async function signOutGoogle() {
  await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);

  try {
    await GoogleSignin.signOut();
  } catch {
    // User may not currently be signed in
  }
}

// --------------------------------------------------
// JWT helper
// --------------------------------------------------

function isJwtExpired(jwt) {
  try {
    const payload = jwt.split(".")[1];

    const decoded = JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    if (!decoded.exp) {
      return false;
    }

    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}