import { Feather } from "@expo/vector-icons";
import {
  useGetWaterHistory,
  getGetWaterHistoryQueryKey,
} from "@workspace/api-client-react";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const DAY_LABELS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const history = useGetWaterHistory({
    query: { queryKey: getGetWaterHistoryQueryKey() },
  });

  const data = history.data ?? [];
  const maxMl = Math.max(...data.map((d) => Math.max(d.totalMl, d.goalMl)), 1);
  const BAR_MAX_HEIGHT = 140;

  const paddingTop = Platform.OS === "web" ? 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 50 : insets.bottom + 80;

  const totalDaysGoalMet = data.filter((d) => d.goalMet).length;
  const avgMl =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.totalMl, 0) / data.length)
      : 0;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop, paddingBottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        7 Gunluk Gecmis
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: colors.pinkLight }]}
        >
          <Text style={[styles.statValue, { color: colors.pink }]}>
            {totalDaysGoalMet}/7
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Hedef Gunleri
          </Text>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: colors.blueLight }]}
        >
          <Text style={[styles.statValue, { color: colors.blue }]}>
            {avgMl} ml
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Gunluk Ort.
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      {history.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.pink} size="large" />
        </View>
      ) : (
        <View
          style={[styles.chartCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.chart}>
            {data.map((day, i) => {
              const intakeHeight =
                (day.totalMl / maxMl) * BAR_MAX_HEIGHT;
              const goalHeight = (day.goalMl / maxMl) * BAR_MAX_HEIGHT;
              const isToday = i === data.length - 1;

              return (
                <View key={day.date} style={styles.barGroup}>
                  {/* Goal line marker */}
                  <View style={[styles.barsContainer, { height: BAR_MAX_HEIGHT }]}>
                    <View
                      style={[
                        styles.goalLine,
                        {
                          bottom: goalHeight,
                          borderColor: colors.orangeMid,
                        },
                      ]}
                    />
                    {/* Intake bar */}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(intakeHeight, 4),
                          backgroundColor: day.goalMet
                            ? colors.blue
                            : colors.pinkMid,
                          borderRadius: 6,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isToday ? colors.pink : colors.mutedForeground,
                        fontFamily: isToday
                          ? "Inter_700Bold"
                          : "Inter_400Regular",
                      },
                    ]}
                  >
                    {getDayLabel(day.date)}
                  </Text>
                  <Text
                    style={[styles.dateLabel, { color: colors.mutedForeground }]}
                  >
                    {formatDate(day.date)}
                  </Text>
                  {day.goalMet && (
                    <Feather name="check-circle" size={12} color={colors.blue} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.blue }]}
              />
              <Text
                style={[styles.legendText, { color: colors.mutedForeground }]}
              >
                Hedef Karsilandi
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.pinkMid }]}
              />
              <Text
                style={[styles.legendText, { color: colors.mutedForeground }]}
              >
                Eksik Kaldi
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendLine,
                  { borderColor: colors.orangeMid },
                ]}
              />
              <Text
                style={[styles.legendText, { color: colors.mutedForeground }]}
              >
                Hedef
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Daily Detail List */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Gunluk Detay
      </Text>
      <View style={styles.detailList}>
        {[...data].reverse().map((day) => (
          <View
            key={day.date}
            style={[
              styles.detailRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.detailLeft}>
              <Feather
                name={day.goalMet ? "check-circle" : "circle"}
                size={18}
                color={day.goalMet ? colors.blue : colors.mutedForeground}
              />
              <View>
                <Text
                  style={[styles.detailDate, { color: colors.foreground }]}
                >
                  {formatDate(day.date)} {getDayLabel(day.date)}
                </Text>
                <Text
                  style={[
                    styles.detailSub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Hedef: {day.goalMl} ml
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.detailAmount,
                { color: day.goalMet ? colors.blue : colors.pink },
              ]}
            >
              {day.totalMl} ml
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    gap: 4,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  center: { height: 200, justifyContent: "center", alignItems: "center" },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 12,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barsContainer: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  bar: {
    width: "70%",
  },
  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
  },
  dayLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  dateLabel: {
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLine: {
    width: 14,
    borderTopWidth: 2,
    borderStyle: "dashed",
  },
  legendText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  detailList: { gap: 8 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailDate: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  detailSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  detailAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
