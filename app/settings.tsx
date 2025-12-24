import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import FidelityContainer from "@/components/FidelityContainer";
import GlowImageBackground from "@/components/GlowImageBackground";
import GlassCard from "@/components/ui/GlassCard";
import IconCircle from "@/components/ui/IconCircle";
import ListRowChevron from "@/components/ui/ListRowChevron";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ToggleRow from "@/components/ui/ToggleRow";
import { useTheme } from "@/design/theme";
import { palette, radii, typography } from "@/design/tokens";
import { IAP_PRODUCTS } from "@/lib/iap";
import { usePurchaseStore } from "@/state/purchaseStore";
import { useBranchingGameStore } from "@/state/branchingGameStore";
import { useSettingsStore } from "@/state/settingsStore";
import { Images } from "../assets/images";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { theme, setTheme, highContrast, setHighContrast, reduceMotion, setReduceMotion } =
    useSettingsStore();
  const { purchase, restore } = usePurchaseStore();
  const activePuzzle = useBranchingGameStore((state) => state.puzzle);
  const selectedDate = useBranchingGameStore((state) => state.selectedDateKey);
  const setSelectedDate = useBranchingGameStore((state) => state.setSelectedDateKey);
  const advanceDay = useBranchingGameStore((state) => state.advanceDay);

  return (
    <FidelityContainer reference={require("../assets/stitch-reference/settings.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={18} color={palette.dark.cyan} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>Settings</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Appearance</Text>
            <GlassCard style={styles.previewCard}>
              <GlowImageBackground
                source={Images.settingsPreview}
                style={styles.previewImage}
                imageStyle={styles.previewImageInner}
              >
                <View style={styles.previewOverlay}>
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>Live Preview</Text>
                  </View>
                </View>
              </GlowImageBackground>
            </GlassCard>
            <GlassCard style={styles.cardGroup}>
              <SegmentedControl
                options={[
                  { key: "light", label: "Light" },
                  { key: "dark", label: "Dark" },
                  { key: "system", label: "System" },
                ]}
                value={theme}
                onChange={(value) => setTheme(value as typeof theme)}
              />
              <View style={styles.divider} />
              <ToggleRow
                label="High Contrast"
                value={highContrast}
                onValueChange={setHighContrast}
                icon={
                  <IconCircle style={styles.iconCircleBlue}>
                    <MaterialIcons name="contrast" size={18} color="#60a5fa" />
                  </IconCircle>
                }
              />
              <View style={styles.divider} />
              <ToggleRow
                label="Reduce Motion"
                value={reduceMotion}
                onValueChange={setReduceMotion}
                icon={
                  <IconCircle style={styles.iconCirclePurple}>
                    <MaterialIcons name="motion-photos-off" size={18} color="#a855f7" />
                  </IconCircle>
                }
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Account</Text>
            <GlassCard style={styles.cardGroup}>
              <View style={styles.accountRow}>
                <View style={styles.accountLeft}>
                  <View style={styles.avatar}>
                    <MaterialIcons name="person" size={22} color="#6b7280" />
                  </View>
                  <View>
                    <Text style={styles.accountName}>Guest User</Text>
                    <Text style={styles.accountSub}>Locally stored</Text>
                  </View>
                </View>
                <View style={styles.accountBadge}>
                  <Text style={styles.accountBadgeText}>Not Synced</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Pressable style={styles.accountLink} onPress={() => router.push("/auth")}>
                <Text style={styles.accountLinkText}>Sign In to Sync Progress</Text>
                <MaterialIcons name="chevron-right" size={20} color="#6b7280" />
              </Pressable>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Monetization</Text>
            <GlassCard style={styles.monetizationCard}>
              <Text style={styles.monetizationTitle}>Remove Ads</Text>
              <Text style={styles.monetizationBody}>
                Support the mission and focus on your emotional growth without interruptions.
              </Text>
              <View style={styles.monetizationList}>
                {["No ads, ever", "Cleaner, mindful focus environment", "One-time purchase"].map(
                  (item) => (
                    <View key={item} style={styles.monetizationItem}>
                      <MaterialIcons name="check-circle" size={18} color="#22c55e" />
                      <Text style={styles.monetizationItemText}>{item}</Text>
                    </View>
                  )
                )}
              </View>
              <Pressable
                style={styles.purchaseButton}
                onPress={() => purchase(IAP_PRODUCTS.removeAds)}
              >
                <MaterialIcons name="diamond" size={18} color="#0b0b0d" />
                <Text style={styles.purchaseButtonText}>Remove Ads ($4.99)</Text>
              </Pressable>
              <Pressable onPress={() => restore()}>
                <Text style={styles.restoreText}>Restore purchase</Text>
              </Pressable>
            </GlassCard>
          </View>

          <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Privacy & Legal</Text>
            <GlassCard style={styles.cardGroup}>
              <ListRowChevron
                label="How It Works"
                icon={<MaterialIcons name="help" size={18} color="#6b7280" />}
                onPress={() => router.push("/help")}
              />
              <View style={styles.divider} />
              <ListRowChevron
                label="Privacy Policy"
                icon={<MaterialIcons name="policy" size={18} color="#6b7280" />}
                onPress={() => router.push("/privacy")}
              />
              <View style={styles.divider} />
              <ListRowChevron
                label="Terms of Service"
                icon={<MaterialIcons name="gavel" size={18} color="#6b7280" />}
                onPress={() => router.push("/terms")}
              />
              <View style={styles.divider} />
              <ListRowChevron
                label="Contact Support"
                icon={<MaterialIcons name="mail" size={18} color="#6b7280" />}
              />
            </GlassCard>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Emotional IQ v2.1.0</Text>
              <Text style={styles.footerSub}>Design for Mindfulness</Text>
            </View>
          </View>

          {__DEV__ ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Developer</Text>
              <GlassCard style={styles.cardGroup}>
                <Text style={styles.devTitle}>Time Travel</Text>
                <Text style={styles.devBody}>
                  Active: {activePuzzle?.dailyDate ?? "???"}{" "}
                  {selectedDate ? "(override)" : "(system)"}
                </Text>
                <View style={styles.devButtons}>
                  <Pressable style={styles.devButton} onPress={() => advanceDay(-1)}>
                    <Text style={styles.devButtonText}>Prev Day</Text>
                  </Pressable>
                  <Pressable style={styles.devButton} onPress={() => advanceDay(1)}>
                    <Text style={styles.devButtonText}>Next Day</Text>
                  </Pressable>
                  <Pressable
                    style={styles.devButtonSecondary}
                    onPress={() => setSelectedDate(null)}
                  >
                    <Text style={styles.devButtonSecondaryText}>Reset</Text>
                  </Pressable>
                </View>
                <Text style={styles.devHint}>
                  Use this to jump across days while testing.
                </Text>
              </GlassCard>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </FidelityContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    marginRight: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#71717a",
    fontFamily: typography.fonts.displayBold,
    marginLeft: 6,
  },
  previewCard: {
    padding: 8,
  },
  previewImage: {
    height: 140,
    justifyContent: "flex-end",
  },
  previewImageInner: {
    borderRadius: 16,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 12,
    justifyContent: "flex-end",
  },
  previewBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  previewBadgeText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  cardGroup: {
    padding: 16,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  iconCircleBlue: {
    backgroundColor: "rgba(96,165,250,0.15)",
  },
  iconCirclePurple: {
    backgroundColor: "rgba(168,85,247,0.12)",
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    fontSize: 15,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  accountSub: {
    fontSize: 12,
    color: "#71717a",
    fontFamily: typography.fonts.bodyMedium,
  },
  accountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  accountBadgeText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#71717a",
    fontFamily: typography.fonts.displayBold,
  },
  accountLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountLinkText: {
    fontSize: 14,
    color: palette.dark.cyan,
    fontFamily: typography.fonts.displayBold,
  },
  monetizationCard: {
    padding: 20,
    gap: 12,
  },
  monetizationTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
  },
  monetizationBody: {
    fontSize: 13,
    color: "#71717a",
    fontFamily: typography.fonts.body,
    lineHeight: 18,
  },
  monetizationList: {
    gap: 10,
    marginTop: 4,
  },
  monetizationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monetizationItemText: {
    fontSize: 13,
    color: "#d1d5db",
    fontFamily: typography.fonts.bodyMedium,
  },
  purchaseButton: {
    height: 48,
    borderRadius: radii.rLg,
    backgroundColor: palette.dark.cyan,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 13,
    color: "#0b0b0d",
    fontFamily: typography.fonts.displayBold,
  },
  restoreText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#71717a",
    textAlign: "center",
    fontFamily: typography.fonts.displayBold,
  },
  footer: {
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  footerText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "#52525b",
    fontFamily: typography.fonts.displayBold,
  },
  footerSub: {
    fontSize: 10,
    color: "#3f3f46",
    fontFamily: typography.fonts.bodyMedium,
  },
  devTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
  },
  devBody: {
    fontSize: 13,
    color: "#a1a1aa",
    fontFamily: typography.fonts.body,
    lineHeight: 18,
  },
  devButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  devButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radii.rLg,
    backgroundColor: palette.dark.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  devButtonText: {
    fontSize: 12,
    color: "#0b0b0d",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  devButtonSecondary: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radii.rLg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  devButtonSecondaryText: {
    fontSize: 12,
    color: "#e2e8f0",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  devHint: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(148,163,184,0.7)",
    fontFamily: typography.fonts.body,
  },
});




