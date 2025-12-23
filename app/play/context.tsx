import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import FidelityContainer from "@/components/FidelityContainer";
import { useTheme } from "@/design/theme";
import { palette, radii, shadows, typography } from "@/design/tokens";
import { useBranchingGameStore } from "@/state/branchingGameStore";

export default function ContextScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { puzzle, loading, error, loadDaily, resetFlow } = useBranchingGameStore();

  useEffect(() => {
    resetFlow();
    loadDaily();
  }, [loadDaily, resetFlow]);

  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/play.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>Daily Puzzle</Text>
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>
              Context
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <MaterialIcons name="psychology" size={16} color={palette.dark.accent} />
            <Text style={styles.headerBadgeText}>{puzzle?.category ?? "Detective"}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Situation</Text>
            <Text style={styles.contextText}>
              {loading ? "Loading today's case..." : puzzle?.context ?? "No daily puzzle yet."}
            </Text>
          </View>

          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>Message</Text>
            <Text style={styles.messageText}>
              {loading ? "Loading message..." : puzzle?.message ?? ""}
            </Text>
          </View>

          <View style={styles.rulesCard}>
            <View style={styles.rulesHeader}>
              <MaterialIcons name="radar" size={18} color={palette.dark.accent} />
              <Text style={styles.rulesTitle}>How this works</Text>
            </View>
            <Text style={styles.rulesBody}>
              You will make three decisions. Commit to each choice to reveal the real subtext.
              No rewinds once you begin.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => router.replace("/play/round-1")}
            style={[styles.commitButton, (!puzzle || loading) && styles.commitButtonDisabled]}
            disabled={!puzzle || loading}
          >
            <Text style={styles.commitText}>Start Round 1</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#0f172a" />
          </Pressable>
        </View>
      </View>
    </FidelityContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.dark.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 28,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerEyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: palette.dark.accent,
    fontFamily: typography.fonts.displayBold,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: typography.fonts.display,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  headerBadgeText: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: palette.dark.accent,
    fontFamily: typography.fonts.displayBold,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 140,
    gap: 18,
  },
  contextCard: {
    backgroundColor: palette.dark.card,
    borderRadius: radii.r2xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    ...shadows.cardDepth,
  },
  contextLabel: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
    marginBottom: 10,
  },
  contextText: {
    fontSize: 18,
    color: "#ffffff",
    fontFamily: typography.fonts.body,
    lineHeight: 26,
  },
  messageCard: {
    backgroundColor: palette.dark.card,
    borderRadius: radii.r2xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    ...shadows.cardDepth,
  },
  messageLabel: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: typography.fonts.display,
    lineHeight: 28,
  },
  rulesCard: {
    padding: 18,
    borderRadius: radii.rXl,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  rulesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  rulesTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#e2e8f0",
    fontFamily: typography.fonts.displayBold,
  },
  rulesBody: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: typography.fonts.body,
    lineHeight: 20,
  },
  errorText: {
    color: palette.dark.warning,
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 12,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: "rgba(5,9,20,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.1)",
  },
  commitButton: {
    height: 54,
    borderRadius: radii.rXl,
    backgroundColor: palette.dark.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  commitButtonDisabled: {
    opacity: 0.5,
  },
  commitText: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#0f172a",
    fontFamily: typography.fonts.displayBold,
  },
});
