import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetGoal,
  useUpdateGoal,
  getGetGoalQueryKey,
  getGetWaterSummaryQueryKey,
  getGetWaterHistoryQueryKey,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PRESET_GOALS = [1500, 2000, 2500, 3000];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [goalInput, setGoalInput] = useState("");
  const [saved, setSaved] = useState(false);

  const goal = useGetGoal({ query: { queryKey: getGetGoalQueryKey() } });
  const updateGoal = useUpdateGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGoalQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWaterSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWaterHistoryQueryKey() });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    },
  });

  useEffect(() => {
    if (goal.data) {
      setGoalInput(String(goal.data.goalMl));
    }
  }, [goal.data]);

  function handleSave() {
    const val = parseInt(goalInput, 10);
    if (!val || val < 500 || val > 10000) return;
    updateGoal.mutate({ data: { goalMl: val } });
  }

  function handlePreset(val: number) {
    setGoalInput(String(val));
    updateGoal.mutate({ data: { goalMl: val } });
  }

  const paddingTop = Platform.OS === "web" ? 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 50 : insets.bottom + 80;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop, paddingBottom },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Ayarlar</Text>

      {/* Goal Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Feather name="target" size={20} color={colors.pink} />
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Günlük Su Hedefi
          </Text>
        </View>

        {goal.isLoading ? (
          <ActivityIndicator color={colors.pink} />
        ) : (
          <>
            <Text style={[styles.currentGoal, { color: colors.mutedForeground }]}>
              Mevcut hedef:{" "}
              <Text style={{ color: colors.pink, fontFamily: "Inter_700Bold" }}>
                {goal.data?.goalMl ?? 2000} ml
              </Text>
            </Text>

            {/* Preset Buttons */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Hazır Hedefler
            </Text>
            <View style={styles.presetRow}>
              {PRESET_GOALS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => handlePreset(g)}
                  style={({ pressed }) => [
                    styles.presetBtn,
                    {
                      backgroundColor:
                        goal.data?.goalMl === g
                          ? colors.pink
                          : colors.pinkLight,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color:
                          goal.data?.goalMl === g ? "#fff" : colors.pink,
                      },
                    ]}
                  >
                    {g} ml
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Custom Input */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Özel Hedef (ml)
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.foreground,
                    flex: 1,
                  },
                ]}
                keyboardType="number-pad"
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder="Orn. 2500"
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable
                onPress={handleSave}
                disabled={updateGoal.isPending}
                style={({ pressed }) => [
                  styles.saveBtn,
                  {
                    backgroundColor: saved ? colors.blue : colors.pink,
                    opacity: pressed || updateGoal.isPending ? 0.75 : 1,
                  },
                ]}
              >
                {updateGoal.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : saved ? (
                  <Feather name="check" size={20} color="#fff" />
                ) : (
                  <Feather name="save" size={20} color="#fff" />
                )}
              </Pressable>
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              500 - 10.000 ml arasinda olabilir
            </Text>
          </>
        )}
      </View>

      {/* Info Card */}
      <View style={[styles.card, { backgroundColor: colors.blueLight }]}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={18} color={colors.blue} />
          <Text style={[styles.cardTitle, { color: colors.blue }]}>
            Tavsiye
          </Text>
        </View>
        <Text style={[styles.infoText, { color: colors.foreground }]}>
          Sağlık uzmanları yetişkinler için günlük 2-3 litre su tüketimini öneriyor. Aktif spor yapıyorsanız bu miktarı artırabilirsiniz. Bu uygulama sadece takip amaçlıdır ve sağlık danışmanlığı sağlamaz.
        </Text>
      </View>

      {/* Orange tip */}
      <View style={[styles.card, { backgroundColor: colors.orangeLight }]}>
        <View style={styles.cardHeader}>
          <Feather name="sun" size={18} color={colors.orange} />
          <Text style={[styles.cardTitle, { color: colors.orange }]}>
            Ipucu
          </Text>
        </View>
        <Text style={[styles.infoText, { color: colors.foreground }]}>
           Sabah uyandığınızda bir bardak su içmek metabolizmanızı hızlandırır ve günün geri kalanında daha az susarsınız. Bu uygulama sadece takip amaçlıdır ve sağlık danışmanlığı sağlamaz.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  currentGoal: { fontSize: 15, fontFamily: "Inter_400Regular" },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  presetRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  presetText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
