import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface EntryItemProps {
  id: number;
  amountMl: number;
  drinkType: string;
  note?: string | null;
  createdAt: string;
  onDelete: (id: number) => void;
}

const DRINK_COLORS: Record<string, string> = {
  water: "#38bdf8",
  tea: "#a3e635",
  coffee: "#a16207",
  juice: "#fb923c",
  other: "#a855f7",
};

const DRINK_LABELS: Record<string, string> = {
  water: "Su",
  tea: "Cay",
  coffee: "Kahve",
  juice: "Meyve Suyu",
  other: "Diger",
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function EntryItem({
  id,
  amountMl,
  drinkType,
  note,
  createdAt,
  onDelete,
}: EntryItemProps) {
  const colors = useColors();
  const dotColor = DRINK_COLORS[drinkType] ?? "#a855f7";
  const label = DRINK_LABELS[drinkType] ?? drinkType;

  function handleDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete(id);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.info}>
        <Text style={[styles.amount, { color: colors.foreground }]}>
          {amountMl} ml
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {label} {note ? `• ${note}` : ""} • {formatTime(createdAt)}
        </Text>
      </View>
      <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={12}>
        <Feather name="trash-2" size={16} color={colors.destructive} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  amount: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  deleteBtn: {
    padding: 4,
  },
});
