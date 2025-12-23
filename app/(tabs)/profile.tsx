import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import FidelityContainer from "@/components/FidelityContainer";
import GlassCard from "@/components/ui/GlassCard";
import { useTheme } from "@/design/theme";
import { palette, radii, typography } from "@/design/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/settings.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textMain }]}>Profile</Text>
          <Pressable onPress={() => router.push("/settings")} style={styles.iconButton}>
            <MaterialIcons name="settings" size={22} color="#6b7280" />
          </Pressable>
        </View>
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Guest User</Text>
            <Text style={styles.cardSubtitle}>Locally stored progress</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/auth")}>
              <MaterialIcons name="login" size={18} color="#0b0b0d" />
              <Text style={styles.primaryButtonText}>Sign In to Sync</Text>
            </Pressable>
          </GlassCard>
        </View>
      </View>
    </FidelityContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.dark.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 28,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  title: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  iconButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  card: {
    padding: 24,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: typography.fonts.body,
  },
  primaryButton: {
    marginTop: 12,
    height: 48,
    borderRadius: radii.rLg,
    backgroundColor: palette.dark.cyan,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#0b0b0d",
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
});
