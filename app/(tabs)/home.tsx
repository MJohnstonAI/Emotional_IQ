import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import FidelityContainer from "@/components/FidelityContainer";
import GlowImageBackground from "@/components/GlowImageBackground";
import GlassCard from "@/components/ui/GlassCard";
import IconCircle from "@/components/ui/IconCircle";
import StatTile from "@/components/ui/StatTile";
import { useTheme } from "@/design/theme";
import { palette, radii, shadows, typography } from "@/design/tokens";
import { IAP_PRODUCTS } from "@/lib/iap";
import { useBranchingGameStore } from "@/state/branchingGameStore";
import { usePurchaseStore } from "@/state/purchaseStore";
import { Images } from "../../assets/images";
import { useEffect } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { puzzle, loading, isCompleted, error, loadDaily } = useBranchingGameStore();
  const purchase = usePurchaseStore((state) => state.purchase);

  useEffect(() => {
    loadDaily();
  }, [loadDaily]);

  const statusLabel = loading
    ? "Loading"
    : error
      ? "Unavailable"
      : isCompleted
        ? "Complete"
        : "Not Started";

  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/home.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View>
            <Text style={[styles.title, { color: colors.textMain }]}>Emotional IQ</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Daily emotional fitness
            </Text>
          </View>
          <Pressable onPress={() => router.push("/settings")} style={styles.iconButton}>
            <MaterialIcons name="settings" size={22} color="#6b7280" />
          </Pressable>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroCard}>
            <View style={styles.statusPill}>
              <View style={styles.pingDot} />
              <Text style={styles.statusText}>
                {statusLabel}
              </Text>
            </View>
            <GlowImageBackground
              source={Images.homeHero}
              style={styles.heroImage}
              imageStyle={styles.heroImageInner}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroEyebrow}>Today's Puzzle</Text>
                <Text style={styles.heroTitle}>{puzzle?.category ?? "Daily Quiz"}</Text>
                <Text style={styles.heroBody}>
                  {puzzle?.message ?? "Open today's message and decode the subtext."}
                </Text>
              </View>
            </GlowImageBackground>
            <View style={styles.heroAction}>
              <Pressable
                style={[styles.playButton, (!puzzle || loading) && styles.playButtonDisabled]}
                onPress={() => router.push("/play/context")}
                disabled={!puzzle || loading}
              >
                <MaterialIcons name="play-circle" size={22} color={palette.dark.accent} />
                <Text style={styles.playButtonText}>
                  {loading ? "Loading..." : "Play Today"}
                </Text>
              </Pressable>
            </View>
          </View>

          <GlassCard style={styles.connectionCard}>
            <IconCircle style={styles.connectionIcon}>
              <MaterialIcons name="public" size={22} color={palette.dark.accent} />
            </IconCircle>
            <View style={styles.connectionText}>
              <Text style={styles.connectionTitle}>Global Connection</Text>
              <Text style={styles.connectionSubtitle}>Same puzzle for everyone today</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#1f2937" />
          </GlassCard>

          <View style={styles.statRow}>
            <StatTile
              label="Streak"
              value="14 Days"
              subLabel="Growing stronger"
              icon={<MaterialIcons name="spa" size={16} color="#6b7280" />}
            />
            <StatTile
              label="Level"
              value="Empathy"
              subLabel="Level 2"
              icon={<MaterialIcons name="military-tech" size={16} color="#6b7280" />}
            />
          </View>

          <Pressable style={styles.adFree} onPress={() => purchase(IAP_PRODUCTS.removeAds)}>
            <Text style={[styles.adFreeText, { color: colors.textMuted }]}>Go Ad-Free</Text>
            <MaterialIcons name="arrow-forward" size={14} color="#6b7280" />
          </Pressable>
        </ScrollView>
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: "rgba(5, 9, 20, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  title: {
    fontSize: 30,
    fontFamily: typography.fonts.display,
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: typography.fonts.bodyMedium,
    color: "#94a3b8",
    letterSpacing: typography.letterSpacing.ultra,
    textTransform: "uppercase",
    marginTop: 10,
  },
  iconButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 120,
    paddingTop: 16,
    gap: 24,
  },
  heroCard: {
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: palette.dark.card,
    ...shadows.cardDepth,
  },
  statusPill: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.dark.accent,
    shadowColor: palette.dark.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  statusText: {
    fontSize: 9,
    color: palette.dark.accentDim,
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroImage: {
    height: 280,
    justifyContent: "flex-end",
  },
  heroImageInner: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  heroContent: {
    padding: 24,
    paddingBottom: 28,
  },
  heroEyebrow: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: palette.dark.accent,
    fontFamily: typography.fonts.displayBold,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 38,
    color: "#ffffff",
    fontFamily: typography.fonts.display,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 15,
    color: "rgba(226,232,240,0.9)",
    fontFamily: typography.fonts.body,
  },
  heroAction: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  playButton: {
    height: 56,
    borderRadius: 26,
    backgroundColor: "#1a2333",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 1,
  },
  connectionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
  },
  connectionIcon: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  connectionText: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: 15,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  connectionSubtitle: {
    fontSize: 11,
    color: "#7b8798",
    fontFamily: typography.fonts.bodyMedium,
    marginTop: 4,
  },
  statRow: {
    flexDirection: "row",
    gap: 16,
  },
  adFree: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radii.rXl,
  },
  adFreeText: {
    fontSize: 11,
    color: "#8b94a6",
    fontFamily: typography.fonts.bodyMedium,
    letterSpacing: 1,
  },
});

