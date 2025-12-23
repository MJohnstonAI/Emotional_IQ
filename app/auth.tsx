import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/design/theme";
import { palette, radii, typography } from "@/design/tokens";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const sendMagicLink = async () => {
    setStatus(null);
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email for a magic link.");
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
