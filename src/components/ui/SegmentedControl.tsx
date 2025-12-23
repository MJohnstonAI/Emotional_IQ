import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii, typography } from "@/design/tokens";

type SegmentedOption = {
  key: string;
  label: string;
  icon?: string;
};

type SegmentedControlProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.item, active && styles.activeItem]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 6,
    borderRadius: radii.rXl,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radii.rLg,
  },
  activeItem: {
    backgroundColor: palette.dark.cyan,
  },
  label: {
    fontSize: 12,
    fontFamily: typography.fonts.display,
    color: "#8b94a6",
  },
  activeLabel: {
    color: "#0b0b0d",
    fontFamily: typography.fonts.displayBold,
  },
});
