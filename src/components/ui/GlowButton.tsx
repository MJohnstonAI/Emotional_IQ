import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { palette, radii, typography } from "@/design/tokens";
import { useSettingsStore } from "@/state/settingsStore";

type GlowButtonProps = {
  title: string;
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function GlowButton({ title, icon, onPress, style }: GlowButtonProps) {
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        [style, !reduceMotion && pressed && styles.pressed].filter(Boolean)
      }
    >
      <LinearGradient
        colors={[palette.dark.cyan, "#08a6c7"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.button}
      >
        {icon}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radii.rXl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: palette.dark.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  text: {
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
