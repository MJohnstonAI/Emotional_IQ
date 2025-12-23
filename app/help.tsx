import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/ui/GlassCard";
import { useTheme } from "@/design/theme";
import { palette, radii, typography } from "@/design/tokens";

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios-new" size={18} color={palette.dark.cyan} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>How It Works</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Daily Puzzle</Text>
          <Text style={styles.cardBody}>
            Each day you get one scenario and one message. Your job is to decode the intent
            behind the words.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Three Decisions</Text>
          <Text style={styles.cardBody}>
            You answer three unique questions in a row. Each choice narrows the truth until
            the reveal.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Commitment</Text>
          <Text style={styles.cardBody}>
            One decision per screen. No back navigation during a puzzle. Commit each choice
            to proceed.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Scoring</Text>
          <Text style={styles.cardBody}>
            3 correct = 100. 2 correct = 66. 1 correct = 33. 0 correct = 0.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Stats and Sharing</Text>
          <Text style={styles.cardBody}>
            After the reveal you see how most players answered. Share your score without
            spoilers.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>
          <Text style={styles.cardBody}>
            Guest progress is stored locally. If you sign in, your completions and streaks
            can sync to Supabase.
          </Text>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tip: triple-tap the header area to toggle the Stitch overlay.</Text>
        </View>
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
  footer: {
    paddingTop: 6,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(148,163,184,0.7)",
    fontFamily: typography.fonts.body,
    textAlign: "center",
  },
});
