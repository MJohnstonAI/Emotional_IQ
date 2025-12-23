import { ReactNode, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

type FidelityContainerProps = {
  children: ReactNode;
  reference: number;
  style?: StyleProp<ViewStyle>;
};

const TAP_WINDOW_MS = 450;

const NativeSlider =
  Platform.OS === "web"
    ? null
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require("@react-native-community/slider").default as any);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function FidelityContainer({
  children,
  reference,
  style,
}: FidelityContainerProps) {
  const { width } = useWindowDimensions();
  const [enabled, setEnabled] = useState(false);
  const [opacity, setOpacity] = useState(0.35);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const tapState = useRef({ count: 0, last: 0 });

  const onHeaderTap = () => {
    const now = Date.now();
    if (now - tapState.current.last > TAP_WINDOW_MS) {
      tapState.current.count = 0;
    }
    tapState.current.last = now;
    tapState.current.count += 1;
    if (tapState.current.count >= 3) {
      tapState.current.count = 0;
      setEnabled((prev) => !prev);
    }
  };

  const overlayStyle = useMemo(
    () => [
      styles.overlay,
      {
        opacity,
        transform: [{ translateX: offsetX }, { translateY: offsetY }, { scale }],
      },
    ],
    [opacity, offsetX, offsetY, scale]
  );

  const stageMaxWidth = useMemo(() => {
    if (Platform.OS !== "web") return undefined;
    if (width >= 900) return 430;
    if (width >= 520) return 520;
    return undefined;
  }, [width]);

  return (
    <View style={[styles.outer, style]}>
      <View
        style={[
          styles.stage,
          Platform.OS === "web" && stageMaxWidth ? { maxWidth: stageMaxWidth } : null,
        ]}
      >
        <Pressable
          onPress={onHeaderTap}
          style={styles.tapZone}
          accessibilityLabel="Toggle Stitch overlay"
        />
        {children}
        {__DEV__ && enabled ? (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <Image source={reference} style={overlayStyle} resizeMode="stretch" />
            <View style={styles.controls}>
              <Text style={styles.controlTitle}>Stitch Overlay</Text>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Opacity</Text>
                {NativeSlider ? (
                  <NativeSlider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={opacity}
                    minimumTrackTintColor="#38bdf8"
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    thumbTintColor="#38bdf8"
                    onValueChange={setOpacity}
                  />
                ) : (
                  <View style={styles.stepGroup}>
                    <Pressable
                      onPress={() => setOpacity((v) => clamp(v - 0.1, 0, 1))}
                      style={styles.stepButton}
                    >
                      <Text style={styles.stepText}>-0.10</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setOpacity((v) => clamp(v - 0.05, 0, 1))}
                      style={styles.stepButton}
                    >
                      <Text style={styles.stepText}>-0.05</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setOpacity((v) => clamp(v + 0.05, 0, 1))}
                      style={styles.stepButton}
                    >
                      <Text style={styles.stepText}>+0.05</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setOpacity((v) => clamp(v + 0.1, 0, 1))}
                      style={styles.stepButton}
                    >
                      <Text style={styles.stepText}>+0.10</Text>
                    </Pressable>
                    <Text style={styles.stepHint}>{opacity.toFixed(2)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>X</Text>
                <View style={styles.stepGroup}>
                  <Pressable
                    onPress={() => setOffsetX((v) => v - 5)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>-5</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOffsetX((v) => v - 1)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>-1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOffsetX((v) => v + 1)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>+1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOffsetX((v) => v + 5)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>+5</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Y</Text>
                <View style={styles.stepGroup}>
                  <Pressable
                    onPress={() => setOffsetY((v) => v - 5)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>-5</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOffsetY((v) => v - 1)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>-1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOffsetY((v) => v + 1)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>+1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOffsetY((v) => v + 5)}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>+5</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Scale</Text>
                <View style={styles.stepGroup}>
                  <Pressable
                    onPress={() => setScale((v) => Math.max(0.9, v - 0.01))}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>-1%</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setScale((v) => Math.min(1.1, v + 0.01))}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>+1%</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#050b14",
  },
  stage: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  tapZone: {
    position: "absolute",
    top: 0,
    left: 60,
    right: 60,
    height: 80,
    zIndex: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: "absolute",
    top: 80,
    right: 16,
    backgroundColor: "rgba(5, 9, 20, 0.9)",
    borderRadius: 16,
    padding: 12,
    width: 220,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  controlTitle: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  controlRow: {
    marginBottom: 10,
  },
  controlLabel: {
    color: "#94a3b8",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  slider: {
    width: "100%",
    height: 20,
  },
  stepGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  stepHint: {
    color: "rgba(226,232,240,0.8)",
    fontSize: 10,
    marginLeft: 6,
  },
  stepButton: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stepText: {
    color: "#e2e8f0",
    fontSize: 10,
    fontWeight: "600",
  },
});
