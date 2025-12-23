import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { palette, radii, shadows } from "@/design/tokens";

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.dark.card,
    borderRadius: radii.r2xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    ...shadows.cardDepth,
  },
});
