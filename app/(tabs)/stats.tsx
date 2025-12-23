import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import FidelityContainer from "@/components/FidelityContainer";
import { useTheme } from "@/design/theme";
import { palette, radii, shadows, typography } from "@/design/tokens";
import { IAP_PRODUCTS } from "@/lib/iap";
import { usePurchaseStore } from "@/state/purchaseStore";

export default function StatsScreen() {
  const { colors } = useTheme();
  const { purchase, entitlements } = usePurchaseStore();
  const proAccess = entitlements.proAccess;
  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/stats.png")}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <MaterialIcons name="arrow-back" size={22} color="#7b8798" />
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>Your Practice</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyGlow} />
            <View style={styles.weeklyContent}>
              <View style={styles.weeklyBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>Weekly Cycle</Text>
              </View>
              <Text style={styles.weeklyValue}>5 Days</Text>
              <Text style={styles.weeklySubtitle}>
                You practiced 5 days this week. Keeping the rhythm!
              </Text>
              <View style={styles.medalRow}>
                <View style={styles.medalItem}>
                  <MaterialIcons name="military-tech" size={22} color="#f59e0b" />
                  <Text style={styles.medalText}>3</Text>
                </View>
                <View style={styles.medalDivider} />
                <View style={styles.medalItem}>
                  <MaterialIcons name="military-tech" size={22} color="#cbd5e1" />
                  <Text style={styles.medalTextMuted}>1</Text>
                </View>
                <View style={styles.medalDivider} />
                <View style={styles.medalItem}>
                  <MaterialIcons name="military-tech" size={22} color="#b45309" />
                  <Text style={styles.medalTextMuted}>1</Text>
                </View>
              </View>
            </View>
            <View style={styles.weekDays}>
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <View key={day + index} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayBox,
                      index === 3 || index === 6 ? styles.dayBoxEmpty : styles.dayBoxActive,
                    ]}
                  >
                    {index === 3 || index === 6 ? (
                      <View style={styles.dayDot} />
                    ) : (
                      <MaterialIcons name="check" size={16} color={palette.dark.accent} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      (index === 3 || index === 6) && styles.dayLabelMuted,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionAction}>View All</Text>
            </View>
            <View style={styles.activityList}>
              {[
                { date: "Oct 26", label: "Emotional Awareness", tries: "1 Try", accent: "#f59e0b" },
                { date: "Oct 25", label: "Empathy Challenge", tries: "2 Tries", accent: "#cbd5e1" },
                { date: "Oct 23", label: "Social Cues", tries: "1 Try", accent: "#b45309" },
              ].map((item) => (
                <View key={item.date} style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityBadge, { borderColor: item.accent + "33" }]}>
                      <MaterialIcons name="military-tech" size={26} color={item.accent} />
                    </View>
                    <View>
                      <View style={styles.activityRow}>
                        <Text style={styles.activityDate}>{item.date}</Text>
                        <View style={styles.activityStatus}>
                          <View style={styles.activityStatusDot} />
                          <Text style={styles.activityStatusText}>Done</Text>
                        </View>
                      </View>
                      <Text style={styles.activityLabel}>{item.label}</Text>
                    </View>
                  </View>
                  <View style={styles.tryBadge}>
                    <Text style={styles.tryBadgeText}>{item.tries}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.lockCard}>
            <View style={styles.lockIcon}>
              <MaterialIcons name="lock" size={26} color="#5b6476" />
            </View>
            <Text style={styles.lockTitle}>Archive Puzzles</Text>
            <Text style={styles.lockSubtitle}>
              Access the complete neural database of past Emotional IQ challenges.
            </Text>
            <Pressable
              style={[styles.unlockButton, proAccess && styles.unlockButtonActive]}
              onPress={() => {
                if (!proAccess) purchase(IAP_PRODUCTS.proAccess);
              }}
            >
              <Text style={styles.unlockText}>
                {proAccess ? "Archive Unlocked" : "Unlock Pro"}
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
            </Pressable>
            <View style={styles.proBadge}>
              <MaterialIcons name="verified" size={14} color={palette.dark.accent} />
              <Text style={styles.proBadgeText}>Pro Feature</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </FidelityContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b0e14",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(11,14,20,0.9)",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: palette.dark.textMain,
    fontFamily: typography.fonts.displayBold,
    marginRight: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
    gap: 24,
  },
  weeklyCard: {
    borderRadius: radii.r2xl,
    backgroundColor: "#131821",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    ...shadows.cardDepth,
  },
  weeklyGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  weeklyContent: {
    padding: 24,
    alignItems: "center",
  },
  weeklyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.dark.accent,
  },
  badgeText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: palette.dark.accent,
    fontFamily: typography.fonts.displayBold,
  },
  weeklyValue: {
    fontSize: 50,
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    marginTop: 12,
  },
  weeklySubtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#94a3b8",
    fontFamily: typography.fonts.bodyMedium,
    marginTop: 8,
    maxWidth: 220,
  },
  medalRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.rLg,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  medalItem: {
    alignItems: "center",
    gap: 4,
  },
  medalText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: typography.fonts.displayBold,
  },
  medalTextMuted: {
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: typography.fonts.displayBold,
  },
  medalDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  dayItem: {
    alignItems: "center",
    gap: 6,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBoxActive: {
    backgroundColor: "#161b26",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  dayBoxEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dayLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
  },
  dayLabelMuted: {
    color: "rgba(148,163,184,0.4)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
  },
  sectionAction: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: palette.dark.accent,
    fontFamily: typography.fonts.displayBold,
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#161b26",
    borderRadius: radii.rLg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...shadows.cardDepth,
  },
  activityLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },
  activityBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityDate: {
    fontSize: 16,
    color: palette.dark.textMain,
    fontFamily: typography.fonts.displayBold,
  },
  activityStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  activityStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.dark.success,
  },
  activityStatusText: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: palette.dark.success,
    fontFamily: typography.fonts.displayBold,
  },
  activityLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: typography.fonts.bodyMedium,
    marginTop: 4,
  },
  tryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0b0e14",
  },
  tryBadgeText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#94a3b8",
    fontFamily: typography.fonts.displayBold,
  },
  lockCard: {
    padding: 26,
    borderRadius: radii.r2xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(22,27,38,0.6)",
    alignItems: "center",
    gap: 12,
  },
  lockIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0b0e14",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockTitle: {
    fontSize: 20,
    color: palette.dark.textMain,
    fontFamily: typography.fonts.displayBold,
  },
  lockSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontFamily: typography.fonts.body,
  },
  unlockButton: {
    marginTop: 6,
    backgroundColor: palette.dark.accent,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: radii.rLg,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unlockButtonActive: {
    backgroundColor: "rgba(59,130,246,0.35)",
  },
  unlockText: {
    color: "#ffffff",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
    backgroundColor: "rgba(59,130,246,0.1)",
  },
  proBadgeText: {
    fontSize: 10,
    color: palette.dark.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: typography.fonts.displayBold,
  },
});
