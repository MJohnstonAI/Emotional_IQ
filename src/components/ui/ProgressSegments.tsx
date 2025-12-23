import { StyleSheet, View } from "react-native";

import { palette } from "@/design/tokens";

type ProgressSegmentsProps = {
  total: number;
  filled: number;
};

export default function ProgressSegments({ total, filled }: ProgressSegmentsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => {
        const active = index < filled;
        return (
          <View
            key={`seg-${index}`}
            style={[styles.segment, active ? styles.segmentActive : styles.segmentIdle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: palette.dark.cyan,
    shadowColor: palette.dark.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  segmentIdle: {
    backgroundColor: "rgba(51, 65, 85, 0.7)",
  },
});
