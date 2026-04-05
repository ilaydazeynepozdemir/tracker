import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface QuickAddButtonProps {
  amount: number;
  label: string;
  onPress: () => void;
  loading?: boolean;
  color?: string;
}

export function QuickAddButton({
  amount,
  label,
  onPress,
  loading,
  color,
}: QuickAddButtonProps) {
  const colors = useColors();
  const bgColor = color ?? colors.pinkLight;
  const textColor = color ? "#fff" : colors.pink;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.amount, { color: textColor }]}>{amount}</Text>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    flex: 1,
    minWidth: 60,
  },
  content: {
    alignItems: "center",
    gap: 2,
  },
  amount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    opacity: 0.85,
  },
});
