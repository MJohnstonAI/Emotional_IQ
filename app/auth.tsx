import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { useTheme } from "@/design/theme";
import { palette, radii, typography } from "@/design/tokens";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const parseFragmentParams = (url: string) => {
  const fragment = url.split("#")[1];
  if (!fragment) return {} as Record<string, string>;
  const params = new URLSearchParams(fragment);
  const values: Record<string, string> = {};
  params.forEach((value, key) => {
    values[key] = value;
  });
  return values;
};

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const completeSignIn = async (url: string) => {
    if (!supabase) return;
    try {
      const parsed = Linking.parse(url);
      const query = parsed.queryParams ?? {};
      const fragmentParams = parseFragmentParams(url);
      const code = typeof query.code === "string" ? query.code : undefined;
      const accessToken =
        (typeof query.access_token === "string" && query.access_token) ||
        fragmentParams.access_token;
      const refreshToken =
        (typeof query.refresh_token === "string" && query.refresh_token) ||
        fragmentParams.refresh_token;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        setStatus("Signed in successfully.");
        router.replace("/auth-success");
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        setStatus("Signed in successfully.");
        router.replace("/auth-success");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed.";
      setStatus(message);
    }
  };

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      setStatus("Completing sign-in...");
      completeSignIn(url);
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const subscription = Linking.addEventListener("url", handleUrl);
    return () => {
      subscription.remove();
    };
  }, []);

  const sendMagicLink = async () => {
    setStatus(null);
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("Enter a valid email address.");
      return;
    }

    const redirectTo = Linking.createURL("/auth");
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email and open the link on this device.");
    }
  };

  const signInWithGoogle = async () => {
    setStatus(null);
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }

    const redirectTo = Linking.createURL("/auth");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    if (!data?.url) {
      setStatus("Unable to start Google sign-in.");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "success" && result.url) {
      setStatus("Completing sign-in...");
      completeSignIn(result.url);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textMain }]}>Sign In</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Sync your progress across devices.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="you@email.com"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Pressable style={styles.primaryButton} onPress={sendMagicLink}>
        <Text style={styles.primaryButtonText}>Send Magic Link</Text>
      </Pressable>
      <Pressable style={styles.googleButton} onPress={signInWithGoogle}>
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.dark.background,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: typography.fonts.body,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: radii.rLg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    color: "#ffffff",
    fontFamily: typography.fonts.body,
  },
  primaryButton: {
    height: 48,
    borderRadius: radii.rLg,
    backgroundColor: palette.dark.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  googleButton: {
    height: 48,
    borderRadius: radii.rLg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: {
    color: "#e2e8f0",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  status: {
    color: "#94a3b8",
    fontFamily: typography.fonts.body,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontFamily: typography.fonts.bodyMedium,
  },
});
