import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { palette, radii, shadows, typography } from "@/design/tokens";

type StatTileProps = {
  label: string;
  value: string;
  subLabel?: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function StatTile({
  label,
  value,
  subLabel,
  icon,
  style,
}: StatTileProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueBlock}>
        <Text style={styles.value}>{value}</Text>
        {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: radii.r3xl,
    backgroundColor: palette.dark.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    ...shadows.cardDepth,
    minHeight: 140,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 9,
    letterSpacing: typography.letterSpacing.ultra,
    textTransform: "uppercase",
    color: "#7b8798",
    fontFamily: typography.fonts.displayBold,
  },
  valueBlock: {
    marginTop: 24,
  },
  value: {
    fontSize: 22,
    color: palette.dark.textMain,
    fontFamily: typography.fonts.display,
  },
  subLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: typography.fonts.bodyMedium,
    marginTop: 6,
  },
});
