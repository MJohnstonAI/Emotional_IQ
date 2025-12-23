import { MaterialIcons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import FidelityContainer from "@/components/FidelityContainer";
import { useTheme } from "@/design/theme";
import { palette, radii, shadows, typography } from "@/design/tokens";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { useBranchingGameStore } from "@/state/branchingGameStore";
import { Images } from "../../assets/images";

const scoreFromCorrect = (correctCount: number) => {
  if (correctCount >= 3) return 100;
  if (correctCount === 2) return 66;
  if (correctCount === 1) return 33;
  return 0;
};

const waitForPlaybackEnd = (sound: Audio.Sound) =>
  new Promise<void>((resolve) => {
    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        resolve();
      }
    });
  });

export default function RevealScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { puzzle, selections } = useBranchingGameStore();
  const [globalPercent, setGlobalPercent] = useState<number | null>(null);
  const hasPlayedReward = useRef(false);

  const correctCount = useMemo(() => {
    if (!puzzle) return 0;
    return puzzle.rounds.reduce((acc, round, index) => {
      const selected = selections[index];
      return acc + (selected && selected === round.correct_key ? 1 : 0);
    }, 0);
  }, [puzzle, selections]);

  const score = scoreFromCorrect(correctCount);

  useEffect(() => {
    if (hasPlayedReward.current) return;
    hasPlayedReward.current = true;\nconst playRewards = async () => {
      try {
        if (score === 100) {
          const medalSound = await Audio.Sound.createAsync(
            require("../../assets/sounds/medal_applause.wav"),
            { shouldPlay: true }
          );
          await waitForPlaybackEnd(medalSound.sound);
          await medalSound.sound.unloadAsync();
          return;
        }

        const revealSound = await Audio.Sound.createAsync(
          require("../../assets/sounds/bigreveal.mp3"),
          { shouldPlay: true }
        );
        await waitForPlaybackEnd(revealSound.sound);
        await revealSound.sound.unloadAsync();
      } catch {
        // Best-effort audio: ignore failures.
      }
    };

    playRewards();
  }, [score]);

  useEffect(() => {
    if (!puzzle || !supabaseEnabled || !supabase) {
      setGlobalPercent(null);
      return;
    }

    supabase
      .from("puzzle_stats")
      .select("total_plays,correct_count")
      .eq("puzzle_id", puzzle.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || !data.total_plays) {
          setGlobalPercent(null);
          return;
        }
        const percent = Math.round((data.correct_count / data.total_plays) * 100);
        setGlobalPercent(percent);
      });
  }, [puzzle]);

  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/results.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scorePill}>
            <MaterialIcons name="psychology" size={18} color={palette.dark.accent} />
            <Text style={styles.scoreText}>Score {score}/100</Text>
          </View>

          {score === 100 ? (
            <View style={styles.trophyContainer}>
              <Image
                source={Images.resultsMedal}
                style={styles.trophyImage}
                resizeMode="contain"
              />
              <Text style={styles.trophySubtext}>PERFECT RESONANCE</Text>
            </View>
          ) : null}

          <Text style={[styles.headline, { color: colors.textMain }]}>The Truth</Text>

          <View style={styles.truthCard}>
            <Text style={styles.truthLabel}>Hidden Read</Text>
            <Text style={styles.truthText}>{puzzle?.reveal.truth ?? ""}</Text>
            <Text style={styles.truthBody}>{puzzle?.reveal.explanation ?? ""}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Global result</Text>
              <Text style={styles.statValue}>
                {globalPercent == null
                  ? "Only 27% got this right"
                  : `Only ${globalPercent}% got this right`}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Your accuracy</Text>
              <Text style={styles.statValue}>{correctCount}/3 correct</Text>
            </View>
          </View>

          {puzzle?.reveal.pattern ? (
            <View style={styles.patternCard}>
              <Text style={styles.patternLabel}>Pattern</Text>
              <Text style={styles.patternText}>{puzzle.reveal.pattern}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable onPress={() => router.replace("/(tabs)/home")} style={styles.primaryButton}>
            <MaterialIcons name="home" size={18} color="#0f172a" />
            <Text style={styles.primaryText}>Back to Home</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} disabled>
            <MaterialIcons name="share" size={16} color="#94a3b8" />
            <Text style={styles.secondaryText}>Share (next step)</Text>
          </Pressable>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 180,
    gap: 18,
  },
  scorePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    backgroundColor: "rgba(56,189,248,0.1)",
  },
  scoreText: {
    color: "#e2e8f0",
    fontFamily: typography.fonts.displayBold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  trophyContainer: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 2,
    shadowColor: palette.dark.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 6,
  },
  trophyImage: {
    width: 120,
    height: 120,
  },
  trophySubtext: {
    marginTop: -8,
    fontSize: 10,
    fontFamily: typography.fonts.displayBold,
    color: palette.dark.accent,
    letterSpacing: 3,
  },
  headline: {
    fontSize: 34,
    fontFamily: typography.fonts.displayBold,
    color: "#ffffff",
  },
  truthCard: {
    backgroundColor: palette.dark.card,
    borderRadius: radii.r2xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    ...shadows.cardDepth,
  },
  truthLabel: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
    marginBottom: 8,
  },
  truthText: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: typography.fonts.display,
    marginBottom: 12,
  },
  truthBody: {
    fontSize: 14,
    color: "#cbd5f5",
    fontFamily: typography.fonts.body,
    lineHeight: 22,
  },
  statCard: {
    borderRadius: radii.rXl,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    padding: 16,
    gap: 10,
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: typography.fonts.bodyMedium,
  },
  statValue: {
    fontSize: 12,
    color: "#e2e8f0",
    fontFamily: typography.fonts.bodyMedium,
  },
  patternCard: {
    borderRadius: radii.rXl,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
    padding: 16,
    backgroundColor: "rgba(56,189,248,0.08)",
  },
  patternLabel: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: palette.dark.accent,
    fontFamily: typography.fonts.displayBold,
    marginBottom: 6,
  },
  patternText: {
    fontSize: 13,
    color: "#e2e8f0",
    fontFamily: typography.fonts.body,
    lineHeight: 20,
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
    gap: 10,
  },
  primaryButton: {
    height: 52,
    borderRadius: radii.rXl,
    backgroundColor: palette.dark.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#0f172a",
    fontFamily: typography.fonts.displayBold,
  },
  secondaryButton: {
    height: 48,
    borderRadius: radii.rXl,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    opacity: 0.7,
  },
  secondaryText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: typography.fonts.bodyMedium,
  },
});

