import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { typography } from "@/design/tokens";

type ListRowChevronProps = {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ListRowChevron({
  label,
  icon,
  onPress,
  style,
}: ListRowChevronProps) {
  return (
    <Pressable style={[styles.row, style]} onPress={onPress}>
      <View style={styles.left}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#5b6476" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
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
