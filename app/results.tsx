import { MaterialIcons } from "@expo/vector-icons";
import { Image, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FidelityContainer from "@/components/FidelityContainer";
import { useTheme } from "@/design/theme";
import { palette, radii, shadows, typography } from "@/design/tokens";
import { utcDateKey } from "@/game/date";
import { shareGrid } from "@/game/scoring";
import { useGameStore } from "@/state/gameStore";
import { Images } from "../assets/images";

const getMedalLabel = (status: string, attemptsCount: number) => {
  if (status !== "won") return "Practice";
  if (attemptsCount <= 2) return "Gold Medal";
  if (attemptsCount <= 4) return "Silver Medal";
  return "Bronze Medal";
};

const getMedalColor = (label: string) => {
  if (label === "Gold Medal") return "#fbbf24";
  if (label === "Silver Medal") return "#e2e8f0";
  if (label === "Bronze Medal") return "#b45309";
  return "#94a3b8";
};

const getResultSummary = (status: string, attemptsCount: number) => {
  if (status === "won") return `${attemptsCount}/6`;
  if (status === "lost") return "X/6";
  return `${attemptsCount}/6`;
};

export default function ResultsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { attempts, status, today } = useGameStore();
  const advanceDay = useGameStore((state) => state.advanceDay);

  const attemptsCount = attempts.length || 0;
  const success = status === "won";
  const medalLabel = getMedalLabel(status, attemptsCount);
  const medalColor = getMedalColor(medalLabel);
  const dateKey = today?.date ?? utcDateKey();
  const grid = today ? shareGrid(attempts.map((a) => a.guess), today.target) : "";
  const shareText = `Emotional IQ ${dateKey} ${getResultSummary(status, attemptsCount)}\n\n${grid}\n\nemoiq.app`;
  const bottomPanelPaddingBottom = 26 + insets.bottom;
  const bottomPanelReserveSpace = 56 + 12 + 48 + 18 + bottomPanelPaddingBottom + 16;

  const copyToClipboard = async (text: string) => {
    const webClipboard = (globalThis as any)?.navigator?.clipboard as
      | { writeText?: (value: string) => Promise<void> }
      | undefined;
    if (Platform.OS === "web" && webClipboard?.writeText) {
      await webClipboard.writeText(text);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Clipboard = require("expo-clipboard") as {
        setStringAsync?: (value: string) => Promise<void>;
      };
      if (Clipboard?.setStringAsync) {
        await Clipboard.setStringAsync(text);
        return;
      }
    } catch {
      // ignore
    }
    await Share.share({ message: text });
  };

  return (
    <FidelityContainer reference={require("../assets/stitch-reference/results.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(styles.content.paddingBottom, bottomPanelReserveSpace) },
          ]}
        >
          <View style={styles.medalWrap}>
            <View style={styles.medalGlow} />
            <Image source={Images.resultsMedal} style={styles.medalImage} resizeMode="contain" />
            <View style={styles.medalLabel}>
              <Text style={[styles.medalLabelText, { color: medalColor }]}>
                {medalLabel}
              </Text>
            </View>
          </View>
          <Text style={[styles.headline, { color: colors.textMain }]}>
            {success ? "Nice calibration." : "Keep practicing."}
          </Text>
          <View style={styles.resultPill}>
            <MaterialIcons name="psychology" size={18} color={palette.dark.accent} />
            <Text style={styles.resultText}>
              {success ? (
                <>
                  Solved in <Text style={styles.resultEm}>{attemptsCount} attempts</Text>
                </>
              ) : (
                <>
                  Attempts used <Text style={styles.resultEm}>{attemptsCount} / 6</Text>
                </>
              )}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>Emotional IQ</Text>
                <View style={styles.summaryMeta}>
                  <Text style={styles.summaryTag}>{getResultSummary(status, attemptsCount)}</Text>
                  <Text style={styles.summarySub}>Daily Puzzle</Text>
                </View>
              </View>
              <View style={styles.summaryIcon}>
                <MaterialIcons name="psychology" size={20} color={palette.dark.accent} />
              </View>
            </View>
            <View style={styles.summaryGrid}>
              {grid
                ? grid.split("\n").map((line) => (
                    <Text key={line} style={styles.gridLine}>
                      {line}
                    </Text>
                  ))
                : null}
            </View>
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryFooterLabel}>Complete</Text>
              <Text style={styles.summaryFooterBrand}>emoiq.app</Text>
            </View>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>
              Empathy is seeing with the eyes of another, listening with the ears of another and feeling with the
              heart of another.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomPanel, { paddingBottom: bottomPanelPaddingBottom }]}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => Share.share({ message: shareText })}
          >
            <MaterialIcons name="ios-share" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Share Result</Text>
          </Pressable>
          <View style={styles.secondaryRow}>
            <Pressable style={styles.secondaryButton} onPress={() => copyToClipboard(shareText)}>
              <MaterialIcons name="content-copy" size={18} color="#94a3b8" />
              <Text style={styles.secondaryButtonText}>Copy</Text>
            </Pressable>
            {__DEV__ ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  advanceDay(1);
                  router.replace("/play/context");
                }}
              >
                <MaterialIcons name="skip-next" size={18} color="#94a3b8" />
                <Text style={styles.secondaryButtonText}>Next Day</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.secondaryGhost}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Text style={styles.secondaryGhostText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </FidelityContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b1121",
  },
  glowTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(59,130,246,0.1)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -120,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(168,85,247,0.08)",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 220,
    gap: 16,
  },
  medalWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  medalGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(59,130,246,0.2)",
    shadowColor: palette.dark.accent,
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  medalImage: {
    width: 140,
    height: 140,
  },
  medalLabel: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#1a2333",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
  },
  medalLabelText: {
    fontSize: 10,
    color: "#fbbf24",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: typography.fonts.displayBold,
  },
  headline: {
    fontSize: 36,
    textAlign: "center",
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  resultPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  resultText: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: typography.fonts.bodyMedium,
  },
  resultEm: {
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  summaryCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: radii.r2xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: palette.dark.card,
    ...shadows.cardDepth,
    overflow: "hidden",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  summaryTitle: {
    fontSize: 22,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  summaryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  summaryTag: {
    fontSize: 10,
    color: "#93c5fd",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 2,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  summarySub: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: typography.fonts.bodyMedium,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryGrid: {
    backgroundColor: "#0d121c",
    padding: 20,
    gap: 10,
    justifyContent: "center",
  },
  gridLine: {
    color: "#e2e8f0",
    fontFamily: typography.fonts.bodyMedium,
    letterSpacing: 1,
    fontSize: 16,
    textAlign: "center",
  },
  summaryFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  summaryFooterLabel: {
    fontSize: 10,
    color: "#94a3b8",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: typography.fonts.displayBold,
  },
  summaryFooterBrand: {
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: 2,
    fontFamily: typography.fonts.displayBold,
  },
  quote: {
    paddingHorizontal: 12,
  },
  quoteText: {
    textAlign: "center",
    fontSize: 15,
    color: "#94a3b8",
    fontFamily: typography.fonts.body,
    fontStyle: "italic",
    lineHeight: 22,
  },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 26,
    backgroundColor: "rgba(11,17,33,0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -12 },
  },
  primaryButton: {
    height: 56,
    borderRadius: radii.rXl,
    backgroundColor: palette.dark.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 13,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: radii.rXl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  secondaryButtonText: {
    color: "#cbd5f5",
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
  },
  secondaryGhost: {
    flex: 1,
    height: 48,
    borderRadius: radii.rXl,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryGhostText: {
    color: "#6b7280",
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
  },
});

