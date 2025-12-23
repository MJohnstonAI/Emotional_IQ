import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { radii } from "@/design/tokens";

type IconCircleProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function IconCircle({ children, style }: IconCircleProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: 48,
    borderRadius: radii.rXl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
});
