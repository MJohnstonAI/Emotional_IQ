import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "@/design/tokens";

export default function SponsorBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 0) }]}>
      <View style={styles.content}>
        <MaterialIcons name="ads-click" size={14} color="#5b677b" />
        <Text style={styles.label}>Sponsor</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    backgroundColor: "rgba(5, 11, 20, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    opacity: 0.4,
  },
  label: {
    color: "#6b7280",
    fontSize: 9,
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
