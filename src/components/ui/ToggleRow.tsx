import { ReactNode } from "react";
import { StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from "react-native";

import { palette, typography } from "@/design/tokens";

type ToggleRowProps = {
  icon?: ReactNode;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export default function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
  style,
}: ToggleRowProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#ffffff"
        trackColor={{ false: "#2b3444", true: palette.dark.cyan }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: "#e2e8f0",
    fontFamily: typography.fonts.bodyMedium,
  },
});
