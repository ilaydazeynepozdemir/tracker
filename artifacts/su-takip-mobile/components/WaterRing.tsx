import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface WaterRingProps {
  percentage: number;
  totalMl: number;
  goalMl: number;
}

export function WaterRing({ percentage, totalMl, goalMl }: WaterRingProps) {
  const colors = useColors();
  const clamped = Math.min(Math.max(percentage, 0), 100);

  function getMotivation(pct: number): string {
    if (pct === 0) return "Suya başlayalım!";
    if (pct < 25) return "Harika bir başlangıç!";
    if (pct < 50) return "Devam et, yarıya yaklaştın!";
    if (pct < 75) return "Yarıyı geçtin, bravo!";
    if (pct < 100) return "Neredeyse hedefe ulaştın!";
    return "Hedefine ulaştın! 🎉";
  }

  // Build 36 arc segments for the ring
  const segments = Array.from({ length: 36 }, (_, i) => {
    const segDeg = i * 10;
    const filled = segDeg < clamped * 3.6;
    let segColor = "transparent";
    if (filled) {
      if (i < 12) segColor = colors.pink;
      else if (i < 24) segColor = colors.purple;
      else segColor = colors.blue;
    }
    return { deg: segDeg, color: segColor };
  });

  const RING = 180;
  const STROKE = 14;

  return (
    <View style={styles.container}>
      <View style={{ width: RING, height: RING }}>
        {/* Background ring */}
        <View
          style={{
            position: "absolute",
            width: RING,
            height: RING,
            borderRadius: RING / 2,
            borderWidth: STROKE,
            borderColor: colors.blueLight,
          }}
        />
        {/* Progress segments */}
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: RING,
              height: RING,
              borderRadius: RING / 2,
              borderTopWidth: STROKE,
              borderRightWidth: 0,
              borderBottomWidth: 0,
              borderLeftWidth: 0,
              borderTopColor: seg.color,
              transform: [{ rotate: `${seg.deg}deg` }],
            }}
          />
        ))}
        {/* Center content */}
        <View style={[styles.center, { width: RING, height: RING }]}>
          <Text style={[styles.pct, { color: colors.pink }]}>
            {Math.round(clamped)}%
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {totalMl} ml
          </Text>
          <Text style={[styles.goal, { color: colors.mutedForeground }]}>
            / {goalMl} ml
          </Text>
        </View>
      </View>
      <Text style={[styles.motivation, { color: colors.mutedForeground }]}>
        {getMotivation(clamped)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 14 },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  pct: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    lineHeight: 50,
  },
  sub: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  goal: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  motivation: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
