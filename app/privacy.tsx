import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { useTheme } from "@/design/theme";
import { palette, typography } from "@/design/tokens";

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios-new" size={18} color={palette.dark.cyan} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>What we collect</Text>
          <Text style={styles.cardBody}>
            Guest play stores settings and puzzle progress on your device. If you sign in, we
            store your puzzle completions, scores, streaks, and profile (pseudonym, optional
            country) in Supabase.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>How we use it</Text>
          <Text style={styles.cardBody}>
            We use your data to run the game, compute global stats, and show leaderboards.
            We do not sell your personal data.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Sharing</Text>
          <Text style={styles.cardBody}>
            Shared results only include your score and aggregate stats. The actual message text
            is never shared.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Your choices</Text>
          <Text style={styles.cardBody}>
            You can play as a guest, or sign in to sync progress. To delete local data, remove
            the app. To delete synced data, contact support.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050914",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "rgba(226,232,240,0.9)",
    fontFamily: typography.fonts.displayBold,
  },
  cardBody: {
    fontSize: 14,
    color: "rgba(148,163,184,0.9)",
    fontFamily: typography.fonts.body,
    lineHeight: 20,
  },
});
