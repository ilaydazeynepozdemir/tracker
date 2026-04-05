import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateWaterEntry,
  useDeleteWaterEntry,
  useGetWaterSummary,
  useListWaterEntries,
  getGetWaterSummaryQueryKey,
  getListWaterEntriesQueryKey,
  getGetWaterHistoryQueryKey,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EntryItem } from "@/components/EntryItem";
import { QuickAddButton } from "@/components/QuickAddButton";
import { WaterRing } from "@/components/WaterRing";
import { useColors } from "@/hooks/useColors";

const QUICK_AMOUNTS = [
  { amount: 100, label: "Yudum" },
  { amount: 200, label: "Bardak" },
  { amount: 250, label: "Kupa" },
  { amount: 330, label: "Kutu" },
  { amount: 500, label: "Sise" },
];

const DRINK_TYPES = [
  { key: "water", label: "Su" },
  { key: "tea", label: "Cay" },
  { key: "coffee", label: "Kahve" },
  { key: "juice", label: "Meyve Suyu" },
  { key: "other", label: "Diger" },
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedDrink, setSelectedDrink] = useState("water");
  const [note, setNote] = useState("");
  const [addingId, setAddingId] = useState<number | null>(null);

  const summary = useGetWaterSummary({
    query: { queryKey: getGetWaterSummaryQueryKey() },
  });
  const entries = useListWaterEntries(undefined, {
    query: { queryKey: getListWaterEntriesQueryKey() },
  });

  const createEntry = useCreateWaterEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWaterSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWaterEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWaterHistoryQueryKey() });
        setAddingId(null);
      },
    },
  });

  const deleteEntry = useDeleteWaterEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWaterSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWaterEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWaterHistoryQueryKey() });
      },
    },
  });

  function handleQuickAdd(amount: number) {
    setAddingId(amount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createEntry.mutate(
      { data: { amountMl: amount, drinkType: "water" } },
      { onSettled: () => setAddingId(null) }
    );
  }

  function handleCustomAdd() {
    const amt = parseInt(customAmount, 10);
    if (!amt || amt <= 0 || amt > 5000) return;
    createEntry.mutate(
      {
        data: {
          amountMl: amt,
          drinkType: selectedDrink,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setCustomAmount("");
          setNote("");
          setSelectedDrink("water");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      }
    );
  }

  function handleDelete(id: number) {
    deleteEntry.mutate({ id });
  }

  const isLoading = summary.isLoading;
  const summaryData = summary.data;
  const entriesData = entries.data ?? [];

  const paddingBottom =
    Platform.OS === "web" ? 34 + 50 : insets.bottom + 80;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom,
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              Gunluk Hedef
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Su Takip
            </Text>
          </View>
          {summaryData && (
            <View
              style={[
                styles.streakBadge,
                { backgroundColor: colors.orangeLight },
              ]}
            >
              <Feather name="zap" size={14} color={colors.orange} />
              <Text style={[styles.streakText, { color: colors.orange }]}>
                {summaryData.streak} gun seri
              </Text>
            </View>
          )}
        </View>

        {/* Progress Ring */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {isLoading ? (
            <ActivityIndicator color={colors.pink} size="large" />
          ) : (
            <WaterRing
              percentage={summaryData?.percentage ?? 0}
              totalMl={summaryData?.totalMl ?? 0}
              goalMl={summaryData?.goalMl ?? 2000}
            />
          )}
        </View>

        {/* Quick Add */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Hizli Ekle
        </Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(({ amount, label }) => (
            <QuickAddButton
              key={amount}
              amount={amount}
              label={label}
              onPress={() => handleQuickAdd(amount)}
              loading={addingId === amount && createEntry.isPending}
              color={
                amount === 100
                  ? colors.pinkLight
                  : amount === 200
                  ? colors.blueLight
                  : amount === 250
                  ? colors.purpleLight
                  : amount === 330
                  ? colors.orangeLight
                  : colors.pinkLight
              }
            />
          ))}
        </View>

        {/* Custom Add Button */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            styles.customBtn,
            {
              backgroundColor: colors.pink,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="plus-circle" size={18} color="#fff" />
          <Text style={styles.customBtnText}>Ozel Miktar Ekle</Text>
        </Pressable>

        {/* Today's Entries */}
        {entriesData.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Bugunun Kayitlari
            </Text>
            <View style={styles.entriesList}>
              {entriesData.map((entry) => (
                <EntryItem
                  key={entry.id}
                  id={entry.id}
                  amountMl={entry.amountMl}
                  drinkType={entry.drinkType}
                  note={entry.note}
                  createdAt={entry.createdAt}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </>
        )}

        {entriesData.length === 0 && !isLoading && (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Feather name="droplet" size={32} color={colors.blue} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Henuz su icmedin. Hadi basla!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Custom Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBg}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 24,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Miktar Ekle
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Miktar (ml)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
            />

            <Text style={[styles.drinkLabel, { color: colors.mutedForeground }]}>
              Icecek Turu
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.drinkRow}>
                {DRINK_TYPES.map((d) => (
                  <Pressable
                    key={d.key}
                    onPress={() => setSelectedDrink(d.key)}
                    style={[
                      styles.drinkChip,
                      {
                        backgroundColor:
                          selectedDrink === d.key ? colors.pink : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.drinkChipText,
                        {
                          color:
                            selectedDrink === d.key ? "#fff" : colors.mutedForeground,
                        },
                      ]}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Not (opsiyonel)"
              placeholderTextColor={colors.mutedForeground}
              value={note}
              onChangeText={setNote}
            />

            <Pressable
              onPress={handleCustomAdd}
              disabled={createEntry.isPending}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.pink,
                  opacity: pressed || createEntry.isPending ? 0.7 : 1,
                },
              ]}
            >
              {createEntry.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addBtnText}>Ekle</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  quickRow: { flexDirection: "row", gap: 8 },
  customBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  customBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  entriesList: { gap: 8 },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBg: { flex: 1 },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  drinkLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  drinkRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  drinkChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  drinkChipText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  addBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
