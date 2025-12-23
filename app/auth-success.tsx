import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/design/theme";
import { palette, radii, typography } from "@/design/tokens";
import { supabase } from "@/lib/supabase";

export default function AuthSuccessScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.textMain }]}>Signed in</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Success</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Signed in as</Text>
        <Text style={styles.cardValue}>{email ?? "Loading..."}</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={() => router.replace("/(tabs)/home")}>
        <Text style={styles.primaryButtonText}>Continue</Text>
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
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  card: {
    marginTop: 10,
    padding: 16,
    borderRadius: radii.rLg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  cardLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 16,
    color: "#ffffff",
    fontFamily: typography.fonts.bodyMedium,
  },
  primaryButton: {
    marginTop: 8,
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
});
