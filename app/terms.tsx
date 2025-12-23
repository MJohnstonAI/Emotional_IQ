import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { useTheme } from "@/design/theme";
import { palette, typography } from "@/design/tokens";

export default function TermsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios-new" size={18} color={palette.dark.cyan} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Use of the app</Text>
          <Text style={styles.cardBody}>
            Emotional IQ is a game for learning and reflection. It is not medical, legal, or
            professional advice.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Gameplay rules</Text>
          <Text style={styles.cardBody}>
            One attempt per puzzle. No replay of daily puzzles after the date passes. Do not
            use automated tools to manipulate scores or leaderboards.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Purchases</Text>
          <Text style={styles.cardBody}>
            Purchases are handled by your app store. Refunds are subject to the store policy.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Changes</Text>
          <Text style={styles.cardBody}>
            We may update features, content, or policies over time. Continued use means you
            accept the latest version.
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
