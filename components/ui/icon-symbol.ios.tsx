import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof Ionicons>["name"]>;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code-slash",
  "chevron.right": "chevron-forward",
  "arrow.uturn.backward": "arrow-undo",
  "square.stack.3d.up.fill": "layers",
  "hand.draw.fill": "hand-left",
  "plus.circle.fill": "add-circle",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return (
    <Ionicons
      color={color}
      size={size}
      name={MAPPING[name] || "help-circle"}
      style={style}
    />
  );
}
