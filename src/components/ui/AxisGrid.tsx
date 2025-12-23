import { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from "react-native";
import Svg, { Line } from "react-native-svg";

import { palette, radii, typography } from "@/design/tokens";
import { useSettingsStore } from "@/state/settingsStore";

type AxisGridProps = {
  value: { x: number; y: number };
  onChange: (next: { x: number; y: number }) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function AxisGrid({ value, onChange }: AxisGridProps) {
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const puckRadius = 16;
  const layoutRef = useRef({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    layoutRef.current = { width, height };
    setSize({ width, height });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const boundedX = clamp(locationX, 0, layoutRef.current.width);
        const boundedY = clamp(locationY, 0, layoutRef.current.height);
        const nextX = Math.round((boundedX / layoutRef.current.width) * 100);
        const nextY = Math.round(
          (1 - boundedY / layoutRef.current.height) * 100
        );
        onChange({ x: nextX, y: nextY });
      },
    })
  ).current;

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const step = 40;
    if (!size.width || !size.height) return lines;
    for (let x = step; x < size.width; x += step) {
      lines.push({ x1: x, y1: 0, x2: x, y2: size.height });
    }
    for (let y = step; y < size.height; y += step) {
      lines.push({ x1: 0, y1: y, x2: size.width, y2: y });
    }
    return lines;
  }, [size.height, size.width]);

  const puckPosition = useMemo(() => {
    if (!size.width || !size.height) {
      return { left: 0, top: 0 };
    }
    const left = (value.x / 100) * size.width - puckRadius;
    const top = (1 - value.y / 100) * size.height - puckRadius;
    return { left, top };
  }, [size.height, size.width, value.x, value.y]);

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <View style={styles.grid} />
      {size.width > 0 ? (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        >
          {gridLines.map((line, index) => (
            <Line
              key={`grid-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(30,41,59,0.4)"
              strokeWidth={1}
            />
          ))}
        </Svg>
      ) : null}
      <View style={styles.crosshairVertical} />
      <View style={styles.crosshairHorizontal} />
      <View style={styles.centerDot} />
      <Text style={styles.labelTop}>High Energy</Text>
      <Text style={styles.labelBottom}>Low Energy</Text>
      <Text style={styles.labelLeft}>Negative</Text>
      <Text style={styles.labelRight}>Positive</Text>
      <View
        style={[styles.puckArea, puckPosition]}
        {...panResponder.panHandlers}
      >
        {reduceMotion ? null : <View style={styles.puckPulse} />}
        {reduceMotion ? null : <View style={styles.puckGlow} />}
        <View style={styles.puck}>
          <View style={styles.puckCore} />
        </View>
        <View style={styles.coordBadge}>
          <Text style={styles.coordText}>
            X:{value.x - 50} Y:{value.y - 50}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.r3xl,
    backgroundColor: "#0b121f",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  crosshairVertical: {
    position: "absolute",
    left: "50%",
    top: 24,
    bottom: 24,
    width: 1,
    backgroundColor: "rgba(148,163,184,0.25)",
  },
  crosshairHorizontal: {
    position: "absolute",
    top: "50%",
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(148,163,184,0.25)",
  },
  centerDot: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 6,
    height: 6,
    marginLeft: -3,
    marginTop: -3,
    borderRadius: 3,
    backgroundColor: "rgba(148,163,184,0.6)",
    shadowColor: "#64748b",
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  labelTop: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    fontSize: 9,
    letterSpacing: 3,
    color: "rgba(148,163,184,0.7)",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
  },
  labelBottom: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    fontSize: 9,
    letterSpacing: 3,
    color: "rgba(148,163,184,0.7)",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
  },
  labelLeft: {
    position: "absolute",
    left: 4,
    top: "50%",
    transform: [{ rotate: "-90deg" }],
    fontSize: 9,
    letterSpacing: 3,
    color: "rgba(148,163,184,0.7)",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
  },
  labelRight: {
    position: "absolute",
    right: 4,
    top: "50%",
    transform: [{ rotate: "90deg" }],
    fontSize: 9,
    letterSpacing: 3,
    color: "rgba(148,163,184,0.7)",
    fontFamily: typography.fonts.displayBold,
    textTransform: "uppercase",
  },
  puckArea: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  puckPulse: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
  },
  puckGlow: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(34,211,238,0.15)",
  },
  puck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: palette.dark.cyanGlow,
    backgroundColor: "#0b121f",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.dark.cyanGlow,
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  puckCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e0f2fe",
  },
  coordBadge: {
    position: "absolute",
    top: -34,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderRadius: radii.rLg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
  },
  coordText: {
    fontSize: 10,
    color: palette.dark.cyanGlow,
    fontFamily: typography.fonts.displayBold,
    letterSpacing: 1.5,
  },
});
