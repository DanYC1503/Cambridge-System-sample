import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  hasValidGoogleAuth,
  signOutGoogle,
} from "../api/auth";

const StartPage = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔥 CHECKING AUTH");

      try {
        // TEMPORARY: force logout for testing
        await signOutGoogle();
        console.log("🔥 FORCED LOGOUT");

        const exists = await hasValidGoogleAuth();

        console.log("🔥 AUTH RESULT:", exists);
        setAuthenticated(exists);
      } catch (error) {
        console.error("🔥 AUTH ERROR:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    console.log("🔥 STILL LOADING");
    return null;
  }

  console.log("🔥 FINAL AUTH STATE:", authenticated);

  if (!authenticated) {
    console.log("🔥 REDIRECTING TO LOGIN");
    return <Redirect href="/login" />;
  }

  console.log("🔥 REDIRECTING TO HOME");
  return <Redirect href="/home" />;
};

export default StartPage;