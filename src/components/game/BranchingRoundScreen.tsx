import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/design/theme";
import { palette, radii, shadows, typography } from "@/design/tokens";
import { useBranchingGameStore } from "@/state/branchingGameStore";

export default function BranchingRoundScreen({
  roundIndex,
  nextRoute,
}: {
  roundIndex: number;
  nextRoute: string;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const { puzzle, selections, setSelection } = useBranchingGameStore();

  const round = puzzle?.rounds?.[roundIndex];
  const selectedKey = selections[roundIndex];

  const onCommit = () => {
    if (!selectedKey) return;
    router.replace(nextRoute);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Round {roundIndex + 1} of 3</Text>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>
            {puzzle?.category ?? "Decode the Subtext"}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <MaterialIcons name="psychology" size={16} color={palette.dark.accent} />
          <Text style={styles.headerBadgeText}>Daily Puzzle</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question {roundIndex + 1}</Text>
          <Text style={styles.questionText}>{round?.question ?? ""}</Text>
        </View>

        <View style={styles.optionStack}>
          {(round?.options ?? []).map((option) => {
            const isSelected = selectedKey === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setSelection(roundIndex, option.key)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardActive,
                ]}
              >
                <View style={[styles.optionDot, isSelected && styles.optionDotActive]} />
                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={onCommit}
          style={[styles.commitButton, !selectedKey && styles.commitButtonDisabled]}
        >
          <Text style={styles.commitText}>Commit Choice</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#0f172a" />
        </Pressable>
      </View>
    </View>
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
    fontSize: 26,
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
    gap: 20,
  },
  questionCard: {
    backgroundColor: palette.dark.card,
    borderRadius: radii.r2xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    ...shadows.cardDepth,
  },
  questionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: typography.fonts.display,
    lineHeight: 28,
  },
  optionStack: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radii.rXl,
    backgroundColor: "rgba(15,23,42,0.7)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
  },
  optionCardActive: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.4)",
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(148,163,184,0.6)",
  },
  optionDotActive: {
    borderColor: palette.dark.accent,
    backgroundColor: palette.dark.accent,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: "#e2e8f0",
    fontFamily: typography.fonts.bodyMedium,
  },
  optionTextActive: {
    color: "#ffffff",
    fontFamily: typography.fonts.bodySemi,
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


