import { PanResponder, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";

import { palette, radii } from "@/design/tokens";

type DragSliderProps = {
  value: number; // 0..100
  onChange: (value: number) => void; // preview updates while dragging
  onCommit?: (value: number) => void; // called on release
  style?: StyleProp<ViewStyle>;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function DragSlider({ value, onChange, onCommit, style }: DragSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const valueRef = useRef(value);
  const startValueRef = useRef(0);
  const lastValueRef = useRef(clamp(value, 0, 100));

  useEffect(() => {
    valueRef.current = value;
    lastValueRef.current = clamp(value, 0, 100);
  }, [value]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const width = trackWidthRef.current;
        if (!width) return false;
        const knobCenter = (clamp(valueRef.current, 0, 100) / 100) * width;
        const hitRadius = 26;
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        return Math.abs(x - knobCenter) <= hitRadius && Math.abs(y - 20) <= 24;
      },
      onMoveShouldSetPanResponder: (evt) => {
        const width = trackWidthRef.current;
        if (!width) return false;
        const knobCenter = (clamp(valueRef.current, 0, 100) / 100) * width;
        const hitRadius = 32;
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        return Math.abs(x - knobCenter) <= hitRadius && Math.abs(y - 20) <= 28;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startValueRef.current = clamp(valueRef.current, 0, 100);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const width = trackWidthRef.current;
        if (!width) return;
        const delta = (gestureState.dx / width) * 100;
        const next = Math.round(clamp(startValueRef.current + delta, 0, 100));
        lastValueRef.current = next;
        onChange(next);
      },
      onPanResponderRelease: () => {
        // commit the final value where the thumb was released
        lastValueRef.current = clamp(lastValueRef.current, 0, 100);
        onCommit?.(lastValueRef.current);
      },
      onPanResponderTerminate: () => {
        lastValueRef.current = clamp(lastValueRef.current, 0, 100);
        onCommit?.(lastValueRef.current);
      },
    });
  }, [onChange, onCommit]);

  const knobLeft = trackWidth
    ? clamp((clamp(value, 0, 100) / 100) * trackWidth, 0, trackWidth)
    : 0;

  return (
    <View
      style={[styles.trackWrap, style]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        trackWidthRef.current = width;
        setTrackWidth(width);
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.track} />
      <View style={[styles.knob, { left: knobLeft - styles.knob.width / 2 }]} />
      <View style={[styles.knobGlow, { left: knobLeft - styles.knobGlow.width / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  trackWrap: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 10,
    borderRadius: radii.rLg,
    backgroundColor: "rgba(148,163,184,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  knobGlow: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(34,211,238,0.18)",
  },
  knob: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.dark.accent,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
