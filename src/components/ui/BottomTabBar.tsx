import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette, typography } from "@/design/tokens";
import { useTheme } from "@/design/theme";

const tabs = [
  { key: "home", label: "Home", icon: "grid-view" as const },
  { key: "stats", label: "Stats", icon: "bar-chart" as const },
  { key: "profile", label: "Profile", icon: "person" as const },
];

export default function BottomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                navigation.navigate(tab.key);
              }}
              style={styles.item}
            >
              {isFocused ? (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.accent, shadowColor: colors.accent },
                  ]}
                />
              ) : null}
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={isFocused ? colors.accent : "#5b677b"}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.accent : "#5b677b" },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.grip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingBottom: 10,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 56,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fonts.bodySemi,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  activeIndicator: {
    position: "absolute",
    top: -3,
    width: 32,
    height: 3,
    borderRadius: 3,
    backgroundColor: palette.dark.accent,
    shadowColor: palette.dark.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  grip: {
    alignSelf: "center",
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: 6,
  },
});
