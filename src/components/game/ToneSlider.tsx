import Slider from "@react-native-community/slider";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import type { Tone } from "@/game/types";
import { palette, radii, typography } from "@/design/tokens";
import DragSlider from "@/components/game/DragSlider";

const toneMeta: Record<Tone, { label: string; emoji: string }> = {
  anger: { label: "Anger", emoji: "😡" },
  affection: { label: "Affection", emoji: "❤️" },
  anxiety: { label: "Anxiety", emoji: "😬" },
  joy: { label: "Joy", emoji: "😄" },
  control: { label: "Control", emoji: "🕹️" },
};

type ToneSliderProps = {
  tone: Tone;
  value: number; // committed value
  onChange: (value: number) => void; // commit only (on release)
};

const clamp100 = (value: number) => Math.min(Math.max(value, 0), 100);

export default function ToneSlider({ tone, value, onChange }: ToneSliderProps) {
  const meta = toneMeta[tone];
  const safeValue = clamp100(Number.isFinite(value) ? value : 50);
  const [preview, setPreview] = useState(safeValue);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isSliding) setPreview(safeValue);
  }, [isSliding, safeValue]);

  const commit = (nextValue: number) => {
    const committed = clamp100(nextValue);
    setPreview(committed);
    setIsSliding(false);
    onChange(committed);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
          <Text style={styles.label}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.centerValue}>
        <Text style={styles.centerValueText}>{Math.round(preview)}%</Text>
      </View>

      {Platform.OS === "web" ? (
        <DragSlider
          value={preview}
          onChange={(next) => {
            setIsSliding(true);
            setPreview(clamp100(next));
          }}
          onCommit={(next) => commit(next)}
        />
      ) : (
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={preview}
          onSlidingStart={() => setIsSliding(true)}
          onValueChange={(v) => setPreview(clamp100(v))}
          onSlidingComplete={(v) => {
            commit(v);
          }}
          minimumTrackTintColor="rgba(148,163,184,0.18)"
          maximumTrackTintColor="rgba(148,163,184,0.18)"
          thumbTintColor={palette.dark.accent}
        />
      )}

      <View style={styles.stepperRow}>
        <Pressable
          accessibilityRole="button"
          style={styles.stepperButton}
          onPress={() => commit(preview - 1)}
        >
          <Text style={styles.stepperText}>-</Text>
        </Pressable>
        <View style={styles.stepperSpacer} />
        <Pressable
          accessibilityRole="button"
          style={styles.stepperButton}
          onPress={() => commit(preview + 1)}
        >
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.rXl,
    padding: 14,
    backgroundColor: "rgba(11,17,33,0.6)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#e2e8f0",
    fontFamily: typography.fonts.displayBold,
  },
  centerValue: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  centerValueText: {
    fontSize: 18,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 1.5,
  },
  stepperRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  stepperSpacer: {
    flex: 1,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontSize: 20,
    color: "#e2e8f0",
    fontFamily: typography.fonts.displayBold,
    lineHeight: 20,
  },
});
