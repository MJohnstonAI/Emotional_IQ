import { ReactNode } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type GlowImageBackgroundProps = {
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
};

export default function GlowImageBackground({
  source,
  style,
  imageStyle,
  children,
}: GlowImageBackgroundProps) {
  return (
    <ImageBackground source={source} style={[styles.container, style]} imageStyle={imageStyle}>
      <LinearGradient
        colors={["rgba(0,0,0,0.25)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(2,6,23,0.9)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
});
